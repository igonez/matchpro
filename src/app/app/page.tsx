'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Trophy, 
  Target, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Zap,
  Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function StudentHomePage() {
  const supabase = createClient();

  const [student, setStudent] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [standing, setStanding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHome() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Dados do aluno
        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        setStudent(studentData);

        // 2. Pontuação no Leaderboard
        const { data: standingData } = await supabase
          .from('leaderboard_standings')
          .select('total_points')
          .eq('student_id', user.id)
          .limit(1)
          .single();

        setStanding(standingData);

        // 3. Missões
        const { data: missionsData } = await supabase
          .from('missions')
          .select('*')
          .limit(3);

        setMissions(missionsData || []);

        // 4. Submissões de hoje
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
        console.error('Erro na home:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, [supabase]);

  const completedCount = missions.filter(m => submissions[m.id]?.status === 'approved').length;
  const progressPercent = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;

  return (
    <div className="flex flex-col flex-1 p-4 space-y-5">
      {/* Top Profile / Streak Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center font-black text-emerald-400 text-lg">
              {student?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
          <div>
            <h1 className="text-base font-black text-white leading-tight">
              {student?.full_name?.split(' ')[0] || 'Atleta'}
            </h1>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-semibold">
              <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
              Nível 1 • Foco Diário
            </p>
          </div>
        </div>

        {/* Streak / Ofensiva */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 shadow-md shadow-orange-950/20">
          <Flame className="h-5 w-5 text-orange-400 fill-orange-400 animate-pulse" />
          <div className="text-left">
            <span className="block text-[10px] text-zinc-400 font-bold leading-none uppercase tracking-wider">Streak</span>
            <span className="text-xs font-black text-orange-400">3 Dias 🔥</span>
          </div>
        </div>
      </div>

      {/* Card de Progresso do Dia */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/50 via-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Meta do Dia
            </span>
            <span className="text-xs font-black text-white">{completedCount}/{missions.length} Concluídas</span>
          </div>

          <h2 className="text-xl font-black text-white leading-snug">
            {progressPercent === 100 ? 'Todas as missões cumpridas hoje! 🎉' : 'Mantenha o ritmo para pontuar!'}
          </h2>

          {/* Barra de Progresso */}
          <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-zinc-300">
                Pontos: <span className="text-emerald-400 font-black">{standing?.total_points || 0} pts</span>
              </span>
            </div>
            <Link href="/app/missions">
              <Button size="sm" className="h-8 text-xs font-bold px-3 rounded-xl shadow-lg shadow-emerald-500/20">
                Ver Missões <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        <Flame className="absolute -right-3 -bottom-5 h-28 w-28 text-emerald-500/10 pointer-events-none rotate-12" />
      </div>

      {/* Atalhos Rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/app/missions">
          <Card className="border-zinc-850 bg-zinc-900/60 hover:border-emerald-500/30 transition-all p-3.5 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs text-white">Missões</p>
                <p className="text-[10px] text-zinc-400">Ver tarefas de hoje</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/app/feed">
          <Card className="border-zinc-850 bg-zinc-900/60 hover:border-emerald-500/30 transition-all p-3.5 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs text-white">Feed Social</p>
                <p className="text-[10px] text-zinc-400">Fotos da turma</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Próximas Missões Pendentes */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Missões Rápidas
          </h2>
          <Link href="/app/missions" className="text-[11px] text-emerald-400 font-bold hover:underline">
            Ver todas
          </Link>
        </div>

        {missions.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs">
            Nenhuma missão cadastrada ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {missions.map((mission) => {
              const sub = submissions[mission.id];
              const isApproved = sub?.status === 'approved';
              const isPending = sub?.status === 'pending';

              return (
                <div
                  key={mission.id}
                  className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-850 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-zinc-800 text-emerald-400 flex items-center justify-center font-extrabold text-xs shrink-0">
                      +{mission.points_rewarded}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-white truncate">{mission.title}</p>
                      <p className="text-[10px] text-zinc-400">Exige registro de foto</p>
                    </div>
                  </div>

                  <div>
                    {isApproved ? (
                      <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Feito
                      </span>
                    ) : isPending ? (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full">
                        <Clock className="h-3.5 w-3.5 animate-spin" /> Em Análise
                      </span>
                    ) : (
                      <Link href={`/app/camera/${mission.id}`}>
                        <Button size="sm" className="h-8 px-2.5 text-xs font-bold rounded-xl shadow-md">
                          <Camera className="h-3.5 w-3.5 mr-1" /> Registrar
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
