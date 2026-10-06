'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  Flame, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

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
        // 1. Buscar dados do desafio e treinador
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

        // 2. Checar se usuário já está logado
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // 3. Checar se já é participante
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

  // Ação de Inscrição / Entrada
  const handleJoin = async () => {
    setError(null);

    // Se não estiver logado, redireciona para login com parâmetro de retorno
    if (!user) {
      router.push(`/login?redirect=/join/${challengeId}`);
      return;
    }

    setJoining(true);

    try {
      // 1. Garantir que perfil do aluno existe na tabela students
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

      // 2. Inscrever o aluno em challenge_participants
      const { error: joinError } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          student_id: user.id,
        });

      if (joinError && !joinError.message.includes('unique')) {
        throw joinError;
      }

      // 3. Inicializar entrada no leaderboard se não existir
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
      console.error('Erro ao se inscrever:', err);
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
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Carregando convite da turma...</p>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-zinc-800 bg-zinc-900/60 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Desafio Indisponível</h2>
          <p className="text-xs text-zinc-400 mt-1 mb-6">
            O link pode estar expirado ou o desafio foi desativado pelo treinador.
          </p>
          <Link href="/login">
            <Button size="sm" variant="outline">Voltar para o Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const missionsList = challenge.missions || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Flame className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight">
              Arena<span className="text-emerald-400">Pro</span>
            </span>
          </Link>

          <Button variant="ghost" size="sm" onClick={copyLink} className="text-xs">
            {copied ? <Check className="h-4 w-4 mr-1 text-emerald-400" /> : <Share2 className="h-4 w-4 mr-1" />}
            {copied ? 'Link Copiado!' : 'Compartilhar Convite'}
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 py-10 w-full flex-1">
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-2xl relative overflow-hidden">
          {/* Header Visual com Badge de Preço */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="success" className="px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase">
                Convite Oficial
              </Badge>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block font-medium">Inscrição</span>
                <span className="text-lg font-black text-emerald-400">
                  {Number(challenge.price) > 0
                    ? `R$ ${Number(challenge.price).toFixed(2)}`
                    : 'Gratuito'}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {challenge.title}
            </h1>

            <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
              Criado por <span className="text-emerald-300 font-bold">{challenge.professionals?.full_name || 'Treinador'}</span>
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Datas */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 text-xs">
              <div>
                <span className="text-zinc-500 font-medium block">Início da Turma</span>
                <span className="font-bold text-zinc-200 mt-0.5 block">
                  {new Date(challenge.start_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 font-medium block">Término</span>
                <span className="font-bold text-zinc-200 mt-0.5 block">
                  {new Date(challenge.end_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Como funciona / Regras */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Como funciona o Desafio
              </h3>
              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <p>Você cumpre as missões diárias da turma e fotografa na hora pelo aplicativo.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <p>O treinador avalia sua foto e aprova os pontos.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <p>Você sobe no ranking da turma atualizado em tempo real.</p>
                </div>
              </div>
            </div>

            {/* Missões Inclusas */}
            {missionsList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Missões da Turma ({missionsList.length})
                </h3>
                <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-850 bg-zinc-950/40 p-1">
                  {missionsList.map((m: any) => (
                    <div key={m.id} className="p-2.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200">{m.title}</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-400">
                        +{m.points_rewarded} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          {/* CTA Footer */}
          <CardFooter className="p-6 pt-0 flex flex-col gap-3">
            {alreadyJoined ? (
              <Link href="/app" className="w-full">
                <Button size="lg" className="w-full font-bold">
                  Você já participa! Ir para o Feed
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                onClick={handleJoin}
                disabled={joining}
                className="w-full font-extrabold text-base shadow-xl shadow-emerald-500/20"
              >
                {joining ? 'Entrando na turma...' : user ? 'Confirmar Entrada no Desafio' : 'Entrar no Desafio Agora'}
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            )}

            {!user && (
              <p className="text-[11px] text-zinc-500 text-center">
                Ao clicar, você será guiado para criar ou acessar sua conta de aluno.
              </p>
            )}
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        ArenaPro — Plataforma Gamificada de Desafios
      </footer>
    </div>
  );
}
