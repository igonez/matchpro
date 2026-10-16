import { NextResponse } from 'next/server';
import { AsaasClient } from '@/lib/asaas/client';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { challengeId, studentName, studentEmail, studentCpf } = body;

    if (!challengeId) {
      return NextResponse.json({ error: 'ID do desafio é obrigatório.' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Obter usuário autenticado (aluno)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    // 2. Buscar detalhes do desafio e do treinador com supabaseAdmin para contornar RLS de professionals
    const { data: challenge, error: chError } = await supabaseAdmin
      .from('challenges')
      .select(`
        id,
        title,
        price,
        professional_id,
        professionals (
          id,
          full_name,
          plan_tier,
          platform_fee_percent,
          asaas_wallet_id
        )
      `)
      .eq('id', challengeId)
      .single();

    if (chError || !challenge) {
      return NextResponse.json({ error: 'Desafio não encontrado.' }, { status: 404 });
    }

    const price = Number(challenge.price || 0);
    if (price <= 0) {
      return NextResponse.json({ error: 'Este desafio é gratuito. Inscrição direta habilitada.' }, { status: 400 });
    }

    const professional: any = challenge.professionals;
    const planTier: PlanTier = professional?.plan_tier || 'starter';
    const planLimits = PLAN_CONFIG[planTier] || PLAN_CONFIG.starter;
    const feePercent = Number(professional?.platform_fee_percent || planLimits.platformFeePercent || 15);

    // Validar se a turma atingiu a capacidade máxima do plano do treinador (apenas inscritos confirmados)
    const { count: currentStudents } = await supabaseAdmin
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challengeId)
      .in('payment_status', ['paid', 'complimentary']);

    if ((currentStudents || 0) >= planLimits.maxStudentsPerChallenge) {
      return NextResponse.json(
        { error: `Esta turma atingiu a capacidade máxima de ${planLimits.maxStudentsPerChallenge} alunos permitida pelo plano do treinador.` },
        { status: 400 }
      );
    }

    // Cálculos do Split
    const feePlatform = Number(((price * feePercent) / 100).toFixed(2));
    const netCoach = Number((price - feePlatform).toFixed(2));

    // 3. Criar ou Obter Cliente Pagador no Asaas
    const cleanStudentCpf = (studentCpf || '').replace(/\D/g, '');
    const validStudentDoc = cleanStudentCpf.length === 11 || cleanStudentCpf.length === 14 ? cleanStudentCpf : undefined;

    const studentCustomerPayload: any = {
      name: studentName || user.user_metadata?.full_name || 'Aluno ArenaFit',
      email: studentEmail || user.email || 'aluno@arenafit.com',
      externalReference: user.id,
    };
    if (validStudentDoc) {
      studentCustomerPayload.cpfCnpj = validStudentDoc;
    }

    const customer = await AsaasClient.createCustomer(studentCustomerPayload);

    // 4. Configurar Split se o treinador já tiver walletId configurado
    const splitConfig = professional?.asaas_wallet_id
      ? [
          {
            walletId: professional.asaas_wallet_id,
            percentualValue: 100 - feePercent,
          },
        ]
      : undefined;

    // 5. Criar Cobrança Pix no Asaas
    const charge = await AsaasClient.createPixChargeWithSplit({
      customerId: customer.id,
      value: price,
      description: `Inscrição no Desafio: ${challenge.title} - ArenaFitPro`,
      externalReference: `chal_${challengeId}_stud_${user.id}`,
      split: splitConfig,
    });

    // 6. Gerar QR Code e Copia e Cola
    const pixData = await AsaasClient.getPixQrCode(charge.id);

    // 7. Registrar a transação pendente no Supabase de forma segura com Service Role
    await supabaseAdmin.from('payments').insert({
      challenge_id: challengeId,
      student_id: user.id,
      professional_id: challenge.professional_id,
      asaas_payment_id: charge.id,
      billing_type: 'PIX',
      gross_value: price,
      net_coach_value: netCoach,
      fee_platform_value: feePlatform,
      status: 'PENDING',
      pix_code: pixData.payload,
      pix_qr_url: pixData.encodedImage,
    });

    return NextResponse.json({
      success: true,
      paymentId: charge.id,
      pixCode: pixData.payload,
      pixQrBase64: pixData.encodedImage,
      expirationDate: pixData.expirationDate,
      grossValue: price,
      netCoach,
      feePlatform,
    });
  } catch (err: any) {
    console.error('Erro ao gerar cobrança Pix:', err);
    return NextResponse.json({ error: err.message || 'Erro ao processar cobrança Pix.' }, { status: 500 });
  }
}
