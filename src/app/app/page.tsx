'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { FreezeShieldModal } from '@/components/student/freeze-shield-modal';
import { MysteryBoxModal } from '@/components/student/mystery-box-modal';

export default function StudentHomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [student, setStudent] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [standing, setStanding] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  const [categoryCounts, setCategoryCounts] = useState({
    treinos: { done: 0, total: 0 },
    cardios: { done: 0, total: 0 },
    refeicoes: { done: 0, total: 0 },
    habitos: { done: 0, total: 0 },
  });

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

        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();

        setStudent(studentData || { full_name: user.email?.split('@')[0] });

        const { data: challengeData } = await supabase
          .from('challenges')
          .select('*, challenge_weeks(*)')
          .eq('is_active', true)
          .order('start_date', { ascending: false })
          .limit(1)
          .single();

        setChallenge(challengeData);

        const { data: standingData } = await supabase
          .from('leaderboard_standings')
          .select('total_points')
          .eq('student_id', user.id)
          .limit(1)
          .single();

        setStanding(standingData);

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
    <div className="flex flex-col flex-1 p-4 sm:p-5 space-y-5 bg-black text-white selection:bg-white selection:text-black max-w-md mx-auto w-full pb-28 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* 1. Header do Atleta Monocromático */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div className="flex items-center gap-3">
          <Link href="/app/profile">
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-b from-white via-zinc-400 to-zinc-900 p-px shadow-[0_0_15px_rgba(255,255,255,0.15)] active:scale-95 transition-all cursor-pointer">
              <div className="h-full w-full bg-black rounded-[15px] flex items-center justify-center font-mono font-black text-white text-base overflow-hidden">
                {student?.avatar_url ? (
                  <img
                    src={student.avatar_url}
                    alt={student.full_name || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  student?.full_name?.charAt(0) || 'A'
                )}
              </div>
            </div>
          </Link>

          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
              SISTEMA_ATIVO
            </span>
            <h1 className="text-base font-black text-white leading-tight">
              {student?.full_name?.split(' ')[0] || 'Atleta'}
            </h1>
          </div>
        </div>

        {/* Badge Streak Monocromático */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-lg">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            {gamState.current_streak || 1}D STREAK
          </span>
        </div>
      </div>

      {/* 2. Hero Card: Radar de Consistência com 3D Spotlight */}
      <div className="relative z-10">
        <SpotlightCard3D className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                PROGRESSO_SEMANAL
              </span>
              <span className="text-xs font-bold text-white">Semana 1 • Dia 2 de 30</span>
            </div>
            <span className="text-2xl font-black text-white font-mono">
              {weeklyPercentage}%
            </span>
          </div>

          {/* Barra de Progresso em Gradiente Metálico */}
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-zinc-900 border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-zinc-500 via-zinc-200 to-white transition-all duration-700"
                style={{ width: `${weeklyPercentage || 25}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>{totalWeeklyDone} completas</span>
              <span>Meta: {totalWeeklyGoals || 20}</span>
            </div>
          </div>

          {/* Grid de 3 Métricas Tabulares */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-center">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">Pontos</span>
              <span className="text-base font-black text-white font-mono block mt-0.5">
                {standing?.total_points || 0}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-center">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">Posição</span>
              <span className="text-base font-black text-white font-mono block mt-0.5">
                4º
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-center">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">Desafio</span>
              <span className="text-base font-black text-white font-mono block mt-0.5">
                D2/30
              </span>
            </div>
          </div>
        </SpotlightCard3D>
      </div>

      {/* 3. Mecanismos de Retenção: Freeze Shield & Mystery Box */}
      <div className="grid grid-cols-2 gap-2.5 relative z-10">
        <button
          onClick={() => setIsFreezeModalOpen(true)}
          className="mono-glass-card p-4 rounded-3xl text-left hover:border-white/30 active:scale-98 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
              SHIELD
            </span>
            <span className="text-[9px] font-mono font-bold text-white border border-white/20 bg-white/5 px-2 py-0.5 rounded-md">
              {gamState.freeze_shields_available}x
            </span>
          </div>
          <p className="text-xs font-black text-white mt-2 group-hover:underline">
            Freeze Shield
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Blinde seu streak hoje
          </p>
        </button>

        <button
          onClick={() => setIsMysteryBoxOpen(true)}
          className="mono-glass-card p-4 rounded-3xl text-left hover:border-white/30 active:scale-98 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
              REWARD
            </span>
            <span className="text-[9px] font-mono font-bold text-white border border-white/20 bg-white/5 px-2 py-0.5 rounded-md">
              {alreadyClaimedBox ? 'OK' : 'Sem 1'}
            </span>
          </div>
          <p className="text-xs font-black text-white mt-2 group-hover:underline">
            Mystery Box
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {alreadyClaimedBox ? 'Resgatada' : 'Bata 100% da semana'}
          </p>
        </button>
      </div>

      {/* 4. Categorias de Metas em Vidro Monocromático */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between pb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            METAS_DO_DESAFIO
          </span>
          <Link href="/app/missions" className="text-[10px] font-mono text-zinc-400 hover:text-white transition-colors">
            Ver todas →
          </Link>
        </div>

        {/* 1. Treinos */}
        <Link href="/app/missions?cat=treino">
          <div className="mono-glass-card p-3.5 rounded-2xl hover:border-white/30 active:scale-98 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-white">Treinos da Semana</p>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                <strong className="text-white font-bold">{categoryCounts.treinos.done}</strong> de {categoryCounts.treinos.total} finalizados
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 border border-white/10 px-2 py-1 rounded-lg">
              ABRIR →
            </span>
          </div>
        </Link>

        {/* 2. Cardios */}
        <Link href="/app/missions?cat=cardio">
          <div className="mono-glass-card p-3.5 rounded-2xl hover:border-white/30 active:scale-98 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-white">Cardios da Semana</p>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                <strong className="text-white font-bold">{categoryCounts.cardios.done}</strong> de {categoryCounts.cardios.total} feitos
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 border border-white/10 px-2 py-1 rounded-lg">
              VER CARDIOS →
            </span>
          </div>
        </Link>

        {/* 3. Refeições */}
        <Link href="/app/missions?cat=refeicao">
          <div className="mono-glass-card p-3.5 rounded-2xl hover:border-white/30 active:scale-98 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-white">Refeições de Hoje</p>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                <strong className="text-white font-bold">{categoryCounts.refeicoes.done}</strong> de {categoryCounts.refeicoes.total} registradas
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 border border-white/10 px-2 py-1 rounded-lg">
              REGISTRAR →
            </span>
          </div>
        </Link>
      </div>

      {/* 5. Mural de Avisos da Turma */}
      {announcements.length > 0 && (
        <div className="space-y-2 relative z-10 pt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
            MURAL_COMUNICADOS
          </span>
          {announcements.map((a) => (
            <div key={a.id} className="mono-glass-card p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white">{a.title}</span>
                <span className="text-[9px] font-mono text-zinc-500">
                  {new Date(a.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{a.content}</p>
            </div>
          ))}
        </div>
      )}

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
