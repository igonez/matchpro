'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';

export default function LeaderboardPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'individual' | 'squads'>('individual');
  const [standings, setStandings] = useState<any[]>([]);
  const [squadStandings, setSquadStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);

  const fetchLeaderboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let currentChallenge = null;

      if (user) {
        const { data: participation } = await supabase
          .from('challenge_participants')
          .select('challenge_id, challenges(*)')
          .eq('student_id', user.id)
          .limit(1)
          .maybeSingle();

        if (participation?.challenges) {
          currentChallenge = participation.challenges as any;
        }
      }

      if (currentChallenge) {
        setActiveChallenge(currentChallenge);

        // A. Standings individuais
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

        // B. Standings de Squads
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

    const channel = supabase
      .channel('realtime_leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_standings',
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 max-w-md mx-auto w-full pb-28 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div className="flex items-center gap-2.5">
          <Link
            href="/app"
            className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            title="Voltar ao Início"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                RANKING OFICIAL
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-bold">
                AO VIVO
              </span>
            </div>
            <h1 className="text-xl font-black text-white">Classificação da Turma</h1>
            <p className="text-[11px] text-zinc-400">Pontuação computada por integridade de check-ins</p>
          </div>
        </div>
      </div>

      {/* Seletor: Individual vs Squads */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-black border border-white/[0.08] relative z-10">
        <button
          onClick={() => setActiveTab('individual')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'individual'
              ? 'bg-zinc-800 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Individual ({standings.length})
        </button>
        <button
          onClick={() => setActiveTab('squads')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'squads'
              ? 'bg-zinc-800 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Squads ({squadStandings.length})
        </button>
      </div>

      {/* PÓDIO 3D DOS TOP 3 COM CORES DE CONQUISTA */}
      {activeTab === 'individual' && standings.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-2 items-end relative z-10">
          {/* 2º Lugar - Prata Cromada */}
          <div className="mono-glass-card p-3 rounded-2xl text-center space-y-1.5 border-slate-400/20 bg-slate-950/40">
            <span className="text-xs text-slate-300 block font-bold flex items-center justify-center gap-1">
              🥈 2º Prata
            </span>
            <div className="h-11 w-11 mx-auto rounded-full bg-zinc-800 border-2 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.2)] flex items-center justify-center font-bold text-xs text-white overflow-hidden">
              {standings[1]?.students?.avatar_url ? (
                <img src={standings[1].students.avatar_url} alt="2º" className="w-full h-full object-cover" />
              ) : (
                standings[1]?.students?.full_name?.charAt(0) || '2'
              )}
            </div>
            <p className="text-xs font-bold text-white truncate">{standings[1]?.students?.full_name?.split(' ')[0]}</p>
            <p className="text-xs font-mono text-slate-300 font-bold">{standings[1]?.total_points} pts</p>
          </div>

          {/* 1º Lugar - Ouro Radiante */}
          <SpotlightCard3D className="p-4 rounded-3xl text-center space-y-2 -translate-y-2 border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-black to-black shadow-[0_0_35px_rgba(245,158,11,0.25)]">
            <span className="text-xs text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40 inline-flex items-center gap-1 font-bold">
              👑 1º Líder
            </span>
            <div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <div className="h-full w-full bg-black rounded-full flex items-center justify-center font-bold text-white text-sm overflow-hidden">
                {standings[0]?.students?.avatar_url ? (
                  <img src={standings[0].students.avatar_url} alt="1º" className="w-full h-full object-cover" />
                ) : (
                  standings[0]?.students?.full_name?.charAt(0) || '1'
                )}
              </div>
            </div>
            <p className="text-xs font-black text-white truncate">{standings[0]?.students?.full_name?.split(' ')[0]}</p>
            <p className="text-sm font-mono font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
              {standings[0]?.total_points} pts
            </p>
          </SpotlightCard3D>

          {/* 3º Lugar - Bronze Cobre */}
          <div className="mono-glass-card p-3 rounded-2xl text-center space-y-1.5 border-amber-700/20 bg-stone-950/40">
            <span className="text-xs text-amber-600 block font-bold flex items-center justify-center gap-1">
              🥉 3º Bronze
            </span>
            <div className="h-11 w-11 mx-auto rounded-full bg-zinc-900 border-2 border-amber-700/60 shadow-[0_0_15px_rgba(180,83,9,0.2)] flex items-center justify-center font-bold text-xs text-white overflow-hidden">
              {standings[2]?.students?.avatar_url ? (
                <img src={standings[2].students.avatar_url} alt="3º" className="w-full h-full object-cover" />
              ) : (
                standings[2]?.students?.full_name?.charAt(0) || '3'
              )}
            </div>
            <p className="text-xs font-bold text-white truncate">{standings[2]?.students?.full_name?.split(' ')[0]}</p>
            <p className="text-xs font-mono text-amber-600 font-bold">{standings[2]?.total_points} pts</p>
          </div>
        </div>
      )}

      {/* Lista Restante de Classificação */}
      <div className="space-y-2 relative z-10 pt-1">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            SINCRONIZANDO PLACAR...
          </div>
        ) : activeTab === 'individual' ? (
          standings.length === 0 ? (
            <div className="mono-glass-card p-8 rounded-3xl text-center text-xs font-mono text-zinc-500">
              Nenhuma pontuação computada ainda.
            </div>
          ) : (
            standings.slice(standings.length >= 3 ? 3 : 0).map((item, idx) => {
              const actualRank = (standings.length >= 3 ? 3 : 0) + idx + 1;
              return (
                <div
                  key={item.id}
                  className="mono-glass-card p-3.5 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-500 w-5 text-center">
                      #{String(actualRank).padStart(2, '0')}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white overflow-hidden">
                      {item.students?.avatar_url ? (
                        <img src={item.students.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        item.students?.full_name?.charAt(0) || 'A'
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.students?.full_name || 'Atleta'}</p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-white">
                    {item.total_points} PTS
                  </span>
                </div>
              );
            })
          )
        ) : (
          /* TAB DE SQUADS */
          squadStandings.length === 0 ? (
            <div className="mono-glass-card p-8 rounded-3xl text-center text-xs font-mono text-zinc-500">
              Nenhum esquadrão configurado no desafio ativo.
            </div>
          ) : (
            squadStandings.map((squad, index) => (
              <div
                key={squad.squad_id}
                className="mono-glass-card p-4 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-500 w-5 text-center font-bold">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{squad.squad_name}</h4>
                    <p className="text-[10px] font-mono text-zinc-500">
                      {squad.total_members ?? squad.member_count ?? 0} membros • Média: {Math.round(squad.squad_average_points)} pts
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-black text-white">
                    {squad.squad_total_points} PTS
                  </span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
