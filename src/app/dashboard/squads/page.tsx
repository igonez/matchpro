'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  UserPlus, 
  Trophy, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function SquadsManagerPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [squads, setSquads] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);

  // Form states para novo squad
  const [squadName, setSquadName] = useState('');
  const [squadMotto, setSquadMotto] = useState('');
  const [squadColor, setSquadColor] = useState('emerald');
  const [creating, setCreating] = useState(false);

  // Vincular aluno a squad
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignSquadId, setAssignSquadId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Desafios do treinador
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('id, title')
        .order('created_at', { ascending: false });

      const safeCh = challengesData || [];
      setChallenges(safeCh);

      const targetChId = selectedChallengeId || (safeCh.length > 0 ? safeCh[0].id : '');
      if (!selectedChallengeId && targetChId) {
        setSelectedChallengeId(targetChId);
      }

      if (targetChId) {
        // 2. Buscar Squads do desafio selecionado
        const { data: squadsData } = await supabase
          .from('challenge_squads')
          .select('*, squad_members(*, students(full_name))')
          .eq('challenge_id', targetChId)
          .order('created_at', { ascending: false });

        setSquads(squadsData || []);

        // 3. Buscar Participantes do desafio
        const { data: parts } = await supabase
          .from('challenge_participants')
          .select('student_id, students(id, full_name)')
          .eq('challenge_id', targetChId);

        setParticipants(parts || []);
      }
    } catch (err) {
      console.error('Erro ao carregar Squads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedChallengeId]);

  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadName.trim() || !selectedChallengeId) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('challenge_squads')
        .insert({
          challenge_id: selectedChallengeId,
          name: squadName,
          motto: squadMotto,
          color_theme: squadColor,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSquads([{ ...data, squad_members: [] }, ...squads]);
        setSquadName('');
        setSquadMotto('');
      }
    } catch (err) {
      console.error('Erro ao criar Squad:', err);
      alert('Não foi possível criar a equipe.');
    } finally {
      setCreating(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!assignStudentId || !assignSquadId || !selectedChallengeId) return;
    try {
      const { error } = await supabase
        .from('squad_members')
        .upsert(
          {
            squad_id: assignSquadId,
            student_id: assignStudentId,
            challenge_id: selectedChallengeId,
          },
          { onConflict: 'student_id, challenge_id' }
        );

      if (error) throw error;

      alert('Aluno alocado no Squad com sucesso!');
      loadData();
    } catch (err) {
      console.error('Erro ao alocar aluno:', err);
      alert('Não foi possível alocar o aluno no Squad.');
    }
  };

  const handleDeleteSquad = async (id: string) => {
    if (!confirm('Deseja excluir este Squad? Os alunos ficarão sem equipe.')) return;
    try {
      await supabase.from('challenge_squads').delete().eq('id', id);
      setSquads(squads.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Erro ao excluir Squad:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black tracking-wider uppercase text-[10px]">
            Guerra de Tribos & Retenção 70%+
          </Badge>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Users className="h-8 w-8 text-emerald-400" />
          Squads & Micro-equipes
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          Divida a turma em equipes de 3 a 5 alunos. Ao invés de desistirem por estarem longe do 1º lugar individual, eles continuam treinando para não decepcionar seus colegas de Squad!
        </p>
      </div>

      {/* Seletor de Desafio */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Desafio Selecionado:
        </label>
        <select
          value={selectedChallengeId}
          onChange={(e) => setSelectedChallengeId(e.target.value)}
          className="h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs px-3 focus:outline-none focus:border-emerald-500"
        >
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Criação e Alocação */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card 1: Criar Squad */}
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" /> Criar Novo Squad
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Dê um nome marcante para o time da turma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSquad} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Nome da Equipe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Squad Espartanos / Team Foco Total"
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Lema / Grito de Guerra</label>
                  <input
                    type="text"
                    placeholder="Ex: Ninguém fica para trás!"
                    value={squadMotto}
                    onChange={(e) => setSquadMotto(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={creating}
                  className="w-full h-10 font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                >
                  {creating ? 'Criando Equipe...' : 'Criar Squad'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Card 2: Alocar Aluno ao Squad */}
          {squads.length > 0 && (
            <Card className="border-zinc-800 bg-zinc-900/40">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-cyan-400" /> Alocar Aluno no Squad
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Distribua os alunos entre as equipes formadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Selecionar Aluno</label>
                  <select
                    value={assignStudentId}
                    onChange={(e) => setAssignStudentId(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Escolha um aluno cadastrado...</option>
                    {participants.map((p) => (
                      <option key={p.student_id} value={p.student_id}>
                        {p.students?.full_name || 'Aluno'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Designar para Squad</label>
                  <select
                    value={assignSquadId}
                    onChange={(e) => setAssignSquadId(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Escolha o Squad destino...</option>
                    {squads.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  onClick={handleAssignStudent}
                  disabled={!assignStudentId || !assignSquadId}
                  className="w-full h-10 font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20"
                >
                  Confirmar Alocação
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lista de Squads Formados */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              Equipes Cadastradas ({squads.length})
            </h2>
            <span className="text-xs text-zinc-500">Média de pontos calculada dinamicamente</span>
          </div>

          {squads.length === 0 && !loading ? (
            <Card className="border-dashed border-zinc-800 p-8 text-center bg-zinc-900/20">
              <Users className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
              <p className="font-semibold text-zinc-300">Nenhum Squad criado neste desafio</p>
              <p className="text-xs text-zinc-500 mt-1">
                Crie o primeiro Squad ao lado para ativar a guerra de times.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {squads.map((squad) => (
                <Card
                  key={squad.id}
                  className="border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-black">
                        {squad.squad_members?.length || 0} Membros
                      </Badge>
                      <button
                        onClick={() => handleDeleteSquad(squad.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                        title="Excluir Squad"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <CardTitle className="text-base font-black text-white">
                      {squad.name}
                    </CardTitle>

                    {squad.motto && (
                      <CardDescription className="text-xs text-zinc-400 italic">
                        "{squad.motto}"
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0 border-t border-zinc-850 py-3">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1.5">
                      Integrantes do Time:
                    </span>
                    {squad.squad_members?.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">Nenhum aluno alocado ainda.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {squad.squad_members?.map((m: any) => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded-lg bg-zinc-950 text-zinc-300 border border-zinc-800 text-[11px] font-medium"
                          >
                            {m.students?.full_name || 'Aluno'}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
