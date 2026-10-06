'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  X, 
  Check, 
  Flag, 
  Eye, 
  Clock, 
  User, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function FiscalizacaoPage() {
  const supabase = createClient();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'reported' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Buscar todas as submissões recentes
      const { data: subsData } = await supabase
        .from('student_submissions')
        .select(`
          id,
          photo_url,
          caption,
          status,
          submitted_at,
          student_id,
          students (
            full_name,
            avatar_url
          ),
          missions (
            id,
            title,
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

  // INVALIDAR / DEDUZIR PONTOS DA FOTO (Rejeitar)
  const handleInvalidatePhoto = async (sub: any) => {
    const confirmAction = confirm(
      `Deseja invalidar esta foto de "${sub.students?.full_name}"?\nIsso vai remover automaticamente ${sub.missions?.points_rewarded || 10} pontos do Leaderboard dele!`
    );
    if (!confirmAction) return;

    setProcessingId(sub.id);
    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ status: 'rejected' })
        .eq('id', sub.id);

      if (error) throw error;

      // Atualiza localmente
      setSubmissions((prev) =>
        prev.map((item) => (item.id === sub.id ? { ...item, status: 'rejected' } : item))
      );
      alert(`Foto desclassificada! -${sub.missions?.points_rewarded || 10} pontos deduzidos do aluno.`);
    } catch (err: any) {
      alert('Erro ao invalidar foto: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // REABILITAR FOTO (Voltar para Aprovada)
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

  // Filtragem
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Fiscalização & Auditoria Amostral <ShieldAlert className="h-6 w-6 text-emerald-400" />
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            As fotos são auto-aprovadas instantaneamente. Invalide apenas fotos falsas para deduzir pontos automaticamente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Banner de Denúncias da Comunidade se houver */}
      {reportedCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <p className="font-black text-sm text-amber-300">
                {reportedCount} foto(s) sinalizada(s) pelos próprios colegas da turma!
              </p>
              <p className="text-xs text-zinc-300">
                Alunos da turma denunciaram fotos suspeitas. Dê uma olhada para manter a integridade do desafio.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setFilter('reported')}
            className="h-9 px-3 text-xs font-black bg-amber-500 hover:bg-amber-400 text-black shrink-0"
          >
            Ver Denúncias
          </Button>
        </div>
      )}

      {/* Filtros em Abas */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-zinc-800 text-white'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Todas Recentes ({submissions.length})
        </button>

        <button
          onClick={() => setFilter('reported')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filter === 'reported'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300'
          }`}
        >
          <Flag className="h-3 w-3" /> Sinalizadas pela Turma ({reportedCount})
        </button>

        <button
          onClick={() => setFilter('rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'rejected'
              ? 'bg-rose-600 text-white'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Desclassificadas ({submissions.filter((s) => s.status === 'rejected').length})
        </button>
      </div>

      {/* Grade de Fotos (Galeria Amostral Rápida) */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
          <div className="h-7 w-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Carregando registros...
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <Card className="border-dashed border-zinc-800 p-12 text-center bg-zinc-900/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">Tudo limpo e em conformidade!</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
            Nenhuma foto necessita de intervenção neste filtro. A turma está pontuando normalmente.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSubmissions.map((sub) => {
            const hasReport = sub.submission_reports && sub.submission_reports.length > 0;
            const isRejected = sub.status === 'rejected';

            return (
              <Card
                key={sub.id}
                className={`border overflow-hidden rounded-2xl bg-zinc-900/60 transition-all ${
                  hasReport && !isRejected
                    ? 'border-amber-500/50 ring-1 ring-amber-500/30'
                    : isRejected
                    ? 'border-rose-500/40 opacity-60'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Imagem do Aluno */}
                <div className="relative aspect-square w-full bg-black overflow-hidden group">
                  <img
                    src={sub.photo_url}
                    alt="Comprovante"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />

                  {/* Badge de Denúncia */}
                  {hasReport && !isRejected && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                      <Flag className="h-3 w-3 fill-current" /> Denunciada ({sub.submission_reports.length})
                    </div>
                  )}

                  {/* Badge de Status */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={isRejected ? 'destructive' : 'success'}
                      className="text-[10px] font-black"
                    >
                      {isRejected ? 'Desclassificada (-pts)' : `+${sub.missions?.points_rewarded || 10} pts`}
                    </Badge>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md p-2 rounded-xl text-[11px] text-zinc-300">
                    <p className="font-extrabold text-white truncate">{sub.missions?.title}</p>
                    {sub.caption && <p className="text-[10px] text-zinc-400 italic line-clamp-1">"{sub.caption}"</p>}
                  </div>
                </div>

                {/* Footer do Card com Ação */}
                <div className="p-3 bg-zinc-950 flex items-center justify-between gap-2 border-t border-zinc-850">
                  <div className="truncate">
                    <p className="font-bold text-xs text-white truncate">{sub.students?.full_name || 'Aluno'}</p>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(sub.submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div>
                    {isRejected ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReactivatePhoto(sub)}
                        disabled={processingId === sub.id}
                        className="h-8 px-2 text-[10px] text-emerald-400 border-emerald-500/30"
                      >
                        Reativar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleInvalidatePhoto(sub)}
                        disabled={processingId === sub.id}
                        className="h-8 px-2.5 text-xs font-bold rounded-xl"
                        title="Desclassificar foto e deduzir pontos"
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Invalidar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
