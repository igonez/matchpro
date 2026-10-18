import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isMasterAdmin } from '@/lib/master-auth';
import { PLAN_CONFIG } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verificação de segurança: checar no auth e no banco
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
        { error: 'Acesso restrito ao Super Admin da plataforma.' },
        { status: 403 }
      );
    }

    // 1. Métricas de Usuários (Treinadores e Alunos)
    const [
      { count: totalCoaches },
      { count: proCoaches },
      { count: totalStudents },
      { count: totalChallenges },
      { count: activeChallenges },
      { data: activeChallengesData }
    ] = await Promise.all([
      supabaseAdmin.from('professionals').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('professionals').select('*', { count: 'exact', head: true }).eq('plan_tier', 'pro'),
      supabaseAdmin.from('students').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('challenges').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('challenges').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('challenges').select('id, professional_id').eq('is_active', true)
    ]);

    // Treinadores com pelo menos 1 turma ativa rodando
    const activeCoachIds = new Set((activeChallengesData || []).map((c: any) => c.professional_id).filter(Boolean));
    const activeCoachesCount = activeCoachIds.size;
    const inactiveCoachesCount = Math.max(0, (totalCoaches || 0) - activeCoachesCount);

    // Alunos em turmas ativas
    let activeStudentsCount = 0;
    try {
      if (activeChallengesData && activeChallengesData.length > 0) {
        const activeChalIds = activeChallengesData.map((c: any) => c.id);
        const { count: partCount } = await supabaseAdmin
          .from('challenge_participants')
          .select('*', { count: 'exact', head: true })
          .in('challenge_id', activeChalIds);
        activeStudentsCount = partCount || 0;
      }
    } catch (e) {
      console.warn('Erro ao calcular alunos ativos:', e);
    }

    // 2. Transações e Faturamento (Tabela payments)
    const { data: paymentsData } = await supabaseAdmin
      .from('payments')
      .select('gross_value, net_coach_value, fee_platform_value, status, created_at, billing_type')
      .order('created_at', { ascending: false });

    const payments = paymentsData || [];
    const confirmedPayments = payments.filter((p: any) => p.status === 'CONFIRMED' || p.status === 'RECEIVED');

    const totalGMV = confirmedPayments.reduce((acc: number, p: any) => acc + Number(p.gross_value || 0), 0);
    const totalPlatformFees = confirmedPayments.reduce((acc: number, p: any) => acc + Number(p.fee_platform_value || 0), 0);
    const totalCoachDisbursed = confirmedPayments.reduce((acc: number, p: any) => acc + Number(p.net_coach_value || 0), 0);

    // MRR Estimado (Plano Pro Oficial: R$ 49,90/mês conforme PLAN_CONFIG.pro.priceMonthly)
    const proMonthlyPrice = PLAN_CONFIG.pro.priceMonthly; // 49.90
    const currentMRR = (proCoaches || 0) * proMonthlyPrice;

    // 3. Gastos com Anúncios (Tabela platform_ad_spend)
    let totalAdSpend = 0;
    let recentAdSpends: any[] = [];
    try {
      const { data: adSpendData } = await supabaseAdmin
        .from('platform_ad_spend')
        .select('*')
        .order('spend_date', { ascending: false });

      if (adSpendData) {
        recentAdSpends = adSpendData;
        totalAdSpend = adSpendData.reduce((acc: number, a: any) => acc + Number(a.amount || 0), 0);
      }
    } catch (e) {
      // Caso a tabela ainda não tenha sido criada no Supabase remoto
    }

    // 4. Unit Economics: CAC, ROI e Lucro
    // Receita Total da Plataforma = Taxas de Split recolhidas + Assinaturas Pro
    const totalPlatformRevenue = totalPlatformFees + currentMRR;
    const netProfit = totalPlatformRevenue - totalAdSpend;
    const cac = totalAdSpend > 0 && (totalCoaches || 0) > 0 ? (totalAdSpend / (totalCoaches || 1)) : 0;
    const roi = totalAdSpend > 0 ? (((totalPlatformRevenue - totalAdSpend) / totalAdSpend) * 100) : 0;
    const roas = totalAdSpend > 0 ? (totalPlatformRevenue / totalAdSpend) : 0;

    // 5. Lista de Treinadores com Contagem de Desafios, Alunos Reais e Contato
    const { data: rawCoaches } = await supabaseAdmin
      .from('professionals')
      .select('id, full_name, specialty, phone, instagram, plan_tier, asaas_wallet_id, created_at, challenges(id, is_active, challenge_participants(count))')
      .order('created_at', { ascending: false })
      .limit(100);

    const formattedCoaches = (rawCoaches || []).map((coach: any) => {
      const coachChallenges = coach.challenges || [];
      const activeChallengesForCoach = coachChallenges.filter((ch: any) => ch.is_active).length;
      const totalStudentsForCoach = coachChallenges.reduce((sum: number, ch: any) => {
        const count = ch.challenge_participants?.[0]?.count || 0;
        return sum + count;
      }, 0);

      return {
        id: coach.id,
        full_name: coach.full_name || 'Treinador Sem Nome',
        specialty: coach.specialty || 'Personal Trainer',
        phone: coach.phone || null,
        instagram: coach.instagram || null,
        plan_tier: coach.plan_tier || 'starter',
        plan_price: coach.plan_tier === 'pro' ? 49.90 : 0,
        platform_fee_percent: coach.plan_tier === 'pro' ? 8 : 15,
        asaas_wallet_id: coach.asaas_wallet_id || null,
        created_at: coach.created_at,
        has_active_challenges: activeChallengesForCoach > 0,
        active_challenges_count: activeChallengesForCoach,
        total_challenges_count: coachChallenges.length,
        total_students_count: totalStudentsForCoach,
      };
    });

    // 6. Lista de Leads Recentes (Beta Testers & Lista VIP)
    let recentLeads: any[] = [];
    try {
      const { data: leadsData } = await supabaseAdmin
        .from('coach_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (leadsData) recentLeads = leadsData;
    } catch (e) {
      // Caso pendente
    }

    return NextResponse.json({
      overview: {
        totalCoaches: totalCoaches || 0,
        activeCoaches: activeCoachesCount,
        inactiveCoaches: inactiveCoachesCount,
        coachActivationRate: totalCoaches ? ((activeCoachesCount / totalCoaches) * 100).toFixed(1) : '0.0',
        proCoaches: proCoaches || 0,
        starterCoaches: (totalCoaches || 0) - (proCoaches || 0),
        totalStudents: totalStudents || 0,
        activeStudents: activeStudentsCount,
        totalChallenges: totalChallenges || 0,
        activeChallenges: activeChallenges || 0,
      },
      financial: {
        totalGMV,
        totalPlatformFees,
        totalCoachDisbursed,
        currentMRR,
        proMonthlyPrice,
        totalPlatformRevenue,
        totalAdSpend,
        netProfit,
        cac,
        roi,
        roas,
        transactionsCount: confirmedPayments.length,
        pendingCount: payments.filter((p: any) => p.status === 'PENDING').length,
      },
      recentCoaches: formattedCoaches,
      recentLeads: recentLeads || [],
      recentAdSpends,
    });
  } catch (err: any) {
    console.error('[API Master Metrics] Erro:', err);
    return NextResponse.json({ error: 'Erro ao carregar métricas mestre.' }, { status: 500 });
  }
}
