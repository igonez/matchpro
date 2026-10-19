'use client';

import React, { useEffect, useState, Suspense } from 'react';
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
  CreditCard,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function InstagramIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
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
        <div className="h-28 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-40 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-40 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-40 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-40 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
        </div>
        <div className="h-96 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 sm:p-10 rounded-[32px] bg-zinc-950 border border-red-500/30 text-center space-y-5 max-w-lg mx-auto mt-12 shadow-[0_0_60px_rgba(239,68,68,0.15)]">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white">Acesso Exclusivo Super Admin</h2>
        <p className="text-sm text-zinc-300 leading-relaxed font-sans">
          {error}
        </p>
        <Link 
          href="/mestre"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition-all shadow-[0_10px_25px_rgba(255,255,255,0.2)]"
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
    <div className="space-y-8 pb-20 font-sans antialiased">
      
      {/* 1. Header do Cockpit Mestre — Luxury Titanium & Brand Logo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.08] pb-8">
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Logo Oficial com Halo Suave */}
          <div className="relative shrink-0">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-3xl overflow-hidden border border-white/20 bg-zinc-950 p-1.5 shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-black border border-amber-400/80 flex items-center justify-center text-amber-400 shadow-md">
              <Crown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded-full">
                Super Admin • Cockpit do Fundador
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              ArenaFitPro • Operações Globais
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl font-normal leading-relaxed">
              Visão macro de tração SaaS, unit economics, assinaturas Pro (R$ 49,90/mês) e diretório de contas ativas.
            </p>
          </div>
        </div>

        {/* Botões de Ação de Topo */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={fetchMetrics}
            variant="outline"
            className="rounded-full border-white/10 bg-zinc-900/80 hover:bg-white/10 text-xs font-semibold text-zinc-200 flex items-center gap-2 px-4 py-2.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar Dados
          </Button>

          <Button
            onClick={() => setIsAdModalOpen(true)}
            className="rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 px-5 py-2.5 shadow-[0_10px_25px_rgba(255,255,255,0.18)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar Gasto Ads
          </Button>
        </div>
      </div>

      {/* 2. Navegação por Abas Executivas — Estilo Pill */}
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
              className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-black font-bold shadow-[0_4px_20px_rgba(255,255,255,0.18)] scale-[1.02]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: VISÃO GERAL & TRAÇÃO SAAS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Grid Bento de Big Numbers — Precisão Contas Ativas & Preços Oficiais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Treinadores (Cadastrados vs Ativos) */}
            <SpotlightCard3D glowIntensity={0.15} className="p-6 space-y-4 bg-zinc-950/85 border border-white/[0.08] border-t-white/20 rounded-[28px] shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Treinadores na Base</span>
                <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    {overview.totalCoaches}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {overview.activeCoaches} ativos
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Taxa de Ativação:</span>
                    <span className="font-mono font-bold text-white">{overview.coachActivationRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Assinantes PRO (R$ 49,90):</span>
                    <span className="font-mono font-bold text-amber-400">{overview.proCoaches}</span>
                  </div>
                </div>
              </div>
            </SpotlightCard3D>

            {/* Card 2: Alunos & Atletas (Total vs Em Desafio Ativo) */}
            <SpotlightCard3D glowIntensity={0.15} className="p-6 space-y-4 bg-zinc-950/85 border border-white/[0.08] border-t-white/20 rounded-[28px] shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Alunos & Atletas</span>
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    {overview.activeStudents}
                  </span>
                  <span className="text-xs font-sans text-zinc-400">
                    em turmas ativas
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs">
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
            <SpotlightCard3D glowIntensity={0.15} className="p-6 space-y-4 bg-zinc-950/85 border border-white/[0.08] border-t-white/20 rounded-[28px] shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Receita Retida (SaaS)</span>
                <div className="h-10 w-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight block">
                  R$ {Number(financial.totalPlatformRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>MRR Pro (R$ 49,90):</span>
                    <span className="font-mono font-bold text-white">
                      R$ {Number(financial.currentMRR).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Taxas de Split:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      R$ {Number(financial.totalPlatformFees).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </SpotlightCard3D>

            {/* Card 4: Volume Bruto Transacionado (GMV) */}
            <SpotlightCard3D glowIntensity={0.15} className="p-6 space-y-4 bg-zinc-950/85 border border-white/[0.08] border-t-white/20 rounded-[28px] shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Volume Bruto (GMV)</span>
                <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight block">
                  R$ {Number(financial.totalGMV).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Inscrições Confirmadas:</span>
                    <span className="font-mono font-bold text-white">{financial.transactionsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Repasses a Coaches:</span>
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
            <div className="p-6 sm:p-7 rounded-[28px] bg-zinc-950/85 border border-white/[0.08] border-t-white/20 backdrop-blur-2xl space-y-5 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                  Estrutura de Monetização
                </h3>
              </div>
              
              <div className="space-y-3.5 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-sm">Plano Pro Coach</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">R$ 49,90/mês</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Taxa ultra-reduzida de <strong>8% de split</strong> por inscrição, até 5 desafios simultâneos e 100 alunos por turma.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-sm">Plano Starter Coach</span>
                    <span className="font-mono font-bold text-zinc-300 text-sm">Grátis (0 R$)</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Taxa padrão de <strong>15% de split</strong> retido por inscrição na plataforma, 1 desafio e até 10 alunos.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-300 font-medium">Lucro Operacional Líquido:</span>
                  <span className={`font-mono font-bold text-sm ${financial.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    R$ {Number(financial.netProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Aquisição & Tráfego */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-zinc-950/85 border border-white/[0.08] border-t-white/20 backdrop-blur-2xl space-y-5 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                  Aquisição & Unit Economics
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-300">Total Investido em Mídia:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    R$ {Number(financial.totalAdSpend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-300">CAC por Treinador Cadastrado:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    R$ {Number(financial.cac).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-300">ROI Geral do Negócio:</span>
                  <span className={`font-mono font-bold text-sm ${financial.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {Number(financial.roi).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-300">ROAS Multiplicador:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{Number(financial.roas).toFixed(2)}x</span>
                </div>
              </div>
            </div>

            {/* Box 3: Atalhos do Fundador */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-zinc-950/85 border border-white/[0.08] border-t-white/20 backdrop-blur-2xl space-y-5 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                  Ações Rápidas do Fundador
                </h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleTabChange('coaches')}
                  className="w-full text-left p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-zinc-200 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-white group-hover:text-amber-400 transition-colors">Gerenciar Treinadores & Ativar PRO</span>
                    <span className="text-xs text-zinc-400 block">{overview.totalCoaches} treinadores cadastrados</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handleTabChange('leads')}
                  className="w-full text-left p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-zinc-200 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-white group-hover:text-cyan-400 transition-colors">Pipeline de Leads Beta</span>
                    <span className="text-xs text-zinc-400 block">{recentLeads.length} leads prontos para WhatsApp</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => setIsAdModalOpen(true)}
                  className="w-full text-left p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-zinc-200 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-white group-hover:text-emerald-400 transition-colors">Lançar Novo Gasto de Mídia</span>
                    <span className="text-xs text-zinc-400 block">Atualiza CAC e ROI automaticamente</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
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
        <div className="space-y-8">
          {/* Unit Economics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="p-6 rounded-[28px] bg-zinc-950/85 border border-white/[0.08] border-t-white/20 space-y-2 shadow-lg">
              <span className="text-xs font-semibold uppercase text-zinc-400 block tracking-wider">Total Investido em Mídia</span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white block">
                R$ {Number(financial.totalAdSpend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-xs text-zinc-400">Meta Ads, Google e Mídia Paga</p>
            </div>

            <div className="p-6 rounded-[28px] bg-zinc-950/85 border border-white/[0.08] border-t-white/20 space-y-2 shadow-lg">
              <span className="text-xs font-semibold uppercase text-zinc-400 block tracking-wider">CAC Real por Coach</span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 block">
                R$ {Number(financial.cac).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-xs text-zinc-400">Custo para atrair 1 treinador</p>
            </div>

            <div className="p-6 rounded-[28px] bg-zinc-950/85 border border-white/[0.08] border-t-white/20 space-y-2 shadow-lg">
              <span className="text-xs font-semibold uppercase text-zinc-400 block tracking-wider">ROI Geral</span>
              <span className={`text-3xl sm:text-4xl font-black font-mono block ${financial.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {Number(financial.roi).toFixed(1)}%
              </span>
              <p className="text-xs text-zinc-400">Retorno sobre investimento</p>
            </div>

            <div className="p-6 rounded-[28px] bg-zinc-950/85 border border-white/[0.08] border-t-white/20 space-y-2 shadow-lg">
              <span className="text-xs font-semibold uppercase text-zinc-400 block tracking-wider">ROAS Multiplicador</span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400 block">
                {Number(financial.roas).toFixed(2)}x
              </span>
              <p className="text-xs text-zinc-400">Receita gerada por R$ 1 investido</p>
            </div>

          </div>

          {/* Histórico de Gastos com Anúncios */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-zinc-950/85 border border-white/[0.08] border-t-white/20 backdrop-blur-2xl space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-sans uppercase tracking-wider">
                  Histórico de Gastos com Anúncios
                </h3>
                <p className="text-xs text-zinc-400">Lançamentos manuais para apuração contínua de ROI e CAC.</p>
              </div>
              <Button
                onClick={() => setIsAdModalOpen(true)}
                className="rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold px-6 py-2.5 shadow-md cursor-pointer"
              >
                + Adicionar Gasto
              </Button>
            </div>

            {recentAdSpends.length === 0 ? (
              <div className="py-14 text-center text-zinc-400 text-xs font-mono">
                Nenhum gasto com anúncios lançado ainda. Clique no botão acima para registrar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                      <th className="py-3.5 px-4">Data</th>
                      <th className="py-3.5 px-4">Plataforma</th>
                      <th className="py-3.5 px-4">Campanha</th>
                      <th className="py-3.5 px-4">Valor (R$)</th>
                      <th className="py-3.5 px-4">Notas</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentAdSpends.map((spend: any) => (
                      <tr key={spend.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 font-mono text-zinc-300">{spend.spend_date}</td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase font-mono text-zinc-300">
                            {spend.platform}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-white font-medium">{spend.campaign_name || 'Geral'}</td>
                        <td className="py-4 px-4 font-mono font-bold text-emerald-400 text-sm">
                          R$ {Number(spend.amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-zinc-400 max-w-xs truncate">{spend.notes || '-'}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteAdSpend(spend.id)}
                            className="text-zinc-400 hover:text-red-400 transition-colors p-1.5 cursor-pointer rounded-lg hover:bg-white/5"
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
        <div className="space-y-8">
          <div className="p-6 sm:p-8 rounded-[28px] bg-zinc-950/85 border border-white/[0.08] border-t-white/20 backdrop-blur-2xl space-y-6 shadow-xl">
            
            {/* Header & Filtros do Diretório */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                  Diretório Global de Treinadores
                </h3>
                <p className="text-xs text-zinc-400">
                  Visão executiva de contas ativas, turmas em andamento, splits e concessão de plano PRO (R$ 49,90).
                </p>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Filtro Status da Conta */}
                <select
                  value={coachStatusFilter}
                  onChange={(e) => setCoachStatusFilter(e.target.value as any)}
                  className="bg-zinc-900 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-white/30 font-medium cursor-pointer"
                >
                  <option value="all">Todas as Contas</option>
                  <option value="active">Com Turma Ativa</option>
                  <option value="inactive">Sem Turma / Onboarding</option>
                </select>

                {/* Filtro Plano */}
                <select
                  value={coachTierFilter}
                  onChange={(e) => setCoachTierFilter(e.target.value as any)}
                  className="bg-zinc-900 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-white/30 font-medium cursor-pointer"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="pro">Apenas PRO (R$ 49,90)</option>
                  <option value="starter">Apenas Starter (Grátis)</option>
                </select>

                {/* Campo de Busca */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={coachSearch}
                    onChange={(e) => setCoachSearch(e.target.value)}
                    placeholder="Buscar nome ou telefone..."
                    className="pl-10 bg-zinc-900 border-white/10 rounded-2xl text-xs text-white placeholder-zinc-500 py-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Tabela de Treinadores */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                    <th className="py-4 px-4">Treinador & Contato</th>
                    <th className="py-4 px-4">Status da Conta</th>
                    <th className="py-4 px-4">Desafios / Alunos</th>
                    <th className="py-4 px-4">Plano Atual</th>
                    <th className="py-4 px-4">Subconta Asaas</th>
                    <th className="py-4 px-4">Cadastro</th>
                    <th className="py-4 px-4 text-right">Ação Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCoaches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-zinc-400 font-sans">
                        Nenhum treinador encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredCoaches.map((coach: any) => {
                      const cleanPhone = coach.phone?.replace(/\D/g, '');
                      return (
                        <tr key={coach.id} className="hover:bg-white/[0.02] transition-colors">
                          
                          {/* Coluna 1: Nome e Contato */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {/* Avatar Inicial */}
                              <div className="h-10 w-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-sm text-white shrink-0">
                                {coach.full_name?.charAt(0)?.toUpperCase() || 'T'}
                              </div>

                              <div>
                                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                  {coach.full_name}
                                  {coach.plan_tier === 'pro' && (
                                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  )}
                                </div>
                                <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                                  <span>{coach.specialty}</span>
                                  {cleanPhone && (
                                    <a
                                      href={`https://wa.me/55${cleanPhone}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-xs"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" /> Zap
                                    </a>
                                  )}
                                  {coach.instagram && (
                                    <a
                                      href={`https://instagram.com/${coach.instagram.replace('@', '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-pink-400 hover:underline flex items-center gap-1 font-mono text-xs"
                                    >
                                      <InstagramIcon className="w-3 h-3" /> {coach.instagram}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Coluna 2: Status da Conta (Ativa com Desafio vs Onboarding) */}
                          <td className="py-4 px-4">
                            {coach.has_active_challenges ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Ativo ({coach.active_challenges_count} turmas)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-medium">
                                Em Onboarding
                              </span>
                            )}
                          </td>

                          {/* Coluna 3: Desafios e Alunos */}
                          <td className="py-4 px-4 font-mono">
                            <div className="text-white font-bold text-xs">
                              {coach.total_challenges_count} desafio(s)
                            </div>
                            <div className="text-xs text-zinc-400">
                              {coach.total_students_count} aluno(s)
                            </div>
                          </td>

                          {/* Coluna 4: Plano e Taxa Oficial */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex flex-col px-3 py-1.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider border ${
                              coach.plan_tier === 'pro' 
                                ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' 
                                : 'bg-white/5 text-zinc-300 border-white/10'
                            }`}>
                              <span>{coach.plan_tier === 'pro' ? '★ PRO (R$ 49,90/mês)' : 'Starter (Grátis)'}</span>
                              <span className="text-[10px] font-normal text-zinc-400">Split da Plataforma: {coach.platform_fee_percent}%</span>
                            </span>
                          </td>

                          {/* Coluna 5: Subconta Asaas */}
                          <td className="py-4 px-4 font-mono">
                            {coach.asaas_wallet_id ? (
                              <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-semibold">
                                <CheckCircle2 className="w-4 h-4" /> Vinculada
                              </span>
                            ) : (
                              <span className="text-amber-400 text-xs flex items-center gap-1.5">
                                <Clock className="w-4 h-4" /> Pendente
                              </span>
                            )}
                          </td>

                          {/* Coluna 6: Data Cadastro */}
                          <td className="py-4 px-4 font-mono text-zinc-400">
                            {new Date(coach.created_at).toLocaleDateString('pt-BR')}
                          </td>

                          {/* Coluna 7: Ação Super Admin */}
                          <td className="py-4 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingCoachId === coach.id}
                              onClick={() => handleToggleCoachTier(coach.id, coach.plan_tier)}
                              className="rounded-full text-xs font-semibold border-white/15 hover:bg-white hover:text-black text-zinc-200 transition-all cursor-pointer px-4"
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
        <div className="space-y-8">
          <div className="p-6 sm:p-8 rounded-[28px] bg-zinc-950/85 border border-white/[0.08] border-t-white/20 backdrop-blur-2xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">
                  Candidatos do Beta Fechado & Lista VIP
                </h3>
                <p className="text-xs text-zinc-400">Leads capturados via /beta e /vip prontos para ativação direta no WhatsApp.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Buscar por nome, zap ou e-mail..."
                  className="pl-10 bg-zinc-900 border-white/10 rounded-2xl text-xs text-white placeholder-zinc-500 py-2.5"
                />
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="py-14 text-center text-zinc-400 text-xs font-mono">
                Nenhum lead encontrado com os filtros atuais.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                      <th className="py-4 px-4">Nome / Perfil</th>
                      <th className="py-4 px-4">WhatsApp</th>
                      <th className="py-4 px-4">E-mail</th>
                      <th className="py-4 px-4">Alunos Previstos</th>
                      <th className="py-4 px-4">Origem</th>
                      <th className="py-4 px-4">Data</th>
                      <th className="py-4 px-4 text-right">Ação Direta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLeads.map((lead: any) => {
                      const cleanPhone = lead.whatsapp?.replace(/\D/g, '');
                      return (
                        <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-white text-sm">{lead.name}</div>
                            {lead.utm_source?.startsWith('ig:') && (
                              <div className="text-xs text-amber-400 font-mono mt-0.5">
                                {lead.utm_source.replace('ig:', '@')}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono text-zinc-300">
                            {lead.whatsapp}
                          </td>
                          <td className="py-4 px-4 text-zinc-300">{lead.email}</td>
                          <td className="py-4 px-4 font-mono">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-200">
                              {lead.students_range || 'N/A'} alunos
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-mono uppercase font-bold border ${
                              lead.utm_medium === 'beta_tester'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {lead.utm_medium === 'beta_tester' ? 'Beta Tester' : 'Lista VIP'}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-zinc-400">
                            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <a
                              href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(lead.name.split(' ')[0])}%2C%20aqui%20%C3%A9%20o%20Igor%20da%20ArenaFitPro!%20Vi%20sua%20inscri%C3%A7%C3%A3o%20para%20o%20Beta.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-all shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                            >
                              <MessageCircle className="w-4 h-4" /> Chamar WhatsApp
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
          <div className="w-full max-w-md bg-zinc-950 border border-white/15 border-t-white/30 rounded-[32px] p-7 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block font-bold">
                Tráfego Pago & Performance
              </span>
              <h3 className="text-2xl font-black text-white">Registrar Gasto de Anúncios</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                Alimenta a apuração automática do CAC e ROI da plataforma.
              </p>
            </div>

            <form onSubmit={handleSaveAdSpend} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-300 block">Data do Gasto</label>
                <input
                  type="date"
                  required
                  value={adSpendDate}
                  onChange={(e) => setAdSpendDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-zinc-300 block">Plataforma</label>
                  <select
                    value={adPlatform}
                    onChange={(e) => setAdPlatform(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="meta_ads">Meta Ads (Instagram/FB)</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="influencer">Parceria / Influencer</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-zinc-300 block">Valor Investido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 250.00"
                    value={adAmount}
                    onChange={(e) => setAdAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-300 block">Nome da Campanha (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Campanha /beta Personais SP"
                  value={adCampaign}
                  onChange={(e) => setAdCampaign(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-300 block">Notas / Observações</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Criativo em vídeo destacando ranking e split automático"
                  value={adNotes}
                  onChange={(e) => setAdNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 resize-none font-sans"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdModalOpen(false)}
                  className="flex-1 rounded-full border-white/10 text-xs font-semibold py-3"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={savingAd}
                  className="flex-1 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider py-3 shadow-[0_5px_20px_rgba(255,255,255,0.2)] cursor-pointer"
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
        <div className="h-28 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-40 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-40 rounded-3xl bg-zinc-950 border border-white/[0.08]" />
        </div>
      </div>
    }>
      <MasterDashboardContent />
    </Suspense>
  );
}
