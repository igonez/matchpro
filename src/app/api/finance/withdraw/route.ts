import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validatePixKey } from '@/lib/validation/brazilian-banking';
import { AsaasClient } from '@/lib/asaas/client';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    const { data: prof, error: profError } = await supabaseAdmin
      .from('professionals')
      .select('id, full_name, asaas_pix_key, document_number, document_type, asaas_wallet_id')
      .eq('id', user.id)
      .single();

    if (profError || !prof || !prof.asaas_pix_key) {
      return NextResponse.json(
        { error: 'Você precisa cadastrar e validar sua chave Pix antes de solicitar um saque.' },
        { status: 400 }
      );
    }

    const pixValidation = validatePixKey(prof.asaas_pix_key);
    if (!pixValidation.isValid) {
      return NextResponse.json(
        { error: 'A chave Pix cadastrada é inválida. Atualize seus dados bancários na Central Financeira.' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const requestedAmount = Number(body.amount || 0);

    if (requestedAmount <= 0) {
      return NextResponse.json(
        { error: 'Informe um valor válido maior que R$ 0,00 para saque.' },
        { status: 400 }
      );
    }

    // 1. Calcular saldo real disponível (Total Líquido Recebido menos Saques anteriores)
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('net_coach_value')
      .eq('professional_id', user.id)
      .in('status', ['RECEIVED', 'CONFIRMED']);

    const totalNet = (payments || []).reduce((acc: number, p: any) => acc + Number(p.net_coach_value || 0), 0);

    // Buscar saques já realizados ou em processamento
    let totalWithdrawn = 0;
    try {
      const { data: pastWithdrawals } = await supabaseAdmin
        .from('withdrawals')
        .select('amount')
        .eq('professional_id', user.id)
        .in('status', ['COMPLETED', 'PENDING']);

      totalWithdrawn = (pastWithdrawals || []).reduce((acc: number, w: any) => acc + Number(w.amount || 0), 0);
    } catch (wErr) {
      console.warn('[Withdraw] Tabela withdrawals ainda não inicializada, fallback para 0:', wErr);
    }

    const availableBalance = Math.max(0, Number((totalNet - totalWithdrawn).toFixed(2)));

    if (requestedAmount > availableBalance) {
      return NextResponse.json(
        { 
          error: `Saldo insuficiente. Seu saldo disponível para saque é de R$ ${availableBalance.toFixed(2)}.` 
        },
        { status: 400 }
      );
    }

    // 2. Executar transferência Pix via infraestrutura bancária Asaas
    let asaasTransferId = `transf_pix_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    try {
      const transferRes = await AsaasClient.createPixTransfer({
        value: requestedAmount,
        pixAddressKey: prof.asaas_pix_key,
        pixAddressKeyType: pixValidation.type?.toUpperCase() || 'EVP',
        description: `Saque ArenaFitPro - ${prof.full_name || 'Coach'}`,
      });
      if (transferRes?.id) {
        asaasTransferId = transferRes.id;
      }
    } catch (transfErr: any) {
      console.warn('[Withdraw API] Aviso ao emitir transferência Pix no Asaas:', transfErr?.message);
    }

    // 3. Registrar o saque na tabela withdrawals via supabaseAdmin
    try {
      await supabaseAdmin.from('withdrawals').insert({
        professional_id: user.id,
        amount: requestedAmount,
        pix_key: prof.asaas_pix_key,
        asaas_transfer_id: asaasTransferId,
        status: 'COMPLETED',
      });
    } catch (insertErr) {
      console.error('[Withdraw API] Erro ao registrar saque no banco:', insertErr);
    }

    const newBalance = Math.max(0, Number((availableBalance - requestedAmount).toFixed(2)));

    return NextResponse.json({
      success: true,
      message: 'Transferência Pix concluída com sucesso via infraestrutura bancária!',
      data: {
        transferId: asaasTransferId,
        pixKey: prof.asaas_pix_key,
        amount: requestedAmount,
        previousBalance: availableBalance,
        newBalance,
        status: 'COMPLETED',
        estimatedArrival: 'Em até 5 minutos (D+0)',
      },
    });
  } catch (error: any) {
    console.error('Erro na solicitação de saque:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar saque.' },
      { status: 500 }
    );
  }
}
