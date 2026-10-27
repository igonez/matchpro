'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  RotateCcw, 
  ArrowRight,
  Zap,
  Camera,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ArenaFitMotionPlayer() {
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const totalScenes = 4;
  const sceneDurations = [4800, 5000, 5400, 5200]; // milissegundos por cena

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentScene < totalScenes - 1) {
        setCurrentScene((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, sceneDurations[currentScene]);

    return () => clearTimeout(timer);
  }, [currentScene, isPlaying]);

  const restartMotion = () => {
    setCurrentScene(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 font-sans selection:bg-white selection:text-black">
      {/* Background Decorativo Estilo Titânio */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[140px]" />
      </div>

      {/* Header de Controle */}
      <div className="relative mb-6 flex items-center justify-between w-full max-w-sm px-2 z-10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
            ARENAFIT PRO • IDENTITY MOTION
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-white/30 text-zinc-300 transition"
            title={isPlaying ? "Pausar" : "Reproduzir"}
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? "opacity-40" : "fill-white text-white"}`} />
          </button>
          <button
            onClick={restartMotion}
            className="p-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-white/30 text-zinc-300 transition"
            title="Reiniciar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dispositivo Estilo 9:16 - Titânio Monocromático */}
      <div className="relative w-full max-w-[380px] h-[680px] bg-[#050507] rounded-[44px] border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden flex flex-col z-10">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-3 inset-x-0 h-6 z-50 flex items-center justify-center">
          <div className="w-28 h-4 bg-black border border-white/10 rounded-full flex items-center justify-end px-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
        </div>

        {/* Linha do Tempo Estilo Stories */}
        <div className="absolute top-10 inset-x-5 z-40 flex gap-1.5">
          {Array.from({ length: totalScenes }).map((_, i) => (
            <div key={i} className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-white transition-all duration-300 shadow-[0_0_6px_rgba(255,255,255,0.8)] ${
                  i < currentScene ? 'w-full' : i === currentScene && isPlaying ? 'w-full transition-all duration-[5000ms] ease-linear' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Palco Principal das Cenas */}
        <div className="relative flex-1 flex flex-col justify-center items-center p-6 text-center">
          <AnimatePresence mode="wait">
            {currentScene === 0 && <SceneBrandIntro key="scene-0" />}
            {currentScene === 1 && <SceneTheProblem key="scene-1" />}
            {currentScene === 2 && <SceneAuditedExecution key="scene-2" />}
            {currentScene === 3 && <SceneLeaderboardAndSplit key="scene-3" />}
          </AnimatePresence>
        </div>

        {/* Subtítulo Dinâmico Monocromático */}
        <div className="p-4 bg-black/80 backdrop-blur-md border-t border-white/[0.08] z-40 text-center">
          <p className="text-[11px] text-zinc-400 font-medium tracking-tight">
            {currentScene === 0 && "⚡ O Sistema Operacional de Gamificação para Desafios Fitness"}
            {currentScene === 1 && "❌ Fim do WhatsApp caótico e planilhas manuais aos domingos"}
            {currentScene === 2 && "🛡️ Câmera Antifraude ao vivo e validação de hábitos com IA"}
            {currentScene === 3 && "👑 Ranking ao vivo, retenção máxima e Split Pix D+0 no Asaas"}
          </p>
        </div>
      </div>

      {/* Seletor Manual de Cenas */}
      <div className="mt-6 flex gap-2 z-10">
        {['1. Identidade', '2. O Gargalo', '3. Auditoria IA', '4. Pódio & Split'].map((name, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentScene(idx);
              setIsPlaying(true);
            }}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
              currentScene === idx 
                ? 'bg-white text-black font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

// CENA 1: Identidade Visual Dark Monocromática Titânio
function SceneBrandIntro() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-5"
    >
      {/* Símbolo Titânio com Brilho Especular */}
      <motion.div 
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-24 h-24 rounded-3xl bg-gradient-to-b from-white/[0.18] to-white/[0.02] border border-white/20 p-px shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.4)] flex items-center justify-center backdrop-blur-xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center border border-white/10 shadow-inner">
          <Zap className="w-8 h-8 text-white fill-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-white/[0.06] text-zinc-300 border border-white/15 uppercase">
          Gamification OS
        </span>
        <h1 className="text-3xl font-black tracking-tight mt-3 text-white">
          ArenaFit<span className="text-zinc-400 font-light">Pro</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-2 max-w-[250px] leading-relaxed">
          A camada definitiva de engajamento para Personal Trainers e Academias.
        </p>
      </motion.div>
    </motion.div>
  );
}

// CENA 2: A Dor Real da Consultoria Online / Desafios
function SceneTheProblem() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center w-full"
    >
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
        O Gargalo Operacional
      </span>

      <div className="w-full space-y-3 my-2">
        {/* Card WhatsApp Caos */}
        <motion.div 
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-3.5 bg-zinc-900/80 rounded-2xl border border-white/10 text-left flex items-center justify-between shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-400">
              💬
            </div>
            <div>
              <p className="text-xs font-bold text-white">Grupos no WhatsApp</p>
              <p className="text-[11px] text-zinc-400">Centenas de fotos perdidas no rolo</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
            Caos
          </span>
        </motion.div>

        {/* Card Planilhas */}
        <motion.div 
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-3.5 bg-zinc-900/80 rounded-2xl border border-white/10 text-left flex items-center justify-between shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-400">
              📑
            </div>
            <div>
              <p className="text-xs font-bold text-white">Contagem Manual</p>
              <p className="text-[11px] text-zinc-400">Horas perdidas calculando pontos</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10">
            Lento
          </span>
        </motion.div>
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs text-zinc-400 mt-4 px-2"
      >
        Você prescreve onde quiser. A ArenaFit audita o cumprimento.
      </motion.p>
    </motion.div>
  );
}

// CENA 3: Auditoria de Hábitos (Câmera Antifraude + IA)
function SceneAuditedExecution() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center w-full"
    >
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-white text-[10px] font-bold tracking-wider uppercase mb-3">
        <Sparkles className="w-3 h-3 text-white" />
        Auditoria Antifraude
      </div>

      <h3 className="text-xl font-black text-white mb-3 tracking-tight">
        Execução Comprovada
      </h3>

      <div className="w-full space-y-2.5">
        {/* Treino do Dia */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="p-3 bg-zinc-900/90 rounded-2xl border border-white/15 flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Treino de Hoje</p>
              <p className="text-[10px] text-zinc-400 font-mono">Foto ao vivo auditada • +50 XP</p>
            </div>
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            <CheckCircle2 className="w-5 h-5 text-white fill-white text-black" />
          </motion.div>
        </motion.div>

        {/* Refeição */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="p-3 bg-zinc-900/90 rounded-2xl border border-white/15 flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center text-white">
              🥗
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Refeição no Foco</p>
              <p className="text-[10px] text-zinc-400 font-mono">IA Nutricional validou • +30 XP</p>
            </div>
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
          >
            <CheckCircle2 className="w-5 h-5 text-white fill-white text-black" />
          </motion.div>
        </motion.div>

        {/* Badge Segurança */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-2.5 bg-zinc-950 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-zinc-300 text-[11px]"
        >
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>Sem fotos antigas da galeria • Timestamp real</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// CENA 4: Leaderboard Monocromático & Split Pix D+0
function SceneLeaderboardAndSplit() {
  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#ffffff', '#a1a1aa', '#71717a']
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center w-full"
    >
      <Trophy className="w-9 h-9 text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]" />
      
      <h3 className="text-xl font-black text-white tracking-tight">
        Ranking em Tempo Real
      </h3>
      <p className="text-[11px] text-zinc-400 mb-4">
        A turma inteira focada e disputando o topo
      </p>

      {/* Pódio Metálico */}
      <div className="w-full flex items-end justify-center gap-2 mb-4 h-24">
        {/* 2º */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: '70%' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-20 bg-zinc-900 rounded-t-2xl border-t border-zinc-500 p-2 flex flex-col items-center justify-between"
        >
          <span className="text-[10px] font-bold text-zinc-400">2º</span>
          <span className="text-[10px] text-zinc-300 truncate w-full">Camila</span>
          <span className="text-[9px] text-zinc-400 font-mono">480 XP</span>
        </motion.div>

        {/* 1º - Titânio Especular */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-24 bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-t-2xl border-t-2 border-white p-2 flex flex-col items-center justify-between shadow-[0_0_25px_rgba(255,255,255,0.15)]"
        >
          <span className="text-xs font-black text-white">1º 👑</span>
          <span className="text-xs font-bold text-white truncate w-full">Lucas M.</span>
          <span className="text-[10px] text-white font-mono font-bold">620 XP</span>
        </motion.div>

        {/* 3º */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: '50%' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-20 bg-zinc-900 rounded-t-2xl border-t border-zinc-600 p-2 flex flex-col items-center justify-between"
        >
          <span className="text-[10px] font-bold text-zinc-400">3º</span>
          <span className="text-[10px] text-zinc-300 truncate w-full">Rafael</span>
          <span className="text-[9px] text-zinc-400 font-mono">390 XP</span>
        </motion.div>
      </div>

      {/* Destaque Split Pix */}
      <div className="w-full mb-4 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center gap-2 text-[10px] text-zinc-300">
        <Coins className="w-3.5 h-3.5 text-white" />
        <span>Split Pix D+0 direto na sua conta Asaas</span>
      </div>

      {/* Botão Monocromático de Alta Conversão */}
      <motion.button 
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-wider rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 hover:bg-zinc-200 transition"
      >
        <span>Criar Desafio no ArenaFit</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
