import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Validar autenticação do coach
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { planTier, paymentMethod } = body;

    // Permitir apenas 'pro' e 'starter' (studio está pausado)
    if (!planTier || !['starter', 'pro'].includes(planTier)) {
      return NextResponse.json({ 
        error: 'Plano inválido ou temporariamente indisponível para contratação.' 
      }, { status: 400 });
    }

    const selectedTier = planTier as PlanTier;
    const planConfig = PLAN_CONFIG[selectedTier];
    const platformFee = planConfig.platformFeePercent;

    // 2. Atualizar plano do treinador de forma segura via service_role (bypassa trigger anti-tamper)
    const { data: updatedCoach, error: updateError } = await supabaseAdmin
      .from('professionals')
      .update({
        plan_tier: selectedTier,
        platform_fee_percent: platformFee,
      })
      .eq('id', user.id)
      .select('id, full_name, plan_tier, platform_fee_percent')
      .single();

    if (updateError) {
      console.error('Erro ao atualizar plano do treinador no Supabase:', updateError);
      return NextResponse.json({ error: 'Erro ao atualizar permissões do plano no banco.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Plano ${planConfig.name} ativado com sucesso!`,
      planTier: selectedTier,
      planName: planConfig.name,
      platformFeePercent: platformFee,
      paymentMethod: paymentMethod || 'MANUAL',
    });
  } catch (error: any) {
    console.error('Erro na confirmação do plano:', error);
    return NextResponse.json({ 
      error: error.message || 'Falha ao processar confirmação de plano.' 
    }, { status: 500 });
  }
}
