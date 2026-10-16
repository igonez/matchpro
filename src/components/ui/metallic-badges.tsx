import React from 'react';

interface MedalProps {
  className?: string;
  size?: number;
}

export function GoldMedalBadge({ className = '', size = 28 }: MedalProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Medalha de Ouro - 1º Lugar"
    >
      <defs>
        <radialGradient id="gold-radial" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFF2A3" />
          <stop offset="45%" stopColor="#EAB308" />
          <stop offset="85%" stopColor="#A16207" />
          <stop offset="100%" stopColor="#713F12" />
        </radialGradient>
        <linearGradient id="gold-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#422006" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14.5" fill="url(#gold-radial)" stroke="url(#gold-rim)" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="11.5" stroke="#FEF9C3" strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <path
        d="M16 8L18.2 12.8L23.4 13.5L19.5 17.1L20.5 22.2L16 19.7L11.5 22.2L12.5 17.1L8.6 13.5L13.8 12.8L16 8Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
    </svg>
  );
}

export function SilverMedalBadge({ className = '', size = 28 }: MedalProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Medalha de Prata - 2º Lugar"
    >
      <defs>
        <radialGradient id="silver-radial" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="85%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>
        <linearGradient id="silver-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14.5" fill="url(#silver-radial)" stroke="url(#silver-rim)" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="11.5" stroke="#F1F5F9" strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <path
        d="M16 8L18.2 12.8L23.4 13.5L19.5 17.1L20.5 22.2L16 19.7L11.5 22.2L12.5 17.1L8.6 13.5L13.8 12.8L16 8Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
    </svg>
  );
}

export function BronzeMedalBadge({ className = '', size = 28 }: MedalProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Medalha de Bronze - 3º Lugar"
    >
      <defs>
        <radialGradient id="bronze-radial" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFEDD5" />
          <stop offset="45%" stopColor="#EA580C" />
          <stop offset="85%" stopColor="#9A3412" />
          <stop offset="100%" stopColor="#431407" />
        </radialGradient>
        <linearGradient id="bronze-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="50%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#2A0B02" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14.5" fill="url(#bronze-radial)" stroke="url(#bronze-rim)" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="11.5" stroke="#FFEDD5" strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
      <path
        d="M16 8L18.2 12.8L23.4 13.5L19.5 17.1L20.5 22.2L16 19.7L11.5 22.2L12.5 17.1L8.6 13.5L13.8 12.8L16 8Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
    </svg>
  );
}
