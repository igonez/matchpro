import { NextResponse } from 'next/server';
import { sendMetaConversionEvent } from '@/lib/analytics/meta-capi';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testCode = searchParams.get('code') || 'TEST81289';

    const result = await sendMetaConversionEvent({
      eventName: 'Purchase',
      eventId: `test_purchase_${Date.now()}`,
      value: 49.90,
      currency: 'BRL',
      contentName: 'Assinatura ArenaFitPro Pro (Teste de Validação CAPI)',
      contentCategory: 'SaaS_Subscription',
      testEventCode: testCode,
      user: {
        email: 'contato@arenafitpro.com.br',
        phone: '12999999999',
        externalId: 'test_admin_user',
      },
    });

    return NextResponse.json({
      success: result.sent,
      testCode,
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
