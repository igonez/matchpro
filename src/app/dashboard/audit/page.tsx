'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { CustomDialog } from '@/components/ui/custom-dialog';

export default function FiscalizacaoPage() {
  const supabase = createClient();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('all');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reported' | 'approved' | 'rejected'>('pending');
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

  const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word, idx) => {
        const lowerConjunctions = ['de', 'da', 'do', 'das', 'dos', 'em', 'e', 'a', '&', '•'];
        if (idx > 0 && lowerConjunctions.includes(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
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
        .select('id, title, is_active, start_date')
        .eq('professional_id', user.id)
        .order('is_active', { ascending: false })
        .order('start_date', { ascending: false });

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

      // Fallback defensivo
      if (subsError) {
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

      // Carregamento resiliente das denúncias de fotos
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

  // Lista filtrada e ordenada (Denunciadas e Pendentes no topo)
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((s) => {
        const hasReport = s.submission_reports && s.submission_reports.length > 0;
        if (filter === 'pending') return s.status === 'pending';
        if (filter === 'reported') return hasReport;
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
      (s) => s.submission_reports && s.submission_reports.length > 0
    ).length;
  }, [submissions]);

  const pendingCount = useMemo(() => {
    return submissions.filter((s) => s.status === 'pending').length;
  }, [submissions]);

  const handleApprovePhoto = async (sub: any) => {
    setProcessingId(sub.id);
    const prevStatus = sub.status;
    try {
      const res = await fetch('/api/audit/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: sub.id,
          status: 'approved',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao aprovar no servidor.');
      }

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === sub.id ? { ...item, status: 'approved', submission_reports: [] } : item
        )
      );
      setSwipeHistory((prev) => [...prev, { id: sub.id, prevStatus }]);
      showToast(`Submissão de ${sub.students?.full_name} aprovada.`);
    } catch (err: any) {
      showToast('Erro ao aprovar: ' + err.message);
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
      const res = await fetch('/api/audit/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: sub.id,
          status: 'rejected',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao invalidar no servidor.');
      }

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === sub.id ? { ...item, status: 'rejected', submission_reports: [] } : item
        )
      );
      setSwipeHistory((prev) => [...prev, { id: sub.id, prevStatus }]);
      showToast(`Submissão de ${sub.students?.full_name} invalidada.`);
      setInvalidateTarget(null);
    } catch (err: any) {
      showToast('Erro ao invalidar: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUndoLastSwipe = async () => {
    if (swipeHistory.length === 0) return;
    const lastAction = swipeHistory[swipeHistory.length - 1];
    setProcessingId(lastAction.id);
    try {
      const res = await fetch('/api/audit/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: lastAction.id,
          status: lastAction.prevStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao desfazer no servidor.');
      }

      setSubmissions((prev) =>
        prev.map((item) => (item.id === lastAction.id ? { ...item, status: lastAction.prevStatus } : item))
      );
      setSwipeHistory((prev) => prev.slice(0, -1));
      setSwipeIndex((prev) => Math.max(0, prev - 1));
      showToast('Decisão anterior desfeita.');
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
      showToast('Nenhuma submissão pendente.');
      return;
    }

    setBatchApproving(true);
    try {
      const res = await fetch('/api/audit/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionIds: pendingIds,
          status: 'approved',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao aprovar em lote no servidor.');
      }

      setSubmissions((prev) =>
        prev.map((s) =>
          pendingIds.includes(s.id) ? { ...s, status: 'approved', submission_reports: [] } : s
        )
      );
      showToast(`${pendingIds.length} submissões aprovadas em lote.`);
    } catch (err: any) {
      showToast('Erro ao aprovar em lote: ' + err.message);
    } finally {
      setBatchApproving(false);
    }
  };

  // Teclado
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
    <div className="space-y-8 relative pb-24 max-w-6xl mx-auto">
      <Monochrome3DBackground />

      {/* Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10 pt-2 border-b border-[#252D3B] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-[#75A7FF] bg-[#3478F6]/15 px-2.5 py-0.5 rounded-full border border-[#3478F6]/30">
              Auditoria & IA
            </span>
            <span className="text-xs text-[#A7B0C0] font-medium">Fiscalização de Check-ins</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F4F6FA] tracking-tight">
            Fiscalização de Check-ins
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B0C0] max-w-xl leading-relaxed">
            Aferição de registros fotográficos, verificação técnica por IA e validação de pontuação de atletas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          {challenges.length > 0 && (
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-11 w-full sm:w-auto sm:max-w-xs rounded-2xl bg-[#121722] border border-[#252D3B] text-[#F4F6FA] text-xs sm:text-sm font-semibold px-3.5 focus:outline-none focus:border-[#3478F6] truncate cursor-pointer shadow-sm transition-all"
            >
              <option value="all">Todas as Turmas ({challenges.length})</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {toTitleCase(c.title)}
                </option>
              ))}
            </select>
          )}

          {/* Segmented Control Limpo (Swipe vs Grade) */}
          <div className="flex items-center p-1 rounded-2xl bg-[#121722] border border-[#252D3B]">
            <button
              onClick={() => setViewMode('swipe')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                viewMode === 'swipe'
                  ? 'bg-[#3478F6] text-white font-black shadow-md'
                  : 'text-[#A7B0C0] hover:text-[#F4F6FA] font-medium'
              }`}
            >
              SWIPE
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#3478F6] text-white font-black shadow-md'
                  : 'text-[#A7B0C0] hover:text-[#F4F6FA] font-medium'
              }`}
            >
              GRADE
            </button>
          </div>

          {pendingCount > 0 && (
            <button
              onClick={handleBatchApprovePending}
              disabled={batchApproving || loading}
              className="px-4 py-2 text-xs font-mono tracking-wider bg-[#3478F6] text-white hover:bg-[#75A7FF] font-black rounded-2xl transition-all shadow-md shadow-[#3478F6]/20 cursor-pointer"
            >
              {batchApproving ? 'PROCESSANDO...' : `APROVAR FILA (${pendingCount})`}
            </button>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-mono text-[#A7B0C0] hover:text-[#F4F6FA] border border-[#252D3B] bg-[#121722] rounded-2xl transition-colors cursor-pointer"
          >
            {loading ? 'ATUALIZANDO...' : 'RECARREGAR'}
          </button>
        </div>
      </div>

      {/* Alerta Tipográfico de Sinalizações */}
      {reportedCount > 0 && (
        <div className="p-4 rounded-2xl bg-[#121722] border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase font-bold">
                SINALIZAÇÃO PELA COMUNIDADE ({reportedCount})
              </span>
            </div>
            <p className="text-xs text-[#A7B0C0]">
              Registros sinalizados por outros participantes aguardam sua conferência.
            </p>
          </div>
          <button
            onClick={() => {
              setFilter('reported');
              setSwipeIndex(0);
            }}
            className="px-4 py-2 text-xs font-mono tracking-wider bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 font-bold rounded-2xl transition-colors shrink-0 cursor-pointer"
          >
            FILTRAR SINALIZADAS
          </button>
        </div>
      )}

      {/* Abas de Filtro Tipográficas */}
      <div className="flex items-center gap-1.5 border-b border-[#252D3B] pb-3 relative z-10 overflow-x-auto no-scrollbar font-mono">
        {[
          { key: 'all', label: 'TODAS', count: submissions.length },
          { key: 'pending', label: 'PENDENTES', count: pendingCount },
          { key: 'reported', label: 'SINALIZADAS', count: reportedCount },
          { key: 'approved', label: 'APROVADAS' },
          { key: 'rejected', label: 'INVALIDADAS' },
        ].map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setFilter(tab.key as any);
                setSwipeIndex(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                active
                  ? 'bg-[#3478F6] text-white font-black shadow-md'
                  : 'text-[#A7B0C0] hover:text-[#F4F6FA]'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`ml-2 text-[10px] ${active ? 'text-white/80' : 'text-[#A7B0C0]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo Principal */}
      {loading ? (
        <div className="py-28 text-center text-xs font-mono text-[#A7B0C0] tracking-widest uppercase relative z-10">
          SINCRONIZANDO REGISTROS DE AUDITORIA...
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="p-16 rounded-3xl border border-[#252D3B] bg-[#121722] text-center space-y-2 relative z-10">
          <p className="text-sm font-bold text-[#F4F6FA]">Nenhum registro encontrado neste filtro.</p>
          <p className="text-xs text-[#A7B0C0] font-mono">Alterne entre as opções acima para auditar outros status.</p>
        </div>
      ) : viewMode === 'swipe' ? (
        /* ==================== MODO SWIPE (MINIMALISTA) ==================== */
        <div className="relative z-10 max-w-lg mx-auto w-full pt-2">
          {/* Telemetria do Deck */}
          <div className="flex items-center justify-between mb-4 px-1 text-xs font-mono text-[#A7B0C0]">
            <span>
              REGISTRO <strong className="text-[#F4F6FA]">{Math.min(swipeIndex + 1, filteredSubmissions.length)}</strong> DE{' '}
              <strong className="text-[#F4F6FA]">{filteredSubmissions.length}</strong>
            </span>
            <div className="flex items-center gap-3">
              {swipeHistory.length > 0 && (
                <button
                  onClick={handleUndoLastSwipe}
                  className="text-[11px] font-mono text-[#A7B0C0] hover:text-[#F4F6FA] transition-colors cursor-pointer"
                >
                  DESFAZER ANTERIOR
                </button>
              )}
              <span className="hidden sm:inline text-[10px] text-[#A7B0C0] tracking-wider">
                [ ← INVALIDAR / APROVAR → ]
              </span>
            </div>
          </div>

          {swipeIndex >= filteredSubmissions.length ? (
            <div 
              data-tour="audit-swipe-container"
              className="p-12 rounded-3xl border border-[#252D3B] bg-[#121722] text-center space-y-4"
            >
              <span className="text-[10px] font-mono tracking-widest text-[#75A7FF] uppercase block">
                AUDITORIA CONCLUÍDA
              </span>
              <h2 className="text-xl font-black text-[#F4F6FA]">Todos os registros deste filtro foram revisados.</h2>
              <p className="text-xs text-[#A7B0C0] max-w-xs mx-auto">
                A fila está limpa. Você pode reiniciar a visualização ou retornar ao modo grade.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setSwipeIndex(0)}
                  className="px-4 py-2.5 rounded-xl bg-[#1B2330] border border-[#252D3B] text-xs font-mono font-bold text-[#F4F6FA] hover:bg-[#252D3B] cursor-pointer"
                >
                  REVER DO INÍCIO
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className="px-4 py-2.5 rounded-xl bg-[#3478F6] hover:bg-[#75A7FF] text-white text-xs font-mono font-black shadow-[0_8px_20px_rgba(52,120,246,0.28)] cursor-pointer"
                >
                  VER EM GRADE
                </button>
              </div>
            </div>
          ) : (
            (() => {
              const sub = filteredSubmissions[swipeIndex];
              const isReported = sub.submission_reports && sub.submission_reports.length > 0;
              const isProcessing = processingId === sub.id;

              return (
                <div
                  key={sub.id}
                  data-tour="audit-swipe-container"
                  className={`p-5 rounded-3xl bg-[#121722] border transition-all ${
                    isReported ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.1)]' : 'border-[#252D3B]'
                  }`}
                >
                  {/* Tarja de Denúncia */}
                  {isReported && (
                    <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-rose-400 uppercase">
                          SINALIZAÇÃO PELA COMUNIDADE ({sub.submission_reports.length})
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-200">
                          PRIORIDADE
                        </span>
                      </div>
                      <p className="text-xs text-rose-200 font-sans">
                        Motivo apontado: <strong>{sub.submission_reports[0]?.reason || 'Suspeita de imagem inadequada'}</strong>
                      </p>
                    </div>
                  )}

                  {/* Header do Aluno */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#252D3B] mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#A7B0C0] uppercase tracking-wider block">
                        ATLETA
                      </span>
                      <span className="text-sm font-bold text-[#F4F6FA] block mt-0.5">
                        {sub.students?.full_name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-[#75A7FF] block">
                        +{sub.missions?.points_rewarded || 10} PTS
                      </span>
                      <span className="text-[10px] font-mono text-[#A7B0C0] block uppercase">
                        {new Date(sub.client_captured_at || sub.submitted_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} • {new Date(sub.submitted_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Foto com proporção cinematográfica limpa */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#080A0F] mb-4 border border-[#252D3B]">
                    <img
                      src={sub.photo_url}
                      alt="Registro do atleta"
                      className="w-full h-full object-cover"
                    />
                    {sub.status === 'rejected' && (
                      <div className="absolute inset-0 bg-[#080A0F]/80 flex items-center justify-center text-xs font-mono tracking-widest text-rose-400 uppercase">
                        REGISTRO INVALIDADO
                      </div>
                    )}
                  </div>

                  {/* Detalhes da Missão e Local */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-[#A7B0C0] tracking-wider uppercase block">
                        MISSÃO
                      </span>
                      <p className="text-[#F4F6FA] font-bold text-sm mt-0.5">{sub.missions?.title}</p>
                    </div>

                    {sub.location_name && (
                      <p className="text-[11px] font-mono text-[#A7B0C0]">
                        LOCAL: {sub.location_name}
                      </p>
                    )}

                    {sub.caption && (
                      <div className="p-3 rounded-xl bg-[#1B2330] border border-[#252D3B] text-[#F4F6FA] italic text-xs leading-relaxed">
                        "{sub.caption}"
                      </div>
                    )}
                  </div>

                  {/* Botão de Disparo IA Gemini */}
                  <div className="mt-4 pt-4 border-t border-[#252D3B]">
                    <button
                      type="button"
                      onClick={() => handleAnalyzeWithAI(sub)}
                      disabled={analyzingId === sub.id}
                      className="w-full py-2.5 px-3 rounded-xl border border-[#252D3B] bg-[#1B2330] hover:bg-[#252D3B] text-[#F4F6FA] text-xs font-mono tracking-wider flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>
                        {analyzingId === sub.id
                          ? 'PROCESSANDO VISÃO COMPUTACIONAL...'
                          : aiAnalysisMap[sub.id]
                          ? 'PARECER TÉCNICO IA'
                          : 'ANALISAR NUTRIÇÃO & CONFORMIDADE (IA)'}
                      </span>
                      <span className="text-[10px] text-[#75A7FF]">
                        {aiAnalysisMap[sub.id] ? (expandedAnalysis[sub.id] ? 'FECHAR' : 'EXPANDIR') : 'GEMINI'}
                      </span>
                    </button>

                    {/* Parecer IA Expandido */}
                    {aiAnalysisMap[sub.id] && expandedAnalysis[sub.id] && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-[#1B2330] border border-[#252D3B] text-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-[#252D3B] pb-2">
                          <span className="text-[10px] font-mono text-[#A7B0C0] tracking-wider uppercase">
                            DIAGNÓSTICO
                          </span>
                          <span className="text-[10px] font-mono text-[#75A7FF] font-bold">
                            CONFORMIDADE: {aiAnalysisMap[sub.id].complianceScore}%
                          </span>
                        </div>

                        <p className="text-[#F4F6FA] leading-relaxed text-xs">
                          {aiAnalysisMap[sub.id].summary}
                        </p>

                        {/* Métricas Nutricionais Tipográficas */}
                        {aiAnalysisMap[sub.id].estimatedMacros && (
                          <div className="grid grid-cols-4 gap-2 pt-1 border-t border-[#252D3B]">
                            <div className="text-center p-2 rounded-lg bg-[#121722] border border-[#252D3B]">
                              <span className="text-[8px] font-mono text-[#A7B0C0] uppercase block">CALORIAS</span>
                              <span className="text-[#F4F6FA] font-mono font-bold text-xs mt-0.5 block">
                                {aiAnalysisMap[sub.id].estimatedMacros.calories?.replace('kcal', '').trim() || '-'}
                              </span>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-[#121722] border border-[#252D3B]">
                              <span className="text-[8px] font-mono text-[#A7B0C0] uppercase block">PROTEÍNA</span>
                              <span className="text-[#F4F6FA] font-mono font-bold text-xs mt-0.5 block">
                                {aiAnalysisMap[sub.id].estimatedMacros.protein || '-'}
                              </span>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-[#121722] border border-[#252D3B]">
                              <span className="text-[8px] font-mono text-[#A7B0C0] uppercase block">CARBOS</span>
                              <span className="text-[#F4F6FA] font-mono font-bold text-xs mt-0.5 block">
                                {aiAnalysisMap[sub.id].estimatedMacros.carbs || '-'}
                              </span>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-[#121722] border border-[#252D3B]">
                              <span className="text-[8px] font-mono text-[#A7B0C0] uppercase block">GORDURAS</span>
                              <span className="text-[#F4F6FA] font-mono font-bold text-xs mt-0.5 block">
                                {aiAnalysisMap[sub.id].estimatedMacros.fats || '-'}
                              </span>
                            </div>
                          </div>
                        )}

                        {aiAnalysisMap[sub.id].feedback && (
                          <p className="text-[#A7B0C0] text-[11px] italic pt-1">
                            "{aiAnalysisMap[sub.id].feedback}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ações de Decisão de Swipe */}
                  <div className="pt-5 mt-5 border-t border-[#252D3B] grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setInvalidateTarget(sub)}
                      disabled={isProcessing}
                      className="py-3.5 px-4 rounded-2xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 font-mono text-xs tracking-wider font-bold transition-all cursor-pointer"
                    >
                      INVALIDAR (←)
                    </button>

                    <button
                      onClick={() => {
                        handleApprovePhoto(sub);
                        setSwipeIndex((prev) => prev + 1);
                      }}
                      disabled={isProcessing}
                      className="py-3.5 px-4 rounded-2xl bg-[#3478F6] text-white hover:bg-[#75A7FF] font-mono text-xs tracking-wider font-black transition-all shadow-lg shadow-[#3478F6]/20 cursor-pointer"
                    >
                      APROVAR (→)
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      ) : (
        /* ==================== MODO GRADE (MINIMALISTA) ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {filteredSubmissions.map((sub: any) => {
            const isRejected = sub.status === 'rejected';
            const isProcessing = processingId === sub.id;
            const isReported = sub.submission_reports && sub.submission_reports.length > 0;

            return (
              <div
                key={sub.id}
                className={`p-5 rounded-3xl bg-[#121722] border flex flex-col justify-between ${
                  isReported ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-[#252D3B]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#252D3B] mb-3">
                    <div>
                      <span className="text-[9px] font-mono text-[#A7B0C0] uppercase tracking-wider block">
                        ATLETA
                      </span>
                      <span className="text-xs font-bold text-[#F4F6FA] block mt-0.5 truncate max-w-[150px]">
                        {sub.students?.full_name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono font-black text-[#75A7FF] block">
                        +{sub.missions?.points_rewarded || 10} PTS
                      </span>
                      <span className="text-[9px] font-mono text-[#A7B0C0] block uppercase">
                        {new Date(sub.client_captured_at || sub.submitted_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {isReported && (
                    <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] space-y-0.5">
                      <span className="text-[9px] font-mono tracking-wider font-bold text-rose-400 uppercase block">
                        SINALIZADA PELA COMUNIDADE ({sub.submission_reports.length})
                      </span>
                      <p className="truncate text-[#A7B0C0]">
                        {sub.submission_reports[0]?.reason || 'Foto suspeita'}
                      </p>
                    </div>
                  )}

                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-3 border border-[#252D3B]">
                    <img src={sub.photo_url} alt="Submissão" className="w-full h-full object-cover" />
                    {isRejected && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center font-mono text-[10px] tracking-widest text-rose-400 uppercase">
                        INVALIDADA
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-[#A7B0C0]">
                    <p className="text-[#F4F6FA] font-bold text-sm">{sub.missions?.title}</p>
                    {sub.location_name && (
                      <p className="text-[10px] font-mono text-[#A7B0C0]">LOCAL: {sub.location_name}</p>
                    )}
                    {sub.caption && (
                      <p className="text-[#F4F6FA] italic text-[11px] p-2 bg-[#1B2330] border border-[#252D3B] rounded-xl">
                        "{sub.caption}"
                      </p>
                    )}
                  </div>

                  {/* Disparo IA */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleAnalyzeWithAI(sub)}
                      disabled={analyzingId === sub.id}
                      className="w-full py-2 px-3 rounded-xl border border-[#252D3B] bg-[#1B2330] hover:bg-[#252D3B] text-[#F4F6FA] text-[11px] font-mono tracking-wider flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>
                        {analyzingId === sub.id
                          ? 'ANALISANDO...'
                          : aiAnalysisMap[sub.id]
                          ? 'PARECER TÉCNICO'
                          : 'ANALISAR IA'}
                      </span>
                      <span className="text-[9px] text-[#3478F6] font-mono font-bold">GEMINI</span>
                    </button>

                    {aiAnalysisMap[sub.id] && expandedAnalysis[sub.id] && (
                      <div className="mt-2 p-3 rounded-2xl bg-[#080A0F] border border-[#252D3B] text-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-[#252D3B] pb-1.5">
                          <span className="text-[9px] font-mono text-[#A7B0C0] uppercase">CONFORMIDADE</span>
                          <span className="text-[10px] font-mono text-[#75A7FF] font-bold">
                            {aiAnalysisMap[sub.id].complianceScore}%
                          </span>
                        </div>
                        <p className="text-[#A7B0C0] text-xs leading-relaxed">
                          {aiAnalysisMap[sub.id].summary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#252D3B] flex gap-2">
                  {sub.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprovePhoto(sub)}
                        disabled={isProcessing}
                        className="w-full py-2 text-xs font-mono font-black tracking-wider bg-[#3478F6] text-white hover:bg-[#75A7FF] rounded-xl transition-all shadow-md shadow-[#3478F6]/20 cursor-pointer"
                      >
                        {isProcessing ? '...' : 'APROVAR'}
                      </button>
                      <button
                        onClick={() => setInvalidateTarget(sub)}
                        disabled={isProcessing}
                        className="w-full py-2 text-xs font-mono font-bold tracking-wider text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-xl transition-colors cursor-pointer"
                      >
                        RECUSAR
                      </button>
                    </>
                  ) : isRejected ? (
                    <button
                      onClick={() => handleApprovePhoto(sub)}
                      disabled={isProcessing}
                      className="w-full py-2 text-xs font-mono font-bold tracking-wider text-[#A7B0C0] hover:text-[#F4F6FA] border border-[#252D3B] rounded-xl transition-colors cursor-pointer"
                    >
                      {isProcessing ? '...' : 'REABILITAR FOTO'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setInvalidateTarget(sub)}
                      disabled={isProcessing}
                      className="w-full py-2 text-xs font-mono font-medium tracking-wider text-[#A7B0C0] hover:text-rose-400 border border-[#252D3B] rounded-xl transition-colors cursor-pointer"
                    >
                      {isProcessing ? '...' : 'INVALIDAR'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast Flutuante Limpo */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50">
          <div className="px-4 py-2.5 rounded-xl border border-white/15 bg-black/95 text-xs font-mono text-white shadow-2xl">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Modal Customizado de Invalidação */}
      <CustomDialog
        isOpen={!!invalidateTarget}
        onClose={() => setInvalidateTarget(null)}
        title="Invalidar Registro de Foto"
        description={`Confirmar a invalidação da foto de "${invalidateTarget?.students?.full_name}" na missão "${invalidateTarget?.missions?.title || 'Missão'}"? ${invalidateTarget?.missions?.points_rewarded || 10} pontos serão deduzidos do ranking do atleta.`}
        confirmLabel={processingId ? 'INVALIDANDO...' : 'CONFIRMAR INVALIDAÇÃO'}
        cancelLabel="VOLTAR"
        onConfirm={handleConfirmInvalidate}
        isLoading={!!processingId}
      />
    </div>
  );
}
