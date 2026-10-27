import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isMasterAdmin } from '@/lib/master-auth';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';
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
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { coachId, targetTier } = await req.json();

    if (!coachId || !['starter', 'pro'].includes(targetTier)) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const selectedTier = targetTier as PlanTier;
    const targetFeePercent = PLAN_CONFIG[selectedTier]?.platformFeePercent ?? 15;

    const { data, error } = await supabaseAdmin
      .from('professionals')
      .update({
        plan_tier: selectedTier,
        plan_status: 'active',
        platform_fee_percent: targetFeePercent,
        is_vip: false,
      })
      .eq('id', coachId)
      .select('id, full_name, plan_tier, is_vip, platform_fee_percent')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Falha ao atualizar plano do treinador.' }, { status: 500 });
    }

    await logSecurityEvent({
      eventType: 'ADMIN_TIER_CHANGED',
      severity: 'WARN',
      userId: user?.id,
      userEmail: user?.email,
      resourcePath: '/api/master/coaches/toggle-tier',
      details: { coachId, targetTier },
    });

    return NextResponse.json({ success: true, coach: data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro interno ao alterar plano.' }, { status: 500 });
  }
}
