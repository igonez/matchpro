'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Calendar, DollarSign, ArrowLeft, CheckCircle2, Trash2, Layers, Plus, ExternalLink, Dumbbell, Flame, Utensils, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

import { CustomDialog } from '@/components/ui/custom-dialog';

export default function EditChallengePage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const resolvedParams = use(params);
  const challengeId = resolvedParams.challengeId;

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal de Exclusão Segura
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadChallenge() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Você precisa estar logado para editar este desafio.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .eq('professional_id', user.id)
          .single();

        if (error || !data) {
          throw new Error('Desafio não encontrado ou você não tem permissão para editá-lo.');
        }

        setTitle(data.title || '');
        setStartDate(data.start_date || '');
        setEndDate(data.end_date || '');
        setPrice(data.price?.toString() || '0');
        setIsActive(data.is_active ?? true);

        // Carregar semanas da turma
        const { data: weeksData } = await supabase
          .from('challenge_weeks')
          .select('*')
          .eq('challenge_id', challengeId)
          .order('week_number', { ascending: true });

        setWeeks(weeksData || []);

        // Carregar missões da turma (diretas por challenge_id ou por week_id)
        const weekIds = (weeksData || []).map((w: any) => w.id);
        let mQuery = supabase.from('missions').select('*');
        if (weekIds.length > 0) {
          mQuery = mQuery.or(`challenge_id.eq.${challengeId},week_id.in.(${weekIds.join(',')})`);
        } else {
          mQuery = mQuery.eq('challenge_id', challengeId);
        }

        const { data: missionsData } = await mQuery
          .order('order_index', { ascending: true });

        setMissions(missionsData || []);
      } catch (err: any) {
        console.error('Erro ao buscar desafio:', err);
        setError(err.message || 'Não foi possível carregar os dados do desafio.');
      } finally {
        setLoading(false);
      }
    }

    if (challengeId) {
      loadChallenge();
    }
  }, [challengeId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const { error: updateError } = await supabase
        .from('challenges')
        .update({
          title,
          start_date: startDate,
          end_date: endDate,
          price: parseFloat(price) || 0,
          is_active: isActive,
        })
        .eq('id', challengeId)
        .eq('professional_id', user.id);

      if (updateError) throw updateError;

      showToast('Desafio atualizado com sucesso!');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err: any) {
      console.error('Erro ao atualizar desafio:', err);
      setError(err.message || 'Erro ao atualizar dados.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteText.trim().toLowerCase() !== 'excluir') {
      setError('Digite "excluir" para confirmar.');
      return;
    }

    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const { error: delError } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId)
        .eq('professional_id', user.id);

      if (delError) throw delError;

      setIsDeleteModalOpen(false);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Erro ao excluir: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#A7B0C0] text-xs font-mono">
        <div className="h-6 w-6 border-2 border-[#3478F6] border-t-transparent rounded-full animate-spin" />
        Carregando dados do desafio...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      {/* Toast Notificação */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-[#252D3B] bg-[#121722] shadow-2xl flex items-center gap-2.5 text-xs font-mono text-[#F4F6FA]">
            <span className="h-2 w-2 rounded-full bg-[#3478F6] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#F4F6FA]">Editar Desafio</h1>
            <p className="text-xs text-[#A7B0C0]">Atualize título, datas, preço ou encerre a turma.</p>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setConfirmDeleteText('');
            setIsDeleteModalOpen(true);
          }}
          className="text-xs"
        >
          <Trash2 className="h-4 w-4 mr-1.5" /> Excluir Desafio
        </Button>
      </div>

      <Card className="border-[#252D3B] bg-[#121722]">
        <CardHeader>
          <CardTitle className="text-lg text-[#F4F6FA] font-black tracking-tight">Configurações Gerais</CardTitle>
          <CardDescription className="text-xs text-[#A7B0C0]">
            Altere as informações do desafio visíveis para os alunos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#A7B0C0] block mb-1">
                Título do Desafio
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A7B0C0] block mb-1">
                  Data de Início
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A7B0C0] block mb-1">
                  Data de Término
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A7B0C0] block mb-1 font-mono">
                  Preço de Inscrição (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A7B0C0] block mb-1">
                  Status da Turma
                </label>
                <select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                  className="w-full h-11 rounded-xl bg-[#1B2330] border border-[#252D3B] text-[#F4F6FA] text-xs px-3 focus:outline-none focus:border-[#3478F6]"
                >
                  <option value="active">Em Andamento (Ativo)</option>
                  <option value="inactive">Encerrado</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-200 font-mono text-xs">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" type="button" className="w-full text-xs">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 text-xs font-bold"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Missões & Semanas Desta Turma */}
      <Card className="border-[#252D3B] bg-[#121722]">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg text-[#F4F6FA] font-black tracking-tight">
                Missões & Semanas da Turma
              </CardTitle>
              <Badge className="text-[10px] font-mono">
                {missions.length} {missions.length === 1 ? 'missão' : 'missões'}
              </Badge>
            </div>
            <CardDescription className="text-xs text-[#A7B0C0] mt-1">
              Missões salvas e ativas que aparecem para os alunos no aplicativo.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/dashboard/leaderboard?challengeId=${challengeId}`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Trophy className="h-3.5 w-3.5 mr-1 text-[#75A7FF]" />
                Ver Ranking
              </Button>
            </Link>
            <Link href={`/dashboard/missions?challengeId=${challengeId}`}>
              <Button
                type="button"
                size="sm"
                className="text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Gerenciar Missões
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {weeks.length === 0 && missions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#1B2330] border border-[#252D3B] text-center space-y-2">
              <p className="text-xs font-mono text-[#A7B0C0]">Nenhuma missão cadastrada nesta turma ainda.</p>
              <Link href={`/dashboard/missions?challengeId=${challengeId}`}>
                <Button size="sm" className="mt-2 text-xs font-bold">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Cadastrar Primeiras Missões
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {weeks.map((week) => {
                const weekMissions = missions.filter((m) => m.week_id === week.id);
                return (
                  <div
                    key={week.id}
                    className="p-4 rounded-2xl bg-[#1B2330]/55 border border-[#252D3B] space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#252D3B]">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#3478F6]" />
                        <h3 className="text-xs font-bold text-[#F4F6FA] uppercase tracking-wider font-mono">
                          {week.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#75A7FF] bg-[#3478F6]/15 px-2 py-0.5 rounded-full border border-[#3478F6]/30 font-bold">
                          +{week.bonus_points || 20} XP Bônus
                        </span>
                        <span className="text-[10px] font-mono text-[#A7B0C0] bg-[#121722] px-2 py-0.5 rounded-full border border-[#252D3B]">
                          {weekMissions.length} {weekMissions.length === 1 ? 'missão ativa' : 'missões ativas'}
                        </span>
                      </div>
                    </div>

                    {weekMissions.length === 0 ? (
                      <p className="text-[11px] text-[#A7B0C0] italic py-1">
                        Nenhuma missão cadastrada para esta semana.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {weekMissions.map((m) => (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-[#121722] border border-[#252D3B] flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[#F4F6FA] truncate">{m.title}</span>
                                {m.is_bonus && (
                                  <Badge className="text-[9px]">
                                    Bônus
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-[#A7B0C0] capitalize mt-0.5 font-mono">
                                {m.category || 'treino'} • {m.requires_cooldown ? '1x por dia' : 'Livre'}
                              </p>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#75A7FF] bg-[#3478F6]/15 px-2 py-0.5 rounded-lg border border-[#3478F6]/30 shrink-0">
                              +{m.points_rewarded}P
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Missões sem semana associada (se houver) */}
              {missions.filter((m) => !m.week_id).length > 0 && (
                <div className="p-4 rounded-2xl bg-[#1B2330]/55 border border-[#252D3B] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#252D3B]">
                    <h3 className="text-xs font-bold text-[#F4F6FA] uppercase tracking-wider font-mono">
                      Missões Gerais / Sem Semana
                    </h3>
                    <span className="text-[10px] font-mono text-[#A7B0C0]">
                      {missions.filter((m) => !m.week_id).length} missões
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {missions.filter((m) => !m.week_id).map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-[#121722] border border-[#252D3B] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-[#F4F6FA] truncate block">{m.title}</span>
                          <span className="text-[10px] text-[#A7B0C0] capitalize font-mono">{m.category}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#75A7FF] bg-[#3478F6]/15 px-2 py-0.5 rounded-lg border border-[#3478F6]/30">
                          +{m.points_rewarded}P
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Exclusão Segura */}
      <CustomDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Desafio"
        description={`Esta ação apagará permanentemente o desafio "${title}", além de todas as missões e histórico dos alunos associados.`}
        confirmLabel={deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
      >
        <div className="space-y-3">
          <p className="text-xs text-[#A7B0C0] font-mono">
            Para confirmar, digite <span className="font-bold text-[#F4F6FA] bg-[#1B2330] border border-[#252D3B] px-1.5 py-0.5 rounded">excluir</span> abaixo:
          </p>
          <Input
            value={confirmDeleteText}
            onChange={(e) => setConfirmDeleteText(e.target.value)}
            placeholder="Digite 'excluir' para confirmar"
            className="text-xs font-mono"
            autoFocus
          />
        </div>
      </CustomDialog>
    </div>
  );
}
