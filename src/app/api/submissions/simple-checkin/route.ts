import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Autenticação obrigatória.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { missionId, challengeId, caption } = body;

    if (!missionId) {
      return NextResponse.json(
        { error: 'ID da missão é obrigatório.' },
        { status: 400 }
      );
    }

    // 1. Obter dados da missão
    const { data: mission, error: missionError } = await supabaseAdmin
      .from('missions')
      .select('id, title, challenge_id, points_rewarded, validation_type, category')
      .eq('id', missionId)
      .single();

    if (missionError || !mission) {
      return NextResponse.json(
        { error: 'Missão não encontrada no sistema.' },
        { status: 404 }
      );
    }

    const resolvedChallengeId = mission.challenge_id || challengeId;

    // 2. Verificar se o aluno está matriculado no desafio correspondente
    if (resolvedChallengeId) {
      const { data: participant, error: partError } = await supabaseAdmin
        .from('challenge_participants')
        .select('id, payment_status')
        .eq('challenge_id', resolvedChallengeId)
        .eq('student_id', user.id)
        .maybeSingle();

      if (partError || !participant) {
        return NextResponse.json(
          { error: 'Você não está matriculado neste desafio.' },
          { status: 403 }
        );
      }
    }

    // 3. Validação anti-duplicação diária (Cooldown / Check-in único no dia)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: existingSubmissions } = await supabaseAdmin
      .from('student_submissions')
      .select('id, status, submitted_at')
      .eq('mission_id', missionId)
      .eq('student_id', user.id)
      .gte('submitted_at', todayStart.toISOString());

    if (existingSubmissions && existingSubmissions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Você já realizou o check-in desta missão hoje! Volte amanhã.',
          alreadyCompleted: true,
        },
        { status: 409 }
      );
    }

    // 4. Inserir a submissão autorizada com status 'approved' via admin
    const nowIso = new Date().toISOString();
    const { data: newSubmission, error: insertError } = await supabaseAdmin
      .from('student_submissions')
      .insert({
        challenge_id: resolvedChallengeId || null,
        mission_id: mission.id,
        student_id: user.id,
        status: 'approved',
        photo_url: 'simple_click',
        caption: caption || 'Check-in direto de hábito confirmado',
        submitted_at: nowIso,
        client_captured_at: nowIso,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Simple Checkin] Erro ao registrar submissão:', insertError);
      return NextResponse.json(
        { error: 'Erro ao registrar check-in no banco de dados.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Missão "${mission.title}" concluída com sucesso!`,
      submission: newSubmission,
      pointsRewarded: mission.points_rewarded,
    });
  } catch (error: any) {
    console.error('[Simple Checkin] Erro interno:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao processar check-in.' },
      { status: 500 }
    );
  }
}
