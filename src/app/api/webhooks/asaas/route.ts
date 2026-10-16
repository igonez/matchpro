import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ASAAS_CONFIG } from '@/lib/asaas/config';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';

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
          // Garantir presença imediata no ranking da turma
          await supabaseAdmin
            .from('leaderboard_standings')
            .upsert(
              {
                challenge_id: updatedPayment.challenge_id,
                student_id: updatedPayment.student_id,
                total_points: 0,
              },
              { onConflict: 'challenge_id,student_id', ignoreDuplicates: true }
            );
        }
      }

      // 2.3. Se for assinatura de plano do treinador (via payment.subscription ou externalReference)
      const subId = payment.subscription;
      if (subId) {
        const { data: coachSub } = await supabaseAdmin
          .from('professionals')
          .select('id')
          .eq('asaas_subscription_id', subId)
          .maybeSingle();

        if (coachSub?.id) {
          const nextMonth = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString();
          await supabaseAdmin
            .from('professionals')
            .update({
              plan_tier: 'pro',
              plan_status: 'active',
              platform_fee_percent: PLAN_CONFIG.pro.platformFeePercent,
              current_period_end: nextMonth,
            })
            .eq('id', coachSub.id);
          console.log(`[Asaas Webhook] Assinatura recorrente ${subId} confirmada/renovada para treinador ${coachSub.id}`);
        }
      } else if (payment.externalReference && payment.externalReference.startsWith('coach_plan_')) {
        // Fallback para cobrança com externalReference
        const parts = payment.externalReference.split('_');
        const planTier = parts[2] as PlanTier;
        const coachId = parts[3];
        if (coachId && ['starter', 'pro'].includes(planTier)) {
          const tierConfig = PLAN_CONFIG[planTier] || PLAN_CONFIG.starter;
          await supabaseAdmin
            .from('professionals')
            .update({
              plan_tier: planTier,
              plan_status: 'active',
              platform_fee_percent: tierConfig.platformFeePercent,
            })
            .eq('id', coachId);
          console.log(`[Asaas Webhook] Plano do treinador ${coachId} atualizado para ${planTier}`);
        }
      }
    }

    // 3. Evento de Inadimplência na Assinatura (Atraso de pagamento)
    if (event === 'PAYMENT_OVERDUE') {
      const subId = payment?.subscription;
      if (subId) {
        await supabaseAdmin
          .from('professionals')
          .update({ plan_status: 'past_due' })
          .eq('asaas_subscription_id', subId);
        console.warn(`[Asaas Webhook] Assinatura ${subId} com pagamento em atraso (past_due).`);
      }
    }

    // 4. Eventos de Cancelamento / Inativação de Assinatura
    if (event === 'SUBSCRIPTION_INACTIVATED' || event === 'SUBSCRIPTION_DELETED') {
      const subId = payload?.subscription?.id || payment?.subscription;
      if (subId) {
        await supabaseAdmin
          .from('professionals')
          .update({
            plan_tier: 'starter',
            plan_status: 'canceled',
            platform_fee_percent: PLAN_CONFIG.starter.platformFeePercent,
          })
          .eq('asaas_subscription_id', subId);
        console.log(`[Asaas Webhook] Assinatura ${subId} inativada. Treinador revertido para plano Starter (15%).`);
      }
    }

    // 5. Evento de Liquidação de Split
    if (event === 'PAYMENT_SPLIT_DONE') {
      const splitId = payload?.additionalInfo?.splitId;
      console.log(`[Asaas Webhook] Split liquidado com sucesso! Cobrança: ${payment?.id}, Split ID: ${splitId}`);
    }

    // 6. Eventos de Estorno / Reembolso
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
