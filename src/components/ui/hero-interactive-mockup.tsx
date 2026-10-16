'use client';

import React, { useState } from 'react';
import { GoldMedalBadge, SilverMedalBadge, BronzeMedalBadge } from '@/components/ui/metallic-badges';
import { 
  Trophy, 
  Camera, 
  Zap, 
  Flame, 
  Crown, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles,
  QrCode,
  Activity,
  Heart
} from 'lucide-react';

export function HeroInteractiveMockup() {
  const [activeTab, setActiveTab] = useState<'podium' | 'ai_camera' | 'pix_split'>('podium');

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-6 perspective-container">
      {/* Tab Switcher Interativo Superior */}
      <div className="flex items-center justify-center gap-2 mb-6 p-1.5 rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-xl w-fit mx-auto shadow-2xl">
        <button
          onClick={() => setActiveTab('podium')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'podium'
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Pódio ao Vivo</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_camera')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'ai_camera'
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Câmera IA Antifraude</span>
        </button>

        <button
          onClick={() => setActiveTab('pix_split')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'pix_split'
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Split Pix D+0</span>
        </button>
      </div>

      {/* Frame do Smartphone em Titânio com Dynamic Island e Chanfro Especular */}
      <div className="relative mx-auto max-w-[340px] sm:max-w-[360px] rounded-[52px] p-3.5 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_40px_rgba(255,255,255,0.08)]">
        {/* Antena bands & Botões laterais simulados */}
        <div className="absolute -left-1 top-24 w-1 h-8 bg-zinc-600 rounded-l-md" />
        <div className="absolute -left-1 top-36 w-1 h-12 bg-zinc-600 rounded-l-md" />
        <div className="absolute -right-1 top-28 w-1 h-14 bg-zinc-600 rounded-r-md" />

        {/* Borda interna do display */}
        <div className="relative rounded-[42px] overflow-hidden bg-black border border-white/10 text-white min-h-[580px] flex flex-col justify-between">
          
          {/* Barra de Status e Dynamic Island */}
          <div className="pt-3 px-6 flex items-center justify-between z-20 text-[11px] font-mono text-zinc-400">
            <span>09:41</span>
            {/* Dynamic Island */}
            <div className="h-5 w-24 rounded-full bg-black border border-white/15 flex items-center justify-between px-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-300">
                <Flame className="w-2.5 h-2.5 text-amber-400" />
                <span>14d</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-4 h-2 rounded-xs border border-white/60 p-0.5">
                <div className="h-full w-full bg-white rounded-xs" />
              </div>
            </div>
          </div>

          {/* Conteúdo Dinâmico da Tela com Base na Aba Selecionada */}
          <div className="p-4 flex-1 flex flex-col justify-between">
            
            {activeTab === 'podium' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Header da Turma no App */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                      Desafio Verão 2026
                    </span>
                    <h4 className="text-sm font-black text-white">Leaderboard da Turma</h4>
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    AO VIVO
                  </span>
                </div>

                {/* Visual dos 3 Degraus */}
                <div className="grid grid-cols-3 gap-2 items-end pt-2 pb-2">
                  {/* 2º Lugar */}
                  <div className="flex flex-col items-center">
                    <SilverMedalBadge size={32} className="mb-1" />
                    <span className="text-[11px] font-bold truncate max-w-[70px]">Mariana</span>
                    <span className="text-[9px] font-mono text-zinc-400">1.820 pts</span>
                    <div className="w-full h-20 bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-t-xl border-t border-x border-zinc-600/40 mt-1.5 flex items-center justify-center">
                      <span className="font-mono font-black text-zinc-400 text-sm">2º</span>
                    </div>
                  </div>

                  {/* 1º Lugar */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Crown className="w-4 h-4 text-amber-400 absolute -top-3.5 left-1/2 -translate-x-1/2 animate-bounce" />
                      <GoldMedalBadge size={38} className="mb-1 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
                    </div>
                    <span className="text-xs font-black text-white truncate max-w-[80px]">Carlos E.</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">2.140 pts 🔥</span>
                    <div className="w-full h-28 bg-gradient-to-t from-amber-500/20 via-zinc-900 to-amber-500/30 rounded-t-xl border-t border-x border-amber-400/50 mt-1.5 flex items-center justify-center">
                      <span className="font-mono font-black text-amber-300 text-lg">1º</span>
                    </div>
                  </div>

                  {/* 3º Lugar */}
                  <div className="flex flex-col items-center">
                    <BronzeMedalBadge size={30} className="mb-1" />
                    <span className="text-[11px] font-bold truncate max-w-[70px]">Rodrigo</span>
                    <span className="text-[9px] font-mono text-zinc-400">1.690 pts</span>
                    <div className="w-full h-16 bg-gradient-to-t from-zinc-900 to-zinc-800/60 rounded-t-xl border-t border-x border-amber-800/40 mt-1.5 flex items-center justify-center">
                      <span className="font-mono font-black text-amber-700 text-sm">3º</span>
                    </div>
                  </div>
                </div>

                {/* Card Pessoal do Aluno Logado */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                      VC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Você (4º Lugar)</div>
                      <div className="text-[10px] text-zinc-400">Faltam 45 pts para o Pódio</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">1.645 pts</span>
                </div>

                {/* Feed Rápido da Turma */}
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/[0.06] flex items-center justify-between text-[10px]">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <strong>Larissa M.</strong> concluiu Treino de Pernas
                  </span>
                  <span className="text-zinc-500 font-mono">há 2m</span>
                </div>
              </div>
            )}

            {activeTab === 'ai_camera' && (
              <div className="space-y-3.5 animate-in fade-in duration-300">
                {/* Viewfinder da Câmera IA */}
                <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-zinc-900 aspect-4/3 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10" />
                  
                  {/* Grid de Escaneamento da IA */}
                  <div className="absolute inset-4 border border-dashed border-white/30 rounded-xl z-20 flex flex-col justify-between p-2">
                    <div className="flex justify-between items-center text-[9px] font-mono text-emerald-400">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        AI SCANNER ATIVO
                      </span>
                      <span>GPS: VERIFICADO</span>
                    </div>

                    {/* Bounding Box com Labels de Macronutrientes */}
                    <div className="p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-left space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white">Refeição Auditada</span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">100% Autêntica</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-zinc-300">
                        <div>Prot: <strong className="text-white">38g</strong></div>
                        <div>Carb: <strong className="text-white">42g</strong></div>
                        <div>Kcal: <strong className="text-amber-400">460</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Foto de Fundo Ilustrativa com Gradiente */}
                  <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white/20" />
                  </div>
                </div>

                {/* Status de Validação */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Sem fotos da Galeria
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px]">+50 XP</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Sensor óptico ao vivo bloqueia qualquer upload falso de arquivo. Integridade máxima para a sua competição.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'pix_split' && (
              <div className="space-y-3.5 animate-in fade-in duration-300">
                {/* Notificação Bancária Push D+0 */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-xs font-black text-white">Split Pix Recebido</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">Agora</span>
                  </div>
                  <div className="text-xl font-black font-mono text-emerald-400">
                    + R$ 89,24
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center justify-between border-t border-white/10 pt-2 font-mono">
                    <span>Inscrição: R$ 97,00</span>
                    <span className="text-white">Taxa: 8% (D+0)</span>
                  </div>
                </div>

                {/* Card de Proteção Tributária */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-left">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Divisão no Nível Bancário</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Você emite nota fiscal apenas sobre o seu lucro líquido. Não pague imposto sobre a taxa da plataforma.
                  </p>
                </div>

                {/* Resumo da Turma */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-black border border-white/[0.08]">
                    <span className="text-[9px] text-zinc-500 block">Alunos Pagos</span>
                    <span className="text-sm font-bold text-white">48 alunos</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black border border-white/[0.08]">
                    <span className="text-[9px] text-zinc-500 block">Faturamento</span>
                    <span className="text-sm font-bold text-emerald-400">R$ 4.283,52</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Nav Simulada no Smartphone */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-around text-zinc-500 text-[10px]">
              <span className="text-white font-bold flex flex-col items-center gap-0.5">
                <Trophy className="w-3.5 h-3.5 text-white" />
                Início
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <Activity className="w-3.5 h-3.5" />
                Missões
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <Camera className="w-3.5 h-3.5" />
                Scan
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <Heart className="w-3.5 h-3.5" />
                Feed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
