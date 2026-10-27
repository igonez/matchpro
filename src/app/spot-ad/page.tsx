'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Film,
  Sparkles
} from 'lucide-react';

// Estrela 4 pontas oficial ArenaFitPro em Cromo 3D (extrusão multicamada)
function ChromeStar3D({ size = 140 }: { size?: number }) {
  const layers = 10;
  const path = 'M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42 Z';
  return (
    <motion.div
      animate={{ rotateY: [-25, 25, -25], rotateX: [8, -8, 8] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: size,
        height: size,
        position: 'relative',
        transformStyle: 'preserve-3d',
      }}
    >
      {Array.from({ length: layers }).map((_, i) => {
        const z = (i - layers / 2) * 1.6;
        const isFront = i === layers - 1;
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
              filter: isFront ? 'drop-shadow(0 0 18px rgba(255,255,255,0.65))' : undefined,
            }}
          >
            <defs>
              <linearGradient id={`star-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isFront ? '#ffffff' : '#71717a'} />
                <stop offset="55%" stopColor={isFront ? '#e4e4e7' : '#3f3f46'} />
                <stop offset="100%" stopColor={isFront ? '#71717a' : '#18181b'} />
              </linearGradient>
            </defs>
            <path d={path} fill={`url(#star-grad-${i})`} />
            {isFront && (
              <>
                <path d="M50 22 L56 50 L50 78 L44 50 Z" fill="#52525b" />
                <circle cx="50" cy="50" r="4.2" fill="#ffffff" />
              </>
            )}
          </svg>
        );
      })}
    </motion.div>
  );
}

// Smartphone 3D Extrudado com Telas Reais Fidedignas do ArenaFitPro
function Phone3DReal({
  src,
  width = 210,
  rotateX = 8,
  rotateY = -16,
  rotateZ = 2,
  children,
}: {
  src: string;
  width?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  children?: React.ReactNode;
}) {
  const height = Math.round(width * (1920 / 1080));
  const layers = 8;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.78, rotateY: rotateY - 35, rotateX: rotateX + 18 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateY: [rotateY, rotateY + 8, rotateY],
        rotateX: [rotateX, rotateX - 4, rotateX],
        rotateZ,
      }}
      transition={{
        opacity: { duration: 0.35 },
        scale: { type: 'spring', stiffness: 160, damping: 16 },
        rotateY: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        rotateX: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{
        width,
        height,
        position: 'relative',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Chassi de Titânio 3D extrudado */}
      {Array.from({ length: layers }).map((_, i) => {
        const z = -i * 2.2;
        const shade = 68 - i * 5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: -5,
              borderRadius: 28,
              background: `linear-gradient(135deg, rgb(${shade + 35},${shade + 35},${shade + 42}), rgb(${shade - 15},${shade - 15},${shade - 10}) 50%, rgb(${shade + 18},${shade + 18},${shade + 24}))`,
              transform: `translateZ(${z}px)`,
            }}
          />
        );
      })}

      {/* Moldura frontal especular */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: 27,
          background: 'linear-gradient(160deg, #71717a, #18181b 45%, #52525b 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.22) inset, 0 25px 50px rgba(0,0,0,0.9)',
          transform: 'translateZ(1px)',
        }}
      />

      {/* Tela Real Fidedigna do ArenaFitPro */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 23,
          overflow: 'hidden',
          backgroundColor: '#000',
          transform: 'translateZ(2px)',
        }}
      >
        <img
          src={src}
          alt="ArenaFitPro App Screen"
          className="w-full h-full object-cover"
        />
        {children}
        {/* Reflexo de vidro animado */}
        <motion.div
          animate={{ x: ['-120%', '140%'] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)',
          }}
        />
      </div>
    </motion.div>
  );
}

