import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AsaasClient } from '@/lib/asaas/client';
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
    const { planTier } = body;

    if (!planTier || !['pro', 'studio'].includes(planTier)) {
      return NextResponse.json({ error: 'Plano inválido para contratação.' }, { status: 400 });
    }

    const selectedTier = planTier as PlanTier;
    const planConfig = PLAN_CONFIG[selectedTier];

    // 2. Buscar perfil do profissional
    const { data: coach, error: coachError } = await supabase
      .from('professionals')
      .select('id, full_name, plan_tier, asaas_customer_id')
      .eq('id', user.id)
      .single();

    if (coachError || !coach) {
      return NextResponse.json({ error: 'Perfil de profissional não localizado.' }, { status: 404 });
    }

    // 3. Criar ou reutilizar cliente no Asaas
    let customerId = coach.asaas_customer_id;
    if (!customerId) {
      const customer = await AsaasClient.createCustomer({
        name: coach.full_name || user.email || 'Treinador ArenaFit',
        email: user.email || 'coach@arenafit.pro',
        cpfCnpj: '00000000000',
        externalReference: user.id,
      });
      customerId = customer.id;

      await supabaseAdmin
        .from('professionals')
        .update({ asaas_customer_id: customerId })
        .eq('id', user.id);
    }

    // 4. Gerar cobrança Pix pontual de primeiro mês para ativação
    const charge = await AsaasClient.createPixChargeWithSplit({
      customerId,
      value: planConfig.priceMonthly,
      description: `Assinatura Plano ${planConfig.name} - ArenaFitPro`,
      externalReference: `coach_plan_${selectedTier}_${user.id}`,
    });

    const pixData = await AsaasClient.getPixQrCode(charge.id);

    return NextResponse.json({
      success: true,
      planTier: selectedTier,
      planName: planConfig.name,
      monthlyPrice: planConfig.priceMonthly,
      chargeId: charge.id,
      pixCode: pixData.payload,
      pixQrBase64: pixData.encodedImage,
      expirationDate: pixData.expirationDate,
    });
  } catch (error: any) {
    console.error('Erro ao gerar checkout de plano:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar contratação de plano.' }, { status: 500 });
  }
}
