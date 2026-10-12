'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Users, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Calendar,
  ExternalLink,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { createClient } from '@/lib/supabase/client';

function CoachLeaderboardContent() {
  const searchParams = useSearchParams();
  const challengeIdParam = searchParams.get('challengeId');
  const supabase = createClient();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challengeIdParam || '');
  const [activeTab, setActiveTab] = useState<'individual' | 'squads'>('individual');
  const [standings, setStandings] = useState<any[]>([]);
  const [squadStandings, setSquadStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Carregar turmas do coach
  useEffect(() => {
    async function loadChallenges() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('challenges')
        .select('id, title, start_date, end_date, is_active')
        .eq('professional_id', user.id)
        .order('is_active', { ascending: false })
        .order('start_date', { ascending: false });

      if (data && data.length > 0) {
        setChallenges(data);
        if (!selectedChallengeId) {
          // Se param bate com algum, usa ele, senão pega o primeiro
          const matched = data.find((c: any) => c.id === challengeIdParam);
          setSelectedChallengeId(matched ? matched.id : data[0].id);
        }
      }
      setLoading(false);
    }
    loadChallenges();
  }, [challengeIdParam, supabase]);

  // 2. Carregar placar do desafio selecionado
  const loadStandings = async (challengeId: string) => {
    if (!challengeId) return;
    setLoading(true);
    try {
      // Standings Individuais com dados do aluno
      const { data: standingsData } = await supabase
        .from('leaderboard_standings')
        .select(`
          id,
          total_points,
          challenge_id,
          student_id,
          students (
            id,
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq('challenge_id', challengeId)
        .order('total_points', { ascending: false });

      // Buscar contagem de missões aprovadas de cada aluno
      const { data: submissionsData } = await supabase
        .from('student_submissions')
        .select('student_id, status')
        .eq('challenge_id', challengeId)
        .eq('status', 'approved');

      const approvedCounts = new Map<string, number>();
      submissionsData?.forEach((s: any) => {
        approvedCounts.set(s.student_id, (approvedCounts.get(s.student_id) || 0) + 1);
      });

      const enriched = (standingsData || []).map((s: any) => ({
        ...s,
        approvedMissions: approvedCounts.get(s.student_id) || 0,
      }));

      setStandings(enriched);

      // Squad Standings
      const { data: squadsData } = await supabase
        .from('squad_standings')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('squad_average_points', { ascending: false });

      setSquadStandings(squadsData || []);
    } catch (err) {
      console.error('Erro ao carregar ranking da turma:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChallengeId) {
      loadStandings(selectedChallengeId);
    }
  }, [selectedChallengeId]);

  // 3. Realtime Updates
  useEffect(() => {
    if (!selectedChallengeId) return;

    const channel = supabase
      .channel('coach_realtime_leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_standings',
          filter: `challenge_id=eq.${selectedChallengeId}`,
        },
        () => {
          loadStandings(selectedChallengeId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChallengeId, supabase]);

  const currentChallenge = challenges.find((c) => c.id === selectedChallengeId);

  // Top 3 do pódio
  const top1 = standings[0];
  const top2 = standings[1];
  const top3 = standings[2];

  return (
    <div className="space-y-6 relative pb-16">
      <Monochrome3DBackground />

      {/* Header com Seletor de Turma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 font-mono">
              CLASSIFICAÇÃO OFICIAL
            </span>
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ao Vivo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Ranking da Turma
          </h1>
          <p className="text-xs text-zinc-400">
            Acompanhe o engajamento, consistência e placar de pontos em tempo real dos seus alunos.
          </p>
        </div>

        {/* Seletor de Desafio */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {challenges.length > 0 && (
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-bold text-white focus:outline-none focus:border-white/30 font-mono"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {c.is_active ? '(Ativo)' : '(Encerrado)'}
                </option>
              ))}
            </select>
          )}

          {currentChallenge && (
            <Link href={`/dashboard/challenges/${currentChallenge.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 px-3 text-xs border-white/10 text-zinc-300 hover:text-white"
              >
                Gerenciar Turma
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        <SpotlightCard3D className="p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>TOTAL DE ATLETAS</span>
            <Users className="h-4 w-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {standings.length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Alunos pontuando nesta turma</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>LÍDER DA TURMA</span>
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2 truncate">
            {top1 ? (top1.students?.full_name?.split(' ')[0] || 'Atleta') : 'Ninguém ainda'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {top1 ? `${top1.total_points} XP acumulados` : 'Aguardando primeiro check-in'}
          </p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>MÉDIA DE PONTOS</span>
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {standings.length > 0
              ? Math.round(standings.reduce((acc, curr) => acc + (curr.total_points || 0), 0) / standings.length)
              : 0} <span className="text-xs text-zinc-400 font-normal">XP</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Média geral dos participantes</p>
        </SpotlightCard3D>
      </div>

      {/* PÓDIO TOP 3 VISUAL */}
      {standings.length > 0 && (
        <div className="relative z-10 mono-glass-card p-6 rounded-3xl border-white/10">
          <div className="text-center pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              PÓDIO DA TURMA
            </span>
            <h2 className="text-lg font-black text-white">Os Mais Consistentes</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 items-end max-w-lg mx-auto pt-4">
            {/* 2º Lugar */}
            <div className="flex flex-col items-center order-1">
              <div className="relative mb-2">
                <div className="h-14 w-14 rounded-2xl bg-zinc-800 border-2 border-zinc-400 flex items-center justify-center font-bold text-white overflow-hidden shadow-lg">
                  {top2?.students?.avatar_url ? (
                    <img src={top2.students.avatar_url} alt="Top 2" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-mono">{top2?.students?.full_name?.charAt(0) || '2'}</span>
                  )}
                </div>
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-zinc-400 text-black font-black text-xs flex items-center justify-center font-mono shadow">
                  2º
                </span>
              </div>
              <p className="text-xs font-bold text-white text-center truncate max-w-[90px]">
                {top2 ? (top2.students?.full_name?.split(' ')[0] || 'Atleta') : '-'}
              </p>
              <span className="text-[10px] font-mono text-zinc-400">
                {top2 ? `${top2.total_points} XP` : '0 XP'}
              </span>
              <div className="w-full h-16 rounded-t-xl bg-zinc-800/60 border-t border-x border-zinc-600/40 mt-2 flex items-center justify-center">
                <span className="text-xs font-black font-mono text-zinc-400">PRATA</span>
              </div>
            </div>

            {/* 1º Lugar (Destaque Central) */}
            <div className="flex flex-col items-center order-2">
              <div className="relative mb-2">
                <div className="h-18 w-18 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 p-0.5 shadow-[0_0_25px_rgba(251,191,36,0.4)]">
                  <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center font-bold text-white overflow-hidden">
                    {top1?.students?.avatar_url ? (
                      <img src={top1.students.avatar_url} alt="Top 1" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-mono text-amber-400">{top1?.students?.full_name?.charAt(0) || '1'}</span>
                    )}
                  </div>
                </div>
                <span className="absolute -top-2.5 -right-2.5 h-7 w-7 rounded-full bg-amber-400 text-black font-black text-sm flex items-center justify-center font-mono shadow-lg">
                  👑
                </span>
              </div>
              <p className="text-xs font-black text-white text-center truncate max-w-[100px]">
                {top1 ? (top1.students?.full_name?.split(' ')[0] || 'Atleta') : '-'}
              </p>
              <span className="text-xs font-mono font-bold text-amber-300">
                {top1 ? `${top1.total_points} XP` : '0 XP'}
              </span>
              <div className="w-full h-24 rounded-t-xl bg-gradient-to-t from-amber-500/20 to-amber-500/40 border-t border-x border-amber-400/50 mt-2 flex items-center justify-center">
                <span className="text-xs font-black font-mono text-amber-300">OURO</span>
              </div>
            </div>

            {/* 3º Lugar */}
            <div className="flex flex-col items-center order-3">
              <div className="relative mb-2">
                <div className="h-14 w-14 rounded-2xl bg-zinc-900 border-2 border-amber-800 flex items-center justify-center font-bold text-white overflow-hidden shadow-lg">
                  {top3?.students?.avatar_url ? (
                    <img src={top3.students.avatar_url} alt="Top 3" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-mono">{top3?.students?.full_name?.charAt(0) || '3'}</span>
                  )}
                </div>
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-amber-800 text-amber-100 font-black text-xs flex items-center justify-center font-mono shadow">
                  3º
                </span>
              </div>
              <p className="text-xs font-bold text-white text-center truncate max-w-[90px]">
                {top3 ? (top3.students?.full_name?.split(' ')[0] || 'Atleta') : '-'}
              </p>
              <span className="text-[10px] font-mono text-zinc-400">
                {top3 ? `${top3.total_points} XP` : '0 XP'}
              </span>
              <div className="w-full h-12 rounded-t-xl bg-zinc-900/60 border-t border-x border-amber-900/40 mt-2 flex items-center justify-center">
                <span className="text-xs font-black font-mono text-amber-700">BRONZE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Individual vs Squads */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 relative z-10">
        <button
          onClick={() => setActiveTab('individual')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'individual'
              ? 'bg-white text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Individual ({standings.length} alunos)
        </button>
        <button
          onClick={() => setActiveTab('squads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'squads'
              ? 'bg-white text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Squads / Equipes ({squadStandings.length})
        </button>
      </div>

      {/* Tabela de Classificação Individual */}
      {activeTab === 'individual' && (
        <Card className="border-white/10 bg-zinc-900/50 relative z-10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white font-black tracking-tight">
              Tabela de Classificação Completa
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Pontuação total calculada com base nos check-ins de missões aprovados.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {standings.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Trophy className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-mono text-zinc-400">Nenhum aluno pontuou nesta turma ainda.</p>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                  Assim que os alunos enviarem fotos de comprovação de treinos ou refeições pelo aplicativo, os pontos aparecerão aqui instantaneamente.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {standings.map((item, index) => {
                  const studentName = item.students?.full_name || 'Atleta';
                  const cleanPhone = item.students?.phone?.replace(/\D/g, '') || '';
                  const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Parabéns pelo seu progresso no desafio! Você está em ${index + 1}º lugar com ${item.total_points} XP!`)}` : null;

                  return (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Posição */}
                        <div className={`h-8 w-8 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 border ${
                          index === 0
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                            : index === 1
                            ? 'bg-zinc-300/20 text-zinc-200 border-zinc-300/40'
                            : index === 2
                            ? 'bg-amber-800/20 text-amber-600 border-amber-800/40'
                            : 'bg-white/5 text-zinc-400 border-white/10'
                        }`}>
                          {index + 1}º
                        </div>

                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                          {item.students?.avatar_url ? (
                            <img src={item.students.avatar_url} alt={studentName} className="w-full h-full object-cover" />
                          ) : (
                            studentName.charAt(0)
                          )}
                        </div>

                        {/* Nome & Dados */}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                            <span>{studentName}</span>
                            {index === 0 && <span title="Líder Atual">👑</span>}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            {item.approvedMissions || 0} {item.approvedMissions === 1 ? 'missão concluída' : 'missões concluídas'}
                          </p>
                        </div>
                      </div>

                      {/* Pontos & Ações */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-base font-black font-mono text-white block">
                            {item.total_points} <span className="text-[10px] text-amber-400 font-bold">XP</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Ativo
                          </span>
                        </div>

                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                            title="Enviar parabéns pelo WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabela de Squads */}
      {activeTab === 'squads' && (
        <Card className="border-white/10 bg-zinc-900/50 relative z-10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white font-black tracking-tight">
              Classificação dos Squads
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Média de pontos de cada equipe para estimular o trabalho coletivo.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {squadStandings.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Users className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-mono text-zinc-400">Nenhum Squad configurado nesta turma.</p>
                <Link href="/dashboard/squads">
                  <Button size="sm" variant="outline" className="mt-2 text-xs border-white/10 text-zinc-300">
                    Configurar Squads
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {squadStandings.map((squad, idx) => (
                  <div key={squad.squad_id || idx} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-zinc-400">{idx + 1}º</span>
                      <div>
                        <p className="text-sm font-bold text-white">{squad.squad_name}</p>
                        <p className="text-[11px] text-zinc-400">{squad.total_members} atletas</p>
                      </div>
                    </div>
                    <span className="text-base font-black font-mono text-white">
                      {Math.round(squad.squad_average_points || 0)} <span className="text-[10px] text-cyan-400">XP Médio</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CoachLeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
          <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Carregando ranking oficial...
        </div>
      }
    >
      <CoachLeaderboardContent />
    </Suspense>
  );
}
