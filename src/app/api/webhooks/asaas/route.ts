import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ASAAS_CONFIG } from '@/lib/asaas/config';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';
import { logSecurityEvent } from '@/lib/security/audit';
import { sendMetaConversionEvent } from '@/lib/analytics/meta-capi';

function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  try {
    // 1. Validação Rigorosa de Autenticidade do Webhook (Timing-Safe & Fail-Closed)
    const authToken = request.headers.get('asaas-access-token') || '';
    const expectedSecret = ASAAS_CONFIG.webhookSecret;

    if (!expectedSecret || !authToken || !safeCompare(authToken, expectedSecret)) {
      await logSecurityEvent({
        eventType: 'WEBHOOK_SIGNATURE_MISMATCH',
        severity: 'HIGH',
        resourcePath: '/api/webhooks/asaas',
        details: { ip: request.headers.get('x-forwarded-for') || 'unknown' },
      });
      console.warn('[Asaas Webhook] Tentativa de acesso não autorizada ao webhook.');
      return NextResponse.json({ error: 'Unauthorized webhook call' }, { status: 401 });
    }

    const payload = await request.json();
    const event = payload?.event;
    const payment = payload?.payment;

    const eventId = payload?.id || `${event}_${payment?.id || Date.now()}`;
    console.log(`[Asaas Webhook] Evento verificado: ${event} [${eventId}]`);

    // 2. Verificação de Idempotência (Evita duplicidade ao reenviar webhooks)
    try {
      const { data: alreadyProcessed } = await supabaseAdmin
        .from('processed_webhooks')
        .select('event_id')
        .eq('event_id', eventId)
        .maybeSingle();

      if (alreadyProcessed) {
        console.log(`[Asaas Webhook] Evento ${eventId} já processado anteriormente. Ignorando reexecução.`);
        return NextResponse.json({ success: true, duplicate: true });
      }
    } catch (idemErr) {
      console.warn('[Asaas Webhook] Aviso ao verificar processed_webhooks:', idemErr);
    }

    if (!payment?.id && !payload?.subscription) {
      return NextResponse.json({ received: true });
    }

    // 3. Eventos de Pagamento Aprovado / Confirmado
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      // 3.1. Atualizar transação na tabela de pagamentos via admin com reconciliação real de centavos
      const updateData: any = {
        status: 'RECEIVED',
        paid_at: new Date().toISOString(),
      };

      if (payment?.split && Array.isArray(payment.split) && payment.split.length > 0) {
        const splitItem = payment.split[0];
        const realCoachValue = Number(splitItem.totalValue ?? splitItem.value ?? 0);
        if (realCoachValue > 0) {
          updateData.net_coach_value = realCoachValue;
          if (typeof payment.netValue === 'number') {
            updateData.fee_platform_value = Number(Math.max(0, payment.netValue - realCoachValue).toFixed(2));
          }
        }
      }

      const { data: updatedPayment, error: paymentUpdateError } = await supabaseAdmin
        .from('payments')
        .update(updateData)
        .eq('asaas_payment_id', payment.id)
        .select('challenge_id, student_id, professional_id')
        .single();

      if (paymentUpdateError) {
        console.error('[Asaas Webhook] Erro ao atualizar status de pagamento:', paymentUpdateError);
      }

      // 3.2. Se for inscrição de aluno em desafio, garantir liberação imediata
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

        // Validar se o valor pago é compatível com o plano Pro (evita adulteração de valor)
        const paymentValue = Number(payment.value || 0);
        if (coachSub?.id && paymentValue >= 40) {
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
        // Fallback seguro para cobrança avulsa com externalReference e checagem de valor
        const parts = payment.externalReference.split('_');
        const planTier = parts[2] as PlanTier;
        const coachId = parts[3];
        const paymentValue = Number(payment.value || 0);
        if (coachId && planTier === 'pro' && paymentValue >= 40) {
          const nextMonth = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString();
          await supabaseAdmin
            .from('professionals')
            .update({
              plan_tier: 'pro',
              plan_status: 'active',
              platform_fee_percent: PLAN_CONFIG.pro.platformFeePercent,
              current_period_end: nextMonth,
            })
            .eq('id', coachId);
          console.log(`[Asaas Webhook] Plano do treinador ${coachId} atualizado para pro`);
        }
      }

      // 3.4. Disparo Server-Side (Meta Conversions API - CAPI) para atribuição de tráfego pago (Pix/Cartão)
      const purchaseValue = Number(payment?.value || 0);
      if (purchaseValue > 0 && payment?.id) {
        const isCoachSubscription = Boolean(
          payment.subscription ||
            (payment.externalReference &&
              payment.externalReference.startsWith('coach_plan_'))
        );
        const buyerUserId =
          updatedPayment?.student_id || updatedPayment?.professional_id || null;

        await sendMetaConversionEvent({
          eventName: isCoachSubscription ? 'Subscribe' : 'Purchase',
          eventId: `asaas_pay_${payment.id}`,
          value: purchaseValue,
          currency: 'BRL',
          contentName: isCoachSubscription
            ? 'Assinatura ArenaFitPro Pro'
            : 'Inscrição em Desafio Fitness',
          contentCategory: isCoachSubscription ? 'SaaS_Subscription' : 'Challenge_Ticket',
          user: {
            externalId: buyerUserId,
          },
        });
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

    // 7. Registrar evento como processado para garantir idempotência futura
    try {
      await supabaseAdmin.from('processed_webhooks').upsert(
        {
          event_id: eventId,
          event_type: event || 'UNKNOWN',
          processed_at: new Date().toISOString(),
        },
        { onConflict: 'event_id' }
      );
    } catch (whErr) {
      console.warn('[Asaas Webhook] Aviso ao gravar log de idempotência:', whErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Asaas Webhook] Erro fatal no processamento:', err);
    return NextResponse.json({ error: 'Erro interno no webhook.' }, { status: 500 });
  }
}
