import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validatePixKey } from '@/lib/validation/brazilian-banking';
import { AsaasClient } from '@/lib/asaas/client';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    // 1. Rate limiting estrito por usuário (prevenção de concorrência e spam de saque)
    const rateLimitResponse = enforceRateLimit(request, 'checkout', `withdraw:${user.id}`);
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Trava anti-concorrência (Prevenção de Race Condition / Double Spending - CWE-362)
    // Se já existir um saque pendente criado há menos de 2 minutos, bloqueia requisições paralelas
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: pendingWithdrawals } = await supabaseAdmin
      .from('withdrawals')
      .select('id')
      .eq('professional_id', user.id)
      .eq('status', 'PENDING')
      .gte('created_at', twoMinutesAgo)
      .limit(1);

    if (pendingWithdrawals && pendingWithdrawals.length > 0) {
      return NextResponse.json(
        { error: 'Existe uma solicitação de saque em processamento para sua conta. Aguarde alguns instantes.' },
        { status: 429 }
      );
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

    if (isNaN(requestedAmount) || requestedAmount < 5) {
      return NextResponse.json(
        { error: 'O valor mínimo para solicitação de saque Pix é de R$ 5,00.' },
        { status: 400 }
      );
    }

    // 1. Calcular saldo real liquidado disponível (Apenas pagamentos com status RECEIVED)
    // Importante: status CONFIRMED (cartão/boleto pendente de liquidação) NÃO pode ser sacado.
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('net_coach_value')
      .eq('professional_id', user.id)
      .eq('status', 'RECEIVED');

    if (paymentsError) {
      console.error('[Withdraw API] Erro ao consultar pagamentos liquidados:', paymentsError);
      return NextResponse.json(
        { error: 'Não foi possível consultar seu saldo liquidado no momento.' },
        { status: 500 }
      );
    }

    const totalNet = (payments || []).reduce((acc: number, p: any) => acc + Number(p.net_coach_value || 0), 0);

    // Buscar saques já realizados ou em processamento (COMPLETED ou PENDING)
    let totalWithdrawn = 0;
    try {
      const { data: pastWithdrawals } = await supabaseAdmin
        .from('withdrawals')
        .select('amount')
        .eq('professional_id', user.id)
        .in('status', ['COMPLETED', 'PENDING']);

      totalWithdrawn = (pastWithdrawals || []).reduce((acc: number, w: any) => acc + Number(w.amount || 0), 0);
    } catch (wErr) {
      console.warn('[Withdraw API] Tabela withdrawals ainda não inicializada:', wErr);
    }

    const availableBalance = Math.max(0, Number((totalNet - totalWithdrawn).toFixed(2)));

    if (requestedAmount > availableBalance) {
      return NextResponse.json(
        { 
          error: `Saldo disponível insuficiente. Seu saldo disponível para saque é de R$ ${availableBalance.toFixed(2)}.` 
        },
        { status: 400 }
      );
    }

    // 2. Executar transferência Pix real via infraestrutura bancária Asaas
    let transferRes: { id: string; status: string; value: number };
    try {
      transferRes = await AsaasClient.createPixTransfer({
        value: requestedAmount,
        pixAddressKey: prof.asaas_pix_key,
        pixAddressKeyType: pixValidation.type?.toUpperCase() || 'EVP',
        description: `Saque ArenaFitPro - ${prof.full_name || 'Coach'}`,
      });

      if (!transferRes?.id) {
        throw new Error('O banco Asaas não retornou o identificador da transferência.');
      }
    } catch (transfErr: any) {
      console.error('[Withdraw API] Falha na emissão de transferência Pix no Asaas:', transfErr?.message);
      return NextResponse.json(
        { 
          error: `Falha na transferência bancária: ${transfErr?.message || 'A instituição bancária recusou a transação.'}` 
        },
        { status: 502 }
      );
    }

    // 3. Registrar o saque na tabela withdrawals via supabaseAdmin com status retornado pelo Asaas
    const finalStatus = transferRes.status === 'PENDING' ? 'PENDING' : 'COMPLETED';
    const { error: insertErr } = await supabaseAdmin.from('withdrawals').insert({
      professional_id: user.id,
      amount: requestedAmount,
      pix_key: prof.asaas_pix_key,
      asaas_transfer_id: transferRes.id,
      status: finalStatus,
    });

    if (insertErr) {
      console.error('[Withdraw API] Erro ao registrar saque no banco:', insertErr);
    }

    await logSecurityEvent({
      eventType: 'SENSITIVE_DATA_ACCESSED',
      severity: 'INFO',
      userId: user.id,
      userEmail: user.email,
      resourcePath: '/api/finance/withdraw',
      details: {
        amount: requestedAmount,
        transferId: transferRes.id,
        status: finalStatus,
      },
    });

    const newBalance = Math.max(0, Number((availableBalance - requestedAmount).toFixed(2)));

    return NextResponse.json({
      success: true,
      message: 'Transferência Pix iniciada com sucesso via infraestrutura bancária!',
      data: {
        transferId: transferRes.id,
        pixKey: prof.asaas_pix_key,
        amount: requestedAmount,
        previousBalance: availableBalance,
        newBalance,
        status: finalStatus,
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
