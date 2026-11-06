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
  isReady,
  onFinish,
  minDisplayTimeMs = 1500, // 1.5s de exibição contínua
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
        fullScreen ? 'fixed inset-0 z-50' : 'w-full min-h-[60vh]'
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
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center animate-star-float">
          <svg
            viewBox="0 0 2048 2048"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.18)] drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
          >
            <defs>
              {/* Gradiente Titânio Prateado Oficial do Ícone */}
              <linearGradient id="titaniumStarGrad" x1="1024" y1="420" x2="1024" y2="1628" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#F4F4F5" />
                <stop offset="65%" stopColor="#A1A1AA" />
                <stop offset="100%" stopColor="#52525B" />
              </linearGradient>

              {/* Bisel Chanfrado Especular Titânio */}
              <linearGradient id="titaniumBezelGrad" x1="420" y1="420" x2="1628" y2="1628" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#71717A" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#18181B" stopOpacity="0.7" />
              </linearGradient>

              {/* Feixe Especular de Luz Nativo — Exclusivamente Sobre as Facetas da Estrela */}
              <linearGradient id="titaniumGleamLight" x1="-120%" y1="-120%" x2="20%" y2="20%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                <animate 
                  attributeName="x1" 
                  values="-150%;150%;-150%" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="y1" 
                  values="-150%;150%;-150%" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="x2" 
                  values="-10%;290%;-10%" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="y2" 
                  values="-10%;290%;-10%" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
              </linearGradient>

              {/* Filtro de Difusão Suave do Ícone */}
              <filter id="titaniumGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="16" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <g filter="url(#titaniumGlowFilter)">
              {/* 1. Polígono Estelar / Estrela Geométrica Oficial do Ícone */}
              <path
                d="M1024 420 L1160 888 L1628 1024 L1160 1160 L1024 1628 L888 1160 L420 1024 L888 888 Z"
                fill="url(#titaniumStarGrad)"
                stroke="url(#titaniumBezelGrad)"
                strokeWidth="12"
              />

              {/* 2. Feixe de Luz Titanium Aplicado Diretamente sobre a MESMA Silhueta da Estrela (Sem Nenhuma Borda Redonda) */}
              <path
                d="M1024 420 L1160 888 L1628 1024 L1160 1160 L1024 1628 L888 1160 L420 1024 L888 888 Z"
                fill="url(#titaniumGleamLight)"
                style={{ mixBlendMode: 'screen' }}
              />

              {/* 3. Facetas de Bisel Interno (Linhas de Relevo Metálico) */}
              <line x1="1024" y1="420" x2="1024" y2="1628" stroke="#FFFFFF" strokeWidth="8" opacity="0.6" />
              <line x1="420" y1="1024" x2="1628" y2="1024" stroke="#FFFFFF" strokeWidth="8" opacity="0.6" />

              {/* 4. Núcleo de Contraste Geométrico */}
              <polygon
                points="1024,710 1120,1024 1024,1338 928,1024"
                fill="#000000"
                fillOpacity="0.45"
              />

              {/* 5. Anéis Concêntricos Centrais Oficiais do Ícone */}
              <circle cx="1024" cy="1024" r="70" fill="#FFFFFF" />
              <circle cx="1024" cy="1024" r="45" fill="#18181B" />
              <circle cx="1024" cy="1024" r="16" fill="#FFFFFF" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
