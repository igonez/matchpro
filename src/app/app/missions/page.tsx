'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Target, 
  Camera, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles, 
  Filter,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function StudentMissionsPage() {
  const supabase = createClient();

  const [missions, setMissions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMissions() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Todas as missões do desafio
        const { data: missionsData } = await supabase
          .from('missions')
          .select('*, challenges(title)')
          .order('points_rewarded', { ascending: false });

        setMissions(missionsData || []);

        // 2. Submissões do aluno
        const { data: submissionsData } = await supabase
          .from('student_submissions')
          .select('*')
          .eq('student_id', user.id);

        if (submissionsData) {
          const map: Record<string, any> = {};
          submissionsData.forEach((s: any) => {
            map[s.mission_id] = s;
          });
          setSubmissions(map);
        }
      } catch (err) {
        console.error('Erro ao carregar missões:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMissions();
  }, [supabase]);

  // Filtragem
  const filteredMissions = missions.filter((m) => {
    const status = submissions[m.id]?.status;
    if (filter === 'completed') return status === 'approved';
    if (filter === 'pending') return !status || status === 'pending' || status === 'rejected';
    return true;
  });

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-white">Missões do Dia</h1>
          <p className="text-[11px] text-zinc-400">Complete e fotografe para somar no ranking</p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              filter === 'pending' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            A Fazer
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              filter === 'completed' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Feitas
          </button>
        </div>
      </div>

      {/* Lista das Missões */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
          <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Carregando suas missões...
        </div>
      ) : filteredMissions.length === 0 ? (
        <Card className="border-dashed border-zinc-850 p-8 text-center bg-zinc-900/30">
          <p className="font-semibold text-xs text-zinc-300">Nenhuma missão encontrada neste filtro</p>
          <p className="text-[11px] text-zinc-500 mt-1">Mude o filtro acima para ver as outras tarefas.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMissions.map((mission) => {
            const sub = submissions[mission.id];
            const isApproved = sub?.status === 'approved';
            const isPending = sub?.status === 'pending';
            const isRejected = sub?.status === 'rejected';

            return (
              <Card
                key={mission.id}
                className={`border-zinc-850 bg-zinc-900/60 transition-all p-4 ${
                  isApproved ? 'border-emerald-500/20 bg-emerald-950/10' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{mission.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="text-[10px] px-2 py-0.5 font-black">
                        +{mission.points_rewarded} pts
                      </Badge>
                      {mission.challenges?.title && (
                        <span className="text-[10px] text-zinc-500 truncate max-w-[160px]">
                          {mission.challenges.title}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação Específica para Cada Tarefa */}
                  <div className="shrink-0">
                    {isApproved && (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                        <CheckCircle2 className="h-4 w-4" /> Concluído
                      </div>
                    )}

                    {isPending && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
                        <Clock className="h-4 w-4 animate-spin" /> Em Análise
                      </div>
                    )}

                    {isRejected && (
                      <Link href={`/app/camera/${mission.id}`}>
                        <Button size="sm" variant="destructive" className="h-9 px-3 text-xs font-bold rounded-xl">
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Tirar Novamente
                        </Button>
                      </Link>
                    )}

                    {!sub && (
                      <Link href={`/app/camera/${mission.id}`}>
                        <Button size="sm" className="h-9 px-3.5 text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/20">
                          <Camera className="h-4 w-4 mr-1.5" /> Registrar Foto
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Se foi enviada, mostra miniatura da foto */}
                {sub?.photo_url && (
                  <div className="mt-3 pt-3 border-t border-zinc-850/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={sub.photo_url}
                        alt="Comprovante"
                        className="h-10 w-10 rounded-lg object-cover border border-zinc-800"
                      />
                      <span className="text-[11px] text-zinc-400">
                        Foto enviada às {new Date(sub.submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <Link href={`/app/camera/${mission.id}`} className="text-[10px] text-zinc-500 hover:text-zinc-300 underline">
                      Trocar foto
                    </Link>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
