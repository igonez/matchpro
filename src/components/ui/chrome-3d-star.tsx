'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Chrome3DStarProps {
  size?: number;
  className?: string;
  delay?: number;
}

export function Chrome3DStar({
  size = 120,
  className = '',
  delay = 0,
}: Chrome3DStarProps) {
  return (
    <motion.div
      animate={{
        y: [0, -14, 0],
        rotateX: [0, 12, 0],
        rotateY: [0, -18, 0],
        rotateZ: [0, 4, 0],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
        width: size,
        height: size,
      }}
      className={`relative inline-block pointer-events-none select-none drop-shadow-[0_20px_35px_rgba(255,255,255,0.12)] ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter"
      >
        <defs>
          {/* Cromo Metálico Gradiente Principal */}
          <linearGradient id="chromeGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#a1a1aa" />
            <stop offset="45%" stopColor="#18181b" />
            <stop offset="55%" stopColor="#27272a" />
            <stop offset="75%" stopColor="#e4e4e7" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* Reflexo Especular Diagonal */}
          <linearGradient id="chromeSpecular" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#d4d4d8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#09090b" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#f4f4f5" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>

          {/* Sombra de Relevo Interno */}
          <radialGradient id="chromeCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#71717a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Brilho da Aura 3D Traseira */}
        <circle cx="100" cy="100" r="70" fill="url(#chromeCoreGlow)" opacity="0.35" filter="blur(14px)" />

        {/* 3D Chrome 4-Pointed Star Shape (Estrela Cromada da Imagem) */}
        <path
          d="M 100,5 
             C 100,65 135,100 195,100 
             C 135,100 100,135 100,195 
             C 100,135 65,100 5,100 
             C 65,100 100,65 100,5 Z"
          fill="url(#chromeGradMain)"
          stroke="url(#chromeSpecular)"
          strokeWidth="1.5"
          className="transition-all"
        />

        {/* Facetas de Bisel 3D Metálico Central */}
        <path
          d="M 100,5 L 100,195"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.6"
        />
        <path
          d="M 5,100 L 195,100"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.6"
        />

        {/* Reflexo Central de Ponto de Luz */}
        <circle cx="100" cy="100" r="6" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)" />
      </svg>
    </motion.div>
  );
}
