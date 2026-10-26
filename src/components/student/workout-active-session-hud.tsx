'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutSession } from '@/lib/workout-session-context';
import { Play, Square, X, ChevronUp, ChevronDown, Camera, AlertTriangle } from 'lucide-react';
import { CustomDialog } from '@/components/ui/custom-dialog';

export function WorkoutActiveSessionHud() {
  const router = useRouter();
  const { activeSession, cancelSession, finishSession, getElapsedSeconds } = useWorkoutSession();
  
  const [elapsed, setElapsed] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  useEffect(() => {
    if (!activeSession) return;

    // Atualiza imediatamente
    setElapsed(getElapsedSeconds());

    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, getElapsedSeconds]);

  if (!activeSession) return null;

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isShortSession = elapsed < 600; // menos de 10 minutos (aviso visual amigável)

  const handleFinishAndTakePhoto = () => {
    const sessionData = finishSession();
    if (!sessionData) return;
    
    // Redireciona para a câmera com os parâmetros de duração
    router.push(
      `/app/camera/${activeSession.missionId}?duration=${sessionData.durationSeconds}&startedAt=${encodeURIComponent(
        sessionData.startedAt
      )}`
    );
  };

  const handleConfirmCancel = () => {
    cancelSession();
    setShowConfirmCancel(false);
  };

  return (
    <>
      {/* 1. Barra Flutuante Minimizada (Acima do menu inferior com Safe Area) */}
      {!isExpanded && (
        <div className="fixed safe-bottom-hud inset-x-0 mx-auto max-w-[460px] sm:max-w-lg w-[95%] sm:w-[90%] z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-zinc-950/95 border border-white/20 rounded-2xl p-2.5 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex items-center justify-between gap-3">
            <div 
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
            >
              <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center relative shrink-0">
                <span className="h-2 w-2 rounded-full bg-white animate-ping absolute" />
                <span className="h-2 w-2 rounded-full bg-white relative z-10" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-zinc-400">
                    {activeSession.category === 'treino' ? 'Treino em andamento' : 'Cardio em andamento'}
                  </span>
                </div>
                <div className="text-sm font-bold text-white tracking-tight">
                  {formattedTime}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleFinishAndTakePhoto}
                className="mono-button-primary min-h-[40px] px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Finalizar</span>
              </button>
              <button
                onClick={() => setIsExpanded(true)}
                aria-label="Expandir cronômetro"
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Expandido HUD em Tela Cheia */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-6 safe-top-drawer safe-bottom-drawer animate-in fade-in zoom-in-95 duration-200">
          {/* Top Bar HUD */}
          <div className="flex items-center justify-between max-w-md sm:max-w-xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                SESSÃO_BIOMÉTRICA_ATIVA
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              aria-label="Minimizar cronômetro"
              className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Centro do HUD: Relógio Militar Gigante */}
          <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold text-white tracking-widest uppercase">
              {activeSession.category === 'treino' ? 'MUSCULAÇÃO / FORÇA' : 'CARDIOVASCULAR'}
            </div>

            <h2 className="text-xl font-black text-white max-w-xs">
              {activeSession.missionTitle}
            </h2>

            {/* Display do Tempo Digital */}
            <div className="relative py-8 px-6 rounded-3xl bg-zinc-950 border border-white/15 w-full max-w-sm shadow-[0_0_50px_rgba(255,255,255,0.06)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                TEMPO DE EXECUÇÃO
              </span>
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {formattedTime}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-[11px] font-mono text-zinc-400">
                <span>INÍCIO: {new Date(activeSession.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>•</span>
                <span>STATUS: GRAVANDO</span>
              </div>
            </div>

            {isShortSession && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400 text-xs max-w-sm">
                <AlertTriangle className="h-4 w-4 text-zinc-300 shrink-0" />
                <span className="text-left text-[11px] font-mono">
                  Sessões com menos de 10 minutos são sinalizadas na auditoria do treinador.
                </span>
              </div>
            )}
          </div>

          {/* Botões de Ação Inferiores */}
          <div className="space-y-3 max-w-sm mx-auto w-full">
            <button
              onClick={handleFinishAndTakePhoto}
              className="mono-button-primary w-full h-14 text-sm font-mono flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              <Camera className="h-5 w-5" />
              <span>FINALIZAR E TIRAR FOTO</span>
            </button>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setIsExpanded(false)}
                className="mono-button-secondary flex-1 h-11 text-xs font-mono"
              >
                MINIMIZAR
              </button>
              <button
                onClick={() => setShowConfirmCancel(true)}
                className="px-4 h-11 rounded-xl bg-white/5 border border-white/10 text-zinc-500 hover:text-white text-xs font-mono transition-colors"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Cancelar Sessão */}
      <CustomDialog
        isOpen={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Sessão de Treino?"
        description="O cronômetro será zerado e este treino não será registrado no placar."
        confirmText="Sim, Descartar"
        cancelText="Voltar"
        variant="destructive"
      />
    </>
  );
}
