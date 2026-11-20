import { NextResponse } from 'next/server';
import { sendMetaConversionEvent } from '@/lib/analytics/meta-capi';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isMasterAdmin } from '@/lib/master-auth';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let authorized = isMasterAdmin(user);
    if (!authorized && user) {
      const { data: prof } = await supabaseAdmin
        .from('professionals')
        .select('is_master_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (prof?.is_master_admin) {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Acesso restrito. Autentique-se como administrador.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const testCode = searchParams.get('code');
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
