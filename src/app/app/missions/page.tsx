'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Target, 
  Camera, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Dumbbell, 
  Flame, 
  Utensils, 
  Droplet, 
  Gift, 
  Sparkles,
  Lock,
  Hourglass
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
  const [todaySubmissions, setTodaySubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Relógio em tempo real para contagem até 23:59:59 (meia-noite)
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>('');

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diffMs = midnight.getTime() - now.getTime();

      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeUntilMidnight(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else {
        setTimeUntilMidnight('00:00:00');
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Carregar semanas e submissões
  useEffect(() => {
    async function loadData() {
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

        // Submissões totais do aluno
        const { data: allSubmissionsData } = await supabase
          .from('student_submissions')
          .select('*, missions(category, requires_cooldown, cooldown_hours)')
          .eq('student_id', user.id);

        if (allSubmissionsData) {
          const map: Record<string, any> = {};
          const todayList: any[] = [];
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          allSubmissionsData.forEach((s: any) => {
            map[s.mission_id] = s;
            const subTime = new Date(s.submitted_at || s.client_captured_at);
            if (subTime >= startOfToday) {
              todayList.push(s);
            }
          });

          setSubmissions(map);
          setTodaySubmissions(todayList);
        }
      } catch (err) {
        console.error('Erro ao carregar semanas do aluno:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  // 2. Carregar missões da semana ativa
  useEffect(() => {
    if (!selectedWeekId) {
      async function loadAllMissions() {
        const { data } = await supabase
          .from('missions')
          .select('*')
          .order('order_index', { ascending: true })
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
        .order('order_index', { ascending: true })
        .order('points_rewarded', { ascending: false });

      setMissions(data || []);
    }

    loadWeeklyMissions();
  }, [selectedWeekId, supabase]);

  // Contagem estrita do dia de hoje: Limite de 1 Treino e 1 Cardio por dia
  const todayWorkoutCount = useMemo(() => {
    return todaySubmissions.filter((s: any) => s.missions?.category === 'treino').length;
  }, [todaySubmissions]);

  const todayCardioCount = useMemo(() => {
    return todaySubmissions.filter((s: any) => s.missions?.category === 'cardio').length;
  }, [todaySubmissions]);

  const isWorkoutDailyLocked = todayWorkoutCount >= 1;
  const isCardioDailyLocked = todayCardioCount >= 1;

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);
  const completedMissionsCount = missions.filter((m) => submissions[m.id]?.status === 'approved').length;
  const isWeekComplete = missions.length > 0 && completedMissionsCount === missions.length;

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'treino':
        return (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Dumbbell className="h-3 w-3" /> Treino (1/dia)
          </span>
        );
      case 'cardio':
        return (
          <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Flame className="h-3 w-3" /> Cardio (1/dia)
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
          <p className="text-[11px] text-zinc-400">Limite de 1 treino e 1 cardio por dia para garantir disciplina real</p>
        </div>
      </div>

      {/* Banner de Travas Diárias Ativas */}
      {(isWorkoutDailyLocked || isCardioDailyLocked) && (
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
              <Hourglass className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <p className="font-extrabold text-white text-[11px]">
                {isWorkoutDailyLocked && isCardioDailyLocked
                  ? 'Meta diária de Treino & Cardio atingida!'
                  : isWorkoutDailyLocked
                  ? 'Treino de hoje concluído!'
                  : 'Cardio de hoje concluído!'}
              </p>
              <p className="text-[10px] text-zinc-400">
                Próximas sessões desbloqueiam em: <strong className="text-orange-400 font-mono">{timeUntilMidnight}</strong>
              </p>
            </div>
          </div>
          <Lock className="h-4 w-4 text-zinc-500" />
        </div>
      )}

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

      {/* Card da Meta de Bônus da Semana (+20 XP) */}
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
              ? `Parabéns! Você bateu 100% da semana e garantiu o bônus de +${selectedWeek.bonus_points || 20} pts! 🎉`
              : `Complete todas as missões desta semana para destravar +${selectedWeek.bonus_points || 20} pontos de bônus no ranking!`}
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

      {/* Lista das Missões da Semana com Cadeado Sequencial */}
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
          {missions.map((mission, index) => {
            const sub = submissions[mission.id];
            const isApproved = sub?.status === 'approved';
            const isPending = sub?.status === 'pending';

            // Verificação de Bloqueio Diário (1 Treino e 1 Cardio por dia)
            const isDailyLocked = 
              !isApproved && !isPending && (
                (mission.category === 'treino' && isWorkoutDailyLocked) ||
                (mission.category === 'cardio' && isCardioDailyLocked)
              );

            // Verificação de Sequenciamento (Cadeado se o treino anterior ainda não foi feito)
            const isPreviousUnfinished = 
              !isApproved && !isPending && (mission.category === 'treino' || mission.category === 'cardio') &&
              index > 0 &&
              missions[index - 1]?.category === mission.category &&
              !submissions[missions[index - 1]?.id];

            const isLocked = isDailyLocked || isPreviousUnfinished;

            return (
              <Card
                key={mission.id}
                className={`border-zinc-850 bg-zinc-900/60 p-4 transition-all ${
                  isApproved ? 'border-emerald-500/25 bg-emerald-950/15' : isLocked ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{mission.title}</span>
                      {mission.is_bonus && (
                        <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/40 text-[9px]">
                          Bônus
                        </Badge>
                      )}
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

                    {!sub && isLocked && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-400 text-xs font-bold">
                          <Lock className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Bloqueado</span>
                        </div>
                        {isDailyLocked && (
                          <span className="text-[9px] text-orange-400 font-mono font-bold">
                            {timeUntilMidnight}
                          </span>
                        )}
                      </div>
                    )}

                    {!sub && !isLocked && (
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
