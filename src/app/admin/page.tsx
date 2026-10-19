'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Megaphone, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  MessageCircle, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Input } from '@/components/ui/input';

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

  const { overview, financial, recentCoaches, recentLeads, recentAdSpends } = metrics;

  // Filtragem de treinadores
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
    <div className="space-y-8 relative">
      {/* Background 3D Animado idêntico ao painel do treinador */}
      <Monochrome3DBackground />

      {/* Top Banner — Mesma estética do treinador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Administração Mestre
            </span>
            <span className="text-xs text-zinc-400 font-medium">Dados globais em tempo real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Operações Globais</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Métricas SaaS, unit economics, assinaturas Pro (R$ 49,90/mês) e contas ativas.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsAdModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold bg-white text-black hover:bg-zinc-100 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar Gasto Ads
          </button>
          <button
            onClick={fetchMetrics}
            className="mono-button-secondary w-full sm:w-auto px-4 py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </button>
        </div>
      </div>

      {/* Navegação por Abas Limpa */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto no-scrollbar relative z-10">
        {[
          { id: 'overview', label: 'Visão Geral' },
          { id: 'financial', label: 'Financeiro & Tráfego' },
          { id: 'coaches', label: `Treinadores (${overview.totalCoaches})` },
          { id: 'leads', label: `Leads Beta (${recentLeads.length})` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white/10 text-white border border-white/20'
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
                {overview.proCoaches} assinantes Pro (R$ 49,90) • {overview.coachActivationRate}% ativação
              </p>
            </SpotlightCard3D>

            {/* Card 2: Alunos em Desafios */}
            <SpotlightCard3D className="p-5">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold tracking-wide text-zinc-400">
                  Alunos em Turmas Ativas
                </span>
                <span className="h-2 w-2 rounded-full bg-white" />
              </div>
              <div className="text-3xl font-black text-white font-mono">{overview.activeStudents}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {overview.totalStudents} total cadastrados • {overview.activeChallenges} desafios rodando
              </p>
            </SpotlightCard3D>

            {/* Card 3: Receita Retida (SaaS) */}
            <SpotlightCard3D className="p-5">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold tracking-wide text-zinc-400">
                  Receita Plataforma
                </span>
                <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded-full">
                  Split + Pro
                </span>
              </div>
              <div className="text-3xl font-black text-white font-mono">
                R$ {Number(financial.totalPlatformRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                MRR Pro: R$ {Number(financial.currentMRR).toFixed(2)} • Splits: R$ {Number(financial.totalPlatformFees).toFixed(2)}
              </p>
            </SpotlightCard3D>

            {/* Card 4: Volume Bruto (GMV) */}
            <SpotlightCard3D className="p-5">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold tracking-wide text-zinc-400">
                  Volume Bruto (GMV)
                </span>
                <span className="text-xs text-zinc-400">Total</span>
              </div>
              <div className="text-3xl font-black text-white font-mono">
                R$ {Number(financial.totalGMV).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {financial.transactionsCount} inscrições confirmadas
              </p>
            </SpotlightCard3D>

          </div>

          {/* Linha 2: Resumo de Planos e Unit Economics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            <SpotlightCard3D className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">Regras de Monetização</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div>
                    <span className="font-semibold text-white block">Plano Pro Coach</span>
                    <span className="text-zinc-400 text-[11px]">8% de split • até 5 desafios • 100 alunos/turma</span>
                  </div>
                  <span className="font-mono font-bold text-white">R$ 49,90/mês</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div>
                    <span className="font-semibold text-white block">Plano Starter Coach</span>
                    <span className="text-zinc-400 text-[11px]">15% de split retido • 1 desafio • até 10 alunos</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-400">Grátis (0 R$)</span>
                </div>
              </div>
            </SpotlightCard3D>

            <SpotlightCard3D className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">Performance & Aquisição</h3>
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
      {/* ABA 2: FINANCEIRO & TRÁFEGO */}
      {/* ========================================================================= */}
      {activeTab === 'financial' && (
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SpotlightCard3D className="p-5">
              <span className="text-xs font-semibold text-zinc-400 block pb-2">Investimento Total</span>
              <div className="text-2xl font-black font-mono text-white">
                R$ {Number(financial.totalAdSpend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Anúncios e Mídia</p>
            </SpotlightCard3D>

            <SpotlightCard3D className="p-5">
              <span className="text-xs font-semibold text-zinc-400 block pb-2">CAC por Treinador</span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                R$ {Number(financial.cac).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Custo de Aquisição</p>
            </SpotlightCard3D>

            <SpotlightCard3D className="p-5">
              <span className="text-xs font-semibold text-zinc-400 block pb-2">ROI Geral</span>
              <div className={`text-2xl font-black font-mono ${financial.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Number(financial.roi).toFixed(1)}%
              </div>
              <p className="text-xs text-zinc-500 mt-1">Retorno s/ Investimento</p>
            </SpotlightCard3D>

            <SpotlightCard3D className="p-5">
              <span className="text-xs font-semibold text-zinc-400 block pb-2">ROAS Multiplicador</span>
              <div className="text-2xl font-black font-mono text-white">
                {Number(financial.roas).toFixed(2)}x
              </div>
              <p className="text-xs text-zinc-500 mt-1">Receita / Gasto</p>
            </SpotlightCard3D>
          </div>

          <SpotlightCard3D className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Histórico de Gastos com Anúncios</h3>
                <p className="text-xs text-zinc-400">Lançamentos para apuração de CAC e ROI.</p>
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
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Plataforma</th>
                      <th className="py-2.5 px-3">Campanha</th>
                      <th className="py-2.5 px-3">Valor</th>
                      <th className="py-2.5 px-3">Notas</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentAdSpends.map((spend: any) => (
                      <tr key={spend.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3 font-mono text-zinc-300">{spend.spend_date}</td>
                        <td className="py-3 px-3 uppercase text-[11px] font-mono text-zinc-300">{spend.platform}</td>
                        <td className="py-3 px-3 text-white font-medium">{spend.campaign_name || 'Geral'}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          R$ {Number(spend.amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">{spend.notes || '-'}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteAdSpend(spend.id)}
                            className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
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
      {/* ABA 3: GESTÃO DE TREINADORES */}
      {/* ========================================================================= */}
      {activeTab === 'coaches' && (
        <SpotlightCard3D className="p-5 space-y-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Diretório de Treinadores</h3>
              <p className="text-xs text-zinc-400">Contas ativas, turmas em andamento e planos.</p>
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
                <option value="pro">Plano PRO (R$ 49,90)</option>
                <option value="starter">Plano Starter</option>
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
                  <th className="py-2.5 px-3">Plano</th>
                  <th className="py-2.5 px-3">Subconta Asaas</th>
                  <th className="py-2.5 px-3">Cadastro</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoaches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono">
                      Nenhum treinador encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredCoaches.map((coach: any) => {
                    const cleanPhone = coach.phone?.replace(/\D/g, '');
                    return (
                      <tr key={coach.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-sm">{coach.full_name}</div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span>{coach.specialty}</span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/55${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-0.5 text-[10px]"
                              >
                                <MessageCircle className="w-3 h-3" /> Zap
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
                          <div className="text-white font-semibold">{coach.total_challenges_count} desafio(s)</div>
                          <div className="text-zinc-500 text-[11px]">{coach.total_students_count} aluno(s)</div>
                        </td>

                        <td className="py-3 px-3">
                          {coach.plan_tier === 'pro' ? (
                            <span className="text-xs font-semibold text-white bg-white/10 border border-white/20 px-2.5 py-1 rounded-full inline-block">
                              PRO (R$ 49,90)
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full inline-block">
                              Starter
                            </span>
                          )}
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
                          <button
                            disabled={updatingCoachId === coach.id}
                            onClick={() => handleToggleCoachTier(coach.id, coach.plan_tier)}
                            className="mono-button-secondary px-3 py-1 text-xs cursor-pointer"
                          >
                            {coach.plan_tier === 'pro' ? 'Rebaixar' : 'Ativar PRO'}
                          </button>
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
      {/* ABA 4: LEADS BETA */}
      {/* ========================================================================= */}
      {activeTab === 'leads' && (
        <SpotlightCard3D className="p-5 space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Candidatos do Beta Fechado & VIP</h3>
              <p className="text-xs text-zinc-400">Leads capturados prontos para contato.</p>
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

      {/* Modal Registrar Gasto de Anúncios */}
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
                    <option value="tiktok">TikTok Ads</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 block">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="250.00"
                    value={adAmount}
                    onChange={(e) => setAdAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Campanha</label>
                <input
                  type="text"
                  placeholder="Nome da campanha"
                  value={adCampaign}
                  onChange={(e) => setAdCampaign(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Notas adicionais"
                  value={adNotes}
                  onChange={(e) => setAdNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="mono-button-secondary flex-1 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAd}
                  className="mono-button-primary flex-1 py-2 text-xs font-bold cursor-pointer"
                >
                  {savingAd ? 'Salvando...' : 'Confirmar'}
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
    <Suspense fallback={
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-2xl bg-zinc-950 border border-white/[0.08]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 rounded-2xl bg-zinc-950 border border-white/[0.08]" />
          <div className="h-32 rounded-2xl bg-zinc-950 border border-white/[0.08]" />
        </div>
      </div>
    }>
      <MasterDashboardContent />
    </Suspense>
  );
}
