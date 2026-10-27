import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

// Paleta oficial ArenaFitPro (extraída das telas reais do app)
export const C = {
  black: '#000000',
  panel: '#0a0a0c',
  white: '#ffffff',
  zinc: '#a1a1aa',
  zincDark: '#52525b',
  emerald: '#34d399',
  gold: '#facc15',
  goldDeep: '#b8860b',
  bronze: '#f97316',
  red: '#f87171',
};

export const FONT = '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
export const MONO = '"JetBrains Mono", "Consolas", "Courier New", monospace';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Fundo titânio com grid em perspectiva 3D (chão infinito) + glow ambiente */
export const ArenaBackground: React.FC<{ glow?: string }> = ({ glow = 'rgba(255,255,255,0.10)' }) => {
  const frame = useCurrentFrame();
  const gridShift = (frame * 4) % 120;
  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: 'hidden' }}>
      {/* Glow volumétrico */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% 38%, ${glow}, transparent 70%)`,
        }}
      />
      {/* Chão em perspectiva */}
      <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: '50% 30%' }}>
        <div
          style={{
            position: 'absolute',
            left: '-50%',
            width: '200%',
            top: '55%',
            height: '120%',
            transform: 'rotateX(72deg)',
            transformOrigin: '50% 0%',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.09) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.09) 2px, transparent 2px)',
            backgroundSize: '120px 120px',
            backgroundPosition: `0px ${gridShift}px`,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0) 70%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0) 70%)',
          }}
        />
      </AbsoluteFill>
      {/* Vinheta */}
      <AbsoluteFill
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.85) 100%)' }}
      />
    </AbsoluteFill>
  );
};

/** Smartphone 3D extrudado (camadas em translateZ) exibindo uma tela REAL do app */
export const Phone3D: React.FC<{
  src: string;
  width?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  translateZ?: number;
  x?: number;
  y?: number;
  scale?: number;
  shine?: number; // 0-1 posição do reflexo especular
  children?: React.ReactNode;
}> = ({ src, width = 560, rotateX = 0, rotateY = 0, rotateZ = 0, translateZ = 0, x = 0, y = 0, scale = 1, shine = 0.5, children }) => {
  const height = width * (1920 / 1080);
  const radius = width * 0.12;
  const depth = 26; // espessura do aparelho em px
  const layers = 10;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        transformStyle: 'preserve-3d',
        transform: `translate3d(${x}px, ${y}px, ${translateZ}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
      }}
    >
      {/* Corpo extrudado em titânio */}
      {Array.from({ length: layers }).map((_, i) => {
        const z = -(i / (layers - 1)) * depth;
        const shade = 70 - i * 5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: radius + 10,
              background: `linear-gradient(135deg, rgb(${shade + 40},${shade + 40},${shade + 46}), rgb(${shade - 20},${shade - 20},${shade - 16}) 50%, rgb(${shade + 20},${shade + 20},${shade + 26}))`,
              transform: `translateZ(${z}px)`,
            }}
          />
        );
      })}
      {/* Moldura frontal */}
      <div
        style={{
          position: 'absolute',
          inset: -10,
          borderRadius: radius + 10,
          background: 'linear-gradient(160deg, #6b6b73, #1c1c20 40%, #3f3f46 100%)',
          boxShadow: '0 0 0 2px rgba(255,255,255,0.18) inset',
          transform: 'translateZ(1px)',
        }}
      />
      {/* Tela real */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: '#000',
          transform: 'translateZ(2px)',
        }}
      >
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {children}
        {/* Reflexo especular de vidro */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(115deg, transparent ${shine * 100 - 22}%, rgba(255,255,255,0.16) ${shine * 100}%, transparent ${shine * 100 + 18}%)`,
          }}
        />
      </div>
      {/* Sombra projetada no chão */}
      <div
        style={{
          position: 'absolute',
          left: '10%',
          right: '10%',
          bottom: -90,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.9), transparent 70%)',
          transform: 'translateZ(-60px) rotateX(80deg)',
        }}
      />
    </div>
  );
};

/** Estrela 4 pontas do logo ArenaFitPro em cromo 3D (extrusão por camadas) */
export const ChromeStar3D: React.FC<{ size?: number; rotateY?: number; rotateX?: number; glow?: number }> = ({
  size = 420,
  rotateY = 0,
  rotateX = 0,
  glow = 1,
}) => {
  const layers = 14;
  const path = 'M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42 Z';
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
    >
      {Array.from({ length: layers }).map((_, i) => {
        const z = (i - layers / 2) * 2.4;
        const isFront = i === layers - 1;
        const isBack = i === 0;
        return (
          <svg
            key={i}
            viewBox="0 0 100 100"
            width={size}
            height={size}
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateZ(${z}px)`,
              filter: isFront ? `drop-shadow(0 0 ${30 * glow}px rgba(255,255,255,${0.75 * glow}))` : undefined,
            }}
          >
            <defs>
              <linearGradient id={`chrome-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isFront || isBack ? '#ffffff' : '#9ca3af'} />
                <stop offset="55%" stopColor={isFront || isBack ? '#e4e4e7' : '#52525b'} />
                <stop offset="100%" stopColor={isFront || isBack ? '#71717a' : '#27272a'} />
              </linearGradient>
            </defs>
            <path d={path} fill={`url(#chrome-${i})`} />
            {(isFront || isBack) && (
              <>
                <path d="M50 22 L56 50 L50 78 L44 50 Z" fill="#7a7a80" />
                <circle cx="50" cy="50" r="4.2" fill="#ffffff" />
              </>
            )}
          </svg>
        );
      })}
    </div>
  );
};

