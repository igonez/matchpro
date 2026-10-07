'use client';

import React, { useState } from 'react';
import { Shield, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

interface FreezeShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  challengeId: string;
  shieldsAvailable: number;
  onShieldActivated: () => void;
}

export function FreezeShieldModal({
  isOpen,
  onClose,
  studentId,
  challengeId,
  shieldsAvailable,
  onShieldActivated,
}: FreezeShieldModalProps) {
  const supabase = createClient();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleActivateShield = async () => {
    if (shieldsAvailable <= 0) return;
    setLoading(true);

    try {
      // 1. Registrar log do escudo
      await supabase.from('freeze_shield_logs').insert({
        student_id: studentId,
        challenge_id: challengeId,
        reason: reason || 'Imprevisto pessoal ou descanso recuperativo',
      });

      // 2. Decrementar shields_available no estado gamificado
      const { data: currentGam } = await supabase
        .from('student_gamification_state')
        .select('*')
        .eq('student_id', studentId)
        .eq('challenge_id', challengeId)
        .single();

      if (currentGam) {
        await supabase
          .from('student_gamification_state')
          .update({
            freeze_shields_available: Math.max(0, currentGam.freeze_shields_available - 1),
            freeze_shields_used: currentGam.freeze_shields_used + 1,
            last_freeze_used_at: new Date().toISOString(),
          })
          .eq('id', currentGam.id);
      }

      setActivatedSuccess(true);
      setTimeout(() => {
        onShieldActivated();
        onClose();
        setActivatedSuccess(false);
      }, 1800);
    } catch (err) {
      console.error('Erro ao ativar Freeze Shield:', err);
      alert('Não foi possível ativar o escudo agora.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-950/95 border border-white/15 p-6 text-white shadow-2xl shadow-black relative overflow-hidden">
        {/* Glow de fundo monocromatico */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {activatedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20 animate-bounce">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Escudo Ativado</h3>
            <p className="text-xs text-zinc-400 font-medium">
              Seu streak de hoje esta 100% blindado contra penalidades.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/5 text-white border border-white/10 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                  Protecao de Streak
                </span>
                <h3 className="text-lg font-black text-white tracking-tight">Freeze Shield</h3>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center justify-between text-white font-bold pb-1 border-b border-white/10">
                <span className="text-zinc-400">Escudos em Estoque:</span>
                <span className="text-white font-black text-sm font-mono">{shieldsAvailable} disponivel(is)</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                Teve um imprevisto ou necessidade de recuperacao? Ative o escudo para <strong className="text-white">congelar o dia de hoje</strong> sem perder a sua sequencia ou bônus semanal.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                Motivo do Acionamento (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: Viagem de trabalho / recuperacao muscular"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl h-11 text-xs font-bold border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleActivateShield}
                disabled={shieldsAvailable <= 0 || loading}
                className="flex-1 rounded-xl h-11 text-xs font-black bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5 disabled:opacity-40"
              >
                {loading ? 'Ativando...' : 'Ativar Escudo'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
