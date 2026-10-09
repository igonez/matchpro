'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Calendar, DollarSign, ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Carregando dados do desafio...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      {/* Toast Notificação */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-mono text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
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
            <h1 className="text-2xl font-black text-white">Editar Desafio</h1>
            <p className="text-xs text-zinc-400">Atualize título, datas, preço ou encerre a turma.</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setConfirmDeleteText('');
            setIsDeleteModalOpen(true);
          }}
          className="text-xs text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <Trash2 className="h-4 w-4 mr-1.5" /> Excluir Desafio
        </Button>
      </div>

      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-lg text-white font-black tracking-tight">Configurações Gerais</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Altere as informações do desafio visíveis para os alunos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
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
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
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
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
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
                <label className="text-xs font-semibold text-zinc-300 block mb-1 font-mono">
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
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Status da Turma
                </label>
                <select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                  className="w-full h-9 rounded-md bg-zinc-950 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-white/30"
                >
                  <option value="active">Em Andamento (Ativo)</option>
                  <option value="inactive">Encerrado</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/20 text-white font-mono text-xs">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" type="button" className="w-full text-xs border-white/10 text-zinc-400 hover:text-white">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 text-xs font-bold bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
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
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
      >
        <div className="space-y-3">
          <p className="text-xs text-zinc-300 font-mono">
            Para confirmar, digite <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">excluir</span> abaixo:
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
