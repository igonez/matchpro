'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Sparkles,
  Brain,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Loader2,
  Layers,
  LayoutGrid,
  X,
  Check,
  RotateCcw,
  Flame,
  ShieldAlert,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export default function FiscalizacaoPage() {
  const supabase = createClient();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('all');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reported' | 'approved' | 'rejected'>('all');
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [batchApproving, setBatchApproving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiAnalysisMap, setAiAnalysisMap] = useState<Record<string, any>>({});
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});

  // Histórico de ações de swipe para permitir "Desfazer"
  const [swipeHistory, setSwipeHistory] = useState<{ id: string; prevStatus: string }[]>([]);

  // Modal Customizado de Invalidação
  const [invalidateTarget, setInvalidateTarget] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Buscar apenas turmas do treinador autenticado (Isolamento Multi-Tenant)
      const { data: coachChallenges } = await supabase
        .from('challenges')
        .select('id, title')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      const safeChallenges = coachChallenges || [];
      setChallenges(safeChallenges);

      if (safeChallenges.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      // Determinar quais turmas auditar
      const targetChallengeIds = selectedChallengeId === 'all'
        ? safeChallenges.map((c: any) => c.id)
        : [selectedChallengeId];

      // 2. Buscar submissões com dados do aluno e missão
      const { data: subsData, error: subsError } = await supabase
        .from('student_submissions')
        .select(`
          id,
          photo_url,
          caption,
          status,
          location_name,
          client_captured_at,
          submitted_at,
          student_id,
          students (
            full_name,
            avatar_url
          ),
          missions!inner (
            id,
            challenge_id,
            title,
            category,
            points_rewarded
          ),
          submission_reports (
            id,
            reason,
            created_at,
            reporter_student_id
          )
        `)
        .in('missions.challenge_id', targetChallengeIds)
        .order('submitted_at', { ascending: false })
        .limit(80);

      let finalSubmissions: any[] = subsData || [];

      // Fallback defensivo caso o join direto de submission_reports falhe
      if (subsError) {
        console.warn('Fallback na consulta de submissões:', subsError.message);
        const { data: fallbackSubs } = await supabase
          .from('student_submissions')
          .select(`
            id,
            photo_url,
            caption,
            status,
            location_name,
            client_captured_at,
            submitted_at,
            student_id,
            students (
              full_name,
              avatar_url
            ),
            missions!inner (
              id,
              challenge_id,
              title,
              category,
              points_rewarded
            )
          `)
          .in('missions.challenge_id', targetChallengeIds)
          .order('submitted_at', { ascending: false })
          .limit(80);

        finalSubmissions = fallbackSubs || [];
      }

      // 3. Garantir carregamento resiliente das denúncias de fotos da tabela submission_reports
      if (finalSubmissions.length > 0) {
        const subIds = finalSubmissions.map((s) => s.id);
        const { data: directReports } = await supabase
          .from('submission_reports')
          .select('id, submission_id, reason, created_at, reporter_student_id')
          .in('submission_id', subIds);

        if (directReports && directReports.length > 0) {
          const reportsBySubId: Record<string, any[]> = {};
          directReports.forEach((r: any) => {
            if (!reportsBySubId[r.submission_id]) reportsBySubId[r.submission_id] = [];
            reportsBySubId[r.submission_id].push(r);
          });

          finalSubmissions = finalSubmissions.map((s) => ({
            ...s,
            submission_reports: reportsBySubId[s.id] || s.submission_reports || [],
          }));
        }
      }

      setSubmissions(finalSubmissions);
      setSwipeIndex(0);
    } catch (err) {
      console.error('Erro ao buscar fiscalização:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedChallengeId]);

  // Lista filtrada e ordenada (Denunciadas e Pendentes sempre no topo para revisão prioritária)
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((s) => {
        const hasReport = s.submission_reports && s.submission_reports.length > 0;
        if (filter === 'pending') return s.status === 'pending';
        if (filter === 'reported') return hasReport && s.status !== 'rejected';
        if (filter === 'rejected') return s.status === 'rejected';
        if (filter === 'approved') return s.status === 'approved';
        return true;
      })
      .sort((a, b) => {
        const aReported = a.submission_reports && a.submission_reports.length > 0 ? 1 : 0;
        const bReported = b.submission_reports && b.submission_reports.length > 0 ? 1 : 0;
        if (aReported !== bReported) return bReported - aReported;
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      });
  }, [submissions, filter]);

  const reportedCount = useMemo(() => {
    return submissions.filter(
      (s) => s.submission_reports && s.submission_reports.length > 0 && s.status !== 'rejected'
    ).length;
  }, [submissions]);

  const pendingCount = useMemo(() => {
    return submissions.filter((s) => s.status === 'pending').length;
  }, [submissions]);

  // Ações de Auditoria
  const handleApprovePhoto = async (sub: any) => {
    setProcessingId(sub.id);
    const prevStatus = sub.status;
    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ status: 'approved' })
        .eq('id', sub.id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((item) => (item.id === sub.id ? { ...item, status: 'approved' } : item))
      );
      setSwipeHistory((prev) => [...prev, { id: sub.id, prevStatus }]);
      showToast(`Foto de "${sub.students?.full_name}" aprovada!`);
    } catch (err: any) {
      showToast('Erro ao aprovar foto: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmInvalidate = async () => {
    if (!invalidateTarget) return;
    const sub = invalidateTarget;
    setProcessingId(sub.id);
    const prevStatus = sub.status;
    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ status: 'rejected' })
        .eq('id', sub.id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((item) => (item.id === sub.id ? { ...item, status: 'rejected' } : item))
      );
      setSwipeHistory((prev) => [...prev, { id: sub.id, prevStatus }]);
      showToast(`Foto de "${sub.students?.full_name}" invalidada.`);
      setInvalidateTarget(null);
    } catch (err: any) {
      showToast('Erro ao invalidar foto: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUndoLastSwipe = async () => {
    if (swipeHistory.length === 0) return;
    const lastAction = swipeHistory[swipeHistory.length - 1];
    setProcessingId(lastAction.id);
    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ status: lastAction.prevStatus })
        .eq('id', lastAction.id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((item) => (item.id === lastAction.id ? { ...item, status: lastAction.prevStatus } : item))
      );
      setSwipeHistory((prev) => prev.slice(0, -1));
      setSwipeIndex((prev) => Math.max(0, prev - 1));
      showToast('Ação desfeita com sucesso!');
    } catch (err: any) {
      showToast('Erro ao desfazer: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAnalyzeWithAI = async (sub: any) => {
    if (aiAnalysisMap[sub.id]) {
      setExpandedAnalysis((prev) => ({ ...prev, [sub.id]: !prev[sub.id] }));
      return;
    }

    setAnalyzingId(sub.id);
    try {
      const res = await fetch('/api/ai/analyze-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl: sub.photo_url,
          category: sub.missions?.category || 'refeicao',
          caption: sub.caption || '',
        }),
      });

      const data = await res.json();
      if (data?.analysis) {
        setAiAnalysisMap((prev) => ({ ...prev, [sub.id]: data.analysis }));
        setExpandedAnalysis((prev) => ({ ...prev, [sub.id]: true }));
      }
    } catch (err) {
      console.error('Erro na análise IA:', err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleBatchApprovePending = async () => {
    const pendingIds = submissions
      .filter((s) => s.status === 'pending')
      .map((s) => s.id);

    if (pendingIds.length === 0) {
      showToast('Nenhuma submissão pendente para aprovar.');
      return;
    }

    setBatchApproving(true);
    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ status: 'approved' })
        .in('id', pendingIds);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((s) => (pendingIds.includes(s.id) ? { ...s, status: 'approved' } : s))
      );
      showToast(`${pendingIds.length} submissão(ões) aprovada(s) em lote!`);
    } catch (err: any) {
      showToast('Erro ao aprovar em lote: ' + err.message);
    } finally {
      setBatchApproving(false);
    }
  };

  // Atalhos de teclado no modo Swipe
  const currentSwipeSub = filteredSubmissions[swipeIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (viewMode !== 'swipe' || !currentSwipeSub || invalidateTarget) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleApprovePhoto(currentSwipeSub);
        setSwipeIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setInvalidateTarget(currentSwipeSub);
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleAnalyzeWithAI(currentSwipeSub);
      }
    },
    [viewMode, currentSwipeSub, invalidateTarget]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="space-y-6 relative pb-16">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Fiscalização & IA
            </span>
            <span className="text-xs text-zinc-400 font-medium">Auditoria de Check-ins</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Auditoria & Fiscalização de Fotos
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Revise fotos com visão computacional, averigue denúncias da comunidade e aprove via Swipe rápido.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Seletor de Turma */}
          {challenges.length > 0 && (
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 rounded-xl bg-black border border-white/15 text-white text-xs px-3 font-medium focus:outline-none focus:border-white/30"
            >
              <option value="all">Todas as Minhas Turmas ({challenges.length})</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          {/* Alternador de Modo: Swipe vs Grade */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode('swipe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'swipe'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Modo Swipe</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grade</span>
            </button>
          </div>

          {pendingCount > 0 && (
            <button
              onClick={handleBatchApprovePending}
              disabled={batchApproving || loading}
              className="mono-button-primary px-3.5 py-2 text-xs font-semibold justify-center flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              {batchApproving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              <span>Aprovar Fila ({pendingCount})</span>
            </button>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="mono-button-secondary px-3.5 py-2 text-xs font-semibold justify-center flex cursor-pointer"
          >
            {loading ? 'Atualizando...' : 'Recarregar'}
          </button>
        </div>
      </div>

      {/* Alerta Destacado de Denúncias da Turma */}
      {reportedCount > 0 && (
        <div className="mono-glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-rose-500/40 bg-rose-950/30 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
          <div className="flex items-start sm:items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                {reportedCount} foto(s) sinalizada(s) pela comunidade por suspeita
              </p>
              <p className="text-xs text-zinc-300 mt-0.5">
                Alunos relataram inconsistências nestas submissões. Elas aparecem priorizadas no topo da fila.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFilter('reported');
              setSwipeIndex(0);
            }}
            className="mono-button-primary px-4 py-2 text-xs font-semibold shrink-0 bg-rose-500 hover:bg-rose-400 text-white cursor-pointer"
          >
            Averiguar Denúncias Agora ({reportedCount})
          </button>
        </div>
      )}

      {/* Filtros em Abas */}
      <div className="flex items-center gap-2 relative z-10 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => {
            setFilter('all');
            setSwipeIndex(0);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-zinc-800 text-white font-bold border border-white/20'
              : 'bg-black/60 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          Todas ({submissions.length})
        </button>
        <button
          onClick={() => {
            setFilter('pending');
            setSwipeIndex(0);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-600 text-white font-bold border border-amber-400 shadow-md'
              : 'bg-black/60 border border-amber-500/30 text-amber-400 hover:text-amber-300'
          }`}
        >
          <span>⏳ Pendentes</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-900/80 text-amber-200 text-[10px] rounded-full font-mono font-bold">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setFilter('reported');
            setSwipeIndex(0);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'reported'
              ? 'bg-rose-600 text-white font-bold border border-rose-400 shadow-md'
              : 'bg-black/60 border border-rose-500/30 text-rose-400 hover:text-rose-300'
          }`}
        >
          <span>🚨 Denunciadas</span>
          {reportedCount > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-900/80 text-rose-200 text-[10px] rounded-full font-mono font-bold">
              {reportedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setFilter('approved');
            setSwipeIndex(0);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
            filter === 'approved'
              ? 'bg-zinc-800 text-white font-bold border border-white/20'
              : 'bg-black/60 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          Aprovadas
        </button>
        <button
          onClick={() => {
            setFilter('rejected');
            setSwipeIndex(0);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
            filter === 'rejected'
              ? 'bg-zinc-800 text-white font-bold border border-white/20'
              : 'bg-black/60 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          Invalidadas
        </button>
      </div>

      {/* Conteúdo Principal */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400 text-xs font-mono relative z-10">
          <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          CARREGANDO SUBMISSÕES E DENÚNCIAS...
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="mono-glass-card p-14 text-center text-xs font-mono text-zinc-400 relative z-10 space-y-2">
          <p className="text-white font-bold text-sm">Nenhuma submissão encontrada neste filtro.</p>
          <p className="text-zinc-500">Alterne entre as abas acima para auditar outras submissões.</p>
        </div>
      ) : viewMode === 'swipe' ? (
        /* ==================== MODO SWIPE (DECK TINDER) ==================== */
        <div className="relative z-10 max-w-md mx-auto w-full pt-2">
          {/* Instruções e Contador */}
          <div className="flex items-center justify-between mb-3 px-1 text-xs font-mono text-zinc-400">
            <span>
              Foto <strong className="text-white">{Math.min(swipeIndex + 1, filteredSubmissions.length)}</strong> de{' '}
              <strong className="text-white">{filteredSubmissions.length}</strong>
            </span>
            <div className="flex items-center gap-2">
              {swipeHistory.length > 0 && (
                <button
                  onClick={handleUndoLastSwipe}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Desfazer</span>
                </button>
              )}
              <span className="hidden sm:inline text-[10px] text-zinc-500">← Rejeitar | Aprovar →</span>
            </div>
          </div>

          {swipeIndex >= filteredSubmissions.length ? (
            /* Fim da Fila de Swipe */
            <SpotlightCard3D className="p-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-white">Todas as Fotos Deste Filtro Foram Auditadas!</h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Excelente trabalho! Você revisou todas as submissões desta seção.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setSwipeIndex(0)}
                  className="mono-button-secondary px-4 py-2 text-xs font-mono font-bold cursor-pointer"
                >
                  Rever do Início
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className="mono-button-primary px-4 py-2 text-xs font-mono font-bold cursor-pointer"
                >
                  Ver em Grade
                </button>
              </div>
            </SpotlightCard3D>
          ) : (
            /* Card Ativo no Deck de Swipe */
            <div className="space-y-4">
              {(() => {
                const sub = filteredSubmissions[swipeIndex];
                const isReported = sub.submission_reports && sub.submission_reports.length > 0;
                const isProcessing = processingId === sub.id;

                return (
                  <SpotlightCard3D
                    key={sub.id}
                    className={`p-4 flex flex-col justify-between transition-all relative ${
                      isReported ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : ''
                    }`}
                  >
                    {/* Alerta de Denúncia Flutuante */}
                    {isReported && (
                      <div className="mb-3 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-black text-xs text-white">
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                            🚨 DENÚNCIA PELA TURMA ({sub.submission_reports.length}x)
                          </span>
                          <span className="text-[10px] font-mono text-rose-300 uppercase px-2 py-0.5 rounded-full bg-rose-900/60">
                            Averiguar
                          </span>
                        </div>
                        <p className="text-xs text-rose-200">
                          Motivo: <strong>{sub.submission_reports[0]?.reason || 'Foto suspeita'}</strong>
                        </p>
                      </div>
                    )}

                    {/* Cabeçalho do Aluno */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white overflow-hidden">
                          {sub.students?.avatar_url ? (
                            <img src={sub.students.avatar_url} alt="aluno" className="w-full h-full object-cover" />
                          ) : (
                            sub.students?.full_name?.charAt(0) || 'A'
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {sub.students?.full_name}
                          </span>
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            {new Date(sub.client_captured_at || sub.submitted_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} • {new Date(sub.submitted_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-mono font-bold text-white block">
                          +{sub.missions?.points_rewarded || 10} PTS
                        </span>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                          sub.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : sub.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {sub.status === 'approved' ? 'Aprovada' : sub.status === 'rejected' ? 'Invalidada' : 'Pendente'}
                        </span>
                      </div>
                    </div>

                    {/* Foto da Submissão */}
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-3 border border-white/10">
                      <img
                        src={sub.photo_url}
                        alt="Submissão"
                        className="w-full h-full object-cover"
                      />
                      {sub.status === 'rejected' && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center font-bold text-xs text-rose-400">
                          Foto Invalidada
                        </div>
                      )}
                    </div>

                    {/* Dados da Missão & Localização */}
                    <div className="space-y-1.5 text-xs text-zinc-300">
                      <p className="text-white font-bold text-sm">{sub.missions?.title}</p>
                      {sub.location_name && (
                        <p className="text-zinc-400 text-[11px] flex items-center gap-1">
                          📍 Local: {sub.location_name}
                        </p>
                      )}
                      {sub.caption && (
                        <p className="text-zinc-300 italic text-xs bg-white/5 p-2 rounded-xl border border-white/5">
                          "{sub.caption}"
                        </p>
                      )}
                    </div>

                    {/* Botão de Disparo IA Gemini */}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => handleAnalyzeWithAI(sub)}
                        disabled={analyzingId === sub.id}
                        className="w-full py-2 px-3 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-white animate-pulse" />
                          <span>
                            {analyzingId === sub.id
                              ? 'Analisando foto com Gemini IA...'
                              : aiAnalysisMap[sub.id]
                              ? 'Parecer Técnico da IA'
                              : 'Analisar Calorias e Macros com IA'}
                          </span>
                        </div>
                        {aiAnalysisMap[sub.id] ? (
                          expandedAnalysis[sub.id] ? (
                            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                          )
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-mono">Gemini Vision</span>
                        )}
                      </button>

                      {/* Card de Análise da IA Expandido */}
                      {aiAnalysisMap[sub.id] && expandedAnalysis[sub.id] && (
                        <div className="mt-2 p-3 rounded-2xl bg-black/90 border border-white/15 text-xs space-y-2 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                            <div className="flex items-center gap-1.5 text-white font-semibold">
                              <Brain className="w-3.5 h-3.5 text-white" />
                              <span>Parecer da IA</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white">
                              Conformidade: {aiAnalysisMap[sub.id].complianceScore}%
                            </span>
                          </div>

                          <p className="text-zinc-200 text-xs leading-relaxed">
                            {aiAnalysisMap[sub.id].summary}
                          </p>

                          {/* Pílulas de Calorias e Macros */}
                          {aiAnalysisMap[sub.id].estimatedMacros && (
                            <div className="grid grid-cols-4 gap-1.5 pt-1">
                              <div className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-center">
                                <span className="text-[9px] text-zinc-400 block font-medium">Calorias</span>
                                <span className="text-white font-bold text-xs">
                                  {aiAnalysisMap[sub.id].estimatedMacros.calories?.replace('kcal', '').trim() || '-'}
                                </span>
                              </div>
                              <div className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-center">
                                <span className="text-[9px] text-zinc-400 block font-medium">Proteína</span>
                                <span className="text-white font-bold text-xs">
                                  {aiAnalysisMap[sub.id].estimatedMacros.protein || '-'}
                                </span>
                              </div>
                              <div className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-center">
                                <span className="text-[9px] text-zinc-400 block font-medium">Carbos</span>
                                <span className="text-white font-bold text-xs">
                                  {aiAnalysisMap[sub.id].estimatedMacros.carbs || '-'}
                                </span>
                              </div>
                              <div className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-center">
                                <span className="text-[9px] text-zinc-400 block font-medium">Gordura</span>
                                <span className="text-white font-bold text-xs">
                                  {aiAnalysisMap[sub.id].estimatedMacros.fats || '-'}
                                </span>
                              </div>
                            </div>
                          )}

                          {aiAnalysisMap[sub.id].feedback && (
                            <p className="text-zinc-400 italic text-xs pt-1 border-t border-white/[0.04]">
                              "{aiAnalysisMap[sub.id].feedback}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Controles de Ação de Swipe */}
                    <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                      <button
                        onClick={() => setInvalidateTarget(sub)}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-3 rounded-2xl bg-rose-600/15 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Atalho: Seta Esquerda (←)"
                      >
                        <X className="h-4 w-4 text-rose-400" />
                        <span>Invalidar (←)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleApprovePhoto(sub);
                          setSwipeIndex((prev) => prev + 1);
                        }}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
                        title="Atalho: Seta Direita (→)"
                      >
                        <Check className="h-4 w-4" />
                        <span>Aprovar (→)</span>
                      </button>
                    </div>
                  </SpotlightCard3D>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* ==================== MODO GRADE ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {filteredSubmissions.map((sub: any) => {
            const isRejected = sub.status === 'rejected';
            const isProcessing = processingId === sub.id;
            const isReported = sub.submission_reports && sub.submission_reports.length > 0;

            return (
              <SpotlightCard3D
                key={sub.id}
                className={`p-4 flex flex-col justify-between ${
                  isReported ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white overflow-hidden">
                        {sub.students?.avatar_url ? (
                          <img src={sub.students.avatar_url} alt="aluno" className="w-full h-full object-cover" />
                        ) : (
                          sub.students?.full_name?.charAt(0) || 'A'
                        )}
                      </div>
                      <span className="text-xs font-bold text-white truncate max-w-[140px]">
                        {sub.students?.full_name}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-400">
                      +{sub.missions?.points_rewarded || 10} PTS
                    </span>
                  </div>

                  {isReported && (
                    <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span>🚨 Denunciada pela turma ({sub.submission_reports.length})</span>
                      </span>
                      <span className="text-[10px] font-mono text-rose-200 truncate max-w-[120px]">
                        {sub.submission_reports[0]?.reason || 'Foto suspeita'}
                      </span>
                    </div>
                  )}

                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-3">
                    <img src={sub.photo_url} alt="Submissão" className="w-full h-full object-cover" />
                    {isRejected && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center font-bold text-xs text-zinc-300">
                        Foto Invalidada
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-zinc-400">
                    <p className="text-white font-bold text-sm font-sans">{sub.missions?.title}</p>
                    <p>
                      Horário:{' '}
                      {new Date(sub.client_captured_at || sub.submitted_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {sub.location_name && <p className="truncate">Local: {sub.location_name}</p>}
                    {sub.caption && <p className="text-zinc-300 font-sans italic mt-1">"{sub.caption}"</p>}
                  </div>

                  {/* Botão de Disparo IA Gemini */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleAnalyzeWithAI(sub)}
                      disabled={analyzingId === sub.id}
                      className="w-full py-1.5 px-2.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                        <span>
                          {analyzingId === sub.id
                            ? 'Analisando com IA...'
                            : aiAnalysisMap[sub.id]
                            ? 'Parecer Técnico da IA'
                            : 'Analisar com IA'}
                        </span>
                      </div>
                      {aiAnalysisMap[sub.id] ? (
                        expandedAnalysis[sub.id] ? (
                          <ChevronUp className="w-3 h-3 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-zinc-400" />
                        )
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-normal">Visão Computacional</span>
                      )}
                    </button>

                    {/* Card de Análise da IA Expandido */}
                    {aiAnalysisMap[sub.id] && expandedAnalysis[sub.id] && (
                      <div className="mt-2 p-2.5 rounded-xl bg-black/80 border border-white/10 text-xs space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
                          <div className="flex items-center gap-1.5 text-white font-semibold">
                            <Brain className="w-3.5 h-3.5 text-white" />
                            <span>Parecer da IA</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white">
                            Conformidade: {aiAnalysisMap[sub.id].complianceScore}%
                          </span>
                        </div>

                        <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                          {aiAnalysisMap[sub.id].summary}
                        </p>

                        {aiAnalysisMap[sub.id].estimatedMacros && (
                          <div className="grid grid-cols-4 gap-1.5 pt-1">
                            <div className="p-1 rounded-lg bg-zinc-900 border border-white/5 text-center">
                              <span className="text-[9px] text-zinc-400 block font-medium">Calorias</span>
                              <span className="text-white font-bold text-xs">
                                {aiAnalysisMap[sub.id].estimatedMacros.calories?.replace('kcal', '').trim() || '-'}
                              </span>
                            </div>
                            <div className="p-1 rounded-lg bg-zinc-900 border border-white/5 text-center">
                              <span className="text-[9px] text-zinc-400 block font-medium">Proteína</span>
                              <span className="text-white font-bold text-xs">
                                {aiAnalysisMap[sub.id].estimatedMacros.protein || '-'}
                              </span>
                            </div>
                            <div className="p-1 rounded-lg bg-zinc-900 border border-white/5 text-center">
                              <span className="text-[9px] text-zinc-400 block font-medium">Carbos</span>
                              <span className="text-white font-bold text-xs">
                                {aiAnalysisMap[sub.id].estimatedMacros.carbs || '-'}
                              </span>
                            </div>
                            <div className="p-1 rounded-lg bg-zinc-900 border border-white/5 text-center">
                              <span className="text-[9px] text-zinc-400 block font-medium">Gordura</span>
                              <span className="text-white font-bold text-xs">
                                {aiAnalysisMap[sub.id].estimatedMacros.fats || '-'}
                              </span>
                            </div>
                          </div>
                        )}

                        {aiAnalysisMap[sub.id].feedback && (
                          <p className="text-zinc-400 font-sans italic text-xs pt-1 border-t border-white/[0.04]">
                            "{aiAnalysisMap[sub.id].feedback}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/[0.06] flex gap-2">
                  {sub.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprovePhoto(sub)}
                        disabled={isProcessing}
                        className="mono-button-primary w-full py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isProcessing ? 'Aprovando...' : 'Aprovar'}</span>
                      </button>
                      <button
                        onClick={() => setInvalidateTarget(sub)}
                        disabled={isProcessing}
                        className="mono-button-secondary w-full py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 border-rose-500/30 cursor-pointer"
                      >
                        Recusar
                      </button>
                    </>
                  ) : isRejected ? (
                    <button
                      onClick={() => handleApprovePhoto(sub)}
                      disabled={isProcessing}
                      className="mono-button-primary w-full py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {isProcessing ? 'Processando...' : 'Reabilitar Foto'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setInvalidateTarget(sub)}
                      disabled={isProcessing}
                      className="mono-button-secondary w-full py-1.5 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {isProcessing ? 'Processando...' : 'Invalidar Foto (Deduzir Pontos)'}
                    </button>
                  )}
                </div>
              </SpotlightCard3D>
            );
          })}
        </div>
      )}

      {/* Toast Flutuante de Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-mono text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modal Customizado de Confirmação de Invalidação */}
      <CustomDialog
        isOpen={!!invalidateTarget}
        onClose={() => setInvalidateTarget(null)}
        title="Invalidar Submissão de Foto"
        description={`Deseja invalidar a foto de "${invalidateTarget?.students?.full_name}" na missão "${invalidateTarget?.missions?.title || 'Missão'}"? Isso deduzirá ${invalidateTarget?.missions?.points_rewarded || 10} pontos do ranking do aluno.`}
        confirmLabel={processingId ? 'Invalidando...' : 'Sim, Invalidar e Deduzir Pontos'}
        cancelLabel="Voltar"
        onConfirm={handleConfirmInvalidate}
        isLoading={!!processingId}
      />
    </div>
  );
}
