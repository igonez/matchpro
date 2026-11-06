'use client';

import React, { useEffect, useState } from 'react';

interface MobileLoadingScreenProps {
  fullScreen?: boolean;
  isReady?: boolean;
  onFinish?: () => void;
  minDisplayTimeMs?: number;
  title?: string;
  subtitle?: string;
}

export function MobileLoadingScreen({
  fullScreen = true,
  isReady = true,
  onFinish,
  minDisplayTimeMs = 0,
}: MobileLoadingScreenProps) {
  const [mountedTime] = useState(() => Date.now());
  const [isMounted, setIsMounted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // 1. Entrada fluida e imediata no frame seguinte
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // 2. Orquestração ultrarrápida do ciclo de vida: sai assim que isReady for verdadeiro
  useEffect(() => {
    if (isReady) {
      const elapsed = Date.now() - mountedTime;
      const remainingTime = Math.max(0, minDisplayTimeMs - elapsed);

      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const unmountTimer = setTimeout(() => {
          setShouldRender(false);
          if (onFinish) onFinish();
        }, 220); // Transição ágil de 220ms (zero atraso perceptível)
        return () => clearTimeout(unmountTimer);
      }, remainingTime);

      return () => clearTimeout(timer);
    } else {
      setIsFadingOut(false);
    }
  }, [isReady, mountedTime, minDisplayTimeMs, onFinish]);

  if (!shouldRender) return null;

  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0 z-50' : 'w-full min-h-[60vh]'
      } bg-[#080A0F] flex items-center justify-center p-6 select-none overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        !isMounted
          ? 'opacity-0 scale-[0.96] pointer-events-none'
          : isFadingOut
          ? 'opacity-0 scale-[1.03] pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      style={{
        backgroundColor: '#080A0F',
      }}
    >
      {/* Luz Ambiente Sutil de Fundo (Preto OLED com gradiente suave) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(52,120,246,0.06)_0%,_transparent_75%)] pointer-events-none" />

      {/* Container Central com a Estrela Pura (Sem Nenhuma Moldura ou Card) */}
      <div className="relative flex items-center justify-center pointer-events-none">
        {/* AURA DE LUZ AZUL ELÉTRICO: Respiração Volumétrica 100% GPU */}
        <div 
          className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[radial-gradient(circle,_rgba(52,120,246,0.45)_0%,_rgba(52,120,246,0.12)_45%,_transparent_70%)] blur-2xl animate-star-aura pointer-events-none" 
        />

        {/* NÚCLEO ESPECULAR INTERNO DA ESTRELA */}
        <div 
          className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-[#3478F6]/30 via-[#75A7FF]/20 to-transparent blur-xl pointer-events-none" 
        />

        {/* ESTRELA SOLTA OFICIAL ARENAFITPRO: Hardware-Accelerated Floating Motion */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center animate-star-float overflow-hidden">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_0_30px_rgba(52,120,246,0.65)]"
          >
            <defs>
              {/* Gradiente Cromo Metálico Puro */}
              <linearGradient id="starMetalMain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#E4E4E7" />
                <stop offset="50%" stopColor="#A1A1AA" />
                <stop offset="75%" stopColor="#E4E4E7" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>

              {/* Bisel de Reflexo */}
              <linearGradient id="starSpecularBezel" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#A1A1AA" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3F3F46" stopOpacity="0.8" />
              </linearGradient>

              {/* Brilho Azul no Centro da Estrela */}
              <radialGradient id="starBlueCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#75A7FF" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#3478F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#080A0F" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Aura de calor atrás da geometria */}
            <circle cx="100" cy="100" r="55" fill="url(#starBlueCore)" opacity="0.6" filter="blur(8px)" />

            {/* Geometria Estelar 4-Pontas ArenaFitPro */}
            <path
              d="M 100,6 
                 C 100,66 134,100 194,100 
                 C 134,100 100,134 100,194 
                 C 100,134 66,100 6,100 
                 C 66,100 100,66 100,6 Z"
              fill="url(#starMetalMain)"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeOpacity="0.85"
            />

            {/* Facetas de Bisel 3D Interno */}
            <path d="M 100,6 L 100,194" stroke="#FFFFFF" strokeWidth="1.1" opacity="0.75" />
            <path d="M 6,100 L 194,100" stroke="#FFFFFF" strokeWidth="1.1" opacity="0.75" />

            {/* Núcleo Central de Titânio */}
            <circle cx="100" cy="100" r="14" fill="#080A0F" opacity="0.6" />
            <circle cx="100" cy="100" r="8" fill="#3478F6" opacity="0.8" />
            <circle cx="100" cy="100" r="3.5" fill="#FFFFFF" />
          </svg>

          {/* Feixe Especular de Luz Metálica (Gleam Shimmer) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-[200%] h-8 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[2px] animate-star-shimmer pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
