'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  MessageCircle, 
  RefreshCw,
  AlertTriangle,
  Star,
  GraduationCap,
  Trophy,
  ExternalLink,
  Download,
  X,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Input } from '@/components/ui/input';

type TabKey = 'overview' | 'coaches' | 'students' | 'challenges' | 'financial' | 'leads';

function MasterDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get('tab') as TabKey | null;

  const validTabs: TabKey[] = ['overview', 'coaches', 'students', 'challenges', 'financial', 'leads'];
  const [activeTab, setActiveTab] = useState<TabKey>(
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'overview'
  );

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar com query params quando a URL mudar
  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  // Filtros - Treinadores
  const [coachSearch, setCoachSearch] = useState('');
  const [coachTierFilter, setCoachTierFilter] = useState<'all' | 'vip' | 'pro' | 'starter'>('all');
  const [coachStatusFilter, setCoachStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filtros - Alunos por Personal
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCoachFilter, setStudentCoachFilter] = useState<string>('all');
  const [studentPaymentFilter, setStudentPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');

  // Filtros - Desafios
  const [challengeSearch, setChallengeSearch] = useState('');
  const [challengeStatusFilter, setChallengeStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filtros - Leads
  const [leadSearch, setLeadSearch] = useState('');

  // Modal de Detalhes de Alunos do Treinador (Drilldown)
  const [selectedCoachForStudents, setSelectedCoachForStudents] = useState<any | null>(null);

  // Modal de Novo Gasto em Ads
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adSpendDate, setAdSpendDate] = useState(new Date().toISOString().split('T')[0]);
  const [adPlatform, setAdPlatform] = useState('meta_ads');
  const [adAmount, setAdAmount] = useState('');
  const [adCampaign, setAdCampaign] = useState('');
  const [adNotes, setAdNotes] = useState('');
  const [savingAd, setSavingAd] = useState(false);

  // Estados de Carregamento de Ações em Treinadores
  const [updatingCoachId, setUpdatingCoachId] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/master/metrics');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não autorizado');
      }
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar dados do Cockpit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Alternar Status VIP (⭐ Não adiciona ao MRR)
  const handleToggleCoachVip = async (coachId: string, currentIsVip: boolean) => {
    const nextVip = !currentIsVip;
    const confirmMsg = nextVip
      ? 'Deseja conceder status VIP a este treinador? Ele receberá todos os recursos PRO e taxa 0%, mas NÃO será contabilizado no MRR financeiro.'
      : 'Deseja remover o status VIP deste treinador? Ele voltará para o plano Starter padrão com 15% de taxa.';

    if (!confirm(confirmMsg)) return;

    setUpdatingCoachId(coachId);
    try {
      const res = await fetch('/api/master/coaches/toggle-vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId, isVip: nextVip }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao alterar VIP');
      }

      await fetchMetrics();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingCoachId(null);
    }
  };

  // Alternar Plano PRO / Starter Normal
  const handleToggleCoachTier = async (coachId: string, currentTier: string) => {
    const targetTier = currentTier === 'pro' ? 'starter' : 'pro';
    setUpdatingCoachId(coachId);
    try {
      const res = await fetch('/api/master/coaches/toggle-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId, targetTier }),
      });
      if (res.ok) {
        await fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingCoachId(null);
    }
  };

  // Salvar gasto com mídia
  const handleSaveAdSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adAmount || Number(adAmount) <= 0) return;

    setSavingAd(true);
    try {
      const res = await fetch('/api/master/ad-spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spend_date: adSpendDate,
          platform: adPlatform,
          amount: Number(adAmount),
          campaign_name: adCampaign,
          notes: adNotes,
        }),
      });

      if (!res.ok) throw new Error('Falha ao salvar gasto');

      setAdAmount('');
      setAdCampaign('');
      setAdNotes('');
      setIsAdModalOpen(false);
      fetchMetrics();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingAd(false);
    }
  };

  const handleDeleteAdSpend = async (id: string) => {
    if (!confirm('Deseja excluir este registro de gasto?')) return;
    try {
      await fetch(`/api/master/ad-spend?id=${id}`, { method: 'DELETE' });
      fetchMetrics();
    } catch (e) {
      console.error(e);
    }
  };

  // Exportar dados para CSV
  const handleExportCSV = (type: 'coaches' | 'students' | 'leads') => {
    if (!metrics) return;
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = '';

    if (type === 'coaches') {
      filename = `arenafit-treinadores-${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Nome', 'Telefone', 'Instagram', 'Plano', 'Status VIP', 'Taxa Split', 'Total Desafios', 'Total Alunos', 'Data Cadastro'];
      rows = (metrics.recentCoaches || []).map((c: any) => [
        `"${c.full_name}"`,
        `"${c.phone || ''}"`,
        `"${c.instagram || ''}"`,
        `"${c.plan_tier}"`,
        c.is_vip ? 'VIP (Isento MRR)' : 'Normal',
        `"${c.platform_fee_percent}%"`,
        c.total_challenges_count || 0,
        c.total_students_count || 0,
        `"${new Date(c.created_at).toLocaleDateString('pt-BR')}"`
      ]);
    } else if (type === 'students') {
      filename = `arenafit-alunos-por-personal-${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Aluno', 'Telefone Aluno', 'Personal Responsável', 'Telefone Personal', 'Desafio', 'Status Pagamento', 'Data Entrada'];
      rows = (metrics.allStudents || []).map((s: any) => [
        `"${s.student_name}"`,
        `"${s.student_phone || ''}"`,
        `"${s.coach_name}"`,
        `"${s.coach_phone || ''}"`,
        `"${s.challenge_title}"`,
        `"${s.payment_status}"`,
        `"${new Date(s.joined_at).toLocaleDateString('pt-BR')}"`
      ]);
    } else if (type === 'leads') {
      filename = `arenafit-leads-${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Nome', 'WhatsApp', 'Email', 'Alunos Previstos', 'Origem', 'Data Cadastro'];
      rows = (metrics.recentLeads || []).map((l: any) => [
        `"${l.name}"`,
        `"${l.whatsapp}"`,
        `"${l.email}"`,
        `"${l.students_range || ''}"`,
        `"${l.utm_medium || 'direto'}"`,
        `"${new Date(l.created_at).toLocaleDateString('pt-BR')}"`
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-2xl bg-zinc-950 border border-white/[0.08]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 rounded-2xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-32 rounded-2xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-32 rounded-2xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-32 rounded-2xl bg-zinc-950 border border-white/[0.08]" />
        </div>
        <div className="h-96 rounded-2xl bg-zinc-950 border border-white/[0.08]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-zinc-950 border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-black text-white">Acesso Exclusivo Super Admin</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {error}
        </p>
        <Link 
          href="/mestre"
          className="mono-button-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold"
        >
          Entrar via Terminal Mestre
        </Link>
      </div>
    );
  }

  const { overview, financial, recentCoaches, allStudents = [], allChallenges = [], recentLeads, recentAdSpends } = metrics;

  // Filtragem de Treinadores
  const filteredCoaches = (recentCoaches || []).filter((c: any) => {
    const matchesSearch = 
      c.full_name?.toLowerCase().includes(coachSearch.toLowerCase()) ||
      c.specialty?.toLowerCase().includes(coachSearch.toLowerCase()) ||
      c.phone?.includes(coachSearch);
    
    const matchesTier = 
      coachTierFilter === 'all' || 
      (coachTierFilter === 'vip' && c.is_vip) ||
      (coachTierFilter === 'pro' && c.plan_tier === 'pro' && !c.is_vip) ||
      (coachTierFilter === 'starter' && c.plan_tier === 'starter');

    const matchesStatus = 
      coachStatusFilter === 'all' || 
      (coachStatusFilter === 'active' && c.has_active_challenges) ||
      (coachStatusFilter === 'inactive' && !c.has_active_challenges);

    return matchesSearch && matchesTier && matchesStatus;
  });

  // Filtragem de Alunos por Personal
  const filteredStudents = (allStudents || []).filter((s: any) => {
    const matchesSearch = 
      s.student_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.student_phone?.includes(studentSearch) ||
      s.challenge_title?.toLowerCase().includes(studentSearch.toLowerCase());

    const matchesCoach = 
      studentCoachFilter === 'all' || s.coach_id === studentCoachFilter;

    const matchesPayment = 
      studentPaymentFilter === 'all' || s.payment_status === studentPaymentFilter;

    return matchesSearch && matchesCoach && matchesPayment;
  });

  // Filtragem de Desafios
  const filteredChallenges = (allChallenges || []).filter((ch: any) => {
    const matchesSearch = 
      ch.title?.toLowerCase().includes(challengeSearch.toLowerCase()) ||
      ch.coach_name?.toLowerCase().includes(challengeSearch.toLowerCase());

    const matchesStatus = 
      challengeStatusFilter === 'all' ||
      (challengeStatusFilter === 'active' && ch.is_active) ||
      (challengeStatusFilter === 'inactive' && !ch.is_active);

    return matchesSearch && matchesStatus;
  });

  // Filtragem de Leads
  const filteredLeads = (recentLeads || []).filter((l: any) => 
    l.name?.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.whatsapp?.includes(leadSearch) ||
    l.email?.toLowerCase().includes(leadSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Top Banner de Controle Executivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Cockpit do Mestre
            </span>
            <span className="text-xs text-zinc-400 font-medium">Controle Multi-Tenant & SaaS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Operações Globais</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Métricas de faturamento, unit economics, assinaturas, concessão de VIPs e carteira de alunos.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          {/* Exportar CSV */}
          <div className="relative group">
            <button
              onClick={() => handleExportCSV(activeTab === 'students' ? 'students' : activeTab === 'leads' ? 'leads' : 'coaches')}
              className="mono-button-secondary w-full sm:w-auto px-3.5 py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
          </div>

          <button
            onClick={() => setIsAdModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold bg-white text-black hover:bg-zinc-100 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar Gasto Ads
          </button>
          
          <button
            onClick={fetchMetrics}
            className="mono-button-secondary w-full sm:w-auto px-3.5 py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </button>
        </div>
      </div>

      {/* Navegação por Abas Limpa e Completa */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto no-scrollbar relative z-10">
        {[
          { id: 'overview', label: 'Visão Geral' },
          { id: 'coaches', label: `Treinadores (${overview.totalCoaches})` },
          { id: 'students', label: `Alunos por Personal (${allStudents.length})` },
          { id: 'challenges', label: `Desafios (${allChallenges.length})` },
          { id: 'financial', label: 'Financeiro & Mídia' },
          { id: 'leads', label: `Leads Beta (${recentLeads.length})` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: VISÃO GERAL */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 relative z-10">
          {/* Grid de Métricas Principais com 3D Spotlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Treinadores */}
            <SpotlightCard3D className="p-5">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold tracking-wide text-zinc-400">
                  Treinadores Cadastrados
                </span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {overview.activeCoaches} ativos
                </span>
              </div>
              <div className="text-3xl font-black text-white font-mono">{overview.totalCoaches}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {overview.payingProCoaches} Pro Pagantes • {overview.vipCoaches} VIPs ⭐ • {overview.starterCoaches} Starter
              </p>
            </SpotlightCard3D>

            {/* Card 2: MRR Real (SEM inflar com VIPs) */}
            <SpotlightCard3D className="p-5">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold tracking-wide text-zinc-400">
                  MRR SaaS Real
                </span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  R$ 49,90/mês
                </span>
              </div>
              <div className="text-3xl font-black text-white font-mono">
                R$ {Number(financial.currentMRR).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {overview.payingProCoaches} assinantes pagantes • ⭐ R$ {Number(financial.waivedMRR).toFixed(2)} em parcerias VIP
              </p>
            </SpotlightCard3D>

            {/* Card 3: Alunos por Personal */}
            <SpotlightCard3D className="p-5">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold tracking-wide text-zinc-400">
                  Alunos em Turmas Ativas
                </span>
                <span className="h-2 w-2 rounded-full bg-white" />
              </div>
              <div className="text-3xl font-black text-white font-mono">{overview.activeStudents}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {overview.totalStudents} total cadastrados • {overview.avgStudentsPerCoach} alunos/treinador
              </p>
            </SpotlightCard3D>

            {/* Card 4: Volume Bruto (GMV) */}
            <SpotlightCard3D className="p-5">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold tracking-wide text-zinc-400">
                  Volume Bruto (GMV)
                </span>
                <span className="text-xs text-zinc-400">Desafios</span>
              </div>
              <div className="text-3xl font-black text-white font-mono">
                R$ {Number(financial.totalGMV).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Splits da plataforma: R$ {Number(financial.totalPlatformFees).toFixed(2)}
              </p>
            </SpotlightCard3D>

          </div>

          {/* Linha 2: Resumo de Planos e Unit Economics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            <SpotlightCard3D className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-tight">Distribuição de Planos & VIPs</h3>
                <span className="text-[11px] text-zinc-400">Multi-Tenancy</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <div>
                      <span className="font-semibold text-white block">VIP Cortesia / Parceiros</span>
                      <span className="text-zinc-400 text-[11px]">Recursos PRO completos, taxa 0%, ISENTO de MRR</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-amber-400">{overview.vipCoaches} treinador(es)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div>
                    <span className="font-semibold text-white block">Plano Pro Coach (Pagante)</span>
                    <span className="text-zinc-400 text-[11px]">Taxa ZERO (0%) da plataforma • R$ 49,90/mês</span>
                  </div>
                  <span className="font-mono font-bold text-white">{overview.payingProCoaches} assinante(s)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div>
                    <span className="font-semibold text-white block">Plano Starter Coach</span>
                    <span className="text-zinc-400 text-[11px]">15% de split retido • 1 desafio • até 10 alunos</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-400">{overview.starterCoaches} conta(s)</span>
                </div>
              </div>
            </SpotlightCard3D>

            <SpotlightCard3D className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-tight">Performance Financeira & Unit Economics</h3>
                <span className="text-[11px] text-zinc-400">Marketing & CAC</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">Total Investido em Mídia:</span>
                  <span className="font-mono font-bold text-white">
                    R$ {Number(financial.totalAdSpend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">CAC Real por Treinador:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    R$ {Number(financial.cac).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">Receita Total Plataforma (Splits + MRR Real):</span>
                  <span className="font-mono font-bold text-white">
                    R$ {Number(financial.totalPlatformRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">Lucro Operacional Líquido:</span>
                  <span className={`font-mono font-bold ${financial.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    R$ {Number(financial.netProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </SpotlightCard3D>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: TREINADORES & VIPS */}
      {/* ========================================================================= */}
      {activeTab === 'coaches' && (
        <SpotlightCard3D className="p-5 space-y-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Gestão de Treinadores & Concessão VIP</h3>
              <p className="text-xs text-zinc-400">
                Atribua status VIP ⭐ (isento de MRR), ative o plano PRO ou inspecione a carteira de alunos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={coachStatusFilter}
                onChange={(e) => setCoachStatusFilter(e.target.value as any)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="all">Todas as Contas</option>
                <option value="active">Com Turma Ativa</option>
                <option value="inactive">Sem Turma / Onboarding</option>
              </select>

              <select
                value={coachTierFilter}
                onChange={(e) => setCoachTierFilter(e.target.value as any)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="all">Todos os Planos</option>
                <option value="vip">⭐ VIP (Isento MRR)</option>
                <option value="pro">⚡ PRO (R$ 49,90)</option>
                <option value="starter">🌱 Starter (15% Split)</option>
              </select>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={coachSearch}
                  onChange={(e) => setCoachSearch(e.target.value)}
                  placeholder="Buscar nome ou zap..."
                  className="pl-8 bg-zinc-900 border-white/10 rounded-xl text-xs text-white h-8"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Treinador</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Desafios / Alunos</th>
                  <th className="py-2.5 px-3">Plano & Categoria</th>
                  <th className="py-2.5 px-3">Taxa Split</th>
                  <th className="py-2.5 px-3">Asaas</th>
                  <th className="py-2.5 px-3">Cadastro</th>
                  <th className="py-2.5 px-3 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoaches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 font-mono">
                      Nenhum treinador encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredCoaches.map((coach: any) => {
                    const cleanPhone = coach.phone?.replace(/\D/g, '');
                    const isVip = Boolean(coach.is_vip);
                    const isPro = coach.plan_tier === 'pro';

                    return (
                      <tr key={coach.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{coach.full_name}</span>
                            {isVip && (
                              <span title="Treinador VIP (Isento de MRR)">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span>{coach.specialty}</span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(coach.full_name.split(' ')[0])}%2C%20aqui%20%C3%A9%20o%20Igor%20da%20ArenaFitPro!`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-0.5 text-[10px]"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          {coach.has_active_challenges ? (
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Ativo
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                              Onboarding
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono">
                          <div className="text-white font-semibold flex items-center gap-1.5">
                            <span>{coach.total_challenges_count} desafio(s)</span>
                          </div>
                          <button
                            onClick={() => setSelectedCoachForStudents(coach)}
                            className="text-zinc-400 hover:text-white underline text-[11px] flex items-center gap-1 mt-0.5 cursor-pointer"
                          >
                            <Users className="w-3 h-3" /> {coach.total_students_count} aluno(s) (Ver)
                          </button>
                        </td>

                        <td className="py-3 px-3">
                          {isVip ? (
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-300" /> VIP Cortesia
                              </span>
                              <span className="block text-[10px] text-zinc-500 font-mono">Isento de MRR</span>
                            </div>
                          ) : isPro ? (
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-white bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full inline-block">
                                PRO (R$ 49,90)
                              </span>
                              <span className="block text-[10px] text-emerald-400 font-mono">+MRR Pago</span>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full inline-block">
                              Starter
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono text-zinc-300">
                          {coach.platform_fee_percent}%
                        </td>

                        <td className="py-3 px-3 font-mono">
                          {coach.asaas_wallet_id ? (
                            <span className="text-emerald-400 text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Vinculada
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-xs flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Pendente
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono text-zinc-400 text-xs">
                          {new Date(coach.created_at).toLocaleDateString('pt-BR')}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botão VIP Dedicado que NÃO adiciona ao MRR */}
                            <button
                              disabled={updatingCoachId === coach.id}
                              onClick={() => handleToggleCoachVip(coach.id, isVip)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                                isVip
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                  : 'bg-white/5 text-zinc-300 border-white/10 hover:border-amber-400/40 hover:text-amber-300'
                              }`}
                              title={isVip ? 'Remover VIP (reverte para Starter)' : 'Conceder VIP (PRO com taxa 0 e isento de MRR)'}
                            >
                              <Star className={`w-3 h-3 ${isVip ? 'fill-amber-300' : ''}`} />
                              {isVip ? 'Remover VIP' : 'Tornar VIP'}
                            </button>

                            {/* Botão PRO / Starter alternativo */}
                            {!isVip && (
                              <button
                                disabled={updatingCoachId === coach.id}
                                onClick={() => handleToggleCoachTier(coach.id, coach.plan_tier)}
                                className="mono-button-secondary px-2.5 py-1 text-[11px] cursor-pointer"
                              >
                                {isPro ? 'Rebaixar' : 'Ativar PRO'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </SpotlightCard3D>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: ALUNOS POR PERSONAL */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <SpotlightCard3D className="p-5 space-y-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Alunos por Personal Trainer</h3>
              <p className="text-xs text-zinc-400">
                Inspecione cada aluno inscrito, o personal responsável, a turma vinculada e o status de pagamento.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro por Personal */}
              <select
                value={studentCoachFilter}
                onChange={(e) => setStudentCoachFilter(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none max-w-xs"
              >
                <option value="all">Todos os Treinadores</option>
                {(recentCoaches || []).map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.total_students_count} alunos)
                  </option>
                ))}
              </select>

              {/* Filtro por Pagamento */}
              <select
                value={studentPaymentFilter}
                onChange={(e) => setStudentPaymentFilter(e.target.value as any)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="paid">Confirmados / Pagos</option>
                <option value="pending">Pendentes</option>
              </select>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Buscar aluno ou zap..."
                  className="pl-8 bg-zinc-900 border-white/10 rounded-xl text-xs text-white h-8"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Aluno</th>
                  <th className="py-2.5 px-3">Personal Responsável</th>
                  <th className="py-2.5 px-3">Desafio / Turma</th>
                  <th className="py-2.5 px-3">Valor Inscrição</th>
                  <th className="py-2.5 px-3">Status Pagamento</th>
                  <th className="py-2.5 px-3">Data Inscrição</th>
                  <th className="py-2.5 px-3 text-right">Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono">
                      Nenhum aluno encontrado para este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st: any) => {
                    const cleanPhone = st.student_phone?.replace(/\D/g, '');
                    return (
                      <tr key={st.participant_id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {st.student_avatar_url ? (
                              <img src={st.student_avatar_url} alt="" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                                {st.student_name?.[0]?.toUpperCase() || 'A'}
                              </div>
                            )}
                            <span>{st.student_name}</span>
                          </div>
                          {st.student_phone && (
                            <span className="text-[11px] text-zinc-400 font-mono block mt-0.5">
                              {st.student_phone}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{st.coach_name}</div>
                          <span className="text-[10px] text-zinc-400">{st.coach_specialty}</span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-white">{st.challenge_title}</div>
                          <span className={`text-[10px] font-mono ${st.challenge_is_active ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {st.challenge_is_active ? 'Turma em andamento' : 'Encerrada'}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-zinc-300">
                          R$ {Number(st.challenge_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3">
                          {st.payment_status === 'paid' || st.payment_status === 'CONFIRMED' || st.payment_status === 'RECEIVED' ? (
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </span>
                          ) : (
                            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pendente
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono text-zinc-400 text-xs">
                          {new Date(st.joined_at).toLocaleDateString('pt-BR')}
                        </td>

                        <td className="py-3 px-3 text-right">
                          {cleanPhone ? (
                            <a
                              href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(st.student_name.split(' ')[0])}%2C%20aqui%20%C3%A9%20o%20suporte%20da%20ArenaFitPro!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                          ) : (
                            <span className="text-zinc-600 text-[11px]">Sem tel</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </SpotlightCard3D>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: DESAFIOS GLOBAIS */}
      {/* ========================================================================= */}
      {activeTab === 'challenges' && (
        <SpotlightCard3D className="p-5 space-y-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Desafios & Turmas Globais</h3>
              <p className="text-xs text-zinc-400">
                Monitore todas as turmas criadas na plataforma, datas e volume de alunos inscritos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={challengeStatusFilter}
                onChange={(e) => setChallengeStatusFilter(e.target.value as any)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Desafios Ativos</option>
                <option value="inactive">Encerrados / Rascunhos</option>
              </select>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={challengeSearch}
                  onChange={(e) => setChallengeSearch(e.target.value)}
                  placeholder="Buscar desafio ou personal..."
                  className="pl-8 bg-zinc-900 border-white/10 rounded-xl text-xs text-white h-8"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Título do Desafio</th>
                  <th className="py-2.5 px-3">Personal Responsável</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Inscrição</th>
                  <th className="py-2.5 px-3">Alunos Inscritos</th>
                  <th className="py-2.5 px-3">Período</th>
                  <th className="py-2.5 px-3 text-right">Página Pública</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredChallenges.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono">
                      Nenhum desafio encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredChallenges.map((ch: any) => (
                    <tr key={ch.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-sm">{ch.title}</div>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {ch.id.slice(0, 8)}...</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{ch.coach_name}</div>
                        <span className="text-[10px] text-zinc-400">{ch.coach_specialty}</span>
                      </td>

                      <td className="py-3 px-3">
                        {ch.is_active ? (
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Ativo
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                            Encerrado
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-zinc-300">
                        R$ {Number(ch.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-white">{ch.participants_count}</span> aluno(s)
                      </td>

                      <td className="py-3 px-3 font-mono text-zinc-400 text-xs">
                        {ch.start_date ? new Date(ch.start_date).toLocaleDateString('pt-BR') : 'N/D'} até {ch.end_date ? new Date(ch.end_date).toLocaleDateString('pt-BR') : 'N/D'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/join/${ch.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Ver Inscrição
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SpotlightCard3D>
      )}

      {/* ========================================================================= */}
      {/* ABA 5: FINANCEIRO & TRÁFEGO */}
      {/* ========================================================================= */}
      {activeTab === 'financial' && (
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SpotlightCard3D className="p-5">
              <span className="text-xs font-semibold text-zinc-400 block pb-2">MRR Pago Líquido</span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                R$ {Number(financial.currentMRR).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-zinc-500 mt-1">{overview.payingProCoaches} assinantes pagantes reais</p>
            </SpotlightCard3D>

            <SpotlightCard3D className="p-5">
              <span className="text-xs font-semibold text-zinc-400 block pb-2">Bolsas VIP Concedidas</span>
              <div className="text-2xl font-black font-mono text-amber-300">
                R$ {Number(financial.waivedMRR).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-zinc-500 mt-1">{overview.vipCoaches} personais isentos de MRR</p>
            </SpotlightCard3D>

            <SpotlightCard3D className="p-5">
              <span className="text-xs font-semibold text-zinc-400 block pb-2">CAC por Treinador</span>
              <div className="text-2xl font-black font-mono text-white">
                R$ {Number(financial.cac).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Custo de Aquisição Real</p>
            </SpotlightCard3D>

            <SpotlightCard3D className="p-5">
              <span className="text-xs font-semibold text-zinc-400 block pb-2">ROAS Multiplicador</span>
              <div className="text-2xl font-black font-mono text-white">
                {Number(financial.roas).toFixed(2)}x
              </div>
              <p className="text-xs text-zinc-500 mt-1">Receita / Gasto em Anúncios</p>
            </SpotlightCard3D>
          </div>

          <SpotlightCard3D className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Histórico de Gastos com Anúncios</h3>
                <p className="text-xs text-zinc-400">Lançamentos de mídia paga para apuração de CAC e ROI.</p>
              </div>
              <button
                onClick={() => setIsAdModalOpen(true)}
                className="mono-button-secondary px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                + Adicionar Gasto
              </button>
            </div>

            {recentAdSpends.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center font-mono">
                Nenhum gasto registrado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                      <th className="py-2 px-3">Data</th>
                      <th className="py-2 px-3">Plataforma</th>
                      <th className="py-2 px-3">Campanha</th>
                      <th className="py-2 px-3">Valor</th>
                      <th className="py-2 px-3">Notas</th>
                      <th className="py-2 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentAdSpends.map((ad: any) => (
                      <tr key={ad.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-mono text-zinc-300">
                          {new Date(ad.spend_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-white">
                          {ad.platform === 'meta_ads' ? 'Meta Ads (Insta/FB)' : ad.platform === 'google_ads' ? 'Google Ads' : ad.platform}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-300">{ad.campaign_name || 'Geral'}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-white">
                          R$ {Number(ad.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400">{ad.notes || '-'}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteAdSpend(ad.id)}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SpotlightCard3D>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 6: LEADS BETA */}
      {/* ========================================================================= */}
      {activeTab === 'leads' && (
        <SpotlightCard3D className="p-5 space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Candidatos do Beta Fechado & Lista VIP</h3>
              <p className="text-xs text-zinc-400">Leads capturados prontos para contato e onboarding.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <Input
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder="Buscar por nome ou zap..."
                className="pl-8 bg-zinc-900 border-white/10 rounded-xl text-xs text-white h-8"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">WhatsApp</th>
                  <th className="py-2.5 px-3">E-mail</th>
                  <th className="py-2.5 px-3">Alunos Previstos</th>
                  <th className="py-2.5 px-3">Origem</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3 text-right">Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono">
                      Nenhum lead encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead: any) => {
                    const cleanPhone = lead.whatsapp?.replace(/\D/g, '');
                    return (
                      <tr key={lead.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3 font-bold text-white">{lead.name}</td>
                        <td className="py-3 px-3 font-mono text-zinc-300">{lead.whatsapp}</td>
                        <td className="py-3 px-3 text-zinc-400">{lead.email}</td>
                        <td className="py-3 px-3 font-mono text-zinc-300">{lead.students_range || 'N/A'} alunos</td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-semibold text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                            {lead.utm_medium === 'beta_tester' ? 'Beta' : 'VIP'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-zinc-500">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(lead.name.split(' ')[0])}%2C%20aqui%20%C3%A9%20o%20Igor%20da%20ArenaFitPro!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </SpotlightCard3D>
      )}

      {/* ========================================================================= */}
      {/* MODAL / DRAWER: ALUNOS DO PERSONAL SELECIONADO */}
      {/* ========================================================================= */}
      {selectedCoachForStudents && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">Alunos de {selectedCoachForStudents.full_name}</h3>
                  {selectedCoachForStudents.is_vip && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300" /> VIP
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {selectedCoachForStudents.specialty} • {selectedCoachForStudents.students?.length || 0} aluno(s) vinculados
                </p>
              </div>
              <button
                onClick={() => setSelectedCoachForStudents(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {(!selectedCoachForStudents.students || selectedCoachForStudents.students.length === 0) ? (
                <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                  Este treinador ainda não possui alunos registrados em seus desafios.
                </div>
              ) : (
                selectedCoachForStudents.students.map((st: any) => {
                  const cleanPhone = st.student_phone?.replace(/\D/g, '');
                  return (
                    <div
                      key={st.participant_id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {st.student_avatar_url ? (
                          <img src={st.student_avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                            {st.student_name?.[0]?.toUpperCase() || 'A'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-xs">{st.student_name}</div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span>Turma: {st.challenge_title}</span>
                            <span>•</span>
                            <span>{new Date(st.joined_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          st.payment_status === 'paid' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-amber-400 bg-amber-500/10'
                        }`}>
                          {st.payment_status === 'paid' ? 'Confirmado' : 'Pendente'}
                        </span>

                        {cleanPhone && (
                          <a
                            href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(st.student_name.split(' ')[0])}!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
                          >
                            <MessageCircle className="w-3 h-3" /> Zap
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedCoachForStudents(null)}
                className="mono-button-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL REGISTRAR GASTO DE ANÚNCIOS */}
      {/* ========================================================================= */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white">Registrar Gasto de Anúncios</h3>
            <p className="text-xs text-zinc-400">
              Alimenta a apuração automática do CAC e ROI da plataforma.
            </p>

            <form onSubmit={handleSaveAdSpend} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Data do Gasto</label>
                <input
                  type="date"
                  required
                  value={adSpendDate}
                  onChange={(e) => setAdSpendDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 block">Plataforma</label>
                  <select
                    value={adPlatform}
                    onChange={(e) => setAdPlatform(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="meta_ads">Meta Ads</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="tiktok_ads">TikTok Ads</option>
                    <option value="influencer">Influencer / Parceria</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 block">Valor Investido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 150.00"
                    value={adAmount}
                    onChange={(e) => setAdAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Nome da Campanha</label>
                <input
                  type="text"
                  placeholder="Ex: Insta Stories - Aquisição Personais"
                  value={adCampaign}
                  onChange={(e) => setAdCampaign(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Observações (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes do criativo, público ou estratégia..."
                  value={adNotes}
                  onChange={(e) => setAdNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="mono-button-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAd}
                  className="px-4 py-2 text-xs font-bold bg-white text-black hover:bg-zinc-200 rounded-xl transition-all cursor-pointer"
                >
                  {savingAd ? 'Salvando...' : 'Salvar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MasterDashboardPage() {
  return (
    <Suspense fallback={<div className="text-xs text-zinc-500 font-mono p-8">Carregando Cockpit Mestre...</div>}>
      <MasterDashboardContent />
    </Suspense>
  );
}
