'use client';

import React, { useState } from 'react';
import { TitaniumMedalBadge, SilverMedalBadge } from '@/components/ui/metallic-badges';
import { 
  Trophy, 
  Camera, 
  Zap, 
  Flame, 
  Crown, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Activity,
  Heart,
  Monitor,
  Smartphone,
  Users,
  Share2
} from 'lucide-react';

export function HeroInteractiveMockup() {
  const [activeTab, setActiveTab] = useState<'podium' | 'stories_share' | 'ai_camera' | 'pix_split'>('podium');

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 sm:mt-12 mb-6 perspective-container">
      {/* Tab Switcher Interativo Superior — Briefing Oficial */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-1.5 rounded-2xl sm:rounded-full bg-[#121722] border border-[#252D3B] backdrop-blur-xl w-full sm:w-fit mx-auto shadow-xl">
        <button
          onClick={() => setActiveTab('podium')}
          className={`flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'podium'
              ? 'bg-[#3478F6] text-white shadow-[0_0_20px_rgba(52,120,246,0.35)]'
              : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#1B2330]'
          }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <span>Pódio & Ranking</span>
        </button>

        <button
          onClick={() => setActiveTab('stories_share')}
          className={`flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'stories_share'
              ? 'bg-[#3478F6] text-white shadow-[0_0_20px_rgba(52,120,246,0.35)]'
              : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#1B2330]'
          }`}
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>Stories 9:16 (Sua Marca)</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_camera')}
          className={`flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'ai_camera'
              ? 'bg-[#3478F6] text-white shadow-[0_0_20px_rgba(52,120,246,0.35)]'
              : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#1B2330]'
          }`}
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span>Câmera IA Antifraude</span>
        </button>

        <button
          onClick={() => setActiveTab('pix_split')}
          className={`flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'pix_split'
              ? 'bg-[#3478F6] text-white shadow-[0_0_20px_rgba(52,120,246,0.35)]'
              : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#1B2330]'
          }`}
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span>Split Pix D+0</span>
        </button>
      </div>

      {/* Showcase Sincronizado: Mobile-First PWA (Aluno) + Web Cockpit (Treinador) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* COLUNA 1: Smartphone PWA do Aluno */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121722] border border-[#252D3B] text-xs font-mono text-[#A7B0C0] mb-4">
            <Smartphone className="w-3.5 h-3.5 text-[#3478F6]" />
            <span>Visão Mobile do Aluno (Sem Baixar App)</span>
          </div>

          <div className="relative w-full max-w-[360px] sm:max-w-[380px] rounded-[44px] p-3 sm:p-3.5 bg-gradient-to-b from-[#1B2330] via-[#121722] to-[#080A0F] border border-[#252D3B] shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_35px_rgba(52,120,246,0.1)]">
            {/* Botões físicos laterais */}
            <div className="absolute -left-1 top-24 w-1 h-8 bg-[#252D3B] rounded-l-md hidden sm:block" />
            <div className="absolute -left-1 top-36 w-1 h-12 bg-[#252D3B] rounded-l-md hidden sm:block" />
            <div className="absolute -right-1 top-28 w-1 h-14 bg-[#252D3B] rounded-r-md hidden sm:block" />

            {/* Display interno */}
            <div className="relative rounded-[36px] overflow-hidden bg-[#080A0F] border border-[#252D3B] text-[#F4F6FA] min-h-[560px] flex flex-col justify-between">
              
              {/* Barra de Status e Dynamic Island */}
              <div className="pt-3.5 px-6 flex items-center justify-between z-20 text-xs font-mono text-[#A7B0C0]">
                <span>09:41</span>
                <div className="h-6 w-28 rounded-full bg-[#121722] border border-[#252D3B] flex items-center justify-between px-3">
                  <span className="h-2 w-2 rounded-full bg-[#3478F6] animate-pulse" />
                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#F4F6FA] font-bold">
                    <Flame className="w-3 h-3 text-[#3478F6]" />
                    <span>14d</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold">5G</span>
                  <div className="w-4 h-2.5 rounded-xs border border-white/60 p-0.5">
                    <div className="h-full w-full bg-white rounded-xs" />
                  </div>
                </div>
              </div>

              {/* Conteúdo Dinâmico da Tela */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                {activeTab === 'podium' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#252D3B] text-left">
                      <div>
                        <span className="text-[11px] font-mono text-[#A7B0C0] uppercase tracking-wider block font-bold">
                          Team Silva • Desafio 30D
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-[#F4F6FA]">Leaderboard da Turma</h4>
                      </div>
                      <span className="text-[11px] font-mono bg-[#3478F6]/15 text-[#75A7FF] border border-[#3478F6]/30 px-2.5 py-0.5 rounded-full font-bold">
                        AO VIVO
                      </span>
                    </div>

                    {/* Pódio 3 Colunas Titanium */}
                    <div className="grid grid-cols-3 gap-2.5 items-end pt-2 pb-1">
                      <div className="flex flex-col items-center">
                        <SilverMedalBadge size={34} className="mb-1.5" />
                        <span className="text-xs font-bold text-[#F4F6FA] truncate max-w-[80px]">Mariana</span>
                        <span className="text-[11px] font-mono text-[#A7B0C0]">1.820 pts</span>
                        <div className="w-full h-20 bg-gradient-to-t from-[#121722] to-[#1B2330] rounded-t-xl border-t border-x border-[#252D3B] mt-1.5 flex items-center justify-center">
                          <span className="font-mono font-bold text-[#A7B0C0] text-base">2º</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <Crown className="w-4 h-4 text-[#3478F6] absolute -top-3.5 left-1/2 -translate-x-1/2 animate-bounce" />
                          <TitaniumMedalBadge size={42} className="mb-1.5 drop-shadow-[0_0_15px_rgba(52,120,246,0.35)]" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-[#F4F6FA] truncate max-w-[90px]">Carlos E.</span>
                        <span className="text-[11px] font-mono text-[#3478F6] font-bold">2.140 pts</span>
                        <div className="w-full h-28 bg-gradient-to-t from-[#1B2330] to-[#252D3B] rounded-t-xl border-t border-x border-[#3478F6]/40 mt-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(52,120,246,0.15)]">
                          <span className="font-mono font-black text-[#FFFFFF] text-xl">1º</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full border border-[#252D3B] bg-[#1B2330] flex items-center justify-center text-xs font-black font-mono text-[#A7B0C0] mb-1.5">
                          3º
                        </div>
                        <span className="text-xs font-bold text-[#F4F6FA] truncate max-w-[80px]">Rodrigo</span>
                        <span className="text-[11px] font-mono text-[#A7B0C0]">1.690 pts</span>
                        <div className="w-full h-16 bg-gradient-to-t from-[#121722] to-[#1B2330]/70 rounded-t-xl border-t border-x border-[#252D3B] mt-1.5 flex items-center justify-center">
                          <span className="font-mono font-bold text-[#A7B0C0] text-base">3º</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Pessoal + Botão de Compartilhar nos Stories */}
                    <div className="p-3.5 rounded-xl bg-[#121722] border border-[#252D3B] space-y-2.5 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-[#3478F6] text-white flex flex-col items-center justify-center text-xs font-black font-mono shadow-md">
                            #03
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-[#F4F6FA]">Seu Desempenho</div>
                            <div className="text-[11px] text-[#A7B0C0]">Faltam 130 XP para #2 Mariana</div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-mono font-bold text-[#F4F6FA]">1.690 XP</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('stories_share')}
                        className="w-full py-2 px-3 rounded-lg bg-[#1B2330] hover:bg-[#252D3B] border border-[#252D3B] flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#F4F6FA] hover:text-[#75A7FF] transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#3478F6]" />
                        <span>Compartilhar Ranking 9:16 nos Stories</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'stories_share' && (
                  <div className="space-y-3.5 animate-in fade-in duration-300">
                    {/* Preview do Card 9:16 com Marca do Personal no Topo */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-b from-zinc-800/80 via-zinc-900 to-black p-4 text-center space-y-2.5 shadow-[0_0_25px_rgba(255,255,255,0.08)]">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-mono text-zinc-200 font-bold">
                        <span>SUA MARCA NO TOPO</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-xl border-2 border-white/60 bg-black/60 flex items-center justify-center text-xs font-black text-white mb-1">
                          TS
                        </div>
                        <div className="text-xs font-extrabold text-white tracking-[2px] uppercase">
                          TEAM SILVA
                        </div>
                        <div className="text-[11px] text-zinc-300">Desafio 30 Dias Shape</div>
                      </div>

                      <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] items-center py-2 border-b border-white/20">
                        <div>
                          <div className="text-base font-black text-white">3º</div>
                          <div className="text-[11px] text-zinc-300">posição</div>
                        </div>
                        <div className="w-px h-6 bg-white/20" />
                        <div>
                          <div className="text-base font-black text-white">1110</div>
                          <div className="text-[11px] text-zinc-300">pontos</div>
                        </div>
                        <div className="w-px h-6 bg-white/20" />
                        <div>
                          <div className="text-base font-black text-white">de 42</div>
                          <div className="text-[11px] text-zinc-300">atletas</div>
                        </div>
                      </div>

                      <div className="space-y-1 text-left text-xs">
                        <div className="flex justify-between text-zinc-200">
                          <span>• Ana Clara</span>
                          <span className="text-white font-bold">1280 XP</span>
                        </div>
                        <div className="flex justify-between text-zinc-200">
                          <span>• Bruno M.</span>
                          <span className="text-white font-bold">1195 XP</span>
                        </div>
                        <div className="flex justify-between text-white font-extrabold">
                          <span>• Carla S. (Você)</span>
                          <span>1110 XP</span>
                        </div>
                      </div>

                      <div className="pt-1 text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                        ✦ ARENAFITPRO
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-left space-y-1">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>Foto, Galeria ou Sticker PNG</span>
                        <span className="text-zinc-300 font-mono text-[11px]">1080×1920</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        O aluno posta o treino nos Stories com o nome da sua consultoria em destaque.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'ai_camera' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-zinc-900 aspect-4/3 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45 z-10" />
                      
                      <div className="absolute inset-3.5 border border-dashed border-white/30 rounded-xl z-20 flex flex-col justify-between p-2.5">
                        <div className="flex justify-between items-center text-[11px] font-mono text-zinc-200 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                            AI SCANNER ATIVO
                          </span>
                          <span>GPS: OK</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 text-left space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Refeição Auditada</span>
                            <span className="text-[11px] font-mono text-zinc-200 font-bold">100% Ao Vivo</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono text-zinc-200">
                            <div>Prot: <strong className="text-white">38g</strong></div>
                            <div>Carb: <strong className="text-white">42g</strong></div>
                            <div>Kcal: <strong className="text-white">460</strong></div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white/20" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2 text-left">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-zinc-300" />
                          Bloqueio de Galeria Ativo
                        </span>
                        <span className="text-zinc-200 font-mono text-xs font-bold">+50 XP</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Sensor óptico em tempo real impede envio de fotos antigas da galeria, mantendo 100% de justiça no desafio.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'pix_split' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.08)] space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm font-black text-white">Split Pix Recebido</span>
                        </div>
                        <span className="text-xs font-mono text-zinc-300">Agora</span>
                      </div>
                      <div className="text-2xl font-black font-mono text-white">
                        + R$ 97,00
                      </div>
                      <div className="text-xs text-zinc-300 flex items-center justify-between border-t border-white/10 pt-2 font-mono">
                        <span>Inscrição: R$ 97,00</span>
                        <span className="text-white font-bold">Taxa Plataforma: 0% (Pro)</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-1.5 text-left">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
                        <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
                        <span>Lucro Direto na Sua Conta</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        No plano Pro, 100% da inscrição cai na sua conta via Pix D+0 (deduzida apenas a tarifa bancária fixa do Asaas, a partir de R$ 0,99). Zero chargeback.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-center font-mono">
                      <div className="p-3 rounded-xl bg-zinc-950 border border-white/10">
                        <span className="text-[11px] text-zinc-400 block">Alunos Pagos</span>
                        <span className="text-sm sm:text-base font-bold text-white">48 alunos</span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-white/10">
                        <span className="text-[11px] text-zinc-400 block">Seu Faturamento</span>
                        <span className="text-sm sm:text-base font-bold text-white">R$ 4.656,00</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Nav Simulada com Touch Targets Proporcionais */}
                <div className="pt-3.5 mt-3 border-t border-white/10 flex items-center justify-around text-zinc-400 text-xs font-medium">
                  <span className="text-white font-bold flex flex-col items-center gap-1">
                    <Trophy className="w-4 h-4 text-white" />
                    Ranking
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Missões
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    <Camera className="w-4 h-4" />
                    Check-in
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    <Heart className="w-4 h-4" />
                    Feed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA 2: Cockpit Web do Treinador */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121722] border border-[#252D3B] text-xs font-mono text-[#A7B0C0] mb-4 self-center lg:self-start">
            <Monitor className="w-3.5 h-3.5 text-[#3478F6]" />
            <span>Painel do Treinador & Nutricionista (Web + Celular em Tempo Real)</span>
          </div>

          <div className="rounded-2xl p-6 sm:p-8 border border-[#252D3B] bg-[#121722] shadow-2xl text-left space-y-6">
            {/* Barra de Janela do Cockpit Web */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#252D3B]">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#252D3B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#252D3B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#252D3B]" />
                </div>
                <span className="text-xs font-mono text-[#A7B0C0] bg-[#1B2330] px-3 py-1 rounded-lg border border-[#252D3B]">
                  arenafitpro.com.br/dashboard
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#F4F6FA] bg-[#1B2330] border border-[#252D3B] px-3 py-1 rounded-full font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3478F6]" />
                Zero Trabalho Manual no WhatsApp
              </span>
            </div>

            {activeTab === 'podium' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#3478F6] font-bold block mb-1">
                    RETENÇÃO ATÉ O ÚLTIMO DIA
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] tracking-tight">
                    Acabe com o silêncio da 2ª semana e faça a turma inteira renovar
                  </h3>
                  <p className="text-sm sm:text-base text-[#A7B0C0] mt-2 leading-relaxed">
                    Enquanto o aluno disputa cada ponto no Pódio ao vivo, seu painel consolida a presença da turma, soma pontos de Squads cooperativos e avisa quem está há 48h sem treinar para você resgatar em 1 clique.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                    <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Engajamento Ativo</span>
                    <span className="text-2xl font-black text-[#F4F6FA] font-mono mt-1 block">94.8%</span>
                    <span className="text-xs text-[#A7B0C0] font-medium mt-1 block">Turma cumprindo o plano</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                    <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Squad Líder</span>
                    <span className="text-lg font-bold text-[#F4F6FA] mt-1 block truncate">Esquadrão Alpha</span>
                    <span className="text-xs text-[#3478F6] font-mono font-bold mt-1 block">8.420 XP somados</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                    <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Radar Anti-Churn</span>
                    <span className="text-lg font-bold text-[#F4F6FA] mt-1 block">1 Toque</span>
                    <span className="text-xs text-[#A7B0C0] mt-1 block">Resgate direto no WhatsApp</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stories_share' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#3478F6] font-bold block mb-1">
                    MARKETING VIRAL WHITE-LABEL 9:16
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] tracking-tight">
                    Cada aluno vira um outdoor da SUA consultoria no Instagram
                  </h3>
                  <p className="text-sm sm:text-base text-[#A7B0C0] mt-2 leading-relaxed">
                    Configure seu Logo e o Nome da sua Consultoria em 10 segundos. Toda vez que um aluno ou você compartilhar o Ranking nos Stories, sua marca aparece no topo — gerando directs de seguidores perguntando como entrar na próxima turma.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                    <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Identidade Visual</span>
                    <span className="text-lg font-bold text-[#F4F6FA] mt-1 block">Seu Logo + Nome</span>
                    <span className="text-xs text-[#A7B0C0] mt-1 block">Destaque no topo do card</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                    <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Formatos Prontos</span>
                    <span className="text-lg font-bold text-[#F4F6FA] mt-1 block">2 Cards × 3 Fundos</span>
                    <span className="text-xs text-[#A7B0C0] mt-1 block">Foto, Galeria ou Sticker PNG</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                    <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Aquisição de Alunos</span>
                    <span className="text-lg font-bold text-[#3478F6] mt-1 block">100% Orgânica</span>
                    <span className="text-xs text-[#A7B0C0] mt-1 block">Prova social diária nos Stories</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai_camera' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#3478F6] font-bold block mb-1">
                    AUDITORIA AUTOMÁTICA + IA NUTRICIONAL
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] tracking-tight">
                    Economize 2 horas por dia sem precisar abrir 300 fotos no WhatsApp
                  </h3>
                  <p className="text-sm sm:text-base text-[#A7B0C0] mt-2 leading-relaxed">
                    A câmera nativa bloqueia fotos antigas da galeria e a IA Nutricional lê o prato do aluno estimando calorias, proteínas, carboidratos e gorduras na hora. Você só acompanha o placar subir.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F4F6FA]">Câmera Antifraude Ao Vivo</span>
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-[#3478F6] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#3478F6]" />
                        <span>Sem Galeria</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#A7B0C0] leading-relaxed">
                      Impede fotos repetidas ou tiradas em outros dias, garantindo disputa 100% justa no pódio.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F4F6FA]">Leitura de Macronutrientes</span>
                      <span className="text-xs font-mono text-[#3478F6] font-bold">IA Vision</span>
                    </div>
                    <p className="text-xs text-[#A7B0C0] leading-relaxed">
                      Estimativa instantânea de proteínas, carboidratos, gorduras e calorias em cada refeição postada.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pix_split' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#3478F6] font-bold block mb-1">
                    FATURAMENTO AUTOMÁTICO PIX D+0
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] tracking-tight">
                    Receba 100% à vista na sua conta sem cobrar comprovante no privado
                  </h3>
                  <p className="text-sm sm:text-base text-[#A7B0C0] mt-2 leading-relaxed">
                    O aluno clica no seu link, paga o Pix e já entra na turma em 3 segundos. O valor líquido cai direto na sua conta bancária no mesmo dia (D+0), sem risco de chargeback e sem bitributação.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                    <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Liberação do Saldo</span>
                    <span className="text-2xl font-black text-[#F4F6FA] font-mono mt-1 block">D+0</span>
                    <span className="text-xs text-[#A7B0C0] mt-1 block">Dinheiro na mão na hora</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                    <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Taxa da Plataforma</span>
                    <span className="text-lg font-bold text-[#3478F6] mt-1 block">0% no Plano Pro</span>
                    <span className="text-xs text-[#A7B0C0] mt-1 block">100% do lucro da inscrição é seu</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                    <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Acesso do Aluno</span>
                    <span className="text-lg font-bold text-[#F4F6FA] mt-1 block">Automático</span>
                    <span className="text-xs text-[#A7B0C0] mt-1 block">Liberado em 2 segundos pós-Pix</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rodapé Informativo de Responsividade Multi-Dispositivo */}
            <div className="pt-4 border-t border-[#252D3B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#A7B0C0]">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#3478F6] shrink-0" />
                <span>Você continua passando seu treino/dieta normal (PDF ou app atual) — nós cuidamos da gamificação!</span>
              </span>
              <span className="font-mono text-[#F4F6FA] font-bold shrink-0">iOS • Android • Web</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
