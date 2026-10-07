'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Trophy, 
  Dumbbell, 
  Utensils, 
  Droplet, 
  Sparkles, 
  ChevronRight, 
  Bell, 
  Pin, 
  Calendar,
  Zap,
  TrendingUp,
  Target,
  ArrowRight,
  LogOut,
  Shield,
  Gift,
  Activity,
  CheckCircle2,
  Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { FreezeShieldModal } from '@/components/student/freeze-shield-modal';
import { MysteryBoxModal } from '@/components/student/mystery-box-modal';

export default function StudentHomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [student, setStudent] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [standing, setStanding] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  // Contadores por Categoria
  const [categoryCounts, setCategoryCounts] = useState({
    treinos: { done: 0, total: 0 },
    cardios: { done: 0, total: 0 },
    refeicoes: { done: 0, total: 0 },
    habitos: { done: 0, total: 0 },
  });

  // Fase 1: Gamificação e Retenção
  const [gamState, setGamState] = useState<any>({
    freeze_shields_available: 1,
    freeze_shields_used: 0,
    current_streak: 1,
  });
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isMysteryBoxOpen, setIsMysteryBoxOpen] = useState(false);
  const [alreadyClaimedBox, setAlreadyClaimedBox] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHome() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 1. Dados do aluno
        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        setStudent(studentData || { full_name: user.email?.split('@')[0] });

        // 2. Desafio Ativo
        const { data: challengeData } = await supabase
          .from('challenges')
          .select('*, challenge_weeks(*)')
          .eq('is_active', true)
          .order('start_date', { ascending: false })
          .limit(1)
          .single();

        setChallenge(challengeData);

        // 3. Posição e Pontos do Aluno
        const { data: standingData } = await supabase
          .from('leaderboard_standings')
          .select('total_points')
          .eq('student_id', user.id)
          .limit(1)
          .single();

        setStanding(standingData);

        // 4. Avisos da Turma
        if (challengeData) {
          const { data: notices } = await supabase
            .from('challenge_announcements')
            .select('*')
            .eq('challenge_id', challengeData.id)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(3);

          setAnnouncements(notices || []);
        }

        // 5. Missões e Submissões para calcular progresso do desafio ativo
        const { data: allMissions } = challengeData?.id 
          ? await supabase
              .from('missions')
              .select('id, category, target_frequency')
              .eq('challenge_id', challengeData.id)
          : await supabase
              .from('missions')
              .select('id, category, target_frequency');

        const { data: userSubmissions } = await supabase
          .from('student_submissions')
          .select('mission_id, status')
          .eq('student_id', user.id)
          .eq('status', 'approved');

        const approvedMissionIds = new Set(userSubmissions?.map((s: any) => s.mission_id) || []);

        let tDone = 0, tTot = 0;
        let cDone = 0, cTot = 0;
        let rDone = 0, rTot = 0;
        let hDone = 0, hTot = 0;

        allMissions?.forEach((m: any) => {
          const freq = m.target_frequency || 1;
          const isDone = approvedMissionIds.has(m.id);

          if (m.category === 'treino') {
            tTot += freq;
            if (isDone) tDone += freq;
          } else if (m.category === 'cardio') {
            cTot += freq;
            if (isDone) cDone += freq;
          } else if (m.category === 'refeicao') {
            rTot += freq;
            if (isDone) rDone += freq;
          } else {
            hTot += freq;
            if (isDone) hDone += freq;
          }
        });

        setCategoryCounts({
          treinos: { done: tDone, total: tTot || 6 },
          cardios: { done: cDone, total: cTot || 7 },
          refeicoes: { done: rDone, total: rTot || 4 },
          habitos: { done: hDone, total: hTot || 3 },
        });

        // 6. Estado Gamificado (Freeze Shield)
        if (challengeData) {
          const { data: gs } = await supabase
            .from('student_gamification_state')
            .select('*')
            .eq('student_id', user.id)
            .eq('challenge_id', challengeData.id)
            .maybeSingle();

          if (gs) {
            setGamState(gs);
          } else {
            const { data: newGs } = await supabase
              .from('student_gamification_state')
              .insert({
                student_id: user.id,
                challenge_id: challengeData.id,
                freeze_shields_available: 1,
              })
              .select('*')
              .maybeSingle();
            if (newGs) setGamState(newGs);
          }

          // Verificar Mystery Box
          const { data: claim } = await supabase
            .from('student_mystery_box_claims')
            .select('id')
            .eq('student_id', user.id)
            .eq('challenge_id', challengeData.id)
            .eq('week_number', 1)
            .maybeSingle();

          setAlreadyClaimedBox(!!claim);
        }

      } catch (err) {
        console.error('Erro na tela de início:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, [supabase, router]);

  // Cálculo geral de progresso semanal em %
  const totalWeeklyGoals = 
    categoryCounts.treinos.total + 
    categoryCounts.cardios.total + 
    categoryCounts.refeicoes.total + 
    categoryCounts.habitos.total;

  const totalWeeklyDone = 
    categoryCounts.treinos.done + 
    categoryCounts.cardios.done + 
    categoryCounts.refeicoes.done + 
    categoryCounts.habitos.done;

  const weeklyPercentage = totalWeeklyGoals > 0 
    ? Math.min(100, Math.round((totalWeeklyDone / totalWeeklyGoals) * 100))
    : 0;

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-5 space-y-5 bg-zinc-950 text-white selection:bg-emerald-500 max-w-md mx-auto w-full pb-28">
      
      {/* 1. Header do Atleta: Avatar com Anel Gradiente + Streak */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <Link href="/app/profile">
            <div className="relative h-13 w-13 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer">
              <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center font-black text-emerald-400 text-lg overflow-hidden">
                {student?.avatar_url ? (
                  <img
                    src={student.avatar_url}
                    alt={student.full_name || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  student?.full_name?.charAt(0) || 'M'
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-[9px] font-black text-black">
                ✓
              </div>
            </div>
          </Link>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">ArenaPro</span>
              <span className="h-1 w-1 rounded-full bg-zinc-600" />
              <span className="text-[10px] font-bold text-zinc-400">Turma Oficial</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white leading-tight">
              Olá, {student?.full_name?.split(' ')[0] || 'Atleta'} 👋
            </h1>
          </div>
        </div>

        {/* Badge Streak de Alta Energia */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/40 shadow-lg shadow-orange-500/10">
          <Flame className="h-4 w-4 text-orange-400 fill-orange-400 animate-pulse" />
          <span className="text-xs font-black text-orange-400">
            {gamState.current_streak || 1}D STREAK
          </span>
        </div>
      </div>

      {/* 2. Hero Card: Radar Geral de Consistência da Semana (Liquid Glass) */}
      <div className="liquid-glass rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-3.5">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                Consistência Semanal
              </span>
              <span className="text-xs font-black text-white">Semana 1 • Dia 2 de 30</span>
            </div>
          </div>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {weeklyPercentage}%
          </span>
        </div>

        {/* Barra de Progresso com Brilho Neon */}
        <div className="space-y-1">
          <div className="w-full h-2.5 rounded-full bg-zinc-950 p-0.5 border border-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
              style={{ width: `${weeklyPercentage || 25}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold px-0.5">
            <span>{totalWeeklyDone} missões feitas</span>
            <span>Meta: {totalWeeklyGoals || 20} missões</span>
          </div>
        </div>

        {/* Grid de 3 Métricas Rápidas */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.08]">
          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-white/5 text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Pontos</span>
            <span className="text-lg font-black text-emerald-400 block mt-0.5">
              {standing?.total_points || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-white/5 text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Posição</span>
            <span className="text-base font-black text-white block mt-0.5">
              4º <span className="text-[10px] text-zinc-400 font-normal">lugar</span>
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-950/60 border border-white/5 text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Desafio</span>
            <span className="text-base font-black text-white block mt-0.5">
              Dia 2<span className="text-[10px] text-zinc-400 font-normal">/30</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Barra de Superpoderes (Freeze Shield & Mystery Box) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: Freeze Shield */}
        <button
          onClick={() => setIsFreezeModalOpen(true)}
          className="liquid-glass-cyan p-3.5 rounded-3xl text-left hover:scale-[1.02] active:scale-98 transition-all group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Shield className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            <span className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-md border border-cyan-500/20">
              {gamState.freeze_shields_available} Disp.
            </span>
          </div>
          <p className="text-xs font-black text-white mt-2 group-hover:text-cyan-300 transition-colors">
            Freeze Shield
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Blinde seu streak hoje
          </p>
        </button>

        {/* Card 2: Mystery Box de Domingo */}
        <button
          onClick={() => setIsMysteryBoxOpen(true)}
          className="liquid-glass-amber p-3.5 rounded-3xl text-left hover:scale-[1.02] active:scale-98 transition-all group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Gift className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
              alreadyClaimedBox
                ? 'bg-zinc-800 text-zinc-400'
                : 'text-amber-400 bg-amber-500/15 border border-amber-500/20'
            }`}>
              {alreadyClaimedBox ? 'Resgatada' : 'Semana 1'}
            </span>
          </div>
          <p className="text-xs font-black text-white mt-2 group-hover:text-amber-300 transition-colors">
            Mystery Box
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {alreadyClaimedBox ? 'Recompensa ganha' : 'Bata 100% e abra'}
          </p>
        </button>
      </div>

      {/* 4. Mural de Avisos Oficiais do Treinador */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-emerald-400" /> Mural da Turma
          </h2>
          <span className="text-[10px] text-zinc-400 font-semibold">Comunicados</span>
        </div>

        {announcements.length === 0 ? (
          <div className="liquid-glass p-3.5 rounded-2xl flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-xs text-zinc-300">
              Nenhum aviso novo hoje. Mantenha o foco nos treinos e refeições! 🔥
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  a.is_pinned
                    ? 'liquid-glass-emerald border-emerald-500/40 shadow-lg'
                    : 'liquid-glass'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {a.is_pinned && <Pin className="h-3 w-3 text-emerald-400 fill-emerald-400" />}
                    <span className="font-extrabold text-xs text-white">{a.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(a.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{a.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Categorias de Metas (Cards Liquid Glass) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-400" /> Resumo das Suas Metas
          </h2>
          <Link href="/app/missions" className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-0.5 hover:underline">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* 1. Treinos da Semana */}
        <Link href="/app/missions?cat=treino">
          <div className="liquid-glass p-3.5 rounded-2xl hover:border-emerald-500/50 active:scale-98 transition-all flex items-center justify-between gap-3 group shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                  Treinos da Semana
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  <strong className="text-emerald-400 font-bold">{categoryCounts.treinos.done}</strong> de {categoryCounts.treinos.total} concluídos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-zinc-400 group-hover:text-white transition-colors">
                Abrir Treinos
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>
        </Link>

        {/* 2. Cardios da Semana */}
        <Link href="/app/missions?cat=cardio">
          <div className="liquid-glass p-3.5 rounded-2xl hover:border-orange-500/50 active:scale-98 transition-all flex items-center justify-between gap-3 group shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white group-hover:text-orange-300 transition-colors">
                  Cardios da Semana
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  <strong className="text-orange-400 font-bold">{categoryCounts.cardios.done}</strong> de {categoryCounts.cardios.total} feitos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-zinc-400 group-hover:text-white transition-colors">
                Ver Cardios
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-orange-400 transition-colors" />
            </div>
          </div>
        </Link>

        {/* 3. Refeições de Hoje */}
        <Link href="/app/missions?cat=refeicao">
          <div className="liquid-glass p-3.5 rounded-2xl hover:border-amber-500/50 active:scale-98 transition-all flex items-center justify-between gap-3 group shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                  Refeições de Hoje
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  <strong className="text-amber-400 font-bold">{categoryCounts.refeicoes.done}</strong> de {categoryCounts.refeicoes.total} registradas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-zinc-400 group-hover:text-white transition-colors">
                Registrar
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-amber-400 transition-colors" />
            </div>
          </div>
        </Link>
      </div>

      {/* 6. Banner Feed Social da Turma */}
      <Link href="/app/feed" className="block pt-1">
        <div className="liquid-glass-emerald p-4 rounded-3xl flex items-center justify-between gap-3 group shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block mb-0.5">
                Comunidade & Feed
              </span>
              <p className="text-xs font-black text-white">Veja as fotos e pratos aprovados da turma hoje</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs font-bold rounded-xl border-emerald-500/40 text-emerald-300 shrink-0 bg-transparent">
            Feed
          </Button>
        </div>
      </Link>

      {/* MODAL 1: FREEZE SHIELD */}
      {student && challenge && (
        <FreezeShieldModal
          isOpen={isFreezeModalOpen}
          onClose={() => setIsFreezeModalOpen(false)}
          studentId={student.id}
          challengeId={challenge.id}
          shieldsAvailable={gamState.freeze_shields_available || 0}
          onShieldActivated={() => {
            setGamState((prev: any) => ({
              ...prev,
              freeze_shields_available: Math.max(0, (prev.freeze_shields_available || 1) - 1),
            }));
          }}
        />
      )}

      {/* MODAL 2: MYSTERY BOX DE DOMINGO */}
      {student && challenge && (
        <MysteryBoxModal
          isOpen={isMysteryBoxOpen}
          onClose={() => setIsMysteryBoxOpen(false)}
          studentId={student.id}
          challengeId={challenge.id}
          weekNumber={1}
          isEligible={true}
          alreadyClaimed={alreadyClaimedBox}
          onRewardClaimed={(reward) => {
            setAlreadyClaimedBox(true);
            if (reward.reward_type === 'freeze_shield') {
              setGamState((prev: any) => ({
                ...prev,
                freeze_shields_available: (prev.freeze_shields_available || 0) + 1,
              }));
            }
          }}
        />
      )}
    </div>
  );
}
