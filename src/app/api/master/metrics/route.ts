import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isMasterAdmin } from '@/lib/master-auth';
import { PLAN_CONFIG } from '@/lib/permissions';
import { getBackupLeads, syncPendingLeadsToSupabase } from '@/lib/leads-backup';

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
      { count: vipCoaches },
      { count: totalStudents },
      { count: totalChallenges },
      { count: activeChallenges },
      { data: activeChallengesData }
    ] = await Promise.all([
      supabaseAdmin.from('professionals').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('professionals').select('*', { count: 'exact', head: true }).eq('plan_tier', 'pro'),
      supabaseAdmin.from('professionals').select('*', { count: 'exact', head: true }).eq('is_vip', true),
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

    // Treinadores Pro Pagantes vs VIPs
    const vipCoachesCount = vipCoaches || 0;
    const totalProCoaches = proCoaches || 0;
    // O MRR só considera quem é Pro E NÃO é VIP
    const payingProCoaches = Math.max(0, totalProCoaches - vipCoachesCount);

    // MRR Oficial: somente assinantes pagantes reais (R$ 49,90)
    const proMonthlyPrice = PLAN_CONFIG.pro.priceMonthly; // 49.90
    const currentMRR = payingProCoaches * proMonthlyPrice;
    // Valor total concedido em bolsas / cortesias / parceiros
    const waivedMRR = vipCoachesCount * proMonthlyPrice;

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
      // Caso a tabela ainda não tenha sido criada no Supabase
    }

    // 4. Unit Economics: CAC, ROI e Lucro
    // Receita Total da Plataforma = Taxas de Split recolhidas + Assinaturas Pro pagantes reais
    const totalPlatformRevenue = totalPlatformFees + currentMRR;
    const netProfit = totalPlatformRevenue - totalAdSpend;
    const cac = totalAdSpend > 0 && (totalCoaches || 0) > 0 ? (totalAdSpend / (totalCoaches || 1)) : 0;
    const roi = totalAdSpend > 0 ? (((totalPlatformRevenue - totalAdSpend) / totalAdSpend) * 100) : 0;
    const roas = totalAdSpend > 0 ? (totalPlatformRevenue / totalAdSpend) : 0;

    // 5. Todos os Alunos por Personal e Turmas
    let allStudents: any[] = [];
    try {
      const { data: participantsData } = await supabaseAdmin
        .from('challenge_participants')
        .select(`
          id,
          joined_at,
          payment_status,
          payment_method,
          student_id,
          challenge_id,
          students(id, full_name, phone, avatar_url),
          challenges(id, title, is_active, price, start_date, end_date, professional_id, professionals(id, full_name, phone, specialty))
        `)
        .order('joined_at', { ascending: false });

      if (participantsData) {
        allStudents = participantsData.map((p: any) => ({
          participant_id: p.id,
          joined_at: p.joined_at,
          payment_status: p.payment_status || 'paid',
          payment_method: p.payment_method || 'pix',
          student_id: p.students?.id || p.student_id,
          student_name: p.students?.full_name || 'Aluno Sem Nome',
          student_phone: p.students?.phone || null,
          student_avatar_url: p.students?.avatar_url || null,
          challenge_id: p.challenges?.id || p.challenge_id,
          challenge_title: p.challenges?.title || 'Desafio',
          challenge_is_active: p.challenges?.is_active ?? false,
          challenge_price: Number(p.challenges?.price || 0),
          coach_id: p.challenges?.professionals?.id || p.challenges?.professional_id,
          coach_name: p.challenges?.professionals?.full_name || 'Treinador',
          coach_phone: p.challenges?.professionals?.phone || null,
          coach_specialty: p.challenges?.professionals?.specialty || 'Personal Trainer',
        }));
      }
    } catch (e) {
      console.warn('Erro ao carregar participantes de desafios:', e);
    }

    // 6. Todos os Desafios Globais
    let allChallenges: any[] = [];
    try {
      const { data: challengesData } = await supabaseAdmin
        .from('challenges')
        .select(`
          id,
          title,
          price,
          is_active,
          start_date,
          end_date,
          professional_id,
          professionals(id, full_name, phone, specialty),
          challenge_participants(count)
        `)
        .order('start_date', { ascending: false });

      if (challengesData) {
        allChallenges = challengesData.map((c: any) => ({
          id: c.id,
          title: c.title,
          price: Number(c.price || 0),
          is_active: Boolean(c.is_active),
          start_date: c.start_date,
          end_date: c.end_date,
          coach_id: c.professionals?.id || c.professional_id,
          coach_name: c.professionals?.full_name || 'Treinador Sem Nome',
          coach_phone: c.professionals?.phone || null,
          coach_specialty: c.professionals?.specialty || 'Personal Trainer',
          participants_count: c.challenge_participants?.[0]?.count || 0,
        }));
      }
    } catch (e) {
      console.warn('Erro ao carregar desafios globais:', e);
    }

    // 7. Lista de Treinadores com Contagem de Desafios, Alunos Reais e Lista de Alunos Atribuídos
    const { data: rawCoaches } = await supabaseAdmin
      .from('professionals')
      .select('id, full_name, specialty, phone, instagram, plan_tier, plan_status, is_vip, platform_fee_percent, asaas_wallet_id, document_number, created_at, challenges(id, title, is_active, price, challenge_participants(count))')
      .order('created_at', { ascending: false })
      .limit(100);

    const formattedCoaches = (rawCoaches || []).map((coach: any) => {
      const coachChallenges = coach.challenges || [];
      const activeChallengesForCoach = coachChallenges.filter((ch: any) => ch.is_active).length;
      const totalStudentsForCoach = coachChallenges.reduce((sum: number, ch: any) => {
        const count = ch.challenge_participants?.[0]?.count || 0;
        return sum + count;
      }, 0);

      // Alunos específicos deste treinador
      const coachStudents = allStudents.filter((s: any) => s.coach_id === coach.id);

      return {
        id: coach.id,
        full_name: coach.full_name || 'Treinador Sem Nome',
        specialty: coach.specialty || 'Personal Trainer',
        phone: coach.phone || null,
        instagram: coach.instagram || null,
        document_number: coach.document_number || null,
        plan_tier: coach.plan_tier || 'starter',
        plan_status: coach.plan_status || 'active',
        is_vip: Boolean(coach.is_vip),
        plan_price: coach.plan_tier === 'pro' && !coach.is_vip ? PLAN_CONFIG.pro.priceMonthly : 0,
        platform_fee_percent: coach.platform_fee_percent ?? (coach.plan_tier === 'pro' ? PLAN_CONFIG.pro.platformFeePercent : PLAN_CONFIG.starter.platformFeePercent),
        asaas_wallet_id: coach.asaas_wallet_id || null,
        created_at: coach.created_at,
        has_active_challenges: activeChallengesForCoach > 0,
        active_challenges_count: activeChallengesForCoach,
        total_challenges_count: coachChallenges.length,
        total_students_count: totalStudentsForCoach,
        students: coachStudents,
      };
    });

    // 8. Lista de Leads Recentes (Beta Testers & Lista VIP) com buffer de contingência
    let recentLeads: any[] = [];
    try {
      const { data: leadsData, error: leadsErr } = await supabaseAdmin
        .from('coach_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (leadsData && !leadsErr) {
        recentLeads = leadsData;
        syncPendingLeadsToSupabase(supabaseAdmin).catch(() => {});
      }
    } catch (e) {
      // Tabela pendente de migração no Supabase
    }

    // Carregar leads locais (contingência / backup)
    try {
      const backupLeads = await getBackupLeads();
      if (backupLeads.length > 0) {
        const existingEmails = new Set(recentLeads.map((l: any) => l.email?.toLowerCase()));
        for (const backup of backupLeads) {
          if (!existingEmails.has(backup.email?.toLowerCase())) {
            recentLeads.push({
              ...backup,
              status: backup.synced ? 'new' : 'backup_local',
            });
          }
        }
        recentLeads.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    } catch (bErr) {
      console.warn('[Master Metrics] Erro ao carregar backup de leads:', bErr);
    }

    return NextResponse.json({
      overview: {
        totalCoaches: totalCoaches || 0,
        activeCoaches: activeCoachesCount,
        inactiveCoaches: inactiveCoachesCount,
        coachActivationRate: totalCoaches ? ((activeCoachesCount / totalCoaches) * 100).toFixed(1) : '0.0',
        proCoaches: totalProCoaches,
        payingProCoaches,
        vipCoaches: vipCoachesCount,
        starterCoaches: Math.max(0, (totalCoaches || 0) - totalProCoaches),
        totalStudents: totalStudents || 0,
        activeStudents: activeStudentsCount,
        totalChallenges: totalChallenges || 0,
        activeChallenges: activeChallenges || 0,
        avgStudentsPerCoach: totalCoaches ? ((totalStudents || 0) / totalCoaches).toFixed(1) : '0.0',
      },
      financial: {
        totalGMV,
        totalPlatformFees,
        totalCoachDisbursed,
        currentMRR,
        waivedMRR,
        payingProCoaches,
        vipCoaches: vipCoachesCount,
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
      allStudents,
      allChallenges,
      recentLeads: recentLeads || [],
      recentAdSpends,
    });
  } catch (err: any) {
    console.error('[API Master Metrics] Erro:', err);
    return NextResponse.json({ error: 'Erro ao carregar métricas mestre.' }, { status: 500 });
  }
}
