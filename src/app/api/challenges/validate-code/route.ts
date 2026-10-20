import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { sanitizeString } from '@/lib/security/sanitize';

export async function POST(request: Request) {
  try {
    // 1. Rate limit para prevenir enumeração e força bruta de turmas
    const rateLimitResponse = enforceRateLimit(request, 'default');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    let rawCode = sanitizeString(body.code || '').slice(0, 150).trim();

    if (!rawCode) {
      return NextResponse.json(
        { valid: false, message: 'Digite o código da turma ou cole o link do convite.' },
        { status: 400 }
      );
    }

    // Se o usuário colou um link completo (ex: https://.../join/uuid ou /join/uuid)
    if (rawCode.includes('/join/')) {
      rawCode = rawCode.split('/join/')[1].split('?')[0].split('/')[0].trim();
    }

    const urlMatch = rawCode.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (urlMatch) {
      rawCode = urlMatch[0];
    }

    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawCode);

    const baseSelect = `
      id,
      title,
      price,
      start_date,
      end_date,
      is_active,
      professional_id,
      professionals (
        id,
        full_name,
        specialty,
        plan_tier
      )
    `;

    let challengeData: any = null;

    if (isUUID) {
      const { data, error } = await supabaseAdmin
        .from('challenges')
        .select(baseSelect)
        .eq('id', rawCode)
        .maybeSingle();

      if (!error && data) {
        challengeData = data;
      }
    } else {
      // 1. Tentar busca por título (ativo)
      const { data: listByTitle } = await supabaseAdmin
        .from('challenges')
        .select(baseSelect)
        .ilike('title', `%${rawCode}%`)
        .order('is_active', { ascending: false })
        .limit(1);

      if (listByTitle && listByTitle.length > 0) {
        challengeData = listByTitle[0];
      } else {
        // 2. Se for um prefixo de UUID (ex: primeiros 8 caracteres)
        const cleanHex = rawCode.replace(/[^0-9a-fA-F]/g, '');
        if (cleanHex.length >= 6) {
          const { data: allActive } = await supabaseAdmin
            .from('challenges')
            .select(baseSelect)
            .limit(50);

          const matched = (allActive || []).find((c: any) =>
            c.id.replace(/-/g, '').toLowerCase().startsWith(cleanHex.toLowerCase())
          );
          if (matched) {
            challengeData = matched;
          }
        }
      }
    }

    if (!challengeData) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Código de turma ou link de convite não encontrado. Peça o link atualizado ao seu treinador.',
        },
        { status: 404 }
      );
    }

    // Se o desafio foi explicitamente desativado pelo treinador
    if (challengeData.is_active === false) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Esta turma foi pausada ou encerrada pelo treinador.',
        },
        { status: 400 }
      );
    }

    // Se o desafio já expirou
    if (challengeData.end_date) {
      const endDate = new Date(challengeData.end_date + 'T23:59:59');
      if (endDate < new Date()) {
        return NextResponse.json(
          {
            valid: false,
            message: `Este desafio terminou em ${new Date(challengeData.end_date).toLocaleDateString('pt-BR')}. Converse com seu treinador sobre novas turmas.`,
          },
          { status: 400 }
        );
      }
    }

    // Validar capacidade de alunos de acordo com o plano do treinador (apenas inscritos confirmados)
    const { count: studentCount } = await supabaseAdmin
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
          message: `Esta turma já atingiu a capacidade máxima de ${planLimits.maxStudentsPerChallenge} alunos permitida pelo plano do treinador.`,
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
      { valid: false, message: 'Erro interno ao validar convite da turma.' },
      { status: 500 }
    );
  }
}
