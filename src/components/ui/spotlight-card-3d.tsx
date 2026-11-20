'use client';

import React, { useEffect, useRef, MouseEvent } from 'react';

interface SpotlightCard3DProps {
  children: React.ReactNode;
  className?: string;
  glowIntensity?: number;
}

export function SpotlightCard3D({
  children,
  className = '',
  glowIntensity = 0.12,
}: SpotlightCard3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = centerY ? ((y - centerY) / centerY) * -1.5 : 0;
      const rotateY = centerX ? ((x - centerX) / centerX) * 1.5 : 0;

      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      el.style.setProperty('--rx', `${rotateX}deg`);
      el.style.setProperty('--ry', `${rotateY}deg`);
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--mx': '50%',
          '--my': '50%',
          '--rx': '0deg',
          '--ry': '0deg',
          transform: 'perspective(1200px) rotateX(var(--rx)) rotateY(var(--ry))',
          transition: 'transform 0.25s ease-out',
          transformStyle: 'preserve-3d',
        } as React.CSSProperties
      }
      className={`group relative rounded-3xl overflow-hidden border border-[#27272A] bg-[#0E0E10]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_20px_rgba(52,120,246,0.08)] transition-shadow duration-300 ${className}`}
    >
      {/* Spotlight Radial Follower */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at var(--mx) var(--my), rgba(52, 120, 246, ${glowIntensity}), transparent 40%)`,
        }}
      />

      {/* Specular Top Edge Light */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#3478F6]/25 to-transparent pointer-events-none" />

      {/* Inner Content with Z-Depth */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