export default function SpotAdMotionPage() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'interactive' | 'video'>('interactive');

  // Sintetizador Web Audio API para SFX sincronizado
  const playSfx = (type: 'whoosh' | 'pop' | 'cash' | 'slam') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'whoosh') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'slam') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (type === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(780, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'cash') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
        osc.start(now);
        osc.stop(now + 0.42);
      }
    } catch {
      // Ignora bloqueio de autoplay antes de clique
    }
  };

  // 6 Cenas fiéis ao vídeo Remotion: Hook, Brand 3D, Câmera IA Real, Leaderboard Real, Financeiro Split Real, Showcase Triplo 3D
  const stepDurations = [2800, 2600, 4000, 4000, 4000, 4500];

  useEffect(() => {
    if (!isLooping || viewMode === 'video') return;

    playSfx(
      currentStep === 4 ? 'cash' : currentStep === 0 ? 'slam' : currentStep === 1 ? 'pop' : 'whoosh'
    );

    const timeout = setTimeout(() => {
      if (currentStep < stepDurations.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setCurrentStep(0);
      }
    }, stepDurations[currentStep]);

    return () => clearTimeout(timeout);
  }, [currentStep, isLooping, viewMode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-white p-4 font-sans select-none overflow-hidden">
      {/* Glow ambiente */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[520px] h-[780px] bg-white/[0.04] rounded-full blur-[160px]" />
      </div>

      {/* Header Superior com Toggle MP4 Real (Remotion) vs Preview 3D */}
      <div className="relative mb-3 flex items-center justify-between w-full max-w-[400px] px-2 z-20">
        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-white/10 p-1 rounded-full">
          <button
            onClick={() => setViewMode('interactive')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 ${
              viewMode === 'interactive'
                ? 'bg-white text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>3D Ao Vivo</span>
          </button>
          <button
            onClick={() => setViewMode('video')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 ${
              viewMode === 'video'
                ? 'bg-emerald-400 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-3 h-3" />
            <span>Vídeo MP4 (Remotion)</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {viewMode === 'interactive' && (
            <>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:border-white/30 transition"
                title={soundEnabled ? 'Mutar SFX' : 'Ativar SFX'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
              </button>
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setIsLooping(true);
                }}
                className="p-1.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:border-white/30 transition"
                title="Reiniciar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <a
            href="/arenafitpro-spot.mp4"
            download="ArenaFitPro-Spot-3D.mp4"
            className="px-2.5 py-1.5 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1 hover:bg-zinc-200 transition"
            title="Baixar arquivo MP4 renderizado pelo Remotion"
          >
            <Download className="w-3 h-3" />
            <span>MP4</span>
          </a>
        </div>
      </div>

      {/* MODO VÍDEO RENDERIZADO PELO REMOTION */}
      {viewMode === 'video' ? (
        <div className="relative w-full max-w-[390px] h-[693px] bg-black rounded-[44px] border-[1.5px] border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden z-10">
          <video
            src="/arenafitpro-spot.mp4"
            className="w-full h-full object-cover"
            controls
            autoPlay
            loop
            playsInline
          />
        </div>
      ) : (
        /* MODO INTERATIVO 3D EM TEMPO REAL */
        <div className="relative w-full max-w-[390px] h-[693px] bg-[#040406] rounded-[46px] border-[1.5px] border-white/[0.15] shadow-[0_30px_90px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.25)] overflow-hidden flex flex-col z-10">
          {/* Dynamic Island */}
          <div className="absolute top-3 inset-x-0 h-6 z-50 flex items-center justify-center">
            <div className="w-32 h-4 bg-black border border-white/10 rounded-full flex items-center justify-between px-3">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">ARENA 3D</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            </div>
          </div>

          {/* Linha de Progresso Stories */}
          <div className="absolute top-10 inset-x-5 z-40 flex gap-1">
            {stepDurations.map((_, i) => (
              <div key={i} className="flex-1 h-[2.5px] bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.9)] ${
                    i < currentStep ? 'w-full' : i === currentStep ? 'w-full transition-all duration-[3500ms] ease-linear' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Chão Infinito 3D em Perspectiva */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ perspective: 500, perspectiveOrigin: '50% 35%' }}
          >
            <div
              style={{
                position: 'absolute',
                left: '-40%',
                width: '180%',
                top: '56%',
                height: '100%',
                transform: 'rotateX(72deg)',
                transformOrigin: '50% 0%',
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '42px 42px',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0) 75%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0) 75%)',
              }}
            />
          </div>

          {/* Palco 3D das Cenas */}
          <div
            className="relative flex-1 flex flex-col justify-center items-center p-5 text-center overflow-hidden"
            style={{ perspective: 1100 }}
          >
            <AnimatePresence mode="wait">
              {currentStep === 0 && <SceneHook3D key="s0" />}
              {currentStep === 1 && <SceneBrand3D key="s1" />}
              {currentStep === 2 && <SceneCameraReal3D key="s2" />}
              {currentStep === 3 && <SceneLeaderboardReal3D key="s3" />}
              {currentStep === 4 && <SceneFinanceReal3D key="s4" />}
              {currentStep === 5 && <SceneShowcaseTriplo3D key="s5" />}
            </AnimatePresence>
          </div>

          {/* Rodapé Técnico */}
          <div className="p-3.5 bg-black/75 backdrop-blur-xl border-t border-white/[0.08] z-30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-300">
                Telas Reais ArenaFitPro • 3D Motion
              </span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500 font-bold">
              0{currentStep + 1} / 06
            </span>
          </div>
        </div>
      )}

      {/* Botões de Seleção de Cenas */}
      {viewMode === 'interactive' && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5 z-20 max-w-[410px]">
          {['1. Hook 3D', '2. Logo 3D', '3. Câmera IA', '4. Leaderboard', '5. Split Pix', '6. Trio 3D'].map((label, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                setIsLooping(true);
              }}
              className={`px-2.5 py-1 text-[10px] rounded-full font-mono transition ${
                currentStep === idx
                  ? 'bg-white text-black font-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                  : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CENAS 3D INTERATIVAS COM AS TELAS REAIS DO ARENAFITPRO
// ---------------------------------------------------------------------------

// CENA 1: Hook 3D com Estrela Cromada + Tipografia Cinética
function SceneHook3D() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.15, filter: 'blur(8px)' }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center w-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="mb-3 opacity-80">
        <ChromeStar3D size={120} />
      </div>

      <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-300 mb-3">
        Personal • Nutri • Academia
      </span>

      <motion.h2
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="text-4xl font-black uppercase tracking-tighter bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_6px_0_#27272a]"
      >
        DESAFIO NO
      </motion.h2>

      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="relative my-1"
      >
        <span className="text-4xl font-black uppercase tracking-tighter text-red-400">
          WHATSAPP?
        </span>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.35, duration: 0.25 }}
          className="absolute left-0 top-1/2 h-1.5 bg-white rounded-full shadow-[0_0_15px_#fff]"
        />
      </motion.div>

      <motion.div
        initial={{ scale: 2.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 14 }}
        className="mt-4 px-5 py-1.5 bg-white text-black font-black text-2xl rounded-xl -rotate-2 shadow-[0_15px_40px_rgba(255,255,255,0.3)]"
      >
        ACABOU.
      </motion.div>
    </motion.div>
  );
}

// CENA 2: Ícone Oficial HD Girando em 3D
function SceneBrand3D() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -30 }}
      className="flex flex-col items-center justify-center w-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        initial={{ rotateY: -90, rotateX: 35, scale: 0.6 }}
        animate={{ rotateY: [-14, 14, -14], rotateX: [10, 4, 10], scale: 1 }}
        transition={{
          scale: { type: 'spring', stiffness: 120, damping: 14 },
          rotateY: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          rotateX: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-36 h-36 mb-5"
      >
        {/* Extrusão traseira do ícone */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 34,
              background: '#27272a',
              transform: `translateZ(${-i * 2.5}px)`,
            }}
          />
        ))}
        <img
          src="/logo-arenafitpro-original-hd.png"
          alt="ArenaFitPro"
          className="w-full h-full rounded-[34px] shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/20"
          style={{ transform: 'translateZ(2px)' }}
        />
      </motion.div>

      <h1 className="text-4xl font-black tracking-tight">
        <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_4px_0_#27272a]">
          ArenaFit
        </span>
        <span className="text-zinc-400 font-light">Pro</span>
      </h1>
      <span className="mt-2 font-mono text-[10px] tracking-[0.35em] text-zinc-400 uppercase">
        GAMIFICATION OS
      </span>
    </motion.div>
  );
}

// CENA 3: Tela Real da Câmera Antifraude + Chips Flutuantes em Paralaxe 3D
function SceneCameraReal3D() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="relative flex flex-col items-center justify-center w-full h-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="relative flex items-center justify-center -mt-8" style={{ transformStyle: 'preserve-3d' }}>
        <Phone3DReal
          src="/social/App Screens Realistas/tela-camera-antifraude-mobile.jpg"
          width={205}
          rotateY={-16}
          rotateX={8}
          rotateZ={2}
        >
          {/* Feixe Laser Escaneando a Refeição Real */}
          <motion.div
            animate={{ top: ['24%', '52%', '24%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-x-3 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_4px_rgba(52,211,153,0.7)]"
          />
        </Phone3DReal>

        {/* Chip 3D: Galeria Bloqueada */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, y: [-3, 3, -3], opacity: 1 }}
          transition={{ delay: 0.2, y: { duration: 2.5, repeat: Infinity } }}
          style={{ transform: 'translateZ(60px) rotateY(14deg)' }}
          className="absolute -left-14 top-12 px-3 py-2 rounded-2xl bg-zinc-950/90 border border-red-400/60 shadow-[0_15px_35px_rgba(0,0,0,0.9)] text-left backdrop-blur-md"
        >
          <p className="text-[8px] font-mono text-red-400 tracking-wider">⛔ GALERIA</p>
          <p className="text-xs font-black text-white">BLOQUEADA</p>
        </motion.div>

        {/* Chip 3D: IA Nutricional */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, y: [3, -3, 3], opacity: 1 }}
          transition={{ delay: 0.35, y: { duration: 2.8, repeat: Infinity } }}
          style={{ transform: 'translateZ(75px) rotateY(-14deg)' }}
          className="absolute -right-14 top-36 px-3 py-2 rounded-2xl bg-zinc-950/90 border border-emerald-400/60 shadow-[0_15px_35px_rgba(0,0,0,0.9)] text-left backdrop-blur-md"
        >
          <p className="text-[8px] font-mono text-emerald-400 tracking-wider">IA NUTRICIONAL</p>
          <p className="text-xs font-black text-white">580 KCAL ✓</p>
        </motion.div>

        {/* Chip 3D: Timestamp +15 XP */}
        <motion.div
          initial={{ x: -70, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ transform: 'translateZ(65px) rotateY(12deg)' }}
          className="absolute -left-12 bottom-12 px-3 py-2 rounded-2xl bg-zinc-950/90 border border-amber-400/60 shadow-[0_15px_35px_rgba(0,0,0,0.9)] text-left backdrop-blur-md"
        >
          <p className="text-[8px] font-mono text-zinc-400">TIMESTAMP 12:45:19</p>
          <p className="text-sm font-black text-amber-400">+15 XP</p>
        </motion.div>
      </div>

      <div className="mt-5 text-sm font-black uppercase tracking-tight">
        CÂMERA <span className="bg-emerald-400 text-black px-2 py-0.5 rounded-md">ANTIFRAUDE</span> AO VIVO
      </div>
    </motion.div>
  );
}

// CENA 4: Tela Real do Leaderboard + Medalhas Metálicas 3D
function SceneLeaderboardReal3D() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="relative flex flex-col items-center justify-center w-full h-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="relative flex items-center justify-center -mt-8" style={{ transformStyle: 'preserve-3d' }}>
        <Phone3DReal
          src="/social/App Screens Realistas/tela-leaderboard-mobile.jpg"
          width={205}
          rotateY={16}
          rotateX={8}
          rotateZ={-2}
        />

        {/* Medalha 1º Ouro 3D */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotateY: [-22, 22, -22] }}
          transition={{ scale: { type: 'spring', delay: 0.15 }, rotateY: { duration: 3, repeat: Infinity } }}
          style={{
            transform: 'translateZ(80px)',
            background: 'radial-gradient(circle at 35% 30%, #fff, #facc15 45%, #713f12 110%)',
          }}
          className="absolute -left-11 top-4 w-12 h-12 rounded-full flex items-center justify-center font-black text-black text-base shadow-[0_10px_25px_rgba(250,204,21,0.5)] border-2 border-yellow-200"
        >
          1º
        </motion.div>

        {/* Medalha 2º Prata 3D */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotateY: [20, -20, 20] }}
          transition={{ scale: { type: 'spring', delay: 0.25 }, rotateY: { duration: 3.2, repeat: Infinity } }}
          style={{
            transform: 'translateZ(65px)',
            background: 'radial-gradient(circle at 35% 30%, #fff, #d4d4d8 50%, #27272a 110%)',
          }}
          className="absolute -right-11 top-20 w-10 h-10 rounded-full flex items-center justify-center font-black text-black text-sm shadow-xl border border-white"
        >
          2º
        </motion.div>

        {/* Card XP Subindo */}
        <motion.div
          initial={{ x: 70, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.35, type: 'spring' }}
          style={{ transform: 'translateZ(75px) rotateY(-14deg)' }}
          className="absolute -right-14 bottom-16 px-3 py-2 rounded-2xl bg-zinc-950/95 border border-amber-400/70 shadow-2xl text-left"
        >
          <p className="text-[8px] font-mono text-zinc-400">GABRIEL • XP TOTAL</p>
          <p className="text-base font-black text-amber-400">1.865 XP</p>
          <p className="text-[9px] font-bold text-emerald-400">▲ PASSOU PARA #03</p>
        </motion.div>
      </div>

      <div className="mt-5 text-sm font-black uppercase tracking-tight">
        RANKING AO VIVO QUE <span className="bg-amber-400 text-black px-2 py-0.5 rounded-md">VICIA</span> A TURMA
      </div>
    </motion.div>
  );
}

// CENA 5: Tela Real da Central Financeira + Moedas Pix 3D
function SceneFinanceReal3D() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center justify-center w-full h-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="mb-2 z-20">
        <span className="text-[9px] font-mono tracking-[0.25em] text-emerald-400 uppercase">
          ⚡ SPLIT PIX D+0 • ASAAS
        </span>
        <motion.div
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 180 }}
          className="text-4xl font-black tracking-tight bg-gradient-to-b from-white via-zinc-100 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_5px_0_#064e3b]"
        >
          R$ 4.750,00
        </motion.div>
        <p className="text-[11px] text-zinc-400 font-semibold">
          na sua conta. <span className="text-emerald-400 font-bold">0% de taxa</span> no PRO.
        </p>
      </div>

      <div className="relative flex items-center justify-center mt-1" style={{ transformStyle: 'preserve-3d' }}>
        <Phone3DReal
          src="/social/App Screens Realistas/tela-financeiro-split-mobile.jpg"
          width={185}
          rotateX={18}
          rotateY={-6}
          rotateZ={1}
        />

        {/* Moedas Pix 3D Flutuando */}
        {[-1, 1].map((dir, idx) => (
          <motion.div
            key={idx}
            animate={{ y: [-8, 8, -8], rotateY: [-25, 25, -25] }}
            transition={{ duration: 2.6 + idx * 0.4, repeat: Infinity }}
            style={{
              transform: 'translateZ(75px)',
              background: 'radial-gradient(circle at 35% 30%, #d1fae5, #34d399 45%, #065f46 110%)',
            }}
            className={`absolute ${dir < 0 ? '-left-11 top-10' : '-right-11 bottom-14'} w-11 h-11 rounded-full border-2 border-emerald-300 flex items-center justify-center font-black text-xs text-emerald-950 shadow-[0_0_25px_rgba(52,211,153,0.6)]`}
          >
            R$
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// CENA 6: Leque 3D com as 3 Telas Reais + CTA
function SceneShowcaseTriplo3D() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-between w-full h-full py-4"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Leque Triplo de iPhones 3D */}
      <div className="relative flex items-center justify-center w-full h-72 mt-2" style={{ perspective: 900, transformStyle: 'preserve-3d' }}>
        {/* Esquerda: Câmera */}
        <div className="absolute -left-2" style={{ transform: 'translateZ(-40px) rotateY(24deg) rotateZ(-4deg)' }}>
          <Phone3DReal
            src="/social/App Screens Realistas/tela-camera-antifraude-mobile.jpg"
            width={130}
            rotateY={22}
            rotateX={4}
            rotateZ={-3}
          />
        </div>

        {/* Direita: Financeiro */}
        <div className="absolute -right-2" style={{ transform: 'translateZ(-40px) rotateY(-24deg) rotateZ(4deg)' }}>
          <Phone3DReal
            src="/social/App Screens Realistas/tela-financeiro-split-mobile.jpg"
            width={130}
            rotateY={-22}
            rotateX={4}
            rotateZ={3}
          />
        </div>

        {/* Centro: Leaderboard */}
        <div className="relative z-20" style={{ transform: 'translateZ(35px)' }}>
          <Phone3DReal
            src="/social/App Screens Realistas/tela-leaderboard-mobile.jpg"
            width={152}
            rotateY={0}
            rotateX={5}
            rotateZ={0}
          />
        </div>
      </div>

      {/* Assinatura + Botão CTA */}
      <div className="w-full flex flex-col items-center z-30">
        <div className="flex items-center gap-2 mb-3">
          <img src="/logo-arenafitpro-original-hd.png" alt="Logo" className="w-7 h-7 rounded-lg" />
          <span className="text-xl font-black tracking-tight">
            ArenaFit<span className="text-zinc-400 font-light">Pro</span>
          </span>
        </div>

        <motion.button
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="w-full py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full shadow-[0_15px_35px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 hover:bg-zinc-200 transition"
        >
          <span>CRIE SEU DESAFIO</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
        <span className="mt-2 font-mono text-[9px] text-zinc-400 tracking-widest">
          arenafitpro.com.br
        </span>
      </div>
    </motion.div>
  );
}
