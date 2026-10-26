'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Flame,
  Dumbbell,
  Zap,
  Sparkles,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface ChallengePreset {
  id: string;
  badge: string;
  name: string;
  defaultTitle: string;
  durationDays: number;
  suggestedPrice: string;
  weeklyBonus: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  workoutsPerWeek: number;
  workoutLabel: string;
  cardiosPerWeek: number;
  cardioLabel: string;
  meals: string[];
  habitTitle: string;
}

const CHALLENGE_PRESETS: ChallengePreset[] = [
  {
    id: 'seca_21',
    badge: 'MAIS VENDIDO • 21 DIAS',
    name: 'Seca & Definição 21D',
    defaultTitle: 'Desafio Seca 21 Dias • Queima & Definição',
    durationDays: 21,
    suggestedPrice: '69.90',
    weeklyBonus: '25',
    summary: '5 Treinos Metabólicos + 6 Cardios HIIT + 4 Refeições c/ IA + Hábito 3L Água',
    icon: Flame,
    workoutsPerWeek: 5,
    workoutLabel: 'Treino Metabólico',
    cardiosPerWeek: 6,
    cardioLabel: 'Cardio Queima (Mín. 30min)',
    meals: ['Café da Manhã Proteico', 'Almoço Limpo & Fibras', 'Lanche Funcional', 'Jantar Low Carb'],
    habitTitle: 'Meta Diária: 3L de Água + Zero Açúcar Refinado',
  },
  {
    id: 'hipertrofia_30',
    badge: 'ALTO TICKET • 30 DIAS',
    name: 'Hipertrofia & Força 30D',
    defaultTitle: 'Desafio Hipertrofia 30 Dias • Ganho Muscular',
    durationDays: 30,
    suggestedPrice: '89.90',
    weeklyBonus: '30',
    summary: '6 Treinos de Força + 4 Cardios Controlados + 4 Refeições Hiperproteicas + Creatina/Água',
    icon: Dumbbell,
    workoutsPerWeek: 6,
    workoutLabel: 'Treino de Força & Hipertrofia',
    cardiosPerWeek: 4,
    cardioLabel: 'Cardio Moderado (25min)',
    meals: ['Café da Manhã Hiperproteico', 'Almoço de Construção Muscular', 'Pré/Pós-Treino Sólido', 'Jantar Rico em Proteínas'],
    habitTitle: 'Meta Diária: Creatina + 3.5L de Água + 7h de Sono',
  },
  {
    id: 'consistencia_14',
    badge: 'ISCA GRATUITA • 14 DIAS',
    name: 'Sprint Consistência 14D',
    defaultTitle: 'Sprint 14 Dias de Disciplina & Consistência',
    durationDays: 14,
    suggestedPrice: '0.00',
    weeklyBonus: '20',
    summary: 'Ideal para atrair alunos novos gratuitamente e converter para sua consultoria',
    icon: Sparkles,
    workoutsPerWeek: 4,
    workoutLabel: 'Treino do Dia Concluído',
    cardiosPerWeek: 5,
    cardioLabel: 'Caminhada ou Cardio Ativo (20min)',
    meals: ['Café da Manhã Equilibrado', 'Almoço Colorido', 'Jantar Leve'],
    habitTitle: 'Meta Diária: 2.5L de Água + 10min Alongamento',
  },
  {
    id: 'performance_28',
    badge: 'CONDICIONAMENTO • 28 DIAS',
    name: 'Performance & Cardio 28D',
    defaultTitle: 'Desafio Performance & Condicionamento 28 Dias',
    durationDays: 28,
    suggestedPrice: '59.90',
    weeklyBonus: '25',
    summary: '4 Treinos de Fortalecimento + 6 Sessões de Corrida/Cardio + Nutrição Energética',
    icon: Zap,
    workoutsPerWeek: 4,
    workoutLabel: 'Fortalecimento & Core',
    cardiosPerWeek: 6,
    cardioLabel: 'Sessão de Corrida / Endurance',
    meals: ['Café Pré-Treino Energético', 'Almoço Recuperação', 'Lanche Natural', 'Jantar Reparador'],
    habitTitle: 'Meta Diária: 3L de Água + Mobilidade Articular',
  },
];

