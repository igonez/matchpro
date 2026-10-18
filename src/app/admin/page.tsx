'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Crown, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  ArrowUpRight, 
  Target, 
  Megaphone, 
  Calendar, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  MessageCircle, 
  Filter, 
  ExternalLink,
  Award,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MasterDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'coaches' | 'leads'>('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtro de Treinadores e Leads
  const [coachSearch, setCoachSearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');

  // Modal / Formulário de Novo Gasto em Ads
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adSpendDate, setAdSpendDate] = useState(new Date().toISOString().split('T')[0]);
  const [adPlatform, setAdPlatform] = useState('meta_ads');
  const [adAmount, setAdAmount] = useState('');
  const [adCampaign, setAdCampaign] = useState('');
  const [adNotes, setAdNotes] = useState('');
  const [savingAd, setSavingAd] = useState(false);

  // Ação de Toggle Pro para Coach
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
        <div className="h-20 rounded-3xl bg-zinc-900/60 border border-white/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 rounded-3xl bg-zinc-900/60 border border-white/5" />
          <div className="h-32 rounded-3xl bg-zinc-900/60 border border-white/5" />
          <div className="h-32 rounded-3xl bg-zinc-900/60 border border-white/5" />
          <div className="h-32 rounded-3xl bg-zinc-900/60 border border-white/5" />
        </div>
        <div className="h-96 rounded-3xl bg-zinc-900/60 border border-white/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center space-y-4 max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-black text-white">Acesso Negado ou Restrito</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Esta tela é de uso exclusivo do Super Admin da ArenaFitPro. Seu usuário atual não possui a flag de Master Admin.
        </p>
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition-all"
        >
          Voltar ao Dashboard do Treinador
        </Link>
      </div>
    );
  }

  const { overview, financial, recentCoaches, recentLeads, recentAdSpends } = metrics;

  const filteredCoaches = recentCoaches.filter((c: any) => 
    c.full_name?.toLowerCase().includes(coachSearch.toLowerCase()) ||
    c.specialty?.toLowerCase().includes(coachSearch.toLowerCase())
  );

  const filteredLeads = recentLeads.filter((l: any) => 
    l.name?.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.whatsapp?.includes(leadSearch) ||
    l.email?.toLowerCase().includes(leadSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* 1. Header do Cockpit Mestre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              Super Admin • Cockpit do Fundador
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            ArenaFitPro • Operações Globais
          </h1>
          <p className="text-xs text-zinc-400">
            Métricas de tração SaaS, unit economics, retorno de mídia e moderação em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchMetrics}
            variant="outline"
            className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </Button>

          <Button
            onClick={() => setIsAdModalOpen(true)}
            className="rounded-xl bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            <Plus className="w-4 h-4" /> Registrar Gasto Ads
          </Button>
        </div>
      </div>

      {/* 2. Navegação por Abas (Tabs) */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Visão Geral & Métricas', icon: TrendingUp },
          { id: 'financial', label: 'Financeiro, Tráfego & ROI', icon: DollarSign },
          { id: 'coaches', label: `Treinadores (${overview.totalCoaches})`, icon: Users },
          { id: 'leads', label: `Leads & Beta (${recentLeads.length})`, icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-black font-black shadow-lg shadow-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: VISÃO GERAL */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Linha 1: Big Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <SpotlightCard3D glowIntensity={0.12} className="p-5 space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-mono uppercase tracking-wider">Volume Bruto (GMV)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  R$ {Number(financial.totalGMV).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-zinc-500 block mt-0.5">
                  {financial.transactionsCount} inscrições pagas
                </span>
              </div>
            </SpotlightCard3D>

            <SpotlightCard3D glowIntensity={0.12} className="p-5 space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-mono uppercase tracking-wider">Receita Líquida Plataforma</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight">
                  R$ {Number(financial.totalPlatformRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-zinc-500 block mt-0.5">
                  Taxas de Split + MRR Pro
                </span>
              </div>
            </SpotlightCard3D>

            <SpotlightCard3D glowIntensity={0.12} className="p-5 space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-mono uppercase tracking-wider">Treinadores Cadastrados</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {overview.totalCoaches}
                </span>
                <span className="text-xs text-zinc-500 block mt-0.5">
                  {overview.proCoaches} assinantes Pro (R$ {financial.currentMRR}/mês)
                </span>
              </div>
            </SpotlightCard3D>

            <SpotlightCard3D glowIntensity={0.12} className="p-5 space-y-3">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[11px] font-mono uppercase tracking-wider">Atletas em Desafios</span>
                <Award className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  {overview.totalStudents}
                </span>
                <span className="text-xs text-zinc-500 block mt-0.5">
                  Em {overview.activeChallenges} turmas ativas
                </span>
              </div>
            </SpotlightCard3D>

          </div>

          {/* Linha 2: Resumo Rápido da Tração */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Distribuição de Receitas
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">Taxas Retidas nos Desafios (Split):</span>
                  <span className="font-mono font-bold text-white">R$ {Number(financial.totalPlatformFees).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">MRR Assinaturas Pro (Mensal):</span>
                  <span className="font-mono font-bold text-amber-400">R$ {Number(financial.currentMRR).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">Repasses Feitos a Treinadores:</span>
                  <span className="font-mono font-bold text-zinc-300">R$ {Number(financial.totalCoachDisbursed).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-cyan-400" /> Aquisição & Tráfego (Resumo)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">Investimento Total em Ads:</span>
                  <span className="font-mono font-bold text-white">R$ {Number(financial.totalAdSpend).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">CAC (Custo por Treinador):</span>
                  <span className="font-mono font-bold text-emerald-400">R$ {Number(financial.cac).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-zinc-400">Lucro Operacional Líquido:</span>
                  <span className={`font-mono font-bold ${financial.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    R$ {Number(financial.netProfit).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Ações Rápidas do Fundador
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('leads')}
                  className="w-full text-left p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-zinc-300 flex items-center justify-between transition-all"
                >
                  <span>Ver novos inscritos no Beta ({recentLeads.length})</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>
                <button
                  onClick={() => setActiveTab('coaches')}
                  className="w-full text-left p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-zinc-300 flex items-center justify-between transition-all"
                >
                  <span>Gerenciar personais e liberar Pro</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>
                <button
                  onClick={() => setIsAdModalOpen(true)}
                  className="w-full text-left p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-xs text-zinc-300 flex items-center justify-between transition-all"
                >
                  <span>Lançar nota de gasto em anúncios</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
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
          {/* Unit Economics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-3xl bg-zinc-950 border border-white/[0.08] space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 block">Total Gasto em Mídia</span>
              <span className="text-2xl font-black font-mono text-white">
                R$ {Number(financial.totalAdSpend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[11px] text-zinc-500">Meta Ads, Google e Mídias</p>
            </div>

            <div className="p-5 rounded-3xl bg-zinc-950 border border-white/[0.08] space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 block">CAC Real por Coach</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                R$ {Number(financial.cac).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[11px] text-zinc-500">Custo para adquirir 1 treinador</p>
            </div>

            <div className="p-5 rounded-3xl bg-zinc-950 border border-white/[0.08] space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 block">ROI Geral</span>
              <span className={`text-2xl font-black font-mono ${financial.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {Number(financial.roi).toFixed(1)}%
              </span>
              <p className="text-[11px] text-zinc-500">Retorno sobre o capital investido</p>
            </div>

            <div className="p-5 rounded-3xl bg-zinc-950 border border-white/[0.08] space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 block">ROAS Multiplicador</span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {Number(financial.roas).toFixed(2)}x
              </span>
              <p className="text-[11px] text-zinc-500">Receita gerada por R$ 1 investido</p>
            </div>

          </div>

          {/* Tabela de Lançamento de Gastos de Anúncios */}
          <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Histórico de Gastos com Anúncios
                </h3>
                <p className="text-xs text-zinc-400">Lançamentos manuais para apuração de ROI e CAC.</p>
              </div>
              <Button
                onClick={() => setIsAdModalOpen(true)}
                className="rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold"
              >
                + Adicionar Gasto
              </Button>
            </div>

            {recentAdSpends.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs font-mono">
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
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-mono">
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
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                            title="Excluir"
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
          <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Diretório de Treinadores Cadastrados
                </h3>
                <p className="text-xs text-zinc-400">Controle de planos, auditoria e contato direto.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={coachSearch}
                  onChange={(e) => setCoachSearch(e.target.value)}
                  placeholder="Buscar por nome ou área..."
                  className="pl-9 bg-zinc-900 border-white/10 rounded-xl text-xs text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase">
                    <th className="py-3 px-3">Treinador</th>
                    <th className="py-3 px-3">Especialidade</th>
                    <th className="py-3 px-3">Plano Atual</th>
                    <th className="py-3 px-3">Subconta Split (Asaas)</th>
                    <th className="py-3 px-3">Cadastro</th>
                    <th className="py-3 px-3 text-right">Ação Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCoaches.map((coach: any) => (
                    <tr key={coach.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-sm">{coach.full_name || 'Sem nome'}</div>
                        <div className="text-[11px] font-mono text-zinc-500">{coach.id.slice(0, 8)}...</div>
                      </td>
                      <td className="py-3 px-3 text-zinc-300">
                        {coach.specialty || 'Personal Trainer'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          coach.plan_tier === 'pro' 
                            ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' 
                            : 'bg-white/5 text-zinc-400 border-white/10'
                        }`}>
                          {coach.plan_tier === 'pro' ? '★ PRO (R$ 149)' : 'Starter (08-15%)'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {coach.asaas_wallet_id ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Vinculada
                          </span>
                        ) : (
                          <span className="text-zinc-500">Pendente</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-400">
                        {new Date(coach.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingCoachId === coach.id}
                          onClick={() => handleToggleCoachTier(coach.id, coach.plan_tier)}
                          className="rounded-lg text-[10px] font-mono border-white/10 hover:bg-white/10 text-zinc-200"
                        >
                          {coach.plan_tier === 'pro' ? 'Rebaixar p/ Starter' : 'Conceder PRO'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: LEADS & PIPELINE (BETA TESTERS & LISTA VIP) */}
      {/* ========================================================================= */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Candidatos do Beta Fechado & Lista VIP
                </h3>
                <p className="text-xs text-zinc-400">Leads capturados via /beta e /vip prontos para contato.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Buscar por nome, zap ou e-mail..."
                  className="pl-9 bg-zinc-900 border-white/10 rounded-xl text-xs text-white placeholder-zinc-500"
                />
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs font-mono">
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
                        <tr key={lead.id} className="hover:bg-white/[0.02]">
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
                          <td className="py-3 px-3 text-zinc-400">{lead.email}</td>
                          <td className="py-3 px-3 font-mono">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px]">
                              {lead.students_range || 'N/A'} alunos
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border ${
                              lead.utm_medium === 'beta_tester'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {lead.utm_medium === 'beta_tester' ? 'Beta Tester' : 'Lista VIP'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-zinc-500">
                            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <a
                              href={`https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(lead.name.split(' ')[0])}%2C%20aqui%20%C3%A9%20o%20Igor%20da%20ArenaFitPro!%20Vi%20sua%20inscri%C3%A7%C3%A3o%20para%20o%20Beta.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold transition-all"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-white/15 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">
                Tráfego Pago & Performance
              </span>
              <h3 className="text-xl font-black text-white">Registrar Gasto de Anúncios</h3>
              <p className="text-xs text-zinc-400">
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
                  placeholder="Ex: Criativo com vídeo do ranking gamificado"
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
                  className="flex-1 rounded-xl border-white/10 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={savingAd}
                  className="flex-1 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase tracking-wider"
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
