'use client';

import React, { useEffect, useState } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  User, 
  Award, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function AuditSwipePage() {
  const supabase = createClient();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Carregar submissões com status 'pending'
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_submissions')
        .select(`
          id,
          photo_url,
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
            points_rewarded,
            challenge_id
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Erro ao carregar auditoria:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Aprovar foto -> Dispara o trigger PostgreSQL para somar os pontos
  const handleApprove = async () => {
    if (submissions.length === 0) return;
    const current = submissions[0];
    setProcessingId(current.id);

    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ status: 'approved' })
        .eq('id', current.id);

      if (error) throw error;

      // Efeito de confete ao aprovar
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });

      setFeedback({ text: `Aprovado! +${current.missions?.points_rewarded} pontos creditados`, type: 'success' });
      setSubmissions((prev) => prev.slice(1));
    } catch (err: any) {
      console.error('Erro ao aprovar:', err);
      alert('Erro ao aprovar submissão: ' + err.message);
    } finally {
      setProcessingId(null);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  // Rejeitar foto
  const handleReject = async () => {
    if (submissions.length === 0) return;
    const current = submissions[0];
    setProcessingId(current.id);

    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({ status: 'rejected' })
        .eq('id', current.id);

      if (error) throw error;

      setFeedback({ text: 'Missão Rejeitada!', type: 'danger' });
      setSubmissions((prev) => prev.slice(1));
    } catch (err: any) {
      console.error('Erro ao rejeitar:', err);
      alert('Erro ao rejeitar submissão: ' + err.message);
    } finally {
      setProcessingId(null);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const current = submissions[0];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Auditoria Express (Swipe)</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Avalie as fotos enviadas. A aprovação credita pontos automaticamente via Trigger no banco.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Alerta de Feedback instantâneo */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-xl text-center text-xs font-bold border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.text}
        </motion.div>
      )}

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-3 border border-zinc-800 rounded-3xl bg-zinc-900/30">
          <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400">Carregando submissões pendentes...</p>
        </div>
      ) : submissions.length === 0 ? (
        <Card className="border-dashed border-zinc-800 p-12 text-center bg-zinc-900/20">
          <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">Tudo em dia!</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
            Não há fotos de missões pendentes para avaliação no momento. Seus alunos estão mandando bem!
          </p>
          <Button variant="outline" size="sm" onClick={fetchSubmissions}>
            Verificar Novamente
          </Button>
        </Card>
      ) : (
        <div className="relative">
          {/* Fila restante */}
          <div className="text-center text-xs font-semibold text-zinc-500 mb-2">
            Restam <span className="text-emerald-400 font-bold">{submissions.length}</span> fotos na fila
          </div>

          {/* Tinder Card Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-3xl border border-zinc-800 overflow-hidden bg-zinc-900 shadow-2xl"
            >
              {/* Foto da Submissão */}
              <div className="relative aspect-[4/5] sm:aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
                {current.photo_url ? (
                  <img
                    src={current.photo_url}
                    alt="Foto da missão"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-zinc-600 text-xs">Imagem indisponível</div>
                )}

                {/* Badge de Pontos Flutuante */}
                <div className="absolute top-4 right-4">
                  <Badge variant="success" className="text-xs font-extrabold px-3 py-1 shadow-lg backdrop-blur bg-emerald-950/80 border-emerald-500/40">
                    +{current.missions?.points_rewarded || 10} Pontos
                  </Badge>
                </div>

                {/* Gradiente escuro no rodapé da imagem */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent p-5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-emerald-400" />
                    <span className="font-black text-white text-base">
                      {current.students?.full_name || 'Aluno'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                    Missão: <span className="text-emerald-300">{current.missions?.title || 'Meta do Dia'}</span>
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Enviado em {new Date(current.submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Botões de Ação estilo Tinder / Swipe */}
              <div className="p-5 bg-zinc-950 flex items-center justify-around gap-4 border-t border-zinc-850">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleReject}
                  disabled={processingId === current.id}
                  className="flex-1 rounded-2xl h-14 font-extrabold text-sm shadow-xl shadow-rose-950/30 flex items-center justify-center gap-2"
                >
                  <X className="h-6 w-6 stroke-[3]" />
                  Rejeitar
                </Button>

                <Button
                  variant="success"
                  size="lg"
                  onClick={handleApprove}
                  disabled={processingId === current.id}
                  className="flex-1 rounded-2xl h-14 font-extrabold text-sm shadow-xl shadow-emerald-950/30 flex items-center justify-center gap-2"
                >
                  <Check className="h-6 w-6 stroke-[3]" />
                  Aprovar (+{current.missions?.points_rewarded})
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
