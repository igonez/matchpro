'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Trash2, Layers, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

function MissionsContent() {
  const searchParams = useSearchParams();
  const challengeIdParam = searchParams.get('challengeId');
  const supabase = createClient();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challengeIdParam || '');
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Carregar lista de desafios
  useEffect(() => {
    async function fetchChallenges() {
      const { data } = await supabase
        .from('challenges')
        .select('id, title')
        .order('start_date', { ascending: false });

      if (data && data.length > 0) {
        setChallenges(data);
        if (!selectedChallengeId) {
          setSelectedChallengeId(data[0].id);
        }
      }
      setLoading(false);
    }
    fetchChallenges();
  }, [supabase]);

  // 2. Carregar missões do desafio selecionado
  useEffect(() => {
    if (!selectedChallengeId) return;

    async function fetchMissions() {
      const { data } = await supabase
        .from('missions')
        .select('*')
        .eq('challenge_id', selectedChallengeId)
        .order('points_rewarded', { ascending: false });

      setMissions(data || []);
    }

    fetchMissions();
  }, [selectedChallengeId, supabase]);

  // Criar nova missão
  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const pointsNum = parseInt(points, 10);
      if (isNaN(pointsNum) || pointsNum <= 0) {
        throw new Error('A pontuação deve ser maior que zero.');
      }

      const { data, error: insertError } = await supabase
        .from('missions')
        .insert({
          challenge_id: selectedChallengeId,
          title,
          points_rewarded: pointsNum,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setMissions((prev) => [data, ...prev]);
      setTitle('');
      setPoints('10');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar missão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir missão
  const handleDeleteMission = async (id: string) => {
    const { error: delError } = await supabase.from('missions').delete().eq('id', id);
    if (!delError) {
      setMissions((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Gerenciamento de Missões</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastre os hábitos e metas diárias que seus alunos deverão cumprir e fotografar.
          </p>
        </div>

        {/* Seletor de Desafio */}
        {challenges.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">Desafio:</span>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Adição */}
        <Card className="border-zinc-800 bg-zinc-900/40 h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-400" />
              Nova Missão Diária
            </CardTitle>
            <CardDescription className="text-xs">
              Exemplos: Refeição Limpa, Treino do Dia, 3 Litros de Água.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMission} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nome da Missão
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Foto do Prato Colorido (Almoço)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Pontos Atribuídos
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="10"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  required
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Ao aprovar a foto, esses pontos vão direto para o Leaderboard.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting || !selectedChallengeId}>
                {isSubmitting ? 'Adicionando...' : 'Adicionar Missão'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabela / Lista de Missões */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Missões Ativas na Turma</CardTitle>
                <CardDescription className="text-xs">
                  Total de {missions.length} tarefas cadastradas para este desafio.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhuma missão cadastrada para este desafio. Adicione uma no formulário ao lado!
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/80">
                  {missions.map((mission) => (
                    <div
                      key={mission.id}
                      className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                          +{mission.points_rewarded}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-100">{mission.title}</p>
                          <p className="text-[11px] text-zinc-500">Exige envio de foto em tempo real</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] text-zinc-400">
                          {mission.points_rewarded} pts
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMission(mission.id)}
                          className="h-8 w-8 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MissionsPage() {
  return (
    <Suspense fallback={<div className="text-zinc-400 p-8">Carregando missões...</div>}>
      <MissionsContent />
    </Suspense>
  );
}
