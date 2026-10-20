'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Plus, 
  ExternalLink, 
  Copy, 
  QrCode, 
  Share2, 
  Search, 
  CheckCircle2, 
  SlidersHorizontal,
  Flame,
  ArrowLeft,
  DollarSign,
  Layers,
  ChevronRight,
  CopyPlus,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Input } from '@/components/ui/input';
import { MobileLoadingScreen } from '@/components/ui/mobile-loading-screen';

interface ChallengeItem {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  price: number;
  is_active: boolean;
  created_at?: string;
  studentsCount: number;
  missionsCount: number;
  grossRevenue: number;
  netRevenue: number;
}

export default function ChallengesManagementPage() {
  const router = useRouter();
  const supabase = createClient();

  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'active' | 'all' | 'ended'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  
  // Modal de Compartilhamento & QR Code
  const [inviteModalChallenge, setInviteModalChallenge] = useState<ChallengeItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Carregar desafios exclusivos do treinador autenticado (multi-tenant)
      const { data: challengesData, error: chError } = await supabase
        .from('challenges')
        .select('*')
        .eq('professional_id', user.id)
        .order('start_date', { ascending: false });

      if (chError) {
        console.error('Erro ao buscar desafios:', chError);
        setLoading(false);
        return;
      }

      const safeChallenges = challengesData || [];
      const challengeIds = safeChallenges.map((c: any) => c.id);

      if (challengeIds.length === 0) {
        setChallenges([]);
        setLoading(false);
        return;
      }

      // 2. Contar participantes com matrícula confirmada por desafio
      const { data: participantsData } = await supabase
        .from('challenge_participants')
        .select('challenge_id')
        .in('challenge_id', challengeIds)
        .in('payment_status', ['paid', 'complimentary']);

      const studentsCountMap = new Map<string, number>();
      participantsData?.forEach((p: any) => {
        studentsCountMap.set(p.challenge_id, (studentsCountMap.get(p.challenge_id) || 0) + 1);
      });

      // 3. Contar missões por desafio (diretas ou via challenge_weeks)
      const { data: weeksData } = await supabase
        .from('challenge_weeks')
        .select('id, challenge_id')
        .in('challenge_id', challengeIds);

      const weekToChallenge = new Map<string, string>();
      weeksData?.forEach((w: any) => weekToChallenge.set(w.id, w.challenge_id));

      const weekIds = weeksData?.map((w: any) => w.id) || [];
      let missionsQuery = supabase.from('missions').select('id, challenge_id, week_id');
      if (weekIds.length > 0) {
        missionsQuery = missionsQuery.or(`challenge_id.in.(${challengeIds.join(',')}),week_id.in.(${weekIds.join(',')})`);
      } else {
        missionsQuery = missionsQuery.in('challenge_id', challengeIds);
      }

      const { data: missionsData } = await missionsQuery;
      const missionsCountMap = new Map<string, number>();
      missionsData?.forEach((m: any) => {
        const chId = m.challenge_id || weekToChallenge.get(m.week_id);
        if (chId) {
          missionsCountMap.set(chId, (missionsCountMap.get(chId) || 0) + 1);
        }
      });

      // 4. Carregar total arrecadado por desafio
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('challenge_id, gross_value, net_coach_value, status')
        .in('challenge_id', challengeIds)
        .in('status', ['RECEIVED', 'CONFIRMED']);

      const grossRevenueMap = new Map<string, number>();
      const netRevenueMap = new Map<string, number>();
      paymentsData?.forEach((p: any) => {
        grossRevenueMap.set(p.challenge_id, (grossRevenueMap.get(p.challenge_id) || 0) + Number(p.gross_value || 0));
        netRevenueMap.set(p.challenge_id, (netRevenueMap.get(p.challenge_id) || 0) + Number(p.net_coach_value || 0));
      });

      const augmented = safeChallenges.map((c: any) => ({
        ...c,
        price: Number(c.price) || 0,
        studentsCount: studentsCountMap.get(c.id) || 0,
        missionsCount: missionsCountMap.get(c.id) || 0,
        grossRevenue: grossRevenueMap.get(c.id) || 0,
        netRevenue: netRevenueMap.get(c.id) || 0,
      }));

      setChallenges(augmented);

    } catch (err) {
      console.error('Falha geral ao buscar desafios:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  // Duplicar Turma completa com semanas e missões (Clone Challenge)
  const handleDuplicateChallenge = async (challengeId: string) => {
    if (duplicatingId) return;
    setDuplicatingId(challengeId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado.');

      // 1. Obter dados completos da turma original
      const { data: orig, error: origError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (origError || !orig) throw new Error('Desafio original não encontrado.');

      // 2. Calcular novas datas mantendo duração original
      const origStart = new Date(orig.start_date || new Date());
      const origEnd = new Date(orig.end_date || new Date(Date.now() + 30 * 86400000));
      const durationMs = Math.max(origEnd.getTime() - origStart.getTime(), 7 * 86400000);
      const newStart = new Date();
      const newEnd = new Date(newStart.getTime() + durationMs);

      // 3. Inserir nova turma duplicada
      const newChallengePayload = {
        professional_id: user.id,
        title: `${orig.title} (Nova Turma)`,
        description: orig.description,
        rules: orig.rules,
        start_date: newStart.toISOString(),
        end_date: newEnd.toISOString(),
        price: orig.price,
        cover_url: orig.cover_url,
        is_active: true,
      };

      const { data: newChallenge, error: insertError } = await supabase
        .from('challenges')
        .insert(newChallengePayload)
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Clonar semanas se existirem
      const { data: origWeeks } = await supabase
        .from('challenge_weeks')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('week_number', { ascending: true });

      const weekMapping = new Map<string, string>();
      if (origWeeks && origWeeks.length > 0) {
        for (const w of origWeeks) {
          const { data: insertedWeek } = await supabase
            .from('challenge_weeks')
            .insert({
              challenge_id: newChallenge.id,
              week_number: w.week_number,
              title: w.title,
              theme: w.theme,
            })
            .select('id')
            .single();

          if (insertedWeek) {
            weekMapping.set(w.id, insertedWeek.id);
          }
        }
      }

      // 5. Clonar missões originais
      const weekIdsParam = origWeeks && origWeeks.length > 0 ? origWeeks.map((w: any) => w.id) : [];
      let origMissionsQuery = supabase.from('missions').select('*');
      if (weekIdsParam.length > 0) {
        origMissionsQuery = origMissionsQuery.or(`challenge_id.eq.${challengeId},week_id.in.(${weekIdsParam.join(',')})`);
      } else {
        origMissionsQuery = origMissionsQuery.eq('challenge_id', challengeId);
      }

      const { data: origMissions } = await origMissionsQuery;

      if (origMissions && origMissions.length > 0) {
        const clonedMissions = origMissions.map((m: any) => ({
          title: m.title,
          description: m.description,
          points: m.points,
          category: m.category,
          frequency: m.frequency,
          verification_type: m.verification_type,
          challenge_id: newChallenge.id,
          week_id: m.week_id ? weekMapping.get(m.week_id) || null : null,
        }));

        await supabase.from('missions').insert(clonedMissions);
      }

      showToast(`Turma duplicada com sucesso com ${origMissions?.length || 0} missões!`);
      await loadChallenges();
    } catch (err: any) {
      console.error('Erro ao duplicar desafio:', err);
      showToast(err.message || 'Erro ao duplicar turma.');
    } finally {
      setDuplicatingId(null);
    }
  };

  // Alternar status ativo/encerrado de uma turma
  const handleToggleStatus = async (challengeId: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      const { error } = await supabase
        .from('challenges')
        .update({ is_active: nextStatus })
        .eq('id', challengeId);

      if (error) throw error;

      setChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, is_active: nextStatus } : c))
      );

      showToast(`Turma marcada como ${nextStatus ? 'Ativa' : 'Encerrada'}!`);
    } catch (err: any) {
      console.error('Erro ao alternar status da turma:', err);
      showToast('Erro ao atualizar status do desafio.');
    }
  };

  // Filtragem dos desafios
  const filteredChallenges = challenges.filter((c) => {
    // Tab filter
    if (filterTab === 'active' && !c.is_active) return false;
    if (filterTab === 'ended' && c.is_active) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q);
    }
    return true;
  });

  // Métricas de cabeçalho
  const activeCount = challenges.filter((c) => c.is_active).length;
  const endedCount = challenges.filter((c) => !c.is_active).length;
  const totalStudents = challenges.reduce((acc, curr) => acc + curr.studentsCount, 0);
  const totalProjectedRevenue = challenges.reduce(
    (acc, curr) => acc + curr.studentsCount * curr.price,
    0
  );

  if (loading) {
    return (
      <MobileLoadingScreen
        title="Gerenciar Desafios"
        subtitle="Carregando turmas e métricas dos desafios..."
        fullScreen={true}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 min-h-screen relative pb-28">
      {/* Background 3D Monocromático */}
      <Monochrome3DBackground />

      {/* Toast flutuante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900/95 border border-white/20 text-white font-mono text-xs shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Header com Navegação e Botão de Ação Primário */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 pt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Início</span>
            </Link>
            <span className="text-zinc-600 font-mono">•</span>
            <span className="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 font-mono">
              TURMAS & DESAFIOS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gerenciar Desafios
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Acompanhe todas as turmas ativas e anteriores, matrículas, missões e links de convite.
          </p>
        </div>

        {/* Botão + Novo Desafio destacado */}
        <Link href="/dashboard/challenges/new" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-black bg-white text-black hover:bg-zinc-100 rounded-2xl shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer border border-white">
            <span className="text-base leading-none font-black text-black group-hover:rotate-90 transition-transform duration-200">+</span>
            <span>Novo Desafio</span>
          </button>
        </Link>
      </div>

      {/* 2. Grid de Métricas de Resumo em 3D */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        <SpotlightCard3D className="p-4 sm:p-5">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Turmas Ativas</span>
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{activeCount}</div>
          <p className="text-[10px] text-zinc-500 mt-1">{challenges.length} turmas no total</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4 sm:p-5">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Alunos Ativos</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{totalStudents}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Inscritos nas turmas</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4 sm:p-5">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Faturamento</span>
            <DollarSign className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            R$ {totalProjectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Valor consolidado</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4 sm:p-5">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400">Encerradas</span>
            <span className="text-[10px] font-mono text-zinc-500">Histórico</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-400 font-mono">{endedCount}</div>
          <p className="text-[10px] text-zinc-500 mt-1">Turmas finalizadas</p>
        </SpotlightCard3D>
      </div>

      {/* 3. Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
        {/* Tabs de Filtro */}
        <div className="flex items-center p-1 rounded-2xl bg-black/60 border border-white/10 self-start">
          <button
            onClick={() => setFilterTab('active')}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filterTab === 'active'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ativos ({activeCount})
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todos ({challenges.length})
          </button>
          <button
            onClick={() => setFilterTab('ended')}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filterTab === 'ended'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Encerrados ({endedCount})
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Buscar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-black/60 border-white/10 text-white rounded-xl text-xs font-mono focus:border-white/30"
          />
        </div>
      </div>

      {/* 4. Lista dos Desafios */}
      {loading ? (
        <div className="py-20 text-center font-mono text-zinc-500 text-sm">
          Carregando turmas e métricas em tempo real...
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="mono-glass-card p-10 sm:p-14 rounded-3xl text-center border-dashed border-white/10 relative z-10 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Nenhum desafio encontrado</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Nenhuma turma corresponde à sua busca atual.'
                : filterTab === 'ended'
                ? 'Você não possui turmas encerradas no momento.'
                : 'Você ainda não possui desafios ativos cadastrados.'}
            </p>
          </div>
          <Link href="/dashboard/challenges/new" className="inline-block">
            <button className="mono-button-primary px-5 py-2.5 text-xs font-semibold">
              + Criar Novo Desafio
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 relative z-10">
          {filteredChallenges.map((c) => {
            const isEnded = !c.is_active;
            const startFormatted = new Date(c.start_date + 'T00:00:00').toLocaleDateString('pt-BR');
            const endFormatted = new Date(c.end_date + 'T00:00:00').toLocaleDateString('pt-BR');

            return (
              <div
                key={c.id}
                className="mono-glass-card p-5 sm:p-6 rounded-3xl flex flex-col justify-between border border-white/[0.08] hover:border-white/25 transition-all group"
              >
                <div className="space-y-4">
                  {/* Topo do Card: Badge de Status e Preço / Split */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleStatus(c.id, c.is_active)}
                      title="Clique para alternar status da turma"
                      className={`text-xs px-2.5 py-0.5 rounded-full border transition-all cursor-pointer font-mono font-bold ${
                        c.is_active
                          ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                          : 'border-white/10 bg-black text-zinc-500 hover:text-white'
                      }`}
                    >
                      {c.is_active ? '● Ativo' : '○ Encerrado'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {c.price > 0 ? (
                        <>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            Split Asaas
                          </span>
                          <span className="text-sm font-mono font-black text-white">
                            R$ {c.price.toFixed(2).replace('.', ',')}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-mono font-bold text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                          Gratuito
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Título e Período */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight line-clamp-1 group-hover:text-zinc-100">
                      {c.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 mt-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span>{startFormatted} até {endFormatted}</span>
                    </div>
                  </div>

                  {/* Grid de Métricas da Turma (Alunos, Missões e Líquido) */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
                    <div className="p-2.5 rounded-2xl bg-black/60 border border-white/[0.06] text-center">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">Alunos</span>
                      <span className="text-base font-black text-white font-mono block mt-0.5">
                        {c.studentsCount}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-black/60 border border-white/[0.06] text-center">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">Missões</span>
                      <span className="text-base font-black text-white font-mono block mt-0.5">
                        {c.missionsCount}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-black/60 border border-white/[0.06] text-center">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">Líquido</span>
                      <span className="text-base font-black text-emerald-400 font-mono block mt-0.5 truncate">
                        R$ {c.netRevenue > 0 ? c.netRevenue.toFixed(0) : '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card com Ações */}
                <div className="pt-5 mt-4 border-t border-white/[0.08] space-y-2.5">
                  {/* Botão de Convidar / Compartilhar */}
                  <button
                    onClick={() => setInviteModalChallenge(c)}
                    className="w-full h-9 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/15 text-xs font-mono font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    <Share2 className="h-3.5 w-3.5 text-zinc-300" />
                    <span>Convidar Alunos (WhatsApp / QR)</span>
                  </button>

                  {/* Ações Secundárias em Linha */}
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href={`/dashboard/challenges/${c.id}/edit`}
                      className="w-full text-center py-2 px-1 rounded-xl bg-zinc-900/90 hover:bg-white hover:text-black border border-white/10 text-[11px] font-mono font-bold text-zinc-300 transition-all truncate"
                    >
                      Editar
                    </Link>

                    <button
                      onClick={() => handleDuplicateChallenge(c.id)}
                      disabled={duplicatingId === c.id}
                      className="w-full text-center py-2 px-1 rounded-xl bg-zinc-900/90 hover:bg-white hover:text-black border border-white/10 text-[11px] font-mono font-bold text-zinc-300 transition-all flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                      title="Clonar esta turma com todas as missões"
                    >
                      {duplicatingId === c.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CopyPlus className="h-3 w-3" />
                      )}
                      <span>Clonar</span>
                    </button>

                    <Link
                      href={`/dashboard/missions?challengeId=${c.id}`}
                      className="w-full text-center py-2 px-1 rounded-xl bg-zinc-900/90 hover:bg-white hover:text-black border border-white/10 text-[11px] font-mono font-bold text-zinc-300 transition-all flex items-center justify-center gap-0.5"
                    >
                      <span>Missões</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL DE CONVITE & COMPARTILHAMENTO DO DESAFIO */}
      {inviteModalChallenge && (
        <CustomDialog
          isOpen={!!inviteModalChallenge}
          onClose={() => setInviteModalChallenge(null)}
          title={`Convidar Alunos • ${inviteModalChallenge.title}`}
          description="Compartilhe este link exclusivo para matricular novos alunos nesta turma."
          confirmLabel="Fechar"
          onConfirm={() => setInviteModalChallenge(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Link Público do Desafio
              </label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/join/${inviteModalChallenge.id}`
                      : ''
                  }
                  className="bg-black/80 border-white/15 text-white rounded-xl text-xs font-mono select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    const link = `${window.location.origin}/join/${inviteModalChallenge.id}`;
                    navigator.clipboard.writeText(link);
                    showToast('Link do convite copiado!');
                  }}
                  className="mono-button-primary px-3 text-xs shrink-0 font-mono cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 inline mr-1" />
                  Copiar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
              <span className="text-zinc-400">Código de Acesso Rápido:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-widest uppercase bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  {inviteModalChallenge.id.slice(0, 8).toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteModalChallenge.id.slice(0, 8).toUpperCase());
                    showToast('Código rápido copiado!');
                  }}
                  className="text-zinc-400 hover:text-white p-1 transition-colors cursor-pointer"
                  title="Copiar código curto"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Ações Rápidas: WhatsApp & QR Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Venha participar do desafio "${inviteModalChallenge.title}" comigo no ArenaFitPro!\n\nGaranta sua vaga no link oficial:\n${
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/join/${inviteModalChallenge.id}`
                      : ''
                  }`
                )}`}
                className="w-full py-2.5 px-3 rounded-xl bg-white text-black font-mono font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-md"
              >
                <span>Enviar no WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  const link = `${window.location.origin}/join/${inviteModalChallenge.id}`;
                  window.open(
                    `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                      link
                    )}`,
                    '_blank'
                  );
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 border border-white/15 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center gap-2 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Ver QR Code Grande</span>
              </button>
            </div>

            {/* QR Code de Projeção Preview */}
            <div className="p-4 rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500">
                QR Code de Acesso Rápido
              </span>
              <div className="bg-white p-2 rounded-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/join/${inviteModalChallenge.id}`
                      : ''
                  )}`}
                  alt="QR Code do Desafio"
                  className="w-36 h-36"
                />
              </div>
              <p className="text-[10px] font-mono text-zinc-500 text-center">
                Aponte a câmera do celular para abrir o checkout e matrícula da turma.
              </p>
            </div>
          </div>
        </CustomDialog>
      )}
    </div>
  );
}
