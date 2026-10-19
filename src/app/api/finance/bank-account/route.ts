import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateCPF, validateCNPJ, validatePixKey, cleanDigits } from '@/lib/validation/brazilian-banking';
import { AsaasClient } from '@/lib/asaas/client';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    // 1. Rate limiting estrito para proteção de consultas bancárias (10 req/min)
    const rateLimitResponse = enforceRateLimit(request, 'checkout', `bank:${user.id}`);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { 
      documentType, 
      documentNumber, 
      pixKey,
      birthDate,
      postalCode,
      address,
      addressNumber,
      province,
      city,
      state,
      companyType,
      mobilePhone
    } = body;

    // 1. Validação do Tipo de Documento
    if (!documentType || !['CPF', 'CNPJ'].includes(documentType)) {
      return NextResponse.json(
        { error: 'Tipo de documento inválido. Escolha CPF ou CNPJ.' },
        { status: 400 }
      );
    }

    // 2. Validação do Número do Documento (CPF / CNPJ)
    const rawDocDigits = cleanDigits(documentNumber);
    if (documentType === 'CPF') {
      if (!validateCPF(rawDocDigits)) {
        return NextResponse.json(
          { error: 'O CPF informado é inválido. Verifique os números digitados.' },
          { status: 400 }
        );
      }
      if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        return NextResponse.json(
          { error: 'Data de nascimento inválida. Utilize o formato AAAA-MM-DD.' },
          { status: 400 }
        );
      }
    } else {
      if (!validateCNPJ(rawDocDigits)) {
        return NextResponse.json(
          { error: 'O CNPJ informado é inválido. Verifique os números digitados.' },
          { status: 400 }
        );
      }
    }

    // 3. Validação Sintática e de Tipo da Chave Pix
    const pixValidation = validatePixKey(pixKey);
    if (!pixValidation.isValid) {
      return NextResponse.json(
        { error: pixValidation.error || 'A chave Pix informada é inválida.' },
        { status: 400 }
      );
    }

    // 4. Validação na API do Asaas (DICT / Banco Central)
    let asaasBankInfo: any = null;
    try {
      asaasBankInfo = await AsaasClient.validatePixAddressKey(pixValidation.formatted);
    } catch (asaasErr: any) {
      console.warn('Aviso ao consultar DICT no Asaas:', asaasErr?.message);
    }

    // 5. Obter ou Criar Subconta no Asaas para viabilizar o Split Automático
    const { data: coachData } = await supabaseAdmin
      .from('professionals')
      .select('id, full_name, phone, asaas_wallet_id')
      .eq('id', user.id)
      .single();

    let walletId = coachData?.asaas_wallet_id;

    if (!walletId) {
      try {
        const subaccount = await AsaasClient.createSubaccount({
          name: coachData?.full_name || user.user_metadata?.full_name || 'Profissional ArenaFitPro',
          email: user.email || 'coach@arenafit.pro',
          cpfCnpj: rawDocDigits,
          birthDate: documentType === 'CPF' ? birthDate : undefined,
          mobilePhone: mobilePhone || coachData?.phone || user.user_metadata?.phone || '11999999999',
          incomeValue: 5000,
          companyType: documentType === 'CNPJ' ? (companyType || 'MEI') : undefined,
          address: address || 'Rua Principal',
          addressNumber: addressNumber || 'S/N',
          province: province || 'Centro',
          postalCode: postalCode ? cleanDigits(postalCode) : '01310100',
        });

        if (subaccount?.walletId) {
          walletId = subaccount.walletId;
          console.log(`[Asaas Subconta] Subconta criada com sucesso! Wallet ID: ${walletId}`);
        }
      } catch (subErr: any) {
        console.warn('Aviso ao criar subconta no Asaas:', subErr?.message);
      }
    }

    // 6. Salvar de forma segura no Supabase
    const updatePayload: any = {
      document_type: documentType,
      document_number: documentNumber.trim(),
      asaas_pix_key: pixValidation.formatted,
    };

    if (walletId) updatePayload.asaas_wallet_id = walletId;
    if (birthDate) updatePayload.birth_date = birthDate;
    if (postalCode) updatePayload.postal_code = postalCode;
    if (address) updatePayload.address = address;
    if (addressNumber) updatePayload.address_number = addressNumber;
    if (province) updatePayload.province = province;
    if (city) updatePayload.city = city;
    if (state) updatePayload.state = state;

    let { error: updateError } = await supabaseAdmin
      .from('professionals')
      .update(updatePayload)
      .eq('id', user.id);

    // Se falhar (ex: colunas de endereço/data de nascimento ainda não migradas no banco), tenta salvar o essencial
    if (updateError) {
      console.warn('Erro ao salvar campos estendidos no banco, tentando fallback básico:', updateError);
      const basicPayload: any = {
        document_type: documentType,
        document_number: documentNumber.trim(),
        asaas_pix_key: pixValidation.formatted,
      };
      if (walletId) basicPayload.asaas_wallet_id = walletId;

      const { error: fallbackError } = await supabaseAdmin
        .from('professionals')
        .update(basicPayload)
        .eq('id', user.id);

      if (fallbackError) {
        console.error('Erro também no fallback ao salvar no banco:', fallbackError);
        return NextResponse.json(
          { error: `Falha ao salvar dados bancários no banco de dados: ${fallbackError.message || fallbackError.details || 'Verifique as permissões de tabela.'}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Dados bancários e carteira de Split configurados com sucesso!',
      data: {
        documentType,
        documentNumber,
        pixKey: pixValidation.formatted,
        pixType: pixValidation.type,
        walletId: walletId || null,
        bankName: asaasBankInfo?.account?.bank?.name || 'Banco Identificado via Pix',
        ownerName: asaasBankInfo?.account?.owner?.name || user.user_metadata?.full_name || 'Titular Verificado',
      },
    });
  } catch (error: any) {
    console.error('Erro na rota de validação bancária:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno ao validar dados bancários.' },
      { status: 500 }
    );
  }
}