function computeDateOffset(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export default function NewChallengePage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedPresetId, setSelectedPresetId] = useState<string>('seca_21');
  const [title, setTitle] = useState(CHALLENGE_PRESETS[0].defaultTitle);
  const [startDate, setStartDate] = useState(() => computeDateOffset(1));
  const [endDate, setEndDate] = useState(() => computeDateOffset(22));
  const [price, setPrice] = useState(CHALLENGE_PRESETS[0].suggestedPrice);
  const [weeklyBonusPoints, setWeeklyBonusPoints] = useState(CHALLENGE_PRESETS[0].weeklyBonus);
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

  const handleApplyPreset = (preset: ChallengePreset) => {
    setSelectedPresetId(preset.id);
    setTitle(preset.defaultTitle);
    const start = computeDateOffset(1);
    const end = computeDateOffset(1 + preset.durationDays);
    setStartDate(start);
    setEndDate(end);
    setPrice(preset.suggestedPrice);
    setWeeklyBonusPoints(preset.weeklyBonus);
    showToast(`Template "${preset.name}" aplicado em 1 clique!`);
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

      // Auto-provisionar semanas e missões completas baseadas no Template selecionado
      try {
        const activePreset =
          CHALLENGE_PRESETS.find((p) => p.id === selectedPresetId) || CHALLENGE_PRESETS[0];
        const bonusVal = Math.max(0, parseInt(weeklyBonusPoints, 10) || 20);
        const totalWeeksCount = Math.max(2, Math.min(4, Math.ceil(activePreset.durationDays / 7)));

        const weekTitles = [
          'Semana 1 • Sprint 1 (Ativação)',
          'Semana 2 • Sprint 2 (Intensidade)',
          'Semana 3 • Sprint 3 (Consistência)',
          'Semana 4 • Sprint 4 (Sprint Final)',
        ];

        const defaultWeeks = Array.from({ length: totalWeeksCount }, (_, idx) => ({
          challenge_id: challenge.id,
          week_number: idx + 1,
          title: weekTitles[idx] || `Semana ${idx + 1}`,
          bonus_points: bonusVal,
        }));

        const { data: createdWeeks, error: wErr } = await supabase
          .from('challenge_weeks')
          .insert(defaultWeeks)
          .select();

        if (wErr) {
          console.warn('Erro ao criar semanas:', wErr);
        }

        if (createdWeeks && createdWeeks.length > 0) {
          const allMissions: any[] = [];

          // Provisiona as missões em TODAS as semanas do desafio para o treinador já ter tudo pronto em 1 clique
          for (const wk of createdWeeks) {
            const wNum = wk.week_number;

            // 1. Treinos da Semana
            for (let t = 1; t <= activePreset.workoutsPerWeek; t++) {
              allMissions.push({
                challenge_id: challenge.id,
                week_id: wk.id,
                title: `${activePreset.workoutLabel} #${t} • Semana ${wNum}`,
                category: 'treino',
                points_rewarded: 15,
                requires_cooldown: true,
                cooldown_hours: 4,
                order_index: t,
                is_bonus: false,
              });
            }

            // 2. Cardios da Semana
            for (let c = 1; c <= activePreset.cardiosPerWeek; c++) {
              allMissions.push({
                challenge_id: challenge.id,
                week_id: wk.id,
                title: `${activePreset.cardioLabel} #${c} • Semana ${wNum}`,
                category: 'cardio',
                points_rewarded: 10,
                requires_cooldown: true,
                cooldown_hours: 4,
                order_index: c,
                is_bonus: false,
              });
            }

            // 3. Refeições Diárias Auditadas por IA
            activePreset.meals.forEach((meal, idx) => {
              allMissions.push({
                challenge_id: challenge.id,
                week_id: wk.id,
                title: `${meal} • Semana ${wNum}`,
                category: 'refeicao',
                points_rewarded: 10,
                requires_cooldown: false,
                order_index: idx + 1,
                is_bonus: false,
              });
            });

            // 4. Hábito / Bônus
            allMissions.push({
              challenge_id: challenge.id,
              week_id: wk.id,
              title: `${activePreset.habitTitle} • Semana ${wNum}`,
              category: 'habito',
              points_rewarded: 25,
              requires_cooldown: false,
              order_index: 99,
              is_bonus: true,
            });
          }

          const { error: mErr } = await supabase.from('missions').insert(allMissions);

          if (mErr && (mErr.message.includes('column') || mErr.message.includes('schema cache'))) {
            const basicMissions = allMissions.map((m) => ({
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

      showToast('Desafio e cronograma completo criados em 1 clique!');
      setTimeout(() => {
        router.push(`/dashboard/missions?challengeId=${challenge.id}`);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar desafio.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      {/* Toast Notificação */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-mono text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
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
          <p className="text-xs text-zinc-400">
            Escolha um modelo pronto em 1 clique ou personalize cada detalhe da sua turma.
          </p>
        </div>
      </div>

      {/* SELETOR DE TEMPLATES EM 1 CLIQUE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Modelos Prontos em 1 Clique (Auto-Preenche Semanas & Missões)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHALLENGE_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-white/[0.08] border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.12)]'
                    : 'bg-zinc-950/70 border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/10">
                    {preset.badge}
                  </span>
                  {isSelected ? (
                    <span className="h-5 w-5 rounded-full bg-white text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <Icon className="w-4 h-4 text-zinc-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-black text-white">{preset.name}</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                    {preset.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] font-mono text-zinc-300">
                  <span>Duração: {preset.durationDays} dias</span>
                  <span className="font-bold text-emerald-400">
                    {Number(preset.suggestedPrice) === 0 ? 'GRÁTIS' : `R$ ${preset.suggestedPrice}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Card data-tour="challenge-form-card" className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle className="text-lg">Dados do Desafio</CardTitle>
          <CardDescription className="text-xs">
            Revise ou edite livremente o título, período e valor de inscrição da turma.
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
                placeholder="Ex: Desafio Seca 21 Dias - Turma Oficial"
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
                <Button type="button" variant="ghost" className="w-full sm:w-auto">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto font-mono">
                {loading ? 'Gerando Semanas & Missões...' : 'Criar Desafio em 1 Clique'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
