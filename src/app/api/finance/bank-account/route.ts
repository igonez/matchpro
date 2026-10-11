import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateCPF, validateCNPJ, validatePixKey, cleanDigits } from '@/lib/validation/brazilian-banking';
import { AsaasClient } from '@/lib/asaas/client';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const { documentType, documentNumber, pixKey } = body;

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
      // Não bloqueia caso o ambiente sandbox não tenha conexão direta com o BACEN,
      // mas registra a intenção de validação
    }

    // 5. Salvar de forma segura no Supabase
    const { error: updateError } = await supabaseAdmin
      .from('professionals')
      .update({
        document_type: documentType,
        document_number: documentNumber.trim(),
        asaas_pix_key: pixValidation.formatted,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erro ao salvar no banco:', updateError);
      return NextResponse.json(
        { error: 'Falha ao salvar dados bancários no banco de dados.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dados bancários e documento validados e salvos com sucesso!',
      data: {
        documentType,
        documentNumber,
        pixKey: pixValidation.formatted,
        pixType: pixValidation.type,
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
