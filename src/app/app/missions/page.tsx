'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Target, 
  Camera, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  Dumbbell, 
  Flame, 
  Utensils, 
  Droplet, 
  Gift, 
  Sparkles,
  Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function StudentMissionsWeeklyPage() {
  const supabase = createClient();

  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [missions, setMissions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // 1. Carregar semanas do desafio
  useEffect(() => {
    async function loadWeeks() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Pegar semanas ordenadas
        const { data: weeksData } = await supabase
          .from('challenge_weeks')
          .select('*')
          .order('week_number', { ascending: true });

        if (weeksData && weeksData.length > 0) {
          setWeeks(weeksData);
          setSelectedWeekId(weeksData[0].id);
        }

        // Submissões do aluno
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
        console.error('Erro ao carregar semanas do aluno:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWeeks();
  }, [supabase]);

  // 2. Carregar missões da semana ativa
  useEffect(() => {
    if (!selectedWeekId) {
      // Se não houver semanas cadastradas, busca todas as missões
      async function loadAllMissions() {
        const { data } = await supabase
          .from('missions')
          .select('*')
          .order('points_rewarded', { ascending: false });
        setMissions(data || []);
      }
      loadAllMissions();
      return;
    }

    async function loadWeeklyMissions() {
      const { data } = await supabase
        .from('missions')
        .select('*')
        .eq('week_id', selectedWeekId)
        .order('points_rewarded', { ascending: false });

      setMissions(data || []);
    }

    loadWeeklyMissions();
  }, [selectedWeekId, supabase]);

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);
  const completedMissionsCount = missions.filter((m) => submissions[m.id]?.status === 'approved').length;
  const isWeekComplete = missions.length > 0 && completedMissionsCount === missions.length;

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'treino':
        return (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Dumbbell className="h-3 w-3" /> Treino
          </span>
        );
      case 'cardio':
        return (
          <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Flame className="h-3 w-3" /> Cardio
          </span>
        );
      case 'refeicao':
        return (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Utensils className="h-3 w-3" /> Refeição
          </span>
        );
      case 'habito':
        return (
          <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Droplet className="h-3 w-3" /> Hábito
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-white">Missões por Semana</h1>
          <p className="text-[11px] text-zinc-400">Avance semana a semana e garanta o bônus de consistência</p>
        </div>
      </div>

      {/* Carrossel de Semanas (Weeks Tabs) */}
      {weeks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {weeks.map((week) => {
            const isSelected = week.id === selectedWeekId;
            return (
              <button
                key={week.id}
                onClick={() => setSelectedWeekId(week.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-black whitespace-nowrap transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-950/40'
                    : 'border-zinc-850 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>Semana {week.week_number}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Card da Meta de Bônus da Semana */}
      {selectedWeek && (
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Gift className="h-4 w-4" /> Bônus da {selectedWeek.title}
            </span>
            <span className="text-xs font-black text-white">
              {completedMissionsCount}/{missions.length} Feitas
            </span>
          </div>

          <p className="text-xs text-zinc-300 font-medium">
            {isWeekComplete
              ? `Parabéns! Você bateu 100% da semana e garantiu o bônus de +${selectedWeek.bonus_points} pts! 🎉`
              : `Complete todas as ${missions.length} tarefas desta semana para destravar +${selectedWeek.bonus_points} pontos de bônus no ranking!`}
          </p>

          {/* Barra de Progresso da Semana */}
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden mt-3 border border-zinc-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all duration-500"
              style={{
                width: `${missions.length > 0 ? (completedMissionsCount / missions.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Lista das Missões da Semana */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
          <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Carregando tarefas...
        </div>
      ) : missions.length === 0 ? (
        <Card className="border-dashed border-zinc-850 p-8 text-center bg-zinc-900/30">
          <p className="font-semibold text-xs text-zinc-300">Nenhuma missão cadastrada nesta semana</p>
          <p className="text-[11px] text-zinc-500 mt-1">Aguarde o treinador liberar os treinos e cardios desta fase.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {missions.map((mission) => {
            const sub = submissions[mission.id];
            const isApproved = sub?.status === 'approved';
            const isPending = sub?.status === 'pending';

            return (
              <Card
                key={mission.id}
                className={`border-zinc-850 bg-zinc-900/60 p-4 transition-all ${
                  isApproved ? 'border-emerald-500/25 bg-emerald-950/15' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{mission.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getCategoryBadge(mission.category)}
                      <Badge variant="success" className="text-[10px] px-2 py-0.5 font-black">
                        +{mission.points_rewarded} pts
                      </Badge>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isApproved && (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                        <CheckCircle2 className="h-4 w-4" /> Concluído
                      </div>
                    )}

                    {isPending && (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
                        <Clock className="h-4 w-4 animate-spin" /> Em Análise
                      </div>
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
