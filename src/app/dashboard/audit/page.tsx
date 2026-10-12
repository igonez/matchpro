'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Sparkles, Brain, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Filter } from 'lucide-react';

export default function FiscalizacaoPage() {
  const supabase = createClient();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('all');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'reported' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiAnalysisMap, setAiAnalysisMap] = useState<Record<string, any>>({});
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});

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

      // 2. Buscar submissões apenas pertencentes às turmas do treinador
      const { data: subsData } = await supabase
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
        .limit(60);

      setSubmissions(subsData || []);
    } catch (err) {
      console.error('Erro ao buscar fiscalização:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedChallengeId]);

  const handleConfirmInvalidate = async () => {
    if (!invalidateTarget) return;
    const sub = invalidateTarget;
    setProcessingId(sub.id);
    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ status: 'rejected' })
        .eq('id', sub.id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((item) => (item.id === sub.id ? { ...item, status: 'rejected' } : item))
      );
      showToast(`Foto de "${sub.students?.full_name}" invalidada.`);
      setInvalidateTarget(null);
    } catch (err: any) {
      showToast('Erro ao invalidar foto: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReactivatePhoto = async (sub: any) => {
    setProcessingId(sub.id);
    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ status: 'approved' })
        .eq('id', sub.id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((item) => (item.id === sub.id ? { ...item, status: 'approved' } : item))
      );
      showToast('Foto reabilitada com sucesso!');
    } catch (err: any) {
      showToast('Erro ao reabilitar foto: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAnalyzeWithAI = async (sub: any) => {
    if (aiAnalysisMap[sub.id]) {
      // Alterna visibilidade se já analisado
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
      if (data.analysis) {
        setAiAnalysisMap((prev) => ({ ...prev, [sub.id]: data.analysis }));
        setExpandedAnalysis((prev) => ({ ...prev, [sub.id]: true }));
      }
    } catch (err) {
      console.error('Erro na análise IA:', err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((s) => {
        const hasReport = s.submission_reports && s.submission_reports.length > 0;
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

  return (
    <div className="space-y-6 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Auditoria
            </span>
            <span className="text-xs text-zinc-400 font-medium">Revisão de check-ins</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Auditoria & Fiscalização de Fotos</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Check-ins auditáveis com foto, localização e horário. Invalide apenas fotos em desacordo para dedução de pontos.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
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

          <button
            onClick={fetchData}
            disabled={loading}
            className="mono-button-secondary w-full sm:w-auto px-4 py-2.5 text-xs font-semibold justify-center flex"
          >
            {loading ? 'Atualizando...' : 'Atualizar Lista'}
          </button>
        </div>
      </div>

      {/* Alerta de Denúncias da Turma */}
      {reportedCount > 0 && (
        <div className="mono-glass-card p-4 rounded-2xl flex items-center justify-between gap-3 relative z-10 border-rose-500/30 bg-rose-950/20">
          <div>
            <p className="font-bold text-xs text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              {reportedCount} foto(s) sinalizada(s) pela turma por suspeita
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Alunos denunciaram inconsistências nestas submissões. Avalie com prioridade no topo da lista.
            </p>
          </div>
          <button
            onClick={() => setFilter('reported')}
            className="mono-button-primary px-3 py-1.5 text-xs font-semibold shrink-0 bg-rose-500 hover:bg-rose-400 text-white"
          >
            Ver Denúncias Agora
          </button>
        </div>
      )}

      {/* Filtros em Abas */}
      <div className="flex items-center gap-2 relative z-10 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
            filter === 'all'
              ? 'bg-zinc-800 text-white font-bold border border-white/20'
              : 'bg-black/60 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          Todas ({submissions.length})
        </button>
        <button
          onClick={() => setFilter('reported')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
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
          onClick={() => setFilter('approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
            filter === 'approved'
              ? 'bg-zinc-800 text-white font-bold border border-white/20'
              : 'bg-black/60 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          Aprovadas
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
            filter === 'rejected'
              ? 'bg-zinc-800 text-white font-bold border border-white/20'
              : 'bg-black/60 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          Invalidadas
        </button>
      </div>

      {/* Grid de Submissões */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono relative z-10">
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          CARREGANDO SUBMISSÕES...
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="mono-glass-card p-12 text-center text-xs font-mono text-zinc-500 relative z-10">
          Nenhuma submissão encontrada neste filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {filteredSubmissions.map((sub: any) => {
            const isRejected = sub.status === 'rejected';
            const isProcessing = processingId === sub.id;

            return (
              <SpotlightCard3D key={sub.id} className="p-4 flex flex-col justify-between">
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

                  {sub.submission_reports && sub.submission_reports.length > 0 && (
                    <div className="mb-3 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-medium flex items-center justify-between">
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
                    {sub.duration_seconds ? (
                      <p className="text-white font-semibold bg-white/10 px-2 py-0.5 rounded-md w-fit text-[11px]">
                        Duração do treino: {Math.floor(sub.duration_seconds / 60)} min {sub.duration_seconds % 60} seg
                      </p>
                    ) : sub.caption && sub.caption.includes('[TEMPO:') ? (
                      <p className="text-white font-semibold bg-white/10 px-2 py-0.5 rounded-md w-fit text-[11px]">
                        Duração do treino: {sub.caption.match(/\[TEMPO:\s*([^\]]+)\]/)?.[1] || 'Registrado'}
                      </p>
                    ) : null}
                    <p>Horário: {new Date(sub.client_captured_at || sub.submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    {sub.location_name && <p className="truncate">Local: {sub.location_name}</p>}
                    {sub.caption && <p className="text-zinc-300 font-sans italic mt-1">"{sub.caption}"</p>}
                  </div>

                  {/* Botão de Disparo IA Gemini */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleAnalyzeWithAI(sub)}
                      disabled={analyzingId === sub.id}
                      className="w-full py-1.5 px-2.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                        <span>{analyzingId === sub.id ? 'Analisando com IA...' : aiAnalysisMap[sub.id] ? 'Parecer Técnico da IA' : 'Analisar com IA'}</span>
                      </div>
                      {aiAnalysisMap[sub.id] ? (
                        expandedAnalysis[sub.id] ? <ChevronUp className="w-3 h-3 text-zinc-400" /> : <ChevronDown className="w-3 h-3 text-zinc-400" />
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
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            aiAnalysisMap[sub.id].complianceScore >= 80
                              ? 'bg-white/10 text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            Conformidade: {aiAnalysisMap[sub.id].complianceScore}%
                          </span>
                        </div>

                        <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                          {aiAnalysisMap[sub.id].summary}
                        </p>

                        {/* Pílulas de Macronutrientes (Nutrição / Refeição) */}
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
                  {isRejected ? (
                    <button
                      onClick={() => handleReactivatePhoto(sub)}
                      disabled={isProcessing}
                      className="mono-button-primary w-full py-1.5 text-xs font-semibold"
                    >
                      {isProcessing ? 'Processando...' : 'Reabilitar Foto'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setInvalidateTarget(sub)}
                      disabled={isProcessing}
                      className="mono-button-secondary w-full py-1.5 text-xs font-semibold text-zinc-400 hover:text-white"
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
