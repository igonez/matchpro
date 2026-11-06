import React from 'react';

interface TitaniumStarLogoProps {
  className?: string;
  size?: number | string;
}

export function TitaniumStarLogo({ className = 'w-28 h-28 sm:w-36 sm:h-36', size }: TitaniumStarLogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`relative flex items-center justify-center animate-star-float ${className}`} style={style}>
      <svg
        viewBox="0 0 2048 2048"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.18)] drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
      >
        <defs>
          {/* Gradiente Titânio Prateado Oficial do Ícone */}
          <linearGradient id="titaniumStarGradCommon" x1="1024" y1="420" x2="1024" y2="1628" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#F4F4F5" />
            <stop offset="65%" stopColor="#A1A1AA" />
            <stop offset="100%" stopColor="#52525B" />
          </linearGradient>

          {/* Bisel Chanfrado Especular Titânio */}
          <linearGradient id="titaniumBezelGradCommon" x1="420" y1="420" x2="1628" y2="1628" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#71717A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#18181B" stopOpacity="0.7" />
          </linearGradient>

          {/* Feixe Especular de Luz Nativo — Exclusivamente Sobre as Facetas da Estrela */}
          <linearGradient id="titaniumGleamLightCommon" x1="-120%" y1="-120%" x2="20%" y2="20%">
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
          <filter id="titaniumGlowFilterCommon" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g filter="url(#titaniumGlowFilterCommon)">
          {/* 1. Polígono Estelar / Estrela Geométrica Oficial do Ícone */}
          <path
            d="M1024 420 L1160 888 L1628 1024 L1160 1160 L1024 1628 L888 1160 L420 1024 L888 888 Z"
            fill="url(#titaniumStarGradCommon)"
            stroke="url(#titaniumBezelGradCommon)"
            strokeWidth="12"
          />

          {/* 2. Feixe de Luz Titanium Aplicado Diretamente sobre a MESMA Silhueta da Estrela (Sem Nenhuma Borda Redonda) */}
          <path
            d="M1024 420 L1160 888 L1628 1024 L1160 1160 L1024 1628 L888 1160 L420 1024 L888 888 Z"
            fill="url(#titaniumGleamLightCommon)"
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
  );
}
