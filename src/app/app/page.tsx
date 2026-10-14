'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { FreezeShieldModal } from '@/components/student/freeze-shield-modal';
import { MysteryBoxModal } from '@/components/student/mystery-box-modal';
import { MobileLoadingScreen } from '@/components/ui/mobile-loading-screen';
import { QrCode, ArrowRight } from 'lucide-react';

export default function StudentHomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [student, setStudent] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [standing, setStanding] = useState<any>(null);
  const [rank, setRank] = useState('1º');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  
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
          .maybeSingle();

        setStudent(studentData || { full_name: user.email?.split('@')[0] || 'Atleta' });

        let challengeData = null;
        const { data: participation } = await supabase
          .from('challenge_participants')
          .select('challenge_id, challenges(*, challenge_weeks(*))')
          .eq('student_id', user.id)
          .limit(1)
          .maybeSingle();

        if (participation?.challenges) {
          challengeData = participation.challenges as any;
        }

        setChallenge(challengeData);

        const { data: standingData } = await supabase
          .from('leaderboard_standings')
          .select('total_points')
          .eq('student_id', user.id)
          .limit(1)
          .maybeSingle();

        setStanding(standingData || { total_points: 0 });

        // Calcular posição real do atleta no ranking
        if (challengeData?.id) {
          const { data: allStandings } = await supabase
            .from('leaderboard_standings')
            .select('student_id, total_points')
            .eq('challenge_id', challengeData.id)
            .order('total_points', { ascending: false });

          if (allStandings && allStandings.length > 0) {
            const idx = allStandings.findIndex((s: any) => s.student_id === user.id);
            setRank(idx !== -1 ? `${idx + 1}º` : `${allStandings.length + 1}º`);
          } else {
            setRank('1º');
          }
        }

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
          : { data: [] };

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

  const handleEnterChallengeByCode = () => {
    let code = inviteCodeInput.trim();
    if (!code) return;
    if (code.includes('/join/')) {
      code = code.split('/join/')[1].split('?')[0].split('/')[0];
    }
    router.push(`/join/${code}`);
  };

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

  if (loading) {
    return (
      <MobileLoadingScreen
        title="ArenaFitPro"
        subtitle="Sincronizando suas missões, streak e placar..."
        fullScreen={true}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-5 space-y-5 bg-black text-white selection:bg-white selection:text-black max-w-md mx-auto w-full pb-28 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* 1. Header do Atleta */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div className="flex items-center gap-3">
          <Link href="/app/profile">
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-b from-white via-zinc-400 to-zinc-900 p-px shadow-[0_0_15px_rgba(255,255,255,0.15)] active:scale-95 transition-all cursor-pointer">
              <div className="h-full w-full bg-black rounded-[15px] flex items-center justify-center font-bold text-white text-base overflow-hidden">
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
            <span className="text-[11px] text-zinc-400 font-medium block">
              Olá, atleta
            </span>
            <h1 className="text-base font-black text-white leading-tight">
              {student?.full_name?.split(' ')[0] || 'Atleta'}
            </h1>
          </div>
        </div>

        {/* Badge Streak Vibrante */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-amber-300 tracking-wide flex items-center gap-1">
            🔥 {gamState.current_streak || 1} dias seguidos
          </span>
        </div>
      </div>

      {!challenge ? (
        /* Tela de Primeiro Acesso - Exige Convite/QR Code */
        <div className="relative z-10 space-y-4 pt-2">
          <SpotlightCard3D className="p-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/20 mx-auto flex items-center justify-center shadow-lg">
              <QrCode className="h-8 w-8 text-white" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                Acesso Inicial
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Aguardando sua Turma
              </h2>
              <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
                Sua conta foi criada com sucesso! Para ver suas missões e pontuar no ranking, entre através do <strong>link de convite</strong> ou <strong>QR Code</strong> compartilhado pelo seu treinador.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <input
                type="text"
                placeholder="Cole o código ou link da turma..."
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 font-mono"
              />
              <button
                type="button"
                onClick={handleEnterChallengeByCode}
                className="mono-button-primary w-full py-3 text-xs font-mono font-bold flex items-center justify-center gap-2"
              >
                <span>Entrar na Turma</span>
                <ArrowRight className="h-3.5 w-3.5 text-black" />
              </button>
            </div>
          </SpotlightCard3D>
        </div>
      ) : (
        <>
      {/* 2. Hero Card: Radar de Consistência com 3D Spotlight */}
      <div className="relative z-10">
        <SpotlightCard3D className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <span className="text-xs font-semibold text-zinc-400 block">
                Progresso Semanal
              </span>
              <span className="text-xs font-medium text-white">Semana 1 • Dia 2 de 30</span>
            </div>
            <span className="text-2xl font-black text-emerald-400 font-mono drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              {weeklyPercentage}%
            </span>
          </div>

          {/* Barra de Progresso com Gradiente Esmeralda Energético */}
          <div className="space-y-1.5">
            <div className="w-full h-2.5 rounded-full bg-zinc-900 border border-white/10 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all duration-700"
                style={{ width: `${weeklyPercentage || 25}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span className="text-emerald-400 font-semibold">{totalWeeklyDone} completas</span>
              <span>Meta: {totalWeeklyGoals || 20}</span>
            </div>
          </div>

          {/* Grid de 3 Métricas Tabulares */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
            <Link
              href="/app/leaderboard"
              className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-center hover:border-amber-400/40 transition-colors block"
              title="Ver Ranking da Turma"
            >
              <span className="text-[10px] text-zinc-400 block font-medium">Pontos</span>
              <span className="text-base font-black text-amber-400 font-mono block mt-0.5">
                {standing?.total_points || 0}
              </span>
            </Link>

            <Link
              href="/app/leaderboard"
              className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-center hover:border-white/30 transition-colors block"
              title="Ver Classificação Geral"
            >
              <span className="text-[10px] text-zinc-400 block font-medium">Posição</span>
              <span className="text-base font-black text-white font-mono block mt-0.5">
                {rank}
              </span>
            </Link>

            <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-center">
              <span className="text-[10px] text-zinc-400 block font-medium">Desafio</span>
              <span className="text-base font-black text-cyan-400 font-mono block mt-0.5">
                D2/30
              </span>
            </div>
          </div>
        </SpotlightCard3D>
      </div>

      {/* Banner de Acesso Rápido ao Ranking & Leaderboard */}
      <Link href="/app/leaderboard" className="block relative z-10 group">
        <div className="mono-glass-card p-3.5 rounded-2xl border border-amber-500/25 bg-amber-950/15 hover:border-amber-500/50 hover:bg-amber-950/25 active:scale-98 transition-all flex items-center justify-between shadow-[0_4px_20px_rgba(245,158,11,0.08)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-300 font-bold text-lg shrink-0 shadow-inner">
              🏆
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white group-hover:text-amber-200 transition-colors">
                  Ranking Oficial da Turma
                </span>
                <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  AO VIVO
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5 truncate">
                Você está em <strong className="text-amber-300 font-mono font-bold">{rank}</strong> • {standing?.total_points || 0} XP
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-300 group-hover:text-white transition-colors shrink-0 ml-2">
            Ver Placar →
          </span>
        </div>
      </Link>

      {/* 3. Mecanismos de Retenção: Freeze Shield & Mystery Box */}
      <div className="grid grid-cols-2 gap-2.5 relative z-10">
        <button
          onClick={() => setIsFreezeModalOpen(true)}
          className="mono-glass-card p-4 rounded-3xl text-left border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-950/20 active:scale-98 transition-all group shadow-[0_4px_20px_rgba(6,182,212,0.06)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
              🛡️ Escudo
            </span>
            <span className="text-xs font-bold text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 rounded-md">
              {gamState.freeze_shields_available}x
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-2 group-hover:underline">
            Freeze Shield
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Blinde seu streak hoje
          </p>
        </button>

        <button
          onClick={() => setIsMysteryBoxOpen(true)}
          className="mono-glass-card p-4 rounded-3xl text-left border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-950/20 active:scale-98 transition-all group shadow-[0_4px_20px_rgba(245,158,11,0.06)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              🎁 Prêmio
            </span>
            <span className="text-xs font-bold text-amber-300 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-md">
              {alreadyClaimedBox ? 'OK' : 'Sem 1'}
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-2 group-hover:underline">
            Mystery Box
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {alreadyClaimedBox ? 'Resgatada' : 'Bata 100% da semana'}
          </p>
        </button>
      </div>

      {/* 4. Categorias de Metas */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-semibold tracking-wide text-zinc-400">
            Metas da Semana
          </span>
          <Link href="/app/missions" className="text-xs text-zinc-400 hover:text-white transition-colors font-medium">
            Ver todas →
          </Link>
        </div>

        {/* 1. Treinos */}
        <Link href="/app/missions?cat=treino">
          <div className="mono-glass-card p-3.5 rounded-2xl hover:border-white/30 active:scale-98 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Treinos da Semana</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                <strong className="text-white font-bold">{categoryCounts.treinos.done}</strong> de {categoryCounts.treinos.total} finalizados
              </p>
            </div>
            <span className="text-xs font-medium text-zinc-300 border border-white/10 px-2.5 py-1 rounded-lg">
              Abrir
            </span>
          </div>
        </Link>

        {/* 2. Cardios */}
        <Link href="/app/missions?cat=cardio">
          <div className="mono-glass-card p-3.5 rounded-2xl hover:border-white/30 active:scale-98 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Cardios da Semana</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                <strong className="text-white font-bold">{categoryCounts.cardios.done}</strong> de {categoryCounts.cardios.total} feitos
              </p>
            </div>
            <span className="text-xs font-medium text-zinc-300 border border-white/10 px-2.5 py-1 rounded-lg">
              Ver cardios
            </span>
          </div>
        </Link>

        {/* 3. Refeições */}
        <Link href="/app/missions?cat=refeicao">
          <div className="mono-glass-card p-3.5 rounded-2xl hover:border-white/30 active:scale-98 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Refeições de Hoje</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                <strong className="text-white font-bold">{categoryCounts.refeicoes.done}</strong> de {categoryCounts.refeicoes.total} registradas
              </p>
            </div>
            <span className="text-xs font-medium text-zinc-300 border border-white/10 px-2.5 py-1 rounded-lg">
              Registrar
            </span>
          </div>
        </Link>
      </div>

      {/* 5. Mural de Avisos da Turma */}
      {announcements.length > 0 && (
        <div className="space-y-2 relative z-10 pt-1">
          <span className="text-xs font-semibold tracking-wide text-zinc-400 block">
            Mural de Avisos
          </span>
          {announcements.map((a) => (
            <div key={a.id} className="mono-glass-card p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white">{a.title}</span>
                <span className="text-xs text-zinc-400">
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
        </>
      )}
    </div>
  );
}
