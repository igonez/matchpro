'use client';

import React, { useState } from 'react';
import { Gift, Sparkles, Trophy, Star, Shield, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

interface MysteryBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  challengeId: string;
  weekNumber: number;
  isEligible: boolean; // Se completou 100% da semana
  alreadyClaimed: boolean;
  onRewardClaimed: (reward: any) => void;
}

export function MysteryBoxModal({
  isOpen,
  onClose,
  studentId,
  challengeId,
  weekNumber,
  isEligible,
  alreadyClaimed,
  onRewardClaimed,
}: MysteryBoxModalProps) {
  const supabase = createClient();
  const [opening, setOpening] = useState(false);
  const [revealedReward, setRevealedReward] = useState<any>(null);

  if (!isOpen) return null;

  const handleOpenBox = async () => {
    if (!isEligible || alreadyClaimed || opening) return;
    setOpening(true);

    try {
      // 1. Buscar recompensas disponíveis
      const { data: rewards } = await supabase
        .from('mystery_box_rewards')
        .select('*');

      let pickedReward: any = null;

      if (rewards && rewards.length > 0) {
        // Sorteio ponderado
        const totalWeight = rewards.reduce((acc: number, curr: any) => acc + (curr.probability_weight || 10), 0);
        let randomNum = Math.random() * totalWeight;

        for (const r of rewards) {
          if (randomNum < (r.probability_weight || 10)) {
            pickedReward = r;
            break;
          }
          randomNum -= (r.probability_weight || 10);
        }
        if (!pickedReward) pickedReward = rewards[0];
      } else {
        // Fallback default
        pickedReward = {
          title: '+50 Pontos de Bônus!',
          description: 'Você garantiu 50 pontos extras na classificação geral!',
          reward_type: 'points',
          reward_value: '50',
          rarity: 'rare',
        };
      }

      // Efeito de suspense (2.5 segundos de animação)
      setTimeout(async () => {
        // 2. Gravar o claim no banco
        await supabase.from('student_mystery_box_claims').insert({
          student_id: studentId,
          challenge_id: challengeId,
          week_number: weekNumber,
          reward_id: pickedReward.id || null,
          reward_title: pickedReward.title,
          reward_type: pickedReward.reward_type,
          reward_value: pickedReward.reward_value,
        });

        // 3. Se for pontos, somar na tabela do leaderboard
        if (pickedReward.reward_type === 'points') {
          const addPts = parseInt(pickedReward.reward_value || '50', 10);
          const { data: standing } = await supabase
            .from('leaderboard_standings')
            .select('id, total_points')
            .eq('student_id', studentId)
            .single();

          if (standing) {
            await supabase
              .from('leaderboard_standings')
              .update({ total_points: standing.total_points + addPts })
              .eq('id', standing.id);
          }
        }

        // 4. Se for Freeze Shield, adicionar no student_gamification_state
        if (pickedReward.reward_type === 'freeze_shield') {
          const { data: gamState } = await supabase
            .from('student_gamification_state')
            .select('id, freeze_shields_available')
            .eq('student_id', studentId)
            .eq('challenge_id', challengeId)
            .single();

          if (gamState) {
            await supabase
              .from('student_gamification_state')
              .update({ freeze_shields_available: gamState.freeze_shields_available + 1 })
              .eq('id', gamState.id);
          }
        }

        setRevealedReward(pickedReward);
        setOpening(false);
        onRewardClaimed(pickedReward);
      }, 2500);

    } catch (err) {
      console.error('Erro ao abrir Mystery Box:', err);
      setOpening(false);
      alert('Erro ao resgatar a caixa da semana.');
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-white text-black font-mono">Nível Lendário</span>;
      case 'epic':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-white/20 text-white border border-white/30 font-mono">Nível Épico</span>;
      case 'rare':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-white/10 text-zinc-300 border border-white/20 font-mono">Nível Raro</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-zinc-900 text-zinc-400 border border-white/10 font-mono">Nível Comum</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-950/95 border border-white/15 p-6 text-white shadow-2xl shadow-black relative overflow-hidden text-center">
        {/* Glow de fundo monocromatico */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* ESTADO 1: RECOMPENSA REVELADA */}
        {revealedReward ? (
          <div className="py-4 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-white/10 border border-white/20 p-0.5 shadow-2xl shadow-white/5">
              <div className="h-full w-full bg-zinc-900 rounded-[22px] flex items-center justify-center text-white">
                <Trophy className="h-10 w-10 animate-bounce stroke-[1.8]" />
              </div>
            </div>

            <div>
              {getRarityBadge(revealedReward.rarity || 'rare')}
              <h3 className="text-xl font-black text-white mt-2 tracking-tight">{revealedReward.title}</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
                {revealedReward.description}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/10 text-xs text-zinc-300 font-bold flex items-center justify-center gap-2">
              <Check className="h-4 w-4 text-white" /> Recompensa creditada na sua conta
            </div>

            <Button
              onClick={onClose}
              className="w-full h-11 rounded-xl text-xs font-black bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5"
            >
              Confirmar e Concluir
            </Button>
          </div>
        ) : (
          /* ESTADO 2: ANIMAÇÃO DA CAIXA OU TELA INICIAL */
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center justify-center gap-1 font-mono">
                <Sparkles className="h-3 w-3" /> Recompensa Semanal
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">Mystery Box</h3>
              <p className="text-xs text-zinc-500 font-mono">Semana {weekNumber} do Desafio</p>
            </div>

            {/* Ícone Central da Caixa */}
            <div className="py-4">
              <div
                className={`h-28 w-28 mx-auto rounded-3xl bg-zinc-900 border border-white/20 p-1 shadow-2xl shadow-black flex items-center justify-center transition-all ${
                  opening ? 'animate-spin scale-110 border-white' : 'hover:scale-105 hover:border-white/40 cursor-pointer'
                }`}
                onClick={handleOpenBox}
              >
                <div className="h-full w-full bg-zinc-950 rounded-[20px] flex items-center justify-center text-white">
                  <Gift className={`h-14 w-14 stroke-[1.8] ${opening ? 'animate-pulse' : ''}`} />
                </div>
              </div>
            </div>

            {alreadyClaimed ? (
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 text-xs text-zinc-400">
                Você já resgatou a sua Mystery Box desta semana. Mantenha o ritmo para a próxima semana.
              </div>
            ) : !isEligible ? (
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 text-xs text-zinc-400 leading-relaxed text-left">
                <strong className="text-white block mb-0.5">Caixa Bloqueada</strong>
                Conclua 100% das metas da semana para liberar o resgate da caixa e acumular vantagens no ranking.
              </div>
            ) : (
              <p className="text-xs text-zinc-300">
                Parabéns. Você atingiu 100% de consistência. Desbloqueie sua caixa misteriosa agora.
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl h-11 text-xs font-bold border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
              >
                Voltar
              </Button>
              <Button
                onClick={handleOpenBox}
                disabled={!isEligible || alreadyClaimed || opening}
                className="flex-1 rounded-xl h-11 text-xs font-black bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5 disabled:opacity-40"
              >
                {opening ? 'Abrindo...' : 'Abrir Caixa'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
