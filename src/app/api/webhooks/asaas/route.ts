import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ASAAS_CONFIG } from '@/lib/asaas/config';

export async function POST(request: Request) {
  try {
    // 1. Validação Rigorosa de Autenticidade do Webhook (Fail-Closed)
    const authToken = request.headers.get('asaas-access-token');
    const expectedSecret = ASAAS_CONFIG.webhookSecret;

    if (!expectedSecret || !authToken || authToken !== expectedSecret) {
      console.warn('[Asaas Webhook] Tentativa de acesso não autorizada ou secret não configurado.');
      return NextResponse.json({ error: 'Unauthorized webhook call' }, { status: 401 });
    }

    const payload = await request.json();
    const event = payload?.event;
    const payment = payload?.payment;

    console.log(`[Asaas Webhook] Evento verificado: ${event}`, payment?.id);

    if (!payment?.id) {
      return NextResponse.json({ received: true });
    }

    // 2. Eventos de Pagamento Aprovado / Confirmado
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      // 2.1. Atualizar transação na tabela de pagamentos via admin
      const { data: updatedPayment, error: paymentUpdateError } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'RECEIVED',
          paid_at: new Date().toISOString(),
        })
        .eq('asaas_payment_id', payment.id)
        .select('challenge_id, student_id, professional_id')
        .single();

      if (paymentUpdateError) {
        console.error('[Asaas Webhook] Erro ao atualizar status de pagamento:', paymentUpdateError);
      }

      // 2.2. Se for inscrição de aluno em desafio, garantir liberação imediata
      if (updatedPayment?.challenge_id && updatedPayment?.student_id) {
        const { error: partError } = await supabaseAdmin
          .from('challenge_participants')
          .upsert(
            {
              challenge_id: updatedPayment.challenge_id,
              student_id: updatedPayment.student_id,
              payment_status: 'paid',
            },
            { onConflict: 'challenge_id,student_id' }
          );

        if (partError) {
          console.error('[Asaas Webhook] Erro ao liberar participante do desafio:', partError);
        } else {
          console.log(`[Asaas Webhook] Acesso liberado: aluno ${updatedPayment.student_id} no desafio ${updatedPayment.challenge_id}`);
        }
      }

      // 2.3. Se for assinatura de plano do treinador (externalReference ou custom)
      if (payment.externalReference && payment.externalReference.startsWith('coach_plan_')) {
        // Formato: coach_plan_{planTier}_{coachId}
        const parts = payment.externalReference.split('_');
        const planTier = parts[2];
        const coachId = parts[3];
        if (coachId && ['starter', 'pro', 'studio'].includes(planTier)) {
          await supabaseAdmin
            .from('professionals')
            .update({
              plan_tier: planTier,
              plan_status: 'active',
            })
            .eq('id', coachId);
          console.log(`[Asaas Webhook] Plano do treinador ${coachId} atualizado para ${planTier}`);
        }
      }
    }

    // 3. Eventos de Estorno / Reembolso
    if (event === 'PAYMENT_REFUNDED') {
      const { data: refundedPayment } = await supabaseAdmin
        .from('payments')
        .update({ status: 'REFUNDED' })
        .eq('asaas_payment_id', payment.id)
        .select('challenge_id, student_id')
        .single();

      // Revogar acesso caso tenha sido reembolsado
      if (refundedPayment?.challenge_id && refundedPayment?.student_id) {
        await supabaseAdmin
          .from('challenge_participants')
          .update({ payment_status: 'refunded' })
          .eq('challenge_id', refundedPayment.challenge_id)
          .eq('student_id', refundedPayment.student_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Asaas Webhook] Erro fatal no processamento:', err);
    return NextResponse.json({ error: 'Erro interno no webhook.' }, { status: 500 });
  }
}
