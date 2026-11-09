'use client';

import React, { useEffect, useState } from 'react';
import { TitaniumStarLogo } from '@/components/ui/titanium-star-logo';

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
  isReady,
  onFinish,
  minDisplayTimeMs = 800, // Tempo de exibição ágil e fluido
}: MobileLoadingScreenProps) {
  const [mountedTime] = useState(() => Date.now());
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Fade Out só é disparado se isReady for explicitamente fornecido como true
  useEffect(() => {
    if (isReady === true) {
      const elapsed = Date.now() - mountedTime;
      const remainingTime = Math.max(0, minDisplayTimeMs - elapsed);

      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const unmountTimer = setTimeout(() => {
          setShouldRender(false);
          if (onFinish) onFinish();
        }, 250);
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
        fullScreen ? 'fixed inset-0 z-[100]' : 'w-full min-h-[60vh]'
      } bg-black flex items-center justify-center p-6 select-none transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFadingOut
          ? 'opacity-0 scale-[1.03] pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      style={{
        backgroundColor: '#000000',
      }}
    >
      {/* 1. Fundo Preto OLED Absoluto com Brilho Central Titânio Sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.025)_0%,_transparent_70%)] pointer-events-none" />

      {/* 2. Container Central com a Estrela Pura do Ícone Oficial (Sem Moldura e Sem Borda Redonda) */}
      <div className="relative flex items-center justify-center pointer-events-none">
        {/* AURA TITANIUM ESPECULAR: Respiração Volumétrica 100% GPU */}
        <div 
          className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_0%,_rgba(161,161,170,0.02)_45%,_transparent_70%)] blur-3xl animate-star-aura pointer-events-none" 
        />

        {/* NÚCLEO LUMINOSO DE TITÂNIO ATRÁS DA ESTRELA */}
        <div 
          className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-white/10 via-zinc-400/5 to-transparent blur-2xl pointer-events-none" 
        />

        {/* ESTRELA OFICIAL IDÊNTICA AO ÍCONE ARENAFITPRO: Hardware-Accelerated Floating Motion */}
        <TitaniumStarLogo />
      </div>
    </div>
  );
}

