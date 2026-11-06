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
          <div className="bg-[#121722]/95 border border-[#252D3B] rounded-2xl p-2.5 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex items-center justify-between gap-3">
            <div 
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
            >
              <div className="h-9 w-9 rounded-xl bg-[#3478F6]/15 border border-[#3478F6]/30 flex items-center justify-center relative shrink-0">
                <span className="h-2 w-2 rounded-full bg-[#3478F6] animate-ping absolute" />
                <span className="h-2 w-2 rounded-full bg-[#3478F6] relative z-10" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[#A7B0C0]">
                    {activeSession.category === 'treino' ? 'Treino em andamento' : 'Cardio em andamento'}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#F4F6FA] tracking-tight">
                  {formattedTime}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleFinishAndTakePhoto}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#3478F6] text-white hover:bg-[#75A7FF] text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,120,246,0.35)] transition-all active:scale-95 cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Finalizar</span>
              </button>
              <button
                onClick={() => setIsExpanded(true)}
                aria-label="Expandir cronômetro"
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-[#1B2330] border border-[#252D3B] text-[#A7B0C0] hover:text-[#F4F6FA] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Expandido HUD em Tela Cheia */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-[#080A0F]/98 backdrop-blur-2xl flex flex-col justify-between p-6 safe-top-drawer safe-bottom-drawer animate-in fade-in zoom-in-95 duration-200">
          {/* Top Bar HUD */}
          <div className="flex items-center justify-between max-w-md sm:max-w-xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3478F6] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#75A7FF]">
                SESSÃO_BIOMÉTRICA_ATIVA
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              aria-label="Minimizar cronômetro"
              className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-[#121722] border border-[#252D3B] text-[#A7B0C0] hover:text-[#F4F6FA] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Centro do HUD: Relógio Militar Gigante */}
          <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="px-3.5 py-1.5 rounded-full bg-[#3478F6]/15 border border-[#3478F6]/30 text-xs font-mono font-bold text-[#75A7FF] tracking-widest uppercase">
              {activeSession.category === 'treino' ? 'MUSCULAÇÃO / FORÇA' : 'CARDIOVASCULAR'}
            </div>

            <h2 className="text-xl font-black text-[#F4F6FA] max-w-xs">
              {activeSession.missionTitle}
            </h2>

            {/* Display do Tempo Digital */}
            <div className="relative py-8 px-6 rounded-3xl bg-[#121722] border border-[#252D3B] w-full max-w-sm shadow-[0_0_50px_rgba(52,120,246,0.12)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A7B0C0] block mb-2">
                TEMPO DE EXECUÇÃO
              </span>
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-[#F4F6FA] drop-shadow-[0_0_20px_rgba(52,120,246,0.35)]">
                {formattedTime}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-[11px] font-mono text-[#A7B0C0]">
                <span>INÍCIO: {new Date(activeSession.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>•</span>
                <span className="text-[#3478F6]">STATUS: GRAVANDO</span>
              </div>
            </div>

            {isShortSession && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#121722] border border-[#252D3B] text-[#A7B0C0] text-xs max-w-sm">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
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
              className="w-full h-14 rounded-2xl bg-[#3478F6] text-white hover:bg-[#75A7FF] font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(52,120,246,0.4)] transition-all active:scale-95 cursor-pointer"
            >
              <Camera className="h-5 w-5" />
              <span>FINALIZAR E TIRAR FOTO</span>
            </button>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setIsExpanded(false)}
                className="flex-1 h-11 rounded-xl bg-[#1B2330] border border-[#252D3B] text-[#F4F6FA] hover:bg-[#252D3B] text-xs font-mono transition-colors cursor-pointer"
              >
                MINIMIZAR
              </button>
              <button
                onClick={() => setShowConfirmCancel(true)}
                className="px-4 h-11 rounded-xl bg-[#121722] border border-[#252D3B] text-[#A7B0C0] hover:text-red-400 text-xs font-mono transition-colors cursor-pointer"
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
