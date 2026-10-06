'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Flame, ArrowUpRight, Sparkles, RefreshCw, Users, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function LeaderboardPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'individual' | 'squads'>('individual');
  const [standings, setStandings] = useState<any[]>([]);
  const [squadStandings, setSquadStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);

  // 1. Carregar Leaderboard e Desafio
  const fetchLeaderboard = async () => {
    try {
      // Pega o desafio ativo mais recente
      const { data: challenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false })
        .limit(1);

      if (challenges && challenges.length > 0) {
        const currentChallenge = challenges[0];
        setActiveChallenge(currentChallenge);

        // A. Pega os standings individuais
        const { data: standingsData } = await supabase
          .from('leaderboard_standings')
          .select(`
            id,
            total_points,
            challenge_id,
            student_id,
            students (
              full_name,
              avatar_url
            )
          `)
          .eq('challenge_id', currentChallenge.id)
          .order('total_points', { ascending: false });

        setStandings(standingsData || []);

        // B. Pega os standings de Squads (Micro-equipes)
        const { data: squadsData } = await supabase
          .from('squad_standings')
          .select('*')
          .eq('challenge_id', currentChallenge.id)
          .order('squad_average_points', { ascending: false });

        setSquadStandings(squadsData || []);
      }
    } catch (err) {
      console.error('Erro ao buscar leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // 2. Realtime Subscription via WebSockets no Supabase
    const channel = supabase
      .channel('realtime_leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_standings',
        },
        (payload: any) => {
          console.log('Realtime Leaderboard update recebido:', payload);
          // Recarrega standings instantaneamente quando houver alteração
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Cores e Ícones do Pódio
  const getPodiumBadge = (rank: number) => {
    if (rank === 0) {
      return (
        <div className="h-8 w-8 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-black text-sm">
          <Crown className="h-4 w-4" />
        </div>
      );
    }
    if (rank === 1) {
      return (
        <div className="h-8 w-8 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/40 flex items-center justify-center font-black text-sm">
          2
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="h-8 w-8 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center font-black text-sm">
          3
        </div>
      );
    }
    return (
      <div className="h-8 w-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-xs">
        {rank + 1}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Top Header */}
      <header className="p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white leading-tight">Ranking da Turma</h1>
            <p className="text-[11px] text-zinc-400">Atualizado ao vivo via Realtime</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          Ao Vivo
        </div>
      </header>

      {/* Info do Desafio Atual */}
      <div className="p-4">
        <div className="rounded-2xl bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-950 border border-amber-500/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
              Desafio Ativo
            </span>
            <Badge variant="outline" className="text-[10px] text-zinc-300">
              {standings.length} Competidores
            </Badge>
          </div>
          <h2 className="text-base font-black text-white mt-1">
            {activeChallenge?.title || 'Desafio Fitness Oficial'}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Acompanhe a disputa individual ou a média de consistência das equipes.
          </p>
        </div>

        {/* ⚔️ SELETOR DE ABAS: INDIVIDUAL VS SQUADS */}
        <div className="grid grid-cols-2 gap-2 mt-3 p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <button
            onClick={() => setActiveTab('individual')}
            className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'individual'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" /> Individual
          </button>
          <button
            onClick={() => setActiveTab('squads')}
            className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'squads'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Squads ({squadStandings.length})
          </button>
        </div>
      </div>

      {/* Lista de Classificação */}
      <div className="p-4 pt-0 space-y-2 flex-1">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
            <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            Carregando pontuações...
          </div>
        ) : activeTab === 'individual' ? (
          /* RANKING INDIVIDUAL */
          standings.length === 0 ? (
            <Card className="border-dashed border-zinc-800 p-8 text-center bg-zinc-900/30">
              <Trophy className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
              <p className="font-semibold text-xs text-zinc-300">Nenhum ponto computado ainda</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                As primeiras missões aprovadas aparecerão aqui no ranking!
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {standings.map((item, index) => {
                const isFirst = index === 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isFirst
                        ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-950/20'
                        : 'bg-zinc-900/40 border-zinc-850 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getPodiumBadge(index)}
                      <div>
                        <p className={`font-black text-sm ${isFirst ? 'text-amber-300' : 'text-white'}`}>
                          {item.students?.full_name || 'Aluno Anônimo'}
                        </p>
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                          {isFirst ? 'Líder do Desafio 🔥' : `Posição #${index + 1}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-base text-emerald-400">
                        {item.total_points}
                        <span className="text-[11px] font-semibold text-zinc-500 ml-1">pts</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* RANKING DE SQUADS / MICRO-EQUIPES */
          squadStandings.length === 0 ? (
            <Card className="border-dashed border-zinc-800 p-8 text-center bg-zinc-900/30">
              <Users className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
              <p className="font-semibold text-xs text-zinc-300">Nenhum Squad formado ainda</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                O treinador dividirá a turma em micro-equipes para a guerra de tribos!
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {squadStandings.map((squad, index) => {
                const isLeader = index === 0;
                return (
                  <div
                    key={squad.squad_id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isLeader
                        ? 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                        : 'bg-zinc-900/40 border-zinc-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          isLeader
                            ? 'bg-emerald-500 text-black shadow-md'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-white">{squad.squad_name}</h3>
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {squad.total_members} atletas
                            </span>
                          </div>
                          {squad.motto && (
                            <p className="text-[10px] text-zinc-400 italic mt-0.5">"{squad.motto}"</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-bold uppercase text-zinc-400 block">Média do Time</span>
                        <div className="font-black text-base text-emerald-400">
                          {squad.squad_average_points || 0}
                          <span className="text-[10px] font-semibold text-zinc-500 ml-1">pts/membro</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
