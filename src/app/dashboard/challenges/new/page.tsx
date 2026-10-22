'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Calendar, DollarSign, ArrowLeft, CheckCircle2, CreditCard, AlertTriangle, ExternalLink } from 'lucide-react';
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
  const [weeklyBonusPoints, setWeeklyBonusPoints] = useState('20');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasWalletId, setHasWalletId] = useState<boolean | null>(null);
  const [checkingWallet, setCheckingWallet] = useState(true);

  useEffect(() => {
    async function checkCoachWallet() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: coachData } = await supabase
          .from('professionals')
          .select('asaas_wallet_id, asaas_pix_key')
          .eq('id', user.id)
          .single();

        setHasWalletId(!!(coachData?.asaas_wallet_id || coachData?.asaas_pix_key));
      } catch (err) {
        console.warn('Erro ao verificar carteira do coach:', err);
      } finally {
        setCheckingWallet(false);
      }
    }

    checkCoachWallet();
  }, [supabase]);

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

      // 0. Validar Limites do Plano do Coach (Multi-Tier SaaS) & Subconta para Split
      const { data: coachData } = await supabase
        .from('professionals')
        .select('plan_tier, asaas_wallet_id, asaas_pix_key')
        .eq('id', user.id)
        .single();

      const parsedPrice = parseFloat(price) || 0;
      if (parsedPrice > 0 && !coachData?.asaas_wallet_id && !coachData?.asaas_pix_key) {
        throw new Error(
          'Para criar um desafio pago com Split automático, você precisa primeiro configurar seus dados de recebimento na Central Financeira.'
        );
      }

      const { count: activeChallengesCount } = await supabase
        .from('challenges')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', user.id)
        .eq('is_active', true);

      const currentTier = (coachData?.plan_tier as any) || 'starter';
      const maxAllowed = currentTier === 'starter' ? 1 : currentTier === 'pro' ? 5 : 9999;

      if ((activeChallengesCount || 0) >= maxAllowed) {
        throw new Error(
          `Você atingiu o limite de ${maxAllowed} desafio(s) ativo(s) do seu plano atual (${currentTier.toUpperCase()}). Faça upgrade na Central Financeira para criar novas turmas.`
        );
      }

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

      // Auto-provisionar as 4 semanas padrão e todas as missões ativas do desafio
      try {
        const bonusVal = Math.max(0, parseInt(weeklyBonusPoints, 10) || 20);
        const defaultWeeks = [
          { challenge_id: challenge.id, week_number: 1, title: 'Semana 1 • Sprint 1 (Ativação)', bonus_points: bonusVal },
          { challenge_id: challenge.id, week_number: 2, title: 'Semana 2 • Sprint 2 (Intensidade)', bonus_points: bonusVal },
          { challenge_id: challenge.id, week_number: 3, title: 'Semana 3 • Sprint 3 (Consistência)', bonus_points: bonusVal },
          { challenge_id: challenge.id, week_number: 4, title: 'Semana 4 • Sprint 4 (Sprint Final)', bonus_points: bonusVal },
        ];
        
        const { data: createdWeeks, error: wErr } = await supabase
          .from('challenge_weeks')
          .insert(defaultWeeks)
          .select();

        if (wErr) {
          console.warn('Erro ao criar semanas:', wErr);
        }

        // Criar as missões iniciais apenas para a Semana 1 (as semanas 2, 3 e 4 ficam livres para programação futura ou cópia)
        if (createdWeeks && createdWeeks.length > 0) {
          const defaultMissions: any[] = [];
          const week1 = createdWeeks.find((w: any) => Number(w.week_number) === 1) || createdWeeks[0];

          if (week1) {
            // 1. Treinos (6 treinos na Semana 1)
            for (let t = 1; t <= 6; t++) {
              defaultMissions.push({
                challenge_id: challenge.id,
                week_id: week1.id,
                title: `Treino #${t} da Semana 1`,
                category: 'treino',
                points_rewarded: 15,
                requires_cooldown: true,
                cooldown_hours: 4,
                order_index: t,
                is_bonus: false,
              });
            }

            // 2. Cardios (7 cardios na Semana 1)
            for (let c = 1; c <= 7; c++) {
              defaultMissions.push({
                challenge_id: challenge.id,
                week_id: week1.id,
                title: `Cardio #${c} (Mín. 30min) • Semana 1`,
                category: 'cardio',
                points_rewarded: 10,
                requires_cooldown: true,
                cooldown_hours: 4,
                order_index: c,
                is_bonus: false,
              });
            }

            // 3. Refeições Diárias
            const meals = ['Café da Manhã Limpo', 'Almoço Balanceado', 'Lanche da Tarde', 'Jantar & Ceia'];
            meals.forEach((meal, idx) => {
              defaultMissions.push({
                challenge_id: challenge.id,
                week_id: week1.id,
                title: `${meal} • Semana 1`,
                category: 'refeicao',
                points_rewarded: 10,
                requires_cooldown: false,
                order_index: idx + 1,
                is_bonus: false,
              });
            });

            // 4. Bônus / Hábito
            defaultMissions.push({
              challenge_id: challenge.id,
              week_id: week1.id,
              title: 'Desafio Bônus: 3L Água + Alongamento • Semana 1',
              category: 'habito',
              points_rewarded: 25,
              requires_cooldown: false,
              order_index: 99,
              is_bonus: true,
            });
          }

          let { error: mErr } = await supabase.from('missions').insert(defaultMissions);

          // Fallback resiliente caso colunas opcionais não existam no cache do Supabase
          if (mErr && (mErr.message.includes('column') || mErr.message.includes('schema cache'))) {
            console.warn('Erro de coluna no schema cache. Tentando insert básico...', mErr);
            const basicMissions = defaultMissions.map((m) => ({
              challenge_id: m.challenge_id,
              week_id: m.week_id,
              title: m.title,
              category: m.category,
              points_rewarded: m.points_rewarded,
            }));
            await supabase.from('missions').insert(basicMissions);
          }
        }
      } catch (weekErr) {
        console.warn('Erro não bloqueante ao criar semanas e missões padrão:', weekErr);
      }

      showToast('Desafio e missões padrão criados com sucesso!');
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

            {/* Gamificação: Bônus por Semana 100% Concluída */}
            <div className="p-3.5 rounded-2xl border border-white/10 bg-zinc-950/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  Bônus por Semana 100% Concluída
                </label>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  +{weeklyBonusPoints || 0} XP por semana
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Pontuação extra que o aluno conquista ao completar 100% das missões da semana. Você também poderá calibrar cada semana individualmente na tela de Missões.
              </p>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="5"
                  placeholder="20"
                  value={weeklyBonusPoints}
                  onChange={(e) => setWeeklyBonusPoints(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* Split / Subconta Warning ou Confirmation */}
            {parseFloat(price) > 0 && !checkingWallet && hasWalletId === false && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300 font-mono">
                      Atenção: Configure seus dados bancários para receber
                    </p>
                    <p className="text-zinc-300 mt-1 leading-relaxed">
                      Para lançar desafios pagos e receber os pagamentos dos alunos via Split automático no Pix, configure seus dados fiscais e bancários na Central Financeira.
                    </p>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-end">
                  <Link href="/dashboard/finance" target="_blank">
                    <Button 
                      type="button" 
                      size="sm" 
                      className="bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs h-8 flex items-center gap-1.5"
                    >
                      Configurar Recebimento na Central Financeira
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {parseFloat(price) > 0 && !checkingWallet && hasWalletId === true && (
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-mono">
                  Split de Pagamentos ativo: As inscrições pagas serão transferidas automaticamente para sua carteira.
                </span>
              </div>
            )}

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
