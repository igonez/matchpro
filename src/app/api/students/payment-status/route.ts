import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { participantId, challengeId, studentId, paymentStatus } = body;

    if (!participantId || !['paid', 'pending', 'complimentary'].includes(paymentStatus)) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    // 1. Verificar se o participante pertence a um desafio cujo dono é o treinador autenticado
    const { data: participant, error: partFetchErr } = await supabaseAdmin
      .from('challenge_participants')
      .select('id, challenge_id, student_id, challenges!inner(id, professional_id)')
      .eq('id', participantId)
      .single();

    if (partFetchErr || !participant) {
      return NextResponse.json({ error: 'Inscrição não localizada.' }, { status: 404 });
    }

    const challengeObj: any = participant.challenges;
    if (challengeObj?.professional_id !== user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para alterar este aluno.' }, { status: 403 });
    }

    // 2. Atualizar status de pagamento via service_role (bypassa bloqueio de trigger client-side)
    const { error: updateErr } = await supabaseAdmin
      .from('challenge_participants')
      .update({ payment_status: paymentStatus })
      .eq('id', participantId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 3. Se aprovado ('paid' ou 'complimentary'), garantir presença no leaderboard_standings
    const targetChallengeId = challengeId || participant.challenge_id;
    const targetStudentId = studentId || participant.student_id;

    if ((paymentStatus === 'paid' || paymentStatus === 'complimentary') && targetChallengeId && targetStudentId) {
      await supabaseAdmin
        .from('leaderboard_standings')
        .upsert(
          {
            challenge_id: targetChallengeId,
            student_id: targetStudentId,
            total_points: 0,
          },
          { onConflict: 'challenge_id,student_id', ignoreDuplicates: true }
        );
    }

    return NextResponse.json({
      success: true,
      paymentStatus,
    });
  } catch (error: any) {
    console.error('Erro ao alternar status de pagamento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno ao atualizar status.' },
      { status: 500 }
    );
  }
}
