'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Calendar, DollarSign, ArrowLeft, CheckCircle2, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function NewChallengePage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState('49.90');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      // Criar Desafio no Supabase
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          professional_id: user.id,
          title: title.trim(),
          start_date: startDate,
          end_date: endDate,
          price: parseFloat(price) || 0,
          is_active: true,
        })
        .select()
        .single();

      if (challengeError) throw challengeError;

      // Auto-provisionar as 4 semanas padrão do desafio para evitar tela de missões órfã
      try {
        const defaultWeeks = [
          { challenge_id: challenge.id, week_number: 1, title: 'Semana 1 • Sprint 1 (Ativação)', bonus_points: 20 },
          { challenge_id: challenge.id, week_number: 2, title: 'Semana 2 • Sprint 2 (Intensidade)', bonus_points: 20 },
          { challenge_id: challenge.id, week_number: 3, title: 'Semana 3 • Sprint 3 (Consistência)', bonus_points: 20 },
          { challenge_id: challenge.id, week_number: 4, title: 'Semana 4 • Sprint 4 (Sprint Final)', bonus_points: 20 },
        ];
        await supabase.from('challenge_weeks').insert(defaultWeeks);
      } catch (weekErr) {
        console.warn('Erro não bloqueante ao criar semanas padrão:', weekErr);
      }

      showToast('Desafio criado com sucesso! Abrindo gerenciador de missões...');
      // Redirecionar para adicionar as missões desse desafio
      setTimeout(() => {
        router.push(`/dashboard/missions?challengeId=${challenge.id}`);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar desafio.');
      setLoading(false);
    }
  };

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

      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Criar Novo Desafio Fitness</h1>
          <p className="text-xs text-zinc-400">Configure as datas, taxa de inscrição e regras gerais.</p>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle className="text-lg">Dados do Desafio</CardTitle>
          <CardDescription className="text-xs">
            Preencha os dados do programa de gamificação que seus alunos irão participar.
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
                placeholder="Ex: Desafio Seca 30 Dias - Turma Outubro"
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
                  Data de Encerramento
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Valor da Inscrição (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-zinc-500 font-bold text-sm">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-10"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Digite 0.00 para desafio gratuito entre seus alunos.
              </p>
            </div>

            {/* Checkout Placeholder / Informação Gateway */}
            <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/60 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white font-mono">Gateway de Pagamento Integrado</p>
                <p className="text-zinc-400 mt-0.5">
                  Ao publicar, os links de checkout automatizados ficam disponíveis para repasse direto na sua conta bancária.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/20 text-zinc-300 text-xs font-mono">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button type="button" variant="ghost" className="w-full sm:w-auto">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto font-mono">
                {loading ? 'Salvando...' : 'Criar e Definir Missões'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
