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
import { CustomDialog } from '@/components/ui/custom-dialog';
import { FeatureGate } from '@/components/ui/feature-gate';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SquadsManagerPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [coachPlan, setCoachPlan] = useState<string>('starter');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [squads, setSquads] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);

  // Form states para novo squad
  const [squadName, setSquadName] = useState('');
  const [squadMotto, setSquadMotto] = useState('');
  const [squadColor, setSquadColor] = useState('zinc');
  const [creating, setCreating] = useState(false);

  // Vincular aluno a squad
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignSquadId, setAssignSquadId] = useState('');

  // Modais Customizados & Feedback
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 0. Carregar plano do treinador
      const { data: profData } = await supabase
        .from('professionals')
        .select('plan_tier')
        .eq('id', user.id)
        .single();

      if (profData?.plan_tier) {
        setCoachPlan(profData.plan_tier);
      }

      // 1. Desafios exclusivos do treinador logado (Isolamento Multi-Tenant)
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('id, title, is_active, start_date')
        .eq('professional_id', user.id)
        .order('is_active', { ascending: false })
        .order('start_date', { ascending: false });

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
    if (!selectedChallengeId) {
      showToast('Selecione uma turma antes de criar um Squad.');
      return;
    }
    if (!squadName.trim()) {
      showToast('Digite o nome da equipe.');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('challenge_squads')
        .insert({
          challenge_id: selectedChallengeId,
          name: squadName.trim(),
          motto: squadMotto.trim() || null,
          color_theme: squadColor,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSquads([{ ...data, squad_members: [] }, ...squads]);
        setSquadName('');
        setSquadMotto('');
        showToast('Squad criado com sucesso!');
      }
    } catch (err: any) {
      console.error('Erro ao criar Squad:', err);
      showToast('Não foi possível criar a equipe: ' + (err.message || 'Erro no banco.'));
    } finally {
      setCreating(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!assignStudentId || !assignSquadId || !selectedChallengeId) {
      showToast('Selecione o aluno e o Squad de destino.');
      return;
    }
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

      showToast('Aluno alocado no Squad com sucesso!');
      loadData();
    } catch (err: any) {
      console.error('Erro ao alocar aluno:', err);
      showToast('Não foi possível alocar o aluno: ' + (err.message || 'Erro no banco.'));
    }
  };

  const handleConfirmDeleteSquad = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('challenge_squads').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setSquads(squads.filter((s) => s.id !== deleteTarget.id));
      showToast(`Squad "${deleteTarget.name}" excluído.`);
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Erro ao excluir Squad:', err);
      showToast('Erro ao excluir Squad: ' + (err.message || 'Falha no banco.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <FeatureGate
      currentTier={coachPlan}
      requiredTier="pro"
      featureName="Guerra de Tribos & Squads"
      featureDescription="A divisão em micro-equipes aumenta a taxa de retenção dos alunos em mais de 40%, evitando desistências e gerando competição saudável."
      benefits={[
        'Criação de equipes ilimitadas por desafio',
        'Cálculo automático de pontuação média do grupo',
        'Redistribuição dinâmica de alunos e capitães',
        'Taxa ZERO (0%) da plataforma (100% do lucro dos desafios é seu)'
      ]}
    >
      <div className="space-y-8">
        {/* Top Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-[#D4D4D8] bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/10">
              Guerra de Tribos & Retenção
            </span>
            <span className="text-xs text-[#A1A1AA] font-medium">Competição Coletiva</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FAFAFA] tracking-tight flex items-center gap-3">
            <Users className="h-7 w-7 sm:h-8 sm:w-8 text-[#3478F6] shrink-0" />
            Squads & Micro-equipes
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5 max-w-2xl leading-relaxed">
            Divida a turma em equipes de 3 a 5 alunos. Ao invés de desistirem por estarem longe do 1º lugar individual, eles continuam treinando para manter o ritmo coletivo do seu Squad.
          </p>
        </div>

      {/* Seletor de Desafio */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <label className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">
          Desafio Selecionado:
        </label>
        <select
          value={selectedChallengeId}
          onChange={(e) => setSelectedChallengeId(e.target.value)}
          className="h-10 w-full sm:w-auto rounded-xl bg-[#18181B] border border-[#27272A] text-[#FAFAFA] text-xs px-3 focus:outline-none focus:border-[#3478F6] font-mono"
        >
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {challenges.length === 0 && !loading && (
        <div className="p-6 rounded-2xl bg-[#0E0E10] border border-[#27272A] text-center space-y-2.5">
          <p className="text-sm font-bold text-[#FAFAFA] font-mono">NENHUMA TURMA ATIVA ENCONTRADA</p>
          <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
            Você precisa criar uma turma antes de poder formar Squads e dividir seus alunos em equipes.
          </p>
          <Link href="/dashboard/challenges/new">
            <Button size="sm" className="rounded-xl px-4 py-2 text-xs font-mono font-bold mt-2">
              + Criar Primeiro Desafio
            </Button>
          </Link>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${challenges.length === 0 && !loading ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        {/* Formulário de Criação e Alocação */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card 1: Criar Squad */}
          <Card className="border-[#27272A] bg-[#0E0E10]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#FAFAFA] flex items-center gap-2 tracking-tight">
                <Plus className="h-4 w-4 text-[#3478F6]" /> Criar Novo Squad
              </CardTitle>
              <CardDescription className="text-xs text-[#A1A1AA]">
                Dê um nome marcante para o time da turma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSquad} className="space-y-4 text-xs">
                <div>
                  <label className="text-[#A1A1AA] font-bold block mb-1">Nome da Equipe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Squad Espartanos / Team Foco Total"
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#18181B] border border-[#27272A] text-[#FAFAFA] placeholder:text-[#A1A1AA]/60 px-3 focus:outline-none focus:border-[#3478F6]"
                  />
                </div>

                <div>
                  <label className="text-[#A1A1AA] font-bold block mb-1">Lema / Grito de Guerra</label>
                  <input
                    type="text"
                    placeholder="Ex: Ninguém fica para trás"
                    value={squadMotto}
                    onChange={(e) => setSquadMotto(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#18181B] border border-[#27272A] text-[#FAFAFA] placeholder:text-[#A1A1AA]/60 px-3 focus:outline-none focus:border-[#3478F6]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={creating}
                  className="w-full h-10 font-bold font-mono"
                >
                  {creating ? 'Criando Equipe...' : 'Criar Squad'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Card 2: Alocar Aluno ao Squad */}
          {squads.length > 0 && (
            <Card className="border-[#27272A] bg-[#0E0E10]">
              <CardHeader>
                <CardTitle className="text-base font-bold text-[#FAFAFA] flex items-center gap-2 tracking-tight">
                  <UserPlus className="h-4 w-4 text-[#3478F6]" /> Alocar Aluno no Squad
                </CardTitle>
                <CardDescription className="text-xs text-[#A1A1AA]">
                  Distribua os alunos entre as equipes formadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <label className="text-[#A1A1AA] font-bold block mb-1">Selecionar Aluno</label>
                  <select
                    value={assignStudentId}
                    onChange={(e) => setAssignStudentId(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#18181B] border border-[#27272A] text-[#FAFAFA] px-3 focus:outline-none focus:border-[#3478F6]"
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
                  <label className="text-[#A1A1AA] font-bold block mb-1">Designar para Squad</label>
                  <select
                    value={assignSquadId}
                    onChange={(e) => setAssignSquadId(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#18181B] border border-[#27272A] text-[#FAFAFA] px-3 focus:outline-none focus:border-[#3478F6]"
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
                  className="w-full h-10 font-bold font-mono"
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
            <h2 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2 tracking-tight">
              <Shield className="h-5 w-5 text-[#3478F6]" />
              Equipes Cadastradas ({squads.length})
            </h2>
            <span className="text-xs text-[#A1A1AA] font-mono">Média de pontos calculada dinamicamente</span>
          </div>

          {squads.length === 0 && !loading ? (
            <Card className="border-dashed border-[#27272A] p-8 text-center bg-[#0E0E10]">
              <Users className="h-10 w-10 mx-auto text-[#D4D4D8] mb-2 opacity-75" />
              <p className="font-semibold text-[#FAFAFA]">Nenhum Squad criado neste desafio</p>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Crie o primeiro Squad ao lado para ativar a guerra de times.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {squads.map((squad) => (
                <Card
                  key={squad.id}
                  className="border-[#27272A] bg-[#0E0E10] hover:border-[#3478F6]/40 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className="font-black font-mono text-[10px]">
                        {squad.squad_members?.length || 0} Membros
                      </Badge>
                      <button
                        onClick={() => setDeleteTarget({ id: squad.id, name: squad.name })}
                        className="text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors p-1"
                        title="Excluir Squad"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <CardTitle className="text-base font-black text-[#FAFAFA]">
                      {squad.name}
                    </CardTitle>

                    {squad.motto && (
                      <CardDescription className="text-xs text-[#A1A1AA] italic">
                        "{squad.motto}"
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0 border-t border-[#27272A] py-3">
                    <span className="text-[10px] font-bold uppercase text-[#A1A1AA] block mb-1.5 font-mono">
                      Integrantes do Time:
                    </span>
                    {squad.squad_members?.length === 0 ? (
                      <p className="text-xs text-[#A1A1AA] italic">Nenhum aluno alocado ainda.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {squad.squad_members?.map((m: any) => (
                          <span
                            key={m.id}
                            className="px-2.5 py-0.5 rounded-lg bg-[#18181B] text-[#FAFAFA] border border-[#27272A] text-[11px] font-medium"
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

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-[#27272A] bg-[#0E0E10] shadow-2xl flex items-center gap-2.5 text-xs font-mono text-[#FAFAFA]">
            <span className="h-2 w-2 rounded-full bg-[#3478F6] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modal Customizado de Exclusão de Squad */}
      <CustomDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir Squad da Turma"
        description={`Tem certeza de que deseja excluir o squad "${deleteTarget?.name}"? Os alunos ficarão sem equipe até serem redistribuídos.`}
        confirmLabel={deleting ? 'Removendo...' : 'Sim, Excluir Squad'}
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDeleteSquad}
        isLoading={deleting}
      />
    </div>
  </FeatureGate>
  );
}
