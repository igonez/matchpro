import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(req, 'default');
    if (rateLimitResponse) return rateLimitResponse;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    const body = await req.json();
    const { challengeId, fullName, phone } = body;

    if (!challengeId) {
      return NextResponse.json({ error: 'ID do desafio não fornecido.' }, { status: 400 });
    }

    // 1. Obter informações completas do desafio e do treinador com service role
    const { data: challenge, error: chError } = await supabaseAdmin
      .from('challenges')
      .select(`
        id,
        title,
        price,
        is_active,
        start_date,
        end_date,
        professional_id,
        professionals (
          id,
          full_name,
          plan_tier
        )
      `)
      .eq('id', challengeId)
      .single();

    if (chError || !challenge) {
      return NextResponse.json({ error: 'Desafio não encontrado.' }, { status: 404 });
    }

    if (challenge.is_active === false) {
      return NextResponse.json({ error: 'Esta turma foi encerrada pelo treinador.' }, { status: 400 });
    }

    // Verificar se o desafio já expirou
    if (challenge.end_date) {
      const endDate = new Date(challenge.end_date + 'T23:59:59');
      if (endDate < new Date()) {
        return NextResponse.json({
          error: `Este desafio terminou em ${new Date(challenge.end_date).toLocaleDateString('pt-BR')}.`,
        }, { status: 400 });
      }
    }

    const price = Number(challenge.price || 0);
    if (price > 0) {
      return NextResponse.json({
        error: 'Este desafio é pago e requer liquidação via Pix.',
        requiresPayment: true,
      }, { status: 400 });
    }

    // 2. Garantir registro na tabela students
    const studentDisplayName =
      (fullName || '').trim() ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Aluno';

    const { data: existingStudent } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existingStudent) {
      await supabaseAdmin.from('students').insert({
        id: user.id,
        full_name: studentDisplayName,
        phone: (phone || '').trim() || user.user_metadata?.phone || null,
      });
    }

    // 3. Verificar se já é participante ativo
    const { data: existingParticipant } = await supabaseAdmin
      .from('challenge_participants')
      .select('id, payment_status')
      .eq('challenge_id', challengeId)
      .eq('student_id', user.id)
      .maybeSingle();

    if (existingParticipant && ['paid', 'complimentary'].includes(existingParticipant.payment_status)) {
      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        message: 'Você já faz parte desta turma!',
      });
    }

    // 4. Validar limite de alunos conforme o plano do treinador
    const coachPlan: PlanTier = (challenge.professionals as any)?.plan_tier || 'starter';
    const planLimits = PLAN_CONFIG[coachPlan] || PLAN_CONFIG.starter;

    const { count: currentStudents } = await supabaseAdmin
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challengeId)
      .in('payment_status', ['paid', 'complimentary']);

    if ((currentStudents || 0) >= planLimits.maxStudentsPerChallenge) {
      return NextResponse.json({
        error: `Esta turma atingiu a capacidade máxima de ${planLimits.maxStudentsPerChallenge} alunos permitida pelo plano do treinador.`,
      }, { status: 400 });
    }

    // 5. Inserir ou atualizar na turma
    const { error: partError } = await supabaseAdmin
      .from('challenge_participants')
      .upsert({
        challenge_id: challengeId,
        student_id: user.id,
        payment_status: 'paid',
        payment_method: 'free',
        joined_at: new Date().toISOString(),
      });

    if (partError) {
      console.error('[API Challenges Join] Erro ao matricular aluno:', partError);
      return NextResponse.json({ error: 'Erro ao registrar matrícula na turma.' }, { status: 500 });
    }

    // 6. Inicializar leaderboard se ainda não existir
    try {
      await supabaseAdmin.from('leaderboard_standings').upsert({
        challenge_id: challengeId,
        student_id: user.id,
        total_points: 0,
      });
    } catch (e) {
      console.warn('[API Challenges Join] Leaderboard já existia:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Matrícula confirmada com sucesso!',
      challengeId,
    });
  } catch (err: any) {
    console.error('[API Challenges Join] Exceção crítica:', err);
    return NextResponse.json({ error: err.message || 'Falha interna ao entrar na turma.' }, { status: 500 });
  }
}
