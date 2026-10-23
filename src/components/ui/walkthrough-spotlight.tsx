'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export interface WalkthroughStep {
  id: string;
  route: string; // Ex: '/dashboard', '/dashboard/finance', '/app', etc.
  targetSelector: string; // Ex: '[data-tour="finance-cta"]'
  title: string;
  badge?: string;
  description: string;
  tip?: string;
  actionText?: string;
  placement?: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

interface WalkthroughContextType {
  isActive: boolean;
  currentStepIndex: number;
  steps: WalkthroughStep[];
  startTour: (tourSteps: WalkthroughStep[], storageKey?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  goToStep: (index: number) => void;
}

const WalkthroughContext = createContext<WalkthroughContextType | null>(null);

export function useWalkthrough() {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return ctx;
}

export function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<WalkthroughStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeStorageKey, setActiveStorageKey] = useState<string | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isSearchingTarget, setIsSearchingTarget] = useState(false);

  const currentStep = steps[currentStepIndex] || null;

  // Atualizar bounding rect do alvo atual
  const updateTargetPosition = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      // Rolar suavemente até o elemento se estiver fora da visão com margem confortável
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      setIsSearchingTarget(false);
    } else {
      setTargetRect(null);
      setIsSearchingTarget(true);
    }
  }, [currentStep]);

  // Observar redimensionamento e scroll da janela
  useEffect(() => {
    if (!isActive) return;

    const handleUpdate = () => {
      if (!currentStep) return;
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isActive, currentStep]);

  // Quando mudar de passo ou rota, sincronizar elemento
  useEffect(() => {
    if (!isActive || !currentStep) return;

    // Se estiver em rota diferente da exigida pelo passo atual, navega
    if (currentStep.route && pathname !== currentStep.route) {
      router.push(currentStep.route);
      return;
    }

    // Tentar localizar o elemento com polling suave
    let attempts = 0;
    const interval = setInterval(() => {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        updateTargetPosition();
        clearInterval(interval);
      } else {
        attempts++;
        if (attempts > 15) {
          // Elemento não encontrado após 3 segundos, exibe no centro
          setTargetRect(null);
          setIsSearchingTarget(false);
          clearInterval(interval);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isActive, currentStepIndex, currentStep, pathname, router, updateTargetPosition]);

  const startTour = useCallback((tourSteps: WalkthroughStep[], storageKey?: string) => {
    setSteps(tourSteps);
    setCurrentStepIndex(0);
    setActiveStorageKey(storageKey || null);
    setIsActive(true);

    // Navega para a primeira tela se necessário
    if (tourSteps[0]?.route && window.location.pathname !== tourSteps[0].route) {
      router.push(tourSteps[0].route);
    }
  }, [router]);

  const completeTour = useCallback(() => {
    setIsActive(false);
    if (activeStorageKey) {
      localStorage.setItem(activeStorageKey, 'completed');
    }
  }, [activeStorageKey]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const nextStepData = steps[nextIdx];
      setCurrentStepIndex(nextIdx);

      if (nextStepData?.route && window.location.pathname !== nextStepData.route) {
        router.push(nextStepData.route);
      }
    } else {
      completeTour();
    }
  }, [currentStepIndex, steps, router, completeTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const prevStepData = steps[prevIdx];
      setCurrentStepIndex(prevIdx);

      if (prevStepData?.route && window.location.pathname !== prevStepData.route) {
        router.push(prevStepData.route);
      }
    }
  }, [currentStepIndex, steps, router]);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      const stepData = steps[index];
      setCurrentStepIndex(index);
      if (stepData?.route && window.location.pathname !== stepData.route) {
        router.push(stepData.route);
      }
    }
  }, [steps, router]);

  // Cálculo da posição do Tooltip/Popover
  const getPopoverStyle = (): React.CSSProperties => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (!targetRect || isMobile) {
      // No celular ou quando não achou o elemento, posiciona fixo embaixo com margens seguras
      return {
        position: 'fixed',
        bottom: '24px',
        left: '16px',
        right: '16px',
        maxWidth: '420px',
        margin: '0 auto',
        zIndex: 10000,
      };
    }

    const margin = 16;
    const popoverWidth = 380;
    const estimatedHeight = 280;

    // Verificar se cabe abaixo do elemento destacado
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    let top = targetRect.bottom + margin;
    let left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);

    // Ajustar se vazar na horizontal
    if (left + popoverWidth > window.innerWidth - margin) {
      left = window.innerWidth - popoverWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    // Se o elemento for muito alto (ex: card de swipe ou lista) ou não couber embaixo:
    if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
      // Posiciona acima do elemento
      top = Math.max(margin, targetRect.top - estimatedHeight - margin);
    } else if (spaceBelow < estimatedHeight && spaceAbove < estimatedHeight) {
      // Se não couber com folga nem em cima nem embaixo, ancora fixo na lateral ou no rodapé
      if (targetRect.left > popoverWidth + margin * 2) {
        // Coloca à esquerda
        left = targetRect.left - popoverWidth - margin;
        top = Math.min(Math.max(margin, targetRect.top), window.innerHeight - estimatedHeight - margin);
      } else if (window.innerWidth - targetRect.right > popoverWidth + margin * 2) {
        // Coloca à direita
        left = targetRect.right + margin;
        top = Math.min(Math.max(margin, targetRect.top), window.innerHeight - estimatedHeight - margin);
      } else {
        // Se a tela for estreita, mantém fixo no canto inferior com backdrop blur
        return {
          position: 'fixed',
          bottom: '24px',
          left: '16px',
          right: '16px',
          maxWidth: '400px',
          margin: '0 auto',
          zIndex: 10000,
        };
      }
    }

    return {
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${popoverWidth}px`,
      zIndex: 10000,
    };
  };

  return (
    <WalkthroughContext.Provider
      value={{
        isActive,
        currentStepIndex,
        steps,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        goToStep,
      }}
    >
      {children}

      {/* Renderização do Walkthrough Spotlight & Tooltip */}
      <AnimatePresence>
        {isActive && currentStep && (
          <div className="fixed inset-0 z-[9999] pointer-events-auto">
            {/* SVG MASK / SPOTLIGHT CUTOUT */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300"
              style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
            >
              <defs>
                <mask id="walkthrough-mask">
                  {/* Fundo Branco (visível/escuro) */}
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  
                  {/* Recorte Preto (transparente no alvo) */}
                  {targetRect && (
                    <rect
                      x={Math.max(0, targetRect.left - 6)}
                      y={Math.max(0, targetRect.top - 6)}
                      width={targetRect.width + 12}
                      height={targetRect.height + 12}
                      rx="14"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>

              {/* Camada escura que usa a máscara */}
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.78)"
                mask="url(#walkthrough-mask)"
              />
            </svg>

            {/* Borda Animada Pulsante ao redor do Elemento Focado */}
            {targetRect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="fixed pointer-events-none border-2 border-white/80 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.45)]"
                style={{
                  top: `${targetRect.top - 6}px`,
                  left: `${targetRect.left - 6}px`,
                  width: `${targetRect.width + 12}px`,
                  height: `${targetRect.height + 12}px`,
                  zIndex: 9999,
                }}
              >
                {/* Linha pontilhada estilizada externa */}
                <div className="absolute -inset-1 rounded-[18px] border border-dashed border-white/30 animate-pulse pointer-events-none" />
              </motion.div>
            )}

            {/* Backdrop clicável transparente para focar */}
            <div 
              className="absolute inset-0"
              onClick={(e) => {
                // Impede fechar ao clicar no vazio acidentalmente
                e.stopPropagation();
              }}
            />

            {/* Popover / Tooltip Informativo do Passo */}
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={getPopoverStyle()}
              className="bg-zinc-950/95 border border-white/20 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl text-white pointer-events-auto"
            >
              {/* Header do Passo */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15 text-[11px] font-mono font-bold tracking-wider">
                    {currentStepIndex + 1} de {steps.length}
                  </span>
                  {currentStep.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                      {currentStep.badge}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={skipTour}
                  className="h-7 w-7 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Pular tour"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Título & Descrição */}
              <h3 className="text-base font-extrabold tracking-tight text-white mb-1.5 flex items-center gap-1.5">
                {currentStep.title}
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                {currentStep.description}
              </p>

              {/* Dica de Ouro / Highlight */}
              {currentStep.tip && (
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-2.5 mb-4 text-[11px] text-zinc-300 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                  <span>{currentStep.tip}</span>
                </div>
              )}

              {/* Barra de Progresso em Pontos */}
              <div className="flex items-center gap-1.5 mb-4">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToStep(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentStepIndex
                        ? 'w-6 bg-white'
                        : idx < currentStepIndex
                        ? 'w-2 bg-emerald-400'
                        : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Ações / Botões de Navegação */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                    currentStepIndex === 0
                      ? 'opacity-30 cursor-not-allowed text-zinc-500'
                      : 'text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={skipTour}
                    className="px-2.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    Pular
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-white hover:bg-zinc-200 text-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.3)] cursor-pointer active:scale-95 transition-all"
                  >
                    <span>
                      {currentStepIndex === steps.length - 1 ? 'Concluir' : 'Próximo'}
                    </span>
                    {currentStepIndex === steps.length - 1 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-black" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WalkthroughContext.Provider>
  );
}
