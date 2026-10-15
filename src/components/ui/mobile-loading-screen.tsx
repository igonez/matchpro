'use client';

import React, { useEffect, useState, useRef } from 'react';

interface MobileLoadingScreenProps {
  fullScreen?: boolean;
  isReady?: boolean;
  onFinish?: () => void;
  minDisplayTimeMs?: number;
  title?: string; // Mantido para compatibilidade reversa, mas não renderiza texto
  subtitle?: string; // Mantido para compatibilidade reversa, mas não renderiza texto
}

export function MobileLoadingScreen({
  fullScreen = true,
  isReady = true,
  onFinish,
  minDisplayTimeMs = 1000,
}: MobileLoadingScreenProps) {
  const [mountedTime] = useState(() => Date.now());
  const [isMounted, setIsMounted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Efeito de Entrada Suave (Fade In) logo após montar
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // 2. Orquestração do Ciclo de Vida e Fade Out cinematográfico
  useEffect(() => {
    if (isReady) {
      const elapsed = Date.now() - mountedTime;
      const remainingTime = Math.max(0, minDisplayTimeMs - elapsed);

      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const unmountTimer = setTimeout(() => {
          setShouldRender(false);
          if (onFinish) onFinish();
        }, 750); // 750ms de transição suave de fade out
        return () => clearTimeout(unmountTimer);
      }, remainingTime);

      return () => clearTimeout(timer);
    } else {
      setIsFadingOut(false);
    }
  }, [isReady, mountedTime, minDisplayTimeMs, onFinish]);

  // 3. Efeito Interativo de Luz no Fundo da Logo (Hover & Mouse Movement)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = ((e.clientX - centerX) / (rect.width / 2)) * 18; // Deslocamento sutil de luz
    const y = ((e.clientY - centerY) / (rect.height / 2)) * 18;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseOffset({ x: 0, y: 0 });
  };

  if (!shouldRender) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`${
        fullScreen ? 'fixed inset-0 z-50' : 'w-full min-h-[70vh]'
      } bg-black flex items-center justify-center p-6 select-none overflow-hidden transition-all duration-750 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        !isMounted
          ? 'opacity-0 scale-[0.94] blur-md pointer-events-none'
          : isFadingOut
          ? 'opacity-0 scale-[1.04] blur-sm pointer-events-none'
          : 'opacity-100 scale-100 blur-none pointer-events-auto'
      }`}
      style={{
        backgroundColor: '#000000',
      }}
    >
      {/* Luz Ambiente Especular Profunda (Veludo Preto OLED) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.035)_0%,_transparent_75%)] pointer-events-none" />

      {/* Container Central com a Logo e Sistema de Halo Especular no Fundo */}
      <div
        className="relative flex items-center justify-center cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        {/* AURA CAMADA 1: Luz Volumétrica Ampla que Respira e Expande no Hover */}
        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-700 ease-out ${
            isHovered
              ? 'w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] bg-white/[0.16] blur-[75px] scale-125 opacity-100'
              : 'w-64 sm:w-80 h-64 sm:h-80 bg-white/[0.05] blur-[60px] scale-100 opacity-60 animate-pulse'
          }`}
          style={{
            transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)`,
          }}
        />

        {/* AURA CAMADA 2: Núcleo Radial Luminous Especular Diretamente Atrás da Logo */}
        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-500 ease-out ${
            isHovered
              ? 'w-52 sm:w-64 h-52 sm:h-64 bg-gradient-to-tr from-white/35 via-zinc-300/20 to-transparent blur-3xl scale-135 opacity-100 rotate-45'
              : 'w-40 sm:w-48 h-40 sm:h-48 bg-gradient-to-tr from-white/15 via-zinc-400/10 to-transparent blur-2xl scale-95 opacity-50'
          }`}
          style={{
            transform: `translate(${mouseOffset.x * 1.2}px, ${mouseOffset.y * 1.2}px)`,
          }}
        />

        {/* AURA CAMADA 3: Anel de Luz Perimetral (Rim Glow) que acende no Hover */}
        <div
          className={`absolute -inset-4 rounded-[36px] pointer-events-none transition-all duration-500 ease-out ${
            isHovered
              ? 'bg-gradient-to-b from-white/40 via-zinc-400/20 to-transparent blur-xl opacity-100 scale-105'
              : 'bg-white/[0.04] blur-lg opacity-30 scale-95'
          }`}
        />

        {/* CARD SQUIRCLE DE LUXO: Logo do App em Altíssima Definição */}
        <div
          className={`relative h-28 w-28 sm:h-36 sm:w-36 rounded-[28px] sm:rounded-[32px] overflow-hidden border bg-zinc-950/80 backdrop-blur-2xl flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isHovered
              ? 'border-white/50 scale-105 shadow-[0_0_50px_rgba(255,255,255,0.35),0_20px_40px_rgba(0,0,0,0.9)] ring-1 ring-white/30'
              : 'border-white/15 scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(255,255,255,0.05)]'
          }`}
          style={{
            transform: isHovered
              ? `scale(1.05) translate(${mouseOffset.x * 0.3}px, ${mouseOffset.y * 0.3}px)`
              : 'scale(1)',
          }}
        >
          {/* Logo Oficial em Altíssima Resolução */}
          <img
            src="/app-logo.png"
            alt="ArenaFitPro"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            style={{
              imageRendering: '-webkit-optimize-contrast',
            }}
          />

          {/* Brilho Especular Deslizante sobre a Superfície de Vidro no Hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
