import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AsaasClient } from '@/lib/asaas/client';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Validar autenticação do coach
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // 1.1 Rate limiting por treinador para evitar criação duplicada de assinaturas no Asaas
    const rateLimitResponse = enforceRateLimit(request, 'checkout', `coach-plan:${user.id}`);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { planTier, billingType = 'PIX', creditCard, creditCardHolderInfo } = body;

    if (!planTier || planTier !== 'pro') {
      return NextResponse.json({ 
        error: 'Apenas o plano Pro Coach está disponível para assinatura.' 
      }, { status: 400 });
    }

    const selectedTier = 'pro' as PlanTier;
    const planConfig = PLAN_CONFIG[selectedTier];

    // 2. Buscar perfil do profissional
    const { data: coach, error: coachError } = await supabase
      .from('professionals')
      .select('id, full_name, plan_tier, asaas_customer_id, document_number, phone')
      .eq('id', user.id)
      .single();

    if (coachError || !coach) {
      return NextResponse.json({ error: 'Perfil de profissional não localizado.' }, { status: 404 });
    }

    // 3. Criar ou reutilizar cliente no Asaas
    let customerId = coach.asaas_customer_id;
    if (!customerId) {
      const cleanDoc = (coach.document_number || '').replace(/\D/g, '');
      const validCpf = cleanDoc.length === 11 || cleanDoc.length === 14 ? cleanDoc : undefined;

      const customerPayload: any = {
        name: coach.full_name || user.user_metadata?.full_name || user.email || 'Treinador ArenaFit',
        email: user.email || 'coach@arenafit.pro',
        phone: coach.phone || user.user_metadata?.phone || undefined,
        externalReference: user.id,
      };
      if (validCpf) {
        customerPayload.cpfCnpj = validCpf;
      }

      const customer = await AsaasClient.createCustomer(customerPayload);
      customerId = customer.id;

      await supabaseAdmin
        .from('professionals')
        .update({ asaas_customer_id: customerId })
        .eq('id', user.id);
    }

    // 4. Criar Assinatura Recorrente Mensal no Asaas (/v3/subscriptions)
    const today = new Date();
    const nextDueDate = today.toISOString().split('T')[0];

    let subscription: any;
    try {
      subscription = await AsaasClient.createSubscription({
        customerId,
        billingType: billingType === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'PIX',
        value: planConfig.priceMonthly,
        nextDueDate,
        cycle: 'MONTHLY',
        description: `Assinatura Mensal Plataforma ArenaFitPro - Plano ${planConfig.name}`,
        creditCard: billingType === 'CREDIT_CARD' ? creditCard : undefined,
        creditCardHolderInfo: billingType === 'CREDIT_CARD' ? creditCardHolderInfo : undefined,
      });
    } catch (subErr: any) {
      // Se o cliente for inválido ou não existir no Asaas (ex: ID antigo/ambiente diferente), gera um novo cliente e tenta novamente
      if (subErr?.message?.includes('Cliente inválido') || subErr?.message?.includes('invalid_customer')) {
        console.warn('[Checkout Coach Plan] Cliente Asaas inválido, gerando novo cliente...');
        const cleanDoc = (coach.document_number || '').replace(/\D/g, '');
        const validCpf = cleanDoc.length === 11 || cleanDoc.length === 14 ? cleanDoc : undefined;
        const freshCustomerPayload: any = {
          name: coach.full_name || user.user_metadata?.full_name || user.email || 'Treinador ArenaFit',
          email: user.email || 'coach@arenafit.pro',
          phone: coach.phone || user.user_metadata?.phone || undefined,
          externalReference: user.id,
        };
        if (validCpf) freshCustomerPayload.cpfCnpj = validCpf;

        const freshCustomer = await AsaasClient.createCustomer(freshCustomerPayload);
        customerId = freshCustomer.id;

        await supabaseAdmin
          .from('professionals')
          .update({ asaas_customer_id: customerId })
          .eq('id', user.id);

        subscription = await AsaasClient.createSubscription({
          customerId,
          billingType: billingType === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'PIX',
          value: planConfig.priceMonthly,
          nextDueDate,
          cycle: 'MONTHLY',
          description: `Assinatura Mensal Plataforma ArenaFitPro - Plano ${planConfig.name}`,
          creditCard: billingType === 'CREDIT_CARD' ? creditCard : undefined,
          creditCardHolderInfo: billingType === 'CREDIT_CARD' ? creditCardHolderInfo : undefined,
        });
      } else {
        throw subErr;
      }
    }

    // Salvar ID da assinatura no perfil do treinador
    await supabaseAdmin
      .from('professionals')
      .update({
        asaas_subscription_id: subscription.id,
        plan_cycle: 'MONTHLY',
      })
      .eq('id', user.id);

    // 5. Se for PIX, buscar a cobrança inicial para fornecer o QR Code
    let pixData: any = null;
    let initialChargeId: string | null = null;

    if (billingType === 'PIX') {
      try {
        const paymentsList = await AsaasClient.getSubscriptionPayments(subscription.id);
        const firstPayment = paymentsList?.data?.[0];

        if (firstPayment?.id) {
          initialChargeId = firstPayment.id;
          pixData = await AsaasClient.getPixQrCode(firstPayment.id);
        }
      } catch (err: any) {
        console.warn('Aviso ao buscar cobrança inicial da assinatura:', err?.message);
      }
    }

    // 6. Se for Cartão de Crédito e já estiver ativa, atualizar o banco imediatamente
    if (billingType === 'CREDIT_CARD' && subscription.status === 'ACTIVE') {
      await supabaseAdmin
        .from('professionals')
        .update({
          plan_tier: selectedTier,
          plan_status: 'active',
          platform_fee_percent: planConfig.platformFeePercent,
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      planTier: selectedTier,
      planName: planConfig.name,
      monthlyPrice: planConfig.priceMonthly,
      billingType,
      chargeId: initialChargeId,
      pixCode: pixData?.payload || null,
      pixQrBase64: pixData?.encodedImage || null,
      expirationDate: pixData?.expirationDate || null,
    });
  } catch (error: any) {
    console.error('Erro ao gerar assinatura recorrente do plano:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar assinatura de plano.' }, { status: 500 });
  }
}
