import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let rawCode = (body.code || '').trim();

    if (!rawCode) {
      return NextResponse.json(
        { valid: false, message: 'Digite o código da turma ou cole o link do convite.' },
        { status: 400 }
      );
    }

    // 1. Se o aluno colou o link completo (ex: https://.../join/uuid ou /join/uuid)
    const urlMatch = rawCode.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (urlMatch) {
      rawCode = urlMatch[0];
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawCode);

    let query = supabase
      .from('challenges')
      .select(`
        id,
        title,
        price,
        start_date,
        end_date,
        is_active,
        professional_id,
        professionals (
          full_name,
          specialty,
          plan_tier
        )
      `);

    let challengeData: any = null;

    if (isUUID) {
      const { data, error } = await query.eq('id', rawCode).maybeSingle();
      if (!error && data) {
        challengeData = data;
      }
    } else {
      // Se digitou código curto ou título do desafio
      const { data: list, error } = await query
        .ilike('title', `%${rawCode}%`)
        .eq('is_active', true)
        .limit(1);

      if (!error && list && list.length > 0) {
        challengeData = list[0];
      }
    }

    if (!challengeData) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Código de turma não encontrado ou o desafio já foi encerrado pelo treinador.',
        },
        { status: 404 }
      );
    }

    // Validar capacidade de alunos de acordo com o plano do treinador (apenas inscritos confirmados)
    const { count: studentCount } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challengeData.id)
      .in('payment_status', ['paid', 'complimentary']);

    const coachPlan = (challengeData.professionals?.plan_tier as PlanTier) || 'starter';
    const planLimits = PLAN_CONFIG[coachPlan] || PLAN_CONFIG.starter;

    if ((studentCount || 0) >= planLimits.maxStudentsPerChallenge) {
      return NextResponse.json(
        {
          valid: false,
          message: `Esta turma já atingiu a capacidade máxima de ${planLimits.maxStudentsPerChallenge} alunos. Converse com o treinador para verificar novas vagas.`,
        },
        { status: 400 }
      );
    }

    const coachName = challengeData.professionals?.full_name || 'Seu Treinador';

    return NextResponse.json({
      valid: true,
      challenge: {
        id: challengeData.id,
        title: challengeData.title,
        price: challengeData.price || 0,
        startDate: challengeData.start_date,
        endDate: challengeData.end_date,
        isActive: challengeData.is_active,
        professionalName: coachName,
        specialty: challengeData.professionals?.specialty || 'Personal Trainer',
      },
    });
  } catch (err: any) {
    console.error('Erro ao validar código da turma:', err);
    return NextResponse.json(
      { valid: false, message: 'Erro interno ao validar código.' },
      { status: 500 }
    );
  }
}
