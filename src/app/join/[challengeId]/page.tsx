'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';

export default function JoinChallengePage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params?.challengeId as string;
  const supabase = createClient();

  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChallenge() {
      if (!challengeId) return;
      setLoading(true);

      try {
        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select(`
            *,
            professionals (
              full_name,
              specialty
            ),
            missions (
              id,
              title,
              points_rewarded
            )
          `)
          .eq('id', challengeId)
          .single();

        if (challengeError) throw challengeError;
        setChallenge(challengeData);

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: participant } = await supabase
            .from('challenge_participants')
            .select('id')
            .eq('challenge_id', challengeId)
            .eq('student_id', currentUser.id)
            .single();

          if (participant) {
            setAlreadyJoined(true);
          }
        }
      } catch (err: any) {
        console.error('Erro ao buscar desafio:', err);
        setError('Desafio não encontrado ou encerrado.');
      } finally {
        setLoading(false);
      }
    }

    loadChallenge();
  }, [challengeId, supabase]);

  const handleJoin = async () => {
    setError(null);

    if (!user) {
      router.push(`/login?redirect=/join/${challengeId}`);
      return;
    }

    setJoining(true);

    try {
      const { data: studentRecord } = await supabase
        .from('students')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!studentRecord) {
        await supabase.from('students').insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Aluno',
        });
      }

      const { error: joinError } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          student_id: user.id,
        });

      if (joinError && !joinError.message.includes('unique')) {
        throw joinError;
      }

      await supabase
        .from('leaderboard_standings')
        .insert({
          challenge_id: challengeId,
          student_id: user.id,
          total_points: 0,
        });

      setAlreadyJoined(true);
      router.push('/app');
    } catch (err: any) {
      console.error('Erro ao ingressar:', err);
      setError(err.message || 'Erro ao ingressar no desafio.');
    } finally {
      setJoining(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 gap-3 font-mono text-xs">
        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        CARREGANDO CREDENCIAL DO DESAFIO...
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="mono-glass-card max-w-md w-full p-8 text-center rounded-3xl">
          <p className="font-bold text-sm text-white font-mono uppercase mb-2">CONVITE EXPIRADO OU INATIVO</p>
          <p className="text-xs text-zinc-400 mb-6 font-sans">
            O desafio foi arquivado pelo organizador ou o link foi desativado.
          </p>
          <Link href="/login">
            <button className="mono-button-primary px-5 py-2 text-xs font-mono">
              Ir para o Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const missionsList = challenge.missions || [];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black font-sans relative overflow-x-hidden">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Top Navbar */}
      <header className="border-b border-white/[0.06] bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">Arena Fit Pro</span>
          </Link>

          <button
            onClick={copyLink}
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            {copied ? '[ LINK COPIADO ]' : '[ COPIAR LINK ]'}
          </button>
        </div>
      </header>

      {/* Hero do Convite com Spotlight 3D */}
      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full relative z-10">
        <div className="absolute -top-6 -right-4 hidden sm:block">
          <Chrome3DStar size={85} />
        </div>

        <SpotlightCard3D className="p-7 sm:p-9 space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                TURMA_OFICIAL_CONVITE
              </span>
              <span className="text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                {Number(challenge.price) > 0 ? `R$ ${Number(challenge.price).toFixed(2)}` : 'GRATUITO'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {challenge.title}
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Treinador: {challenge.professionals?.full_name || 'Coach Certificado'}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
            {challenge.description || 'Desafio fitness focado em disciplina, consistência diária e evolução física com auditoria em tempo real.'}
          </p>

          {/* Cronograma Monocromático */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/60 border border-white/[0.08] font-mono text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Início Oficial</span>
              <span className="font-bold text-white">{new Date(challenge.start_date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Término</span>
              <span className="font-bold text-white">{new Date(challenge.end_date).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Resumo de Missões */}
          {missionsList.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                GRADE_DE_MISSÕES ({missionsList.length})
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {missionsList.map((m: any) => (
                  <div key={m.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300">{m.title}</span>
                    <span className="text-white font-bold">+{m.points_rewarded} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl border border-white/20 bg-black text-xs font-mono text-zinc-300">
              {error}
            </div>
          )}

          {/* Botão de Ação */}
          <div className="pt-4 border-t border-white/[0.06]">
            {alreadyJoined ? (
              <Link href="/app" className="block">
                <button className="mono-button-primary w-full h-12 text-xs font-mono font-bold">
                  VOCÊ JÁ ESTÁ INSCRITO • ABRIR APP →
                </button>
              </Link>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="mono-button-primary w-full h-13 text-xs font-mono font-bold"
              >
                {joining ? 'PROCESSANDO ENTRADA...' : 'ENTRAR NA TURMA AGORA →'}
              </button>
            )}
          </div>
        </SpotlightCard3D>
      </main>

      {/* Footer Minimalista */}
      <footer className="border-t border-white/[0.06] py-8 px-6 text-center text-[10px] font-mono text-zinc-600 relative z-10">
        Arena Fit Pro Technologies • Autenticação Criptografada
      </footer>
    </div>
  );
}
