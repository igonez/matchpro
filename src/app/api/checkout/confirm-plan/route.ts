import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Validar autenticação do coach
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { planTier, paymentMethod } = body;

    // Em produção, upgrades não podem ser confirmados sem webhook do gateway
    if (planTier !== 'starter' && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        error: 'Upgrades de plano devem ser realizados exclusivamente através do fluxo oficial de pagamento Asaas.' 
      }, { status: 403 });
    }

    // Permitir apenas 'starter' (downgrade) ou 'pro' (em dev/test)
    if (!planTier || !['starter', 'pro'].includes(planTier)) {
      return NextResponse.json({ 
        error: 'Plano inválido ou temporariamente indisponível para contratação.' 
      }, { status: 400 });
    }

    const selectedTier = planTier as PlanTier;
    const planConfig = PLAN_CONFIG[selectedTier];
    const platformFee = planConfig.platformFeePercent;

    // 2. Se for downgrade para Starter, cancelar assinatura ativa no Asaas
    if (selectedTier === 'starter') {
      const { data: coachProf } = await supabaseAdmin
        .from('professionals')
        .select('asaas_subscription_id')
        .eq('id', user.id)
        .maybeSingle();

      if (coachProf?.asaas_subscription_id) {
        try {
          const { AsaasClient } = await import('@/lib/asaas/client');
          await AsaasClient.cancelSubscription(coachProf.asaas_subscription_id);
          console.log(`[Downgrade] Assinatura Asaas ${coachProf.asaas_subscription_id} cancelada com sucesso.`);
        } catch (subCancelErr: any) {
          console.warn('[Downgrade] Aviso ao cancelar assinatura Asaas:', subCancelErr?.message);
        }
      }
    }

    // 3. Atualizar plano do treinador de forma segura via service_role (bypassa trigger anti-tamper)
    const updateFields: any = {
      plan_tier: selectedTier,
      platform_fee_percent: platformFee,
    };
    if (selectedTier === 'starter') {
      updateFields.asaas_subscription_id = null;
      updateFields.plan_status = 'canceled';
    }

    const { data: updatedCoach, error: updateError } = await supabaseAdmin
      .from('professionals')
      .update(updateFields)
      .eq('id', user.id)
      .select('id, full_name, plan_tier, platform_fee_percent')
      .single();

    if (updateError) {
      console.error('Erro ao atualizar plano do treinador no Supabase:', updateError);
      return NextResponse.json({ error: 'Erro ao atualizar permissões do plano no banco.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Plano ${planConfig.name} ativado com sucesso!`,
      planTier: selectedTier,
      planName: planConfig.name,
      platformFeePercent: platformFee,
      paymentMethod: paymentMethod || 'MANUAL',
    });
  } catch (error: any) {
    console.error('Erro na confirmação do plano:', error);
    return NextResponse.json({ 
      error: error.message || 'Falha ao processar confirmação de plano.' 
    }, { status: 500 });
  }
}
