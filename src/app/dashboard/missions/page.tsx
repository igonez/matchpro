'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Layers, 
  Award, 
  Sparkles, 
  Dumbbell, 
  Flame, 
  Utensils, 
  Droplet, 
  Gift, 
  Copy,
  ChevronRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

function PlannerContent() {
  const searchParams = useSearchParams();
  const challengeIdParam = searchParams.get('challengeId');
  const supabase = createClient();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challengeIdParam || '');
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Nova Semana
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekBonus, setNewWeekBonus] = useState('50');
  const [creatingWeek, setCreatingWeek] = useState(false);

  // Estados de Nova Missão na Semana
  const [missionTitle, setMissionTitle] = useState('');
  const [category, setCategory] = useState<'treino' | 'cardio' | 'refeicao' | 'habito' | 'outro'>('treino');
  const [points, setPoints] = useState('10');
  const [frequency, setFrequency] = useState('1');
  const [creatingMission, setCreatingMission] = useState(false);

  // 1. Carregar lista de desafios
  useEffect(() => {
    async function fetchChallenges() {
      const { data } = await supabase
        .from('challenges')
        .select('id, title, start_date, end_date')
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

  // 2. Carregar semanas do desafio selecionado
  const fetchWeeks = async (challengeId: string) => {
    const { data } = await supabase
      .from('challenge_weeks')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('week_number', { ascending: true });

    setWeeks(data || []);
    if (data && data.length > 0) {
      setSelectedWeekId(data[0].id);
    } else {
      setSelectedWeekId('');
      setMissions([]);
    }
  };

  useEffect(() => {
    if (selectedChallengeId) {
      fetchWeeks(selectedChallengeId);
    }
  }, [selectedChallengeId]);

  // 3. Carregar missões da semana selecionada
  const fetchMissions = async (weekId: string) => {
    if (!weekId) return;
    const { data } = await supabase
      .from('missions')
      .select('*')
      .eq('week_id', weekId)
      .order('points_rewarded', { ascending: false });

    setMissions(data || []);
  };

  useEffect(() => {
    if (selectedWeekId) {
      fetchMissions(selectedWeekId);
    }
  }, [selectedWeekId]);

  // Criar Nova Semana
  const handleCreateWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId) return;

    setCreatingWeek(true);
    const nextWeekNumber = weeks.length + 1;

    try {
      const { data, error } = await supabase
        .from('challenge_weeks')
        .insert({
          challenge_id: selectedChallengeId,
          week_number: nextWeekNumber,
          title: newWeekTitle || `Semana ${nextWeekNumber}`,
          bonus_points: parseInt(newWeekBonus, 10) || 0,
        })
        .select()
        .single();

      if (error) throw error;

      setWeeks((prev) => [...prev, data]);
      setSelectedWeekId(data.id);
      setNewWeekTitle('');
    } catch (err: any) {
      alert('Erro ao criar semana: ' + err.message);
    } finally {
      setCreatingWeek(false);
    }
  };

  // Gerar automaticamente as 4 Semanas de um desafio de 30 dias
  const handleAutoGenerate4Weeks = async () => {
    if (!selectedChallengeId) return;
    setCreatingWeek(true);

    try {
      const weeksToInsert = [
        { challenge_id: selectedChallengeId, week_number: 1, title: 'Semana 1: Adaptação & Hábitos', bonus_points: 50 },
        { challenge_id: selectedChallengeId, week_number: 2, title: 'Semana 2: Intensidade Máxima', bonus_points: 50 },
        { challenge_id: selectedChallengeId, week_number: 3, title: 'Semana 3: Foco & Disciplina', bonus_points: 75 },
        { challenge_id: selectedChallengeId, week_number: 4, title: 'Semana 4: Sprint Final', bonus_points: 100 },
      ];

      const { data, error } = await supabase
        .from('challenge_weeks')
        .insert(weeksToInsert)
        .select();

      if (error) throw error;

      setWeeks(data || []);
      if (data && data.length > 0) {
        setSelectedWeekId(data[0].id);
      }
    } catch (err: any) {
      alert('Erro ao gerar semanas: ' + err.message);
    } finally {
      setCreatingWeek(false);
    }
  };

  // Criar Missão dentro da Semana Selecionada
  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !selectedWeekId) return;

    setCreatingMission(true);
    try {
      const { data, error } = await supabase
        .from('missions')
        .insert({
          challenge_id: selectedChallengeId,
          week_id: selectedWeekId,
          title: missionTitle,
          category,
          points_rewarded: parseInt(points, 10) || 10,
          target_frequency: parseInt(frequency, 10) || 1,
        })
        .select()
        .single();

      if (error) throw error;

      setMissions((prev) => [data, ...prev]);
      setMissionTitle('');
    } catch (err: any) {
      alert('Erro ao cadastrar missão: ' + err.message);
    } finally {
      setCreatingMission(false);
    }
  };

  // Ícones e cores por categoria
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'treino':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 flex items-center gap-1">
            <Dumbbell className="h-3 w-3" /> Treino
          </Badge>
        );
      case 'cardio':
        return (
          <Badge className="bg-orange-500/15 text-orange-300 border-orange-500/30 flex items-center gap-1">
            <Flame className="h-3 w-3" /> Cardio
          </Badge>
        );
      case 'refeicao':
        return (
          <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 flex items-center gap-1">
            <Utensils className="h-3 w-3" /> Refeição
          </Badge>
        );
      case 'habito':
        return (
          <Badge className="bg-sky-500/15 text-sky-300 border-sky-500/30 flex items-center gap-1">
            <Droplet className="h-3 w-3" /> Hábito/Água
          </Badge>
        );
      default:
        return <Badge variant="outline">Outro</Badge>;
    }
  };

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Planejador Semanal de Desafio
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Organize o desafio em sprints semanais (Treinos, Cardios, Refeições) com bônus de consistência.
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

      {/* Abas das Semanas (Weeks Carousel / Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {weeks.map((week) => {
          const isSelected = week.id === selectedWeekId;
          return (
            <button
              key={week.id}
              onClick={() => setSelectedWeekId(week.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-extrabold whitespace-nowrap transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-950/30'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span>{week.title}</span>
              {week.bonus_points > 0 && (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                  +{week.bonus_points} bônus
                </span>
              )}
            </button>
          );
        })}

        {/* Botão de Adicionar Semana ou Gerar 4 Semanas */}
        {weeks.length === 0 ? (
          <Button
            size="sm"
            onClick={handleAutoGenerate4Weeks}
            disabled={creatingWeek}
            className="rounded-2xl h-10 px-4 text-xs font-extrabold shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Gerar Estrutura de 4 Semanas (30 Dias)
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const num = weeks.length + 1;
              setNewWeekTitle(`Semana ${num}`);
              const fakeEvent = { preventDefault: () => {} } as any;
              handleCreateWeek(fakeEvent);
            }}
            disabled={creatingWeek}
            className="rounded-2xl h-10 px-3 text-xs text-zinc-400 border-dashed"
          >
            <Plus className="h-4 w-4 mr-1" /> Nova Semana
          </Button>
        )}
      </div>

      {/* Conteúdo da Semana Ativa */}
      {selectedWeek && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário: Adicionar Missão na Semana */}
          <Card className="border-zinc-800 bg-zinc-900/40 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" />
                Nova Missão na {selectedWeek.title}
              </CardTitle>
              <CardDescription className="text-xs">
                Configure as metas específicas desta fase do desafio.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateMission} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Categoria da Missão
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="treino">🏋️ Treino de Força / Musculação</option>
                    <option value="cardio">🏃 Cardio / Corrida / Bike</option>
                    <option value="refeicao">🥗 Refeição Limpa (Almoço, Jantar, etc.)</option>
                    <option value="habito">💧 Hábito Diário (Água, Sono, Suplemento)</option>
                    <option value="outro">⭐ Outro Desafio Específico</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Título da Missão
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Treino 1 (Superiores + Abdômen)"
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Pontos por Foto
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Meta na Semana
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qtd vezes"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Banner de Bônus da Semana */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 mb-0.5">
                    <Gift className="h-4 w-4" /> Bônus de Fechamento da Semana
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Ao cumprir todas as missões desta semana, o aluno recebe automaticamente{' '}
                    <strong className="text-emerald-300">+{selectedWeek.bonus_points} pontos</strong> de bônus!
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={creatingMission}>
                  {creatingMission ? 'Adicionando...' : 'Adicionar à Semana'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Missões da Semana */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-zinc-800 bg-zinc-900/40">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    Metas Planejadas: {selectedWeek.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {missions.length} tarefas cadastradas para esta fase.
                  </CardDescription>
                </div>

                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-extrabold text-xs">
                  Bônus: +{selectedWeek.bonus_points} pts
                </Badge>
              </CardHeader>

              <CardContent>
                {missions.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">
                    <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Nenhuma missão cadastrada nesta semana ainda. Adicione ao lado treinos, cardios ou refeições!
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800/80">
                    {missions.map((mission) => (
                      <div
                        key={mission.id}
                        className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                            +{mission.points_rewarded}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-bold text-sm text-zinc-100">{mission.title}</p>
                              {getCategoryBadge(mission.category)}
                            </div>
                            <p className="text-[11px] text-zinc-500">
                              Meta: {mission.target_frequency || 1}x nesta semana • Comprovação por foto
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] text-zinc-400">
                            {mission.points_rewarded} pts
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              await supabase.from('missions').delete().eq('id', mission.id);
                              setMissions((prev) => prev.filter((m) => m.id !== mission.id));
                            }}
                            className="h-8 w-8 text-zinc-500 hover:text-rose-400"
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
      )}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="text-zinc-400 p-8">Carregando planejador...</div>}>
      <PlannerContent />
    </Suspense>
  );
}
