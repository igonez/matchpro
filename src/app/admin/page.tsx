'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Crown, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Target, 
  Megaphone, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  MessageCircle, 
  ExternalLink,
  Award,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  Flame,
  Check,
  UserCheck,
  UserX,
  CreditCard
} from 'lucide-react';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function InstagramIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function MasterDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get('tab') as 'overview' | 'financial' | 'coaches' | 'leads' | null;

  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'coaches' | 'leads'>(tabFromUrl || 'overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar com query params quando a URL mudar
  useEffect(() => {
    if (tabFromUrl && ['overview', 'financial', 'coaches', 'leads'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tab: 'overview' | 'financial' | 'coaches' | 'leads') => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  // Filtros de busca
  const [coachSearch, setCoachSearch] = useState('');
  const [coachTierFilter, setCoachTierFilter] = useState<'all' | 'pro' | 'starter'>('all');
  const [coachStatusFilter, setCoachStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [leadSearch, setLeadSearch] = useState('');

  // Modal de Novo Gasto em Ads
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adSpendDate, setAdSpendDate] = useState(new Date().toISOString().split('T')[0]);
  const [adPlatform, setAdPlatform] = useState('meta_ads');
  const [adAmount, setAdAmount] = useState('');
  const [adCampaign, setAdCampaign] = useState('');
  const [adNotes, setAdNotes] = useState('');
  const [savingAd, setSavingAd] = useState(false);

  // Ação de Toggle Pro para Treinador
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
        fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingCoachId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-36 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-36 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-36 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-36 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
        </div>
        <div className="h-96 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-zinc-950 border border-red-500/30 text-center space-y-4 max-w-lg mx-auto mt-12 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-black text-white">Acesso Exclusivo Super Admin</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {error}
        </p>
        <Link 
          href="/mestre"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          Entrar via Terminal Mestre
        </Link>
      </div>
    );
  }

  const { overview, financial, recentCoaches, recentLeads, recentAdSpends } = metrics;

  // Filtragem avançada de treinadores
  const filteredCoaches = (recentCoaches || []).filter((c: any) => {
    const matchesSearch = 
      c.full_name?.toLowerCase().includes(coachSearch.toLowerCase()) ||
      c.specialty?.toLowerCase().includes(coachSearch.toLowerCase()) ||
      c.phone?.includes(coachSearch);
    
    const matchesTier = 
      coachTierFilter === 'all' || c.plan_tier === coachTierFilter;

    const matchesStatus = 
      coachStatusFilter === 'all' || 
      (coachStatusFilter === 'active' && c.has_active_challenges) ||
      (coachStatusFilter === 'inactive' && !c.has_active_challenges);

    return matchesSearch && matchesTier && matchesStatus;
  });

  const filteredLeads = (recentLeads || []).filter((l: any) => 
    l.name?.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.whatsapp?.includes(leadSearch) ||
    l.email?.toLowerCase().includes(leadSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* 1. Header do Cockpit Mestre — Luxury Titanium */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/[0.08] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400">
              Super Admin • Cockpit do Fundador
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white text-balance">
            ArenaFitPro • Operações Globais
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl text-pretty">
            Métricas de tração SaaS, unit economics, contas ativas, assinaturas Pro (R$ 49,90) e moderação em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={fetchMetrics}
            variant="outline"
            className="rounded-full border-white/10 bg-zinc-900/60 hover:bg-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </Button>

          <Button
            onClick={() => setIsAdModalOpen(true)}
            className="rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_10px_25px_rgba(255,255,255,0.18)] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Gasto Ads
          </Button>
        </div>
      </div>

      {/* 2. Navegação por Abas Executivas */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Visão Geral & Tração', icon: TrendingUp },
          { id: 'financial', label: 'Financeiro, Tráfego & ROI', icon: DollarSign },
          { id: 'coaches', label: `Treinadores (${overview.totalCoaches})`, icon: Users },
          { id: 'leads', label: `Pipeline Leads (${recentLeads.length})`, icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-black font-black shadow-lg shadow-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: VISÃO GERAL & TRAÇÃO SAAS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Grid de Big Numbers — Precisão Contas Ativas & Preços Oficiais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Treinadores (Cadastrados vs Ativos) */}
            <SpotlightCard3D glowIntensity={0.12} className="p-5 sm:p-6 space-y-3.5 bg-zinc-950/80 border border-white/[0.08] border-t-white/20 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Treinadores na Base</span>
                <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    {overview.totalCoaches}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {overview.activeCoaches} ativos
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Taxa de Ativação:</span>
                    <span className="font-mono font-bold text-white">{overview.coachActivationRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Assinantes Pro (R$ 49,90):</span>
                    <span className="font-mono font-bold text-amber-400">{overview.proCoaches}</span>
                  </div>
                </div>
              </div>
            </SpotlightCard3D>

            {/* Card 2: Alunos & Atletas (Total vs Em Desafio Ativo) */}
            <SpotlightCard3D glowIntensity={0.12} className="p-5 sm:p-6 space-y-3.5 bg-zinc-950/80 border border-white/[0.08] border-t-white/20 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Alunos & Atletas</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    {overview.activeStudents}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    em turmas ativas
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Total Cadastrados:</span>
                    <span className="font-mono font-bold text-white">{overview.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Desafios Rodando:</span>
                    <span className="font-mono font-bold text-cyan-400">{overview.activeChallenges} de {overview.totalChallenges}</span>
                  </div>
                </div>
              </div>
            </SpotlightCard3D>

            {/* Card 3: Receita da Plataforma (Splits + MRR Pro) */}
            <SpotlightCard3D glowIntensity={0.12} className="p-5 sm:p-6 space-y-3.5 bg-zinc-950/80 border border-white/[0.08] border-t-white/20 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Receita Retida (SaaS)</span>
                <div className="h-8 w-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight block">
                  R$ {Number(financial.totalPlatformRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>MRR Pro (R$ 49,90):</span>
                    <span className="font-mono font-bold text-white">
                      R$ {Number(financial.currentMRR).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Taxas Retidas (Split):</span>
                    <span className="font-mono font-bold text-emerald-400">
                      R$ {Number(financial.totalPlatformFees).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </SpotlightCard3D>

            {/* Card 4: Volume Bruto Transacionado (GMV) */}
            <SpotlightCard3D glowIntensity={0.12} className="p-5 sm:p-6 space-y-3.5 bg-zinc-950/80 border border-white/[0.08] border-t-white/20 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Volume Bruto (GMV)</span>
                <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight block">
                  R$ {Number(financial.totalGMV).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Transações Confirmadas:</span>
                    <span className="font-mono font-bold text-white">{financial.transactionsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Repasses a Treinadores:</span>
                    <span className="font-mono font-bold text-zinc-300">
                      R$ {Number(financial.totalCoachDisbursed).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </SpotlightCard3D>

          </div>

          {/* Linha 2: Resumo Estratégico & Ações Executivas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Box 1: Economia SaaS & Taxas */}
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Estrutura de Monetização
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 font-medium">Plano Pro Coach:</span>
                    <span className="font-mono font-bold text-amber-400">R$ 49,90/mês</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Taxa reduzida de 8% de split, até 5 desafios simultâneos e 100 alunos por turma.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 font-medium">Plano Starter Coach:</span>
                    <span className="font-mono font-bold text-zinc-300">Grátis (0 R$)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Taxa padrão de 15% de split retido por inscrição, 1 desafio e até 10 alunos.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">Lucro Operacional Líquido:</span>
                  <span className={`font-mono font-bold ${financial.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    R$ {Number(financial.netProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Aquisição & Tráfego */}
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-cyan-400" /> Aquisição & Unit Economics
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">Total Investido em Mídia:</span>
                  <span className="font-mono font-bold text-white">
                    R$ {Number(financial.totalAdSpend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">CAC por Treinador Cadastrado:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    R$ {Number(financial.cac).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">ROI Geral do Negócio:</span>
                  <span className={`font-mono font-bold ${financial.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {Number(financial.roi).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">ROAS Multiplicador:</span>
                  <span className="font-mono font-bold text-amber-400">{Number(financial.roas).toFixed(2)}x</span>
                </div>
              </div>
            </div>

            {/* Box 3: Atalhos do Fundador */}
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Ações Rápidas do Fundador
              </h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => handleTabChange('coaches')}
                  className="w-full text-left p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-zinc-300 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="group-hover:text-white">Gerenciar Treinadores & Ativar PRO</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
                <button
                  onClick={() => handleTabChange('leads')}
                  className="w-full text-left p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-zinc-300 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="group-hover:text-white">Acessar Leads Beta & WhatsApp ({recentLeads.length})</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
                <button
                  onClick={() => setIsAdModalOpen(true)}
                  className="w-full text-left p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-zinc-300 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span className="group-hover:text-white">Lançar Novo Gasto de Mídia</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: FINANCEIRO, TRÁFEGO PAGO & ROI */}
      {/* ========================================================================= */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Unit Economics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">Total Investido em Mídia</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                R$ {Number(financial.totalAdSpend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-xs text-zinc-400">Meta Ads, Google e Tráfego</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">CAC Real por Coach</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                R$ {Number(financial.cac).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-xs text-zinc-400">Custo para atrair 1 treinador</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">ROI Geral</span>
              <span className={`text-2xl sm:text-3xl font-black font-mono ${financial.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {Number(financial.roi).toFixed(1)}%
              </span>
              <p className="text-xs text-zinc-400">Retorno sobre investimento</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">ROAS Multiplicador</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                {Number(financial.roas).toFixed(2)}x
              </span>
              <p className="text-xs text-zinc-400">Receita gerada por R$ 1 investido</p>
            </div>

          </div>

          {/* Histórico de Gastos com Anúncios */}
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Histórico de Gastos com Anúncios
                </h3>
                <p className="text-xs text-zinc-400">Lançamentos manuais para apuração de ROI e CAC.</p>
              </div>
              <Button
                onClick={() => setIsAdModalOpen(true)}
                className="rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold px-5"
              >
                + Adicionar Gasto
              </Button>
            </div>

            {recentAdSpends.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs font-mono">
                Nenhum gasto com anúncios lançado ainda. Clique no botão acima para registrar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase">
                      <th className="py-3 px-3">Data</th>
                      <th className="py-3 px-3">Plataforma</th>
                      <th className="py-3 px-3">Campanha</th>
                      <th className="py-3 px-3">Valor (R$)</th>
                      <th className="py-3 px-3">Notas</th>
                      <th className="py-3 px-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentAdSpends.map((spend: any) => (
                      <tr key={spend.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3 font-mono text-zinc-300">{spend.spend_date}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-mono text-zinc-300">
                            {spend.platform}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-white font-medium">{spend.campaign_name || 'Geral'}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          R$ {Number(spend.amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">{spend.notes || '-'}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteAdSpend(spend.id)}
                            className="text-zinc-400 hover:text-red-400 transition-colors p-1 cursor-pointer"
                            title="Excluir Registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: GESTÃO DE TREINADORES & TENANTS */}
      {/* ========================================================================= */}
      {activeTab === 'coaches' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 backdrop-blur-xl space-y-5">
            
            {/* Header & Filtros do Diretório */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Diretório Global de Treinadores
                </h3>
                <p className="text-xs text-zinc-400">
                  Visão de contas ativas, turmas em andamento, splits e concessão de plano PRO (R$ 49,90).
                </p>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Filtro Status da Conta */}
                <select
                  value={coachStatusFilter}
                  onChange={(e) => setCoachStatusFilter(e.target.value as any)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-white/30 font-mono"
                >
                  <option value="all">Todas as Contas</option>
                  <option value="active">Com Turma Ativa</option>
                  <option value="inactive">Sem Turma / Onboarding</option>
                </select>

                {/* Filtro Plano */}
                <select
                  value={coachTierFilter}
                  onChange={(e) => setCoachTierFilter(e.target.value as any)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-white/30 font-mono"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="pro">Apenas PRO (R$ 49,90)</option>
                  <option value="starter">Apenas Starter (Grátis)</option>
                </select>

                {/* Campo de Busca */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={coachSearch}
                    onChange={(e) => setCoachSearch(e.target.value)}
                    placeholder="Buscar nome ou telefone..."
                    className="pl-9 bg-zinc-900 border-white/10 rounded-xl text-xs text-white placeholder-zinc-500"
                  />
                </div>
              </div>
            </div>

            {/* Tabela de Treinadores */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase">
                    <th className="py-3 px-3">Treinador & Contato</th>
                    <th className="py-3 px-3">Status da Conta</th>
                    <th className="py-3 px-3">Desafios / Alunos</th>
                    <th className="py-3 px-3">Plano Atual</th>
                    <th className="py-3 px-3">Subconta Asaas</th>
                    <th className="py-3 px-3">Cadastro</th>
                    <th className="py-3 px-3 text-right">Ação Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCoaches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400 font-mono">
                        Nenhum treinador encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredCoaches.map((coach: any) => {
                      const cleanPhone = coach.phone?.replace(/\D/g, '');
                      return (
                        <tr key={coach.id} className="hover:bg-white/[0.02] transition-colors">
                          
                          {/* Coluna 1: Nome e Contato */}
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              {coach.full_name}
                              {coach.plan_tier === 'pro' && (
                                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span>{coach.specialty}</span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/55${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                                >
                                  <MessageCircle className="w-3 h-3" /> Zap
                                </a>
                              )}
                              {coach.instagram && (
                                <a
                                  href={`https://instagram.com/${coach.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-pink-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                                >
                                  <InstagramIcon className="w-3 h-3" /> {coach.instagram}
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Coluna 2: Status da Conta (Ativa com Desafio vs Onboarding) */}
                          <td className="py-3.5 px-3">
                            {coach.has_active_challenges ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Ativo ({coach.active_challenges_count} turmas)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
                                Em Onboarding
                              </span>
                            )}
                          </td>

                          {/* Coluna 3: Desafios e Alunos */}
                          <td className="py-3.5 px-3 font-mono">
                            <div className="text-white font-bold">
                              {coach.total_challenges_count} desafio(s)
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              {coach.total_students_count} aluno(s)
                            </div>
                          </td>

                          {/* Coluna 4: Plano e Taxa Oficial */}
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex flex-col px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border ${
                              coach.plan_tier === 'pro' 
                                ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' 
                                : 'bg-white/5 text-zinc-400 border-white/10'
                            }`}>
                              <span>{coach.plan_tier === 'pro' ? '★ PRO (R$ 49,90/mês)' : 'Starter (Grátis)'}</span>
                              <span className="text-[9px] font-normal text-zinc-400">Split: {coach.platform_fee_percent}%</span>
                            </span>
                          </td>

                          {/* Coluna 5: Subconta Asaas */}
                          <td className="py-3.5 px-3 font-mono">
                            {coach.asaas_wallet_id ? (
                              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Vinculada
                              </span>
                            ) : (
                              <span className="text-amber-400/90 text-[11px] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Pendente
                              </span>
                            )}
                          </td>

                          {/* Coluna 6: Data Cadastro */}
                          <td className="py-3.5 px-3 font-mono text-zinc-400">
                            {new Date(coach.created_at).toLocaleDateString('pt-BR')}
                          </td>

                          {/* Coluna 7: Ação Super Admin */}
                          <td className="py-3.5 px-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingCoachId === coach.id}
                              onClick={() => handleToggleCoachTier(coach.id, coach.plan_tier)}
                              className="rounded-full text-[11px] font-mono border-white/10 hover:bg-white/10 text-zinc-200 transition-all cursor-pointer"
                            >
                              {coach.plan_tier === 'pro' ? 'Rebaixar p/ Starter' : 'Conceder PRO'}
                            </Button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: PIPELINE DE LEADS & BETA TESTERS */}
      {/* ========================================================================= */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Candidatos do Beta Fechado & Lista VIP
                </h3>
                <p className="text-xs text-zinc-400">Leads capturados via /beta e /vip prontos para ativação no WhatsApp.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Buscar por nome, zap ou e-mail..."
                  className="pl-9 bg-zinc-900 border-white/10 rounded-xl text-xs text-white placeholder-zinc-500"
                />
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs font-mono">
                Nenhum lead encontrado com os filtros atuais.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase">
                      <th className="py-3 px-3">Nome / Perfil</th>
                      <th className="py-3 px-3">WhatsApp</th>
                      <th className="py-3 px-3">E-mail</th>
                      <th className="py-3 px-3">Alunos Previstos</th>
                      <th className="py-3 px-3">Origem</th>
                      <th className="py-3 px-3">Data</th>
                      <th className="py-3 px-3 text-right">Ação Direta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLeads.map((lead: any) => {
                      const cleanPhone = lead.whatsapp?.replace(/\D/g, '');
                      return (
                        <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-white">{lead.name}</div>
                            {lead.utm_source?.startsWith('ig:') && (
                              <div className="text-[11px] text-amber-400 font-mono">
                                {lead.utm_source.replace('ig:', '@')}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-zinc-300">
                            {lead.whatsapp}
                          </td>
                          <td className="py-3 px-3 text-zinc-300">{lead.email}</td>
                          <td className="py-3 px-3 font-mono">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-zinc-300">
                              {lead.students_range || 'N/A'} alunos
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase border ${
                              lead.utm_medium === 'beta_tester'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {lead.utm_medium === 'beta_tester' ? 'Beta Tester' : 'Lista VIP'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-zinc-400">
                            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <a
                              href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(lead.name.split(' ')[0])}%2C%20aqui%20%C3%A9%20o%20Igor%20da%20ArenaFitPro!%20Vi%20sua%20inscri%C3%A7%C3%A3o%20para%20o%20Beta.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(52,211,153,0.1)]"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> Chamar WhatsApp
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR GASTO COM ANÚNCIOS (ADS) */}
      {/* ========================================================================= */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-white/15 border-t-white/30 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">
                Tráfego Pago & Performance
              </span>
              <h3 className="text-xl font-black text-white">Registrar Gasto de Anúncios</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Alimenta a apuração automática do CAC e ROI da plataforma.
              </p>
            </div>

            <form onSubmit={handleSaveAdSpend} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block">Data do Gasto</label>
                <input
                  type="date"
                  required
                  value={adSpendDate}
                  onChange={(e) => setAdSpendDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block">Plataforma</label>
                  <select
                    value={adPlatform}
                    onChange={(e) => setAdPlatform(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="meta_ads">Meta Ads (Instagram/FB)</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="influencer">Parceria / Influencer</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block">Valor Investido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 250.00"
                    value={adAmount}
                    onChange={(e) => setAdAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block">Nome da Campanha (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Campanha /beta Personais SP"
                  value={adCampaign}
                  onChange={(e) => setAdCampaign(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block">Notas / Observações</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Criativo em vídeo destacando ranking e split automático"
                  value={adNotes}
                  onChange={(e) => setAdNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/40 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdModalOpen(false)}
                  className="flex-1 rounded-full border-white/10 text-xs font-mono"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={savingAd}
                  className="flex-1 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase tracking-wider shadow-[0_5px_15px_rgba(255,255,255,0.15)]"
                >
                  {savingAd ? 'Salvando...' : 'Confirmar Gasto'}
                </Button>
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
    <Suspense fallback={
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-36 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-36 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
        </div>
      </div>
    }>
      <MasterDashboardContent />
    </Suspense>
  );
}
