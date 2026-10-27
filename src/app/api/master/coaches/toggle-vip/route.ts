import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isMasterAdmin } from '@/lib/master-auth';
import { PLAN_CONFIG } from '@/lib/permissions';
import { logSecurityEvent } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
      return NextResponse.json({ error: 'Acesso negado ao painel mestre.' }, { status: 403 });
    }

    const { coachId, isVip } = await req.json();

    if (!coachId || typeof isVip !== 'boolean') {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    // Se está concedendo VIP:
    // Ganha todos os recursos PRO, taxa ZERO da plataforma, status vip, e flag is_vip = true.
    // Importante: NÃO é contabilizado no MRR financeiro.
    // Se está removendo VIP:
    // Retorna para Starter (ou mantém plano anterior caso queira alterar separadamente).
    const updatePayload = isVip
      ? {
          is_vip: true,
          plan_tier: 'pro',
          platform_fee_percent: PLAN_CONFIG.pro.platformFeePercent, // 0%
          plan_status: 'active',
        }
      : {
          is_vip: false,
          plan_tier: 'starter',
          platform_fee_percent: PLAN_CONFIG.starter.platformFeePercent, // 15%
          plan_status: 'active',
        };

    const { data, error } = await supabaseAdmin
      .from('professionals')
      .update(updatePayload)
      .eq('id', coachId)
      .select('id, full_name, plan_tier, is_vip, platform_fee_percent, plan_status')
      .single();

    if (error) {
      console.error('[Toggle VIP] Erro Supabase:', error);
      return NextResponse.json({ error: 'Falha ao atualizar status VIP do treinador.' }, { status: 500 });
    }

    await logSecurityEvent({
      eventType: 'ADMIN_VIP_TOGGLED',
      severity: 'WARN',
      userId: user?.id,
      userEmail: user?.email,
      resourcePath: '/api/master/coaches/toggle-vip',
      details: { coachId, isVip, coachName: data.full_name },
    });

    return NextResponse.json({ success: true, coach: data });
  } catch (err: any) {
    console.error('[API Master Toggle VIP] Erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno ao alterar status VIP.' }, { status: 500 });
  }
}
