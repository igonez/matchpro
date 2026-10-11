import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verificar autenticação do coach
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, fullName, phone, email, paymentStatus = 'paid' } = body;

    if (!challengeId || !fullName?.trim()) {
      return NextResponse.json({ error: 'Desafio e nome completo são obrigatórios.' }, { status: 400 });
    }

    // 2. Verificar se o coach é dono do desafio e validar limites de alunos do plano
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select(`
        id, 
        professional_id,
        professionals (
          plan_tier
        )
      `)
      .eq('id', challengeId)
      .eq('professional_id', user.id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Você não tem permissão para gerenciar este desafio.' }, { status: 403 });
    }

    const coachTier: any = (challenge.professionals as any)?.plan_tier || 'starter';
    const maxStudentsAllowed = coachTier === 'starter' ? 15 : coachTier === 'pro' ? 100 : 9999;

    const { count: currentStudentsCount } = await supabaseAdmin
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challengeId);

    if ((currentStudentsCount || 0) >= maxStudentsAllowed) {
      return NextResponse.json(
        { 
          error: `Limite de ${maxStudentsAllowed} alunos atingido para o seu plano (${coachTier.toUpperCase()}). Faça upgrade na Central Financeira para matricular mais alunos.` 
        }, 
        { status: 403 }
      );
    }

    // 3. Criar ou localizar o usuário no auth.users via Supabase Admin
    const cleanPhone = phone?.trim() || '';
    const cleanEmail = email?.trim() || `aluno.${Date.now()}.${Math.floor(Math.random() * 1000)}@arenafit.pro`;
    const tempPassword = `Fit@${Math.random().toString(36).substring(2, 10)}!`;

    // Tentar criar usuário autenticado
    const { data: authCreated, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        role: 'student',
        phone: cleanPhone,
        manual_enrollment: true,
      },
    });

    let studentId: string;

    if (createAuthError) {
      // Se o email já existir, buscar o usuário existente
      if (createAuthError.message.includes('already exists') || createAuthError.message.includes('unique')) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const found = existingUsers?.users?.find((u: any) => u.email === cleanEmail);
        if (found) {
          studentId = found.id;
        } else {
          return NextResponse.json({ error: 'Erro ao cadastrar conta de aluno: ' + createAuthError.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: 'Erro ao criar conta de autenticação: ' + createAuthError.message }, { status: 400 });
      }
    } else {
      studentId = authCreated.user.id;
    }

    // 4. Upsert na tabela public.students
    await supabaseAdmin
      .from('students')
      .upsert({
        id: studentId,
        full_name: fullName.trim(),
        phone: cleanPhone || null,
      });

    // 5. Inserir ou atualizar challenge_participants
    const { data: participant, error: partError } = await supabaseAdmin
      .from('challenge_participants')
      .upsert(
        {
          challenge_id: challengeId,
          student_id: studentId,
          payment_status: paymentStatus,
        },
        { onConflict: 'challenge_id,student_id' }
      )
      .select('id, challenge_id, student_id, payment_status, enrolled_at')
      .single();

    if (partError) {
      return NextResponse.json({ error: 'Erro ao matricular aluno: ' + partError.message }, { status: 500 });
    }

    // 6. Garantir entrada no leaderboard_standings
    await supabaseAdmin
      .from('leaderboard_standings')
      .upsert(
        {
          challenge_id: challengeId,
          student_id: studentId,
          total_points: 0,
        },
        { onConflict: 'challenge_id,student_id' }
      );

    return NextResponse.json({
      success: true,
      studentId,
      participant,
      student: {
        id: studentId,
        full_name: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
      },
      message: 'Aluno matriculado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro na matrícula manual:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor.' }, { status: 500 });
  }
}