/** Card de vidro flutuante (glassmorphism titânio) */
export const GlassChip: React.FC<{
  children: React.ReactNode;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ children, accent = 'rgba(255,255,255,0.25)', style }) => (
  <div
    style={{
      position: 'absolute',
      padding: '22px 30px',
      borderRadius: 28,
      background: 'rgba(12,12,14,0.82)',
      border: `2px solid ${accent}`,
      boxShadow: `0 30px 70px rgba(0,0,0,0.85), 0 0 40px ${accent.replace(/[\d.]+\)$/, '0.25)')}, inset 0 2px 2px rgba(255,255,255,0.15)`,
      backdropFilter: 'blur(20px)',
      color: C.white,
      fontFamily: FONT,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Texto cromado extrudado (camadas de text-shadow) */
export const chromeText = (depth = 10, color = '#3f3f46'): React.CSSProperties => ({
  background: 'linear-gradient(180deg, #ffffff 0%, #e4e4e7 45%, #8b8b94 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: `drop-shadow(0 ${depth}px 0 ${color}) drop-shadow(0 ${depth + 14}px 24px rgba(0,0,0,0.9))`,
});

/** Linha de legenda estilo TikTok com palavra em destaque */
export const Caption: React.FC<{ text: string; highlight?: string; start?: number; color?: string }> = ({
  text,
  highlight,
  start = 0,
  color = C.emerald,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 170,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 64,
        lineHeight: 1.15,
        letterSpacing: -1.5,
        textTransform: 'uppercase',
      }}
    >
      {words.map((w, i) => {
        const appear = interpolate(frame - start - i * 3, [0, 6], [0, 1], clamp);
        const isHi = highlight && w.toUpperCase().includes(highlight.toUpperCase());
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: 18,
              opacity: appear,
              transform: `translateY(${(1 - appear) * 30}px) scale(${0.8 + appear * 0.2})`,
              color: isHi ? '#000' : C.white,
              background: isHi ? color : 'transparent',
              padding: isHi ? '0 14px' : 0,
              borderRadius: 12,
              textShadow: isHi ? 'none' : '0 6px 24px rgba(0,0,0,0.95)',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
