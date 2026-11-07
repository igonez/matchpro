import { NextResponse } from 'next/server';
import { sendMetaConversionEvent } from '@/lib/analytics/meta-capi';
import { createClient } from '@/lib/supabase/server';
import { isMasterAdmin } from '@/lib/master-auth';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const testCode = searchParams.get('code');

    // Exige código explícito de teste ou sessão autenticada de Master Admin para evitar disparos indevidos por bots
    if (!testCode && !isMasterAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso restrito. Informe o código de teste (?code=TEST...) ou autentique-se como administrador.' },
        { status: 403 }
      );
    }

    const activeTestCode = testCode || 'TEST81289';

    const result = await sendMetaConversionEvent({
      eventName: 'Purchase',
      eventId: `test_purchase_${Date.now()}`,
      value: 49.90,
      currency: 'BRL',
      contentName: 'Assinatura ArenaFitPro Pro (Teste de Validação CAPI)',
      contentCategory: 'SaaS_Subscription',
      testEventCode: activeTestCode,
      user: {
        email: 'contato@arenafitpro.com.br',
        phone: '12999999999',
        externalId: 'test_admin_user',
      },
    });

    return NextResponse.json({
      success: result.sent,
      testCode: activeTestCode,
      reason: result.reason || 'Evento enviado com sucesso para a Meta!',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro inesperado' },
      { status: 500 }
    );
  }
}
