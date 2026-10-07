'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Sparkles, Brain, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FiscalizacaoPage() {
  const supabase = createClient();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'reported' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiAnalysisMap, setAiAnalysisMap] = useState<Record<string, any>>({});
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
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
          missions (
            id,
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
  }, []);

  const handleInvalidatePhoto = async (sub: any) => {
    const confirmAction = confirm(
      `Invalidar esta submissão de "${sub.students?.full_name}"?\nIsso deduzirá ${sub.missions?.points_rewarded || 10} pontos do ranking do aluno.`
    );
    if (!confirmAction) return;

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
    } catch (err: any) {
      alert('Erro ao invalidar foto: ' + err.message);
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
    } catch (err: any) {
      alert('Erro ao reabilitar foto: ' + err.message);
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

  const filteredSubmissions = submissions.filter((s) => {
    const hasReport = s.submission_reports && s.submission_reports.length > 0;
    if (filter === 'reported') return hasReport && s.status !== 'rejected';
    if (filter === 'rejected') return s.status === 'rejected';
    if (filter === 'approved') return s.status === 'approved';
    return true;
  });

  const reportedCount = submissions.filter(
    (s) => s.submission_reports && s.submission_reports.length > 0 && s.status !== 'rejected'
  ).length;

  return (
    <div className="space-y-6 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Header Monocromático */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
            AUDIT_KERNEL_INTERFACE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Auditoria & Fiscalização de Fotos</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Check-ins auditáveis com GPS e horário militar. Invalide apenas fotos em desacordo para dedução de pontos.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="mono-button-secondary w-full sm:w-auto px-4 py-2.5 text-xs font-mono justify-center flex"
          >
            {loading ? 'ATUALIZANDO...' : 'ATUALIZAR FILA'}
          </button>
        </div>
      </div>

      {/* Alerta de Denúncias da Turma */}
      {reportedCount > 0 && (
        <div className="mono-glass-card p-4 rounded-2xl flex items-center justify-between gap-3 relative z-10 border-white/20">
          <div>
            <p className="font-bold text-xs text-white font-mono uppercase">
              {reportedCount} FOTO(S) SINALIZADA(S) PELA TURMA
            </p>
            <p className="text-xs text-zinc-400">
              Colegas reportaram inconsistências nesta submissão. Avalie prioritariamente.
            </p>
          </div>
          <button
            onClick={() => setFilter('reported')}
            className="mono-button-primary px-3 py-1.5 text-xs font-mono shrink-0"
          >
            FILTRAR DENÚNCIAS
          </button>
        </div>
      )}

      {/* Filtros em Abas Monocromáticas */}
      <div className="flex items-center gap-2 relative z-10 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono shrink-0 transition-all ${
            filter === 'all'
              ? 'bg-zinc-800 text-white font-bold border border-white/20'
              : 'bg-black/60 border border-white/10 text-zinc-500 hover:text-white'
          }`}
        >
          TODAS ({submissions.length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono shrink-0 transition-all ${
            filter === 'approved'
              ? 'bg-zinc-800 text-white font-bold border border-white/20'
              : 'bg-black/60 border border-white/10 text-zinc-500 hover:text-white'
          }`}
        >
          APROVADAS
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono shrink-0 transition-all ${
            filter === 'rejected'
              ? 'bg-zinc-800 text-white font-bold border border-white/20'
              : 'bg-black/60 border border-white/10 text-zinc-500 hover:text-white'
          }`}
        >
          INVALIDADAS
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
          {filteredSubmissions.map((sub) => {
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

                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-3">
                    <img src={sub.photo_url} alt="Submissão" className="w-full h-full object-cover" />
                    {isRejected && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center font-mono font-bold text-xs text-zinc-400">
                        [ FOTO INVALIDADA ]
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 font-mono text-[10px] text-zinc-400">
                    <p className="text-white font-bold text-xs font-sans">{sub.missions?.title}</p>
                    {sub.duration_seconds ? (
                      <p className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md w-fit">
                        DURAÇÃO DO TREINO: {Math.floor(sub.duration_seconds / 60)} MIN {sub.duration_seconds % 60} SEG
                      </p>
                    ) : sub.caption && sub.caption.includes('[TEMPO:') ? (
                      <p className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md w-fit">
                        DURAÇÃO DO TREINO: {sub.caption.match(/\[TEMPO:\s*([^\]]+)\]/)?.[1] || 'REGISTRADO'}
                      </p>
                    ) : null}
                    <p>HORÁRIO: {new Date(sub.client_captured_at || sub.submitted_at).toLocaleTimeString('pt-BR')}</p>
                    {sub.location_name && <p className="truncate">GPS: {sub.location_name}</p>}
                    {sub.caption && <p className="text-zinc-300 font-sans italic mt-1">"{sub.caption}"</p>}
                  </div>

                  {/* Botão de Disparo IA Gemini */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleAnalyzeWithAI(sub)}
                      disabled={analyzingId === sub.id}
                      className="w-full py-1.5 px-2.5 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-[10px] flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                        <span>{analyzingId === sub.id ? 'ANALISANDO COM GEMINI...' : aiAnalysisMap[sub.id] ? 'PARECER TÉCNICO IA' : 'ANALISAR COM IA'}</span>
                      </div>
                      {aiAnalysisMap[sub.id] ? (
                        expandedAnalysis[sub.id] ? <ChevronUp className="w-3 h-3 text-zinc-400" /> : <ChevronDown className="w-3 h-3 text-zinc-400" />
                      ) : (
                        <span className="text-[9px] text-zinc-500">MULTIMODAL</span>
                      )}
                    </button>

                    {/* Card de Análise da IA Expandido */}
                    {aiAnalysisMap[sub.id] && expandedAnalysis[sub.id] && (
                      <div className="mt-2 p-2.5 rounded-xl bg-black/80 border border-white/10 font-mono text-[10px] space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
                          <div className="flex items-center gap-1.5 text-white font-bold">
                            <Brain className="w-3 h-3 text-white" />
                            <span>PARECER MULTIMODAL</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            aiAnalysisMap[sub.id].complianceScore >= 80
                              ? 'bg-white/10 text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            CONFORMIDADE: {aiAnalysisMap[sub.id].complianceScore}%
                          </span>
                        </div>

                        <p className="text-zinc-300 font-sans text-[11px] leading-tight">
                          {aiAnalysisMap[sub.id].summary}
                        </p>

                        {/* Pílulas de Macronutrientes (Nutrição / Refeição) */}
                        {aiAnalysisMap[sub.id].estimatedMacros && (
                          <div className="grid grid-cols-4 gap-1 pt-1">
                            <div className="p-1 rounded bg-zinc-900 border border-white/5 text-center">
                              <span className="text-[8px] text-zinc-500 block">KCAL</span>
                              <span className="text-white font-bold text-[9px]">
                                {aiAnalysisMap[sub.id].estimatedMacros.calories?.replace('kcal', '').trim() || '-'}
                              </span>
                            </div>
                            <div className="p-1 rounded bg-zinc-900 border border-white/5 text-center">
                              <span className="text-[8px] text-zinc-500 block">PROT</span>
                              <span className="text-white font-bold text-[9px]">
                                {aiAnalysisMap[sub.id].estimatedMacros.protein || '-'}
                              </span>
                            </div>
                            <div className="p-1 rounded bg-zinc-900 border border-white/5 text-center">
                              <span className="text-[8px] text-zinc-500 block">CARB</span>
                              <span className="text-white font-bold text-[9px]">
                                {aiAnalysisMap[sub.id].estimatedMacros.carbs || '-'}
                              </span>
                            </div>
                            <div className="p-1 rounded bg-zinc-900 border border-white/5 text-center">
                              <span className="text-[8px] text-zinc-500 block">GORD</span>
                              <span className="text-white font-bold text-[9px]">
                                {aiAnalysisMap[sub.id].estimatedMacros.fats || '-'}
                              </span>
                            </div>
                          </div>
                        )}

                        {aiAnalysisMap[sub.id].feedback && (
                          <p className="text-zinc-400 font-sans italic text-[10px] pt-1 border-t border-white/[0.04]">
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
                      className="mono-button-primary w-full py-1.5 text-xs font-mono"
                    >
                      {isProcessing ? 'PROCESSANDO...' : 'REABILITAR FOTO'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInvalidatePhoto(sub)}
                      disabled={isProcessing}
                      className="mono-button-secondary w-full py-1.5 text-xs font-mono text-zinc-400 hover:text-white"
                    >
                      {isProcessing ? 'PROCESSANDO...' : 'INVALIDAR FOTO (DEDUZIR PONTOS)'}
                    </button>
                  )}
                </div>
              </SpotlightCard3D>
            );
          })}
        </div>
      )}
    </div>
  );
}
