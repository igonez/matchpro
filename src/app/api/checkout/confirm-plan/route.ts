import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';
import { AsaasClient } from '@/lib/asaas/client';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit';

export async function POST(request: Request) {
  try {
    const rateLimitResponse = enforceRateLimit(request, 'checkout');
    if (rateLimitResponse) return rateLimitResponse;

    const supabase = await createClient();

    // 1. Validar autenticação do coach
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { planTier } = body;

    // Permitir apenas 'starter' (downgrade) ou 'pro' (verificação estrita via Asaas)
    if (!planTier || !['starter', 'pro'].includes(planTier)) {
      return NextResponse.json({ 
        error: 'Plano inválido ou indisponível.' 
      }, { status: 400 });
    }

    const selectedTier = planTier as PlanTier;

    // 2. Buscar perfil atual do treinador
    const { data: coachProf, error: coachError } = await supabaseAdmin
      .from('professionals')
      .select('id, full_name, plan_tier, asaas_subscription_id')
      .eq('id', user.id)
      .single();

    if (coachError || !coachProf) {
      return NextResponse.json({ error: 'Perfil de profissional não localizado.' }, { status: 404 });
    }

    // 3. SE FOR UPGRADE PARA PRO: Verificação estrita e à prova de fraude na API do Asaas
    if (selectedTier === 'pro') {
      if (!coachProf.asaas_subscription_id) {
        await logSecurityEvent({
          eventType: 'UNAUTHORIZED_API_ACCESS',
          severity: 'WARN',
          userId: user.id,
          resourcePath: '/api/checkout/confirm-plan',
          details: { reason: 'Tentativa de upgrade sem assinatura criada no Asaas' },
        });
        return NextResponse.json({ 
          error: 'Nenhuma assinatura do plano Pro pendente de pagamento foi localizada para esta conta.' 
        }, { status: 400 });
      }

      // Consultar diretamente o livro-razão bancário do Asaas para comprovação do pagamento
      let asaasPayments: any;
      try {
        asaasPayments = await AsaasClient.getSubscriptionPayments(coachProf.asaas_subscription_id);
      } catch (asaasErr: any) {
        console.error('[Confirm Plan] Erro ao consultar Asaas:', asaasErr);
        return NextResponse.json({ 
          error: 'Não foi possível validar o pagamento junto à instituição bancária no momento. Tente novamente em instantes.' 
        }, { status: 502 });
      }

      const validPaid = asaasPayments?.data?.find(
        (p: any) => (p.status === 'RECEIVED' || p.status === 'CONFIRMED') && Number(p.value) >= 40
      );

      if (!validPaid) {
        return NextResponse.json({ 
          error: 'O pagamento da assinatura ainda não foi confirmado pela instituição bancária. Assim que o Pix/Cartão for compensado, seu plano será liberado automaticamente.' 
        }, { status: 400 });
      }

      // Pagamento COMPROVADO no Asaas! Ativar Pro com taxa 0%
      const nextMonth = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString();
      const { data: updatedCoach, error: updateError } = await supabaseAdmin
        .from('professionals')
        .update({
          plan_tier: 'pro',
          plan_status: 'active',
          platform_fee_percent: PLAN_CONFIG.pro.platformFeePercent,
          current_period_end: nextMonth,
        })
        .eq('id', user.id)
        .select('id, full_name, plan_tier, platform_fee_percent')
        .single();

      if (updateError) {
        console.error('Erro ao atualizar permissões do plano no Supabase:', updateError);
        return NextResponse.json({ error: 'Erro ao registrar ativação no banco.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Pagamento confirmado no Asaas! Plano Pro Coach ativado com sucesso!',
        planTier: 'pro',
        planName: PLAN_CONFIG.pro.name,
        platformFeePercent: PLAN_CONFIG.pro.platformFeePercent,
      });
    }

    // 4. SE FOR DOWNGRADE PARA STARTER: Cancelar assinatura no Asaas e reverter para plano gratuito
    if (selectedTier === 'starter') {
      if (coachProf.asaas_subscription_id) {
        try {
          await AsaasClient.cancelSubscription(coachProf.asaas_subscription_id);
          console.log(`[Downgrade] Assinatura Asaas ${coachProf.asaas_subscription_id} cancelada com sucesso.`);
        } catch (subCancelErr: any) {
          console.warn('[Downgrade] Aviso ao cancelar assinatura Asaas:', subCancelErr?.message);
        }
      }

      const { data: updatedCoach, error: updateError } = await supabaseAdmin
        .from('professionals')
        .update({
          plan_tier: 'starter',
          plan_status: 'canceled',
          platform_fee_percent: PLAN_CONFIG.starter.platformFeePercent,
          asaas_subscription_id: null,
        })
        .eq('id', user.id)
        .select('id, full_name, plan_tier, platform_fee_percent')
        .single();

      if (updateError) {
        console.error('Erro ao efetuar downgrade no Supabase:', updateError);
        return NextResponse.json({ error: 'Erro ao atualizar plano no banco.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Plano revertido para Starter Coach.',
        planTier: 'starter',
        planName: PLAN_CONFIG.starter.name,
        platformFeePercent: PLAN_CONFIG.starter.platformFeePercent,
      });
    }

    return NextResponse.json({ error: 'Operação inválida.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro na confirmação do plano:', error);
    return NextResponse.json({ 
      error: error.message || 'Falha ao processar confirmação de plano.' 
    }, { status: 500 });
  }
}
