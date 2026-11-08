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
      {/* Tab Switcher Interativo Superior com Scroll Horizontal Suave no Mobile e Centrado no Desktop */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-10 p-1.5 rounded-2xl sm:rounded-full bg-[#121722] border border-[#252D3B] backdrop-blur-xl w-full sm:w-fit mx-auto shadow-xl overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveTab('podium')}
          className={`shrink-0 min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'podium'
              ? 'bg-[#3478F6] text-white shadow-[0_0_25px_rgba(52,120,246,0.4)]'
              : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#1B2330]'
          }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <span>Pódio & Ranking</span>
        </button>

        <button
          onClick={() => setActiveTab('stories_share')}
          className={`shrink-0 min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'stories_share'
              ? 'bg-[#3478F6] text-white shadow-[0_0_25px_rgba(52,120,246,0.4)]'
              : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#1B2330]'
          }`}
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>Stories 9:16</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_camera')}
          className={`shrink-0 min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'ai_camera'
              ? 'bg-[#3478F6] text-white shadow-[0_0_25px_rgba(52,120,246,0.4)]'
              : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#1B2330]'
          }`}
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span>Câmera IA Antifraude</span>
        </button>

        <button
          onClick={() => setActiveTab('pix_split')}
          className={`shrink-0 min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'pix_split'
              ? 'bg-[#3478F6] text-white shadow-[0_0_25px_rgba(52,120,246,0.4)]'
              : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#1B2330]'
          }`}
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span>Split Pix D+0</span>
        </button>
      </div>

      {/* Showcase Sincronizado: Mobile-First PWA (Aluno) + Web Cockpit (Treinador) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        
        {/* COLUNA 1: Smartphone PWA do Aluno */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121722] border border-[#252D3B] text-xs font-mono text-[#A7B0C0] mb-5">
            <Smartphone className="w-3.5 h-3.5 text-[#3478F6]" />
            <span>Visão Mobile do Aluno (Sem Baixar App)</span>
          </div>

          <div className="relative w-full max-w-[335px] sm:max-w-[380px] rounded-[38px] sm:rounded-[44px] p-2.5 sm:p-3.5 bg-gradient-to-b from-[#1B2330] via-[#121722] to-[#080A0F] border border-[#252D3B] shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_35px_rgba(52,120,246,0.12)]">
            {/* Botões físicos laterais */}
            <div className="absolute -left-1 top-24 w-1 h-8 bg-[#252D3B] rounded-l-md hidden sm:block" />
            <div className="absolute -left-1 top-36 w-1 h-12 bg-[#252D3B] rounded-l-md hidden sm:block" />
            <div className="absolute -right-1 top-28 w-1 h-14 bg-[#252D3B] rounded-r-md hidden sm:block" />

            {/* Display interno */}
            <div className="relative rounded-[30px] sm:rounded-[36px] overflow-hidden bg-[#080A0F] border border-[#252D3B] text-[#F4F6FA] min-h-[570px] flex flex-col justify-between">
              
              {/* Barra de Status e Dynamic Island */}
              <div className="pt-3.5 px-6 flex items-center justify-between z-20 text-xs font-mono text-[#A7B0C0]">
                <span>09:41</span>
                <div className="h-6 w-28 rounded-full bg-[#121722] border border-[#252D3B] flex items-center justify-between px-3">
                  <span className="h-2 w-2 rounded-full bg-[#3478F6] animate-pulse" />
                  <div className="flex items-center gap-1 text-xs font-mono text-[#F4F6FA] font-bold">
                    <Flame className="w-3 h-3 text-[#3478F6]" />
                    <span>14d</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">5G</span>
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
                        <span className="text-xs font-mono text-[#A7B0C0] uppercase tracking-wider block font-bold">
                          Team Silva • Desafio 30D
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-[#F4F6FA]">Leaderboard da Turma</h4>
                      </div>
                      <span className="text-xs font-mono bg-[#3478F6]/15 text-[#75A7FF] border border-[#3478F6]/30 px-2.5 py-0.5 rounded-full font-bold">
                        AO VIVO
                      </span>
                    </div>

                    {/* Pódio 3 Colunas Ouro / Prata / Bronze */}
                    <div className="grid grid-cols-3 gap-2.5 items-end pt-2 pb-1">
                      <div className="flex flex-col items-center">
                        <SilverMedalBadge size={34} className="mb-1.5 drop-shadow-[0_0_10px_rgba(203,213,225,0.3)]" />
                        <span className="text-xs font-bold text-[#F4F6FA] truncate max-w-[80px]">Mariana</span>
                        <span className="text-xs font-mono text-slate-300 font-semibold">1.820 pts</span>
                        <div className="w-full h-20 bg-gradient-to-t from-[#121722] via-slate-400/15 to-slate-300/25 rounded-t-xl border-t border-x border-slate-300/45 mt-1.5 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(203,213,225,0.12)]">
                          <span className="font-mono font-black text-slate-200 text-base leading-none">2º</span>
                          <span className="text-[9px] font-mono font-bold text-slate-300/80 uppercase tracking-widest mt-0.5">PRATA</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <Crown className="w-4 h-4 text-amber-400 absolute -top-3.5 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                          <GoldMedalBadge size={42} className="mb-1.5 drop-shadow-[0_0_15px_rgba(251,191,36,0.45)]" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-[#F4F6FA] truncate max-w-[90px]">Carlos E.</span>
                        <span className="text-xs font-mono text-amber-300 font-bold">2.140 pts</span>
                        <div className="w-full h-28 bg-gradient-to-t from-[#121722] via-amber-500/20 to-amber-400/35 rounded-t-xl border-t border-x border-amber-400/60 mt-1.5 flex flex-col items-center justify-center shadow-[0_0_24px_rgba(251,191,36,0.22)]">
                          <span className="font-mono font-black text-amber-300 text-xl leading-none">1º</span>
                          <span className="text-[9px] font-mono font-bold text-amber-200/90 uppercase tracking-widest mt-1">OURO</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <BronzeMedalBadge size={34} className="mb-1.5 drop-shadow-[0_0_10px_rgba(217,119,6,0.35)]" />
                        <span className="text-xs font-bold text-[#F4F6FA] truncate max-w-[80px]">Rodrigo</span>
                        <span className="text-xs font-mono text-amber-500 font-semibold">1.690 pts</span>
                        <div className="w-full h-16 bg-gradient-to-t from-[#121722] via-amber-900/25 to-amber-700/30 rounded-t-xl border-t border-x border-amber-600/50 mt-1.5 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.15)]">
                          <span className="font-mono font-black text-amber-400 text-base leading-none">3º</span>
                          <span className="text-[9px] font-mono font-bold text-amber-500/85 uppercase tracking-widest mt-0.5">BRONZE</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Pessoal + Botão de Compartilhar nos Stories */}
                    <div className="p-3.5 rounded-xl bg-[#121722] border border-[#252D3B] space-y-2.5 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/50 text-amber-100 flex flex-col items-center justify-center text-xs font-black font-mono shadow-md">
                            #03
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-[#F4F6FA]">Seu Desempenho</div>
                            <div className="text-xs text-[#A7B0C0]">Faltam 130 XP para #2 Mariana</div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-mono font-bold text-amber-400">1.690 XP</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('stories_share')}
                        className="w-full py-2.5 px-3 rounded-lg bg-[#1B2330] hover:bg-[#252D3B] border border-[#252D3B] flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#F4F6FA] hover:text-[#75A7FF] transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#3478F6]" />
                        <span>Compartilhar Ranking 9:16 nos Stories</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'stories_share' && (
                  <div className="space-y-3.5 animate-in fade-in duration-300">
                    {/* Preview do Card 9:16 com Foto Real da Aluna e Marca do Personal no Topo */}
                    <div className="relative rounded-2xl overflow-hidden border border-[#252D3B] p-4 text-center space-y-2.5 shadow-[0_0_25px_rgba(52,120,246,0.1)]">
                      <img
                        src="/images/mockups/student-workout-selfie.jpg"
                        alt="Foto pós-treino da aluna"
                        className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.55] contrast-[1.08]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F] via-[#080A0F]/70 to-[#080A0F]/50 z-0" />

                      <div className="relative z-10 space-y-2.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs font-mono text-[#75A7FF] font-bold">
                          <span>SUA MARCA NO TOPO</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-xl border border-[#3478F6] bg-[#121722] flex items-center justify-center text-xs font-black text-[#F4F6FA] mb-1 shadow-md">
                            TS
                          </div>
                          <div className="text-xs font-extrabold text-[#F4F6FA] tracking-[2px] uppercase">
                            TEAM SILVA
                          </div>
                          <div className="text-xs text-[#A7B0C0]">Desafio 30 Dias Shape</div>
                        </div>

                        <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] items-center py-2 border-b border-white/10">
                          <div>
                            <div className="text-base font-black text-amber-400">3º</div>
                            <div className="text-xs text-[#A7B0C0]">posição</div>
                          </div>
                          <div className="w-px h-6 bg-[#252D3B]" />
                          <div>
                            <div className="text-base font-black text-amber-300">1110</div>
                            <div className="text-xs text-[#A7B0C0]">pontos</div>
                          </div>
                          <div className="w-px h-6 bg-[#252D3B]" />
                          <div>
                            <div className="text-base font-black text-[#F4F6FA]">de 42</div>
                            <div className="text-xs text-[#A7B0C0]">atletas</div>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left text-xs">
                          <div className="flex items-center justify-between text-[#F4F6FA] px-1.5 py-0.5">
                            <span className="flex items-center gap-1.5 font-semibold">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400/20 border border-amber-400/50 text-[10px] font-mono font-black text-amber-300">
                                1º
                              </span>
                              <span>Ana Clara</span>
                            </span>
                            <span className="text-amber-300 font-mono font-bold">1280 XP</span>
                          </div>
                          <div className="flex items-center justify-between text-[#F4F6FA] px-1.5 py-0.5">
                            <span className="flex items-center gap-1.5 font-medium">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-300/20 border border-slate-300/50 text-[10px] font-mono font-black text-slate-200">
                                2º
                              </span>
                              <span>Bruno M.</span>
                            </span>
                            <span className="text-slate-200 font-mono font-bold">1195 XP</span>
                          </div>
                          <div className="flex items-center justify-between text-[#F4F6FA] font-extrabold bg-[#3478F6]/20 border border-[#3478F6]/40 rounded-lg px-2 py-1 backdrop-blur-xs">
                            <span className="flex items-center gap-1.5">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-700/35 border border-amber-500/60 text-[10px] font-mono font-black text-amber-400">
                                3º
                              </span>
                              <span>Carla S. (Você)</span>
                            </span>
                            <span className="text-amber-400 font-mono">1110 XP</span>
                          </div>
                        </div>

                        <div className="pt-1 text-xs font-mono tracking-widest text-[#A7B0C0] uppercase">
                          ✦ ARENAFITPRO
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#121722] border border-[#252D3B] text-left space-y-1">
                      <div className="text-xs font-bold text-[#F4F6FA] flex items-center justify-between">
                        <span>Foto, Galeria ou Sticker PNG</span>
                        <span className="text-[#3478F6] font-mono text-xs font-bold">1080×1920</span>
                      </div>
                      <p className="text-xs text-[#A7B0C0] leading-relaxed">
                        O aluno posta o treino nos Stories com o nome da sua consultoria em destaque.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'ai_camera' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="relative rounded-2xl overflow-hidden border border-[#252D3B] bg-[#121722] aspect-4/3 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45 z-10" />
                      
                      <div className="absolute inset-3.5 border border-dashed border-[#3478F6]/40 rounded-xl z-20 flex flex-col justify-between p-2.5">
                        <div className="flex justify-between items-center text-xs font-mono text-[#F4F6FA] font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#3478F6] animate-ping" />
                            AI SCANNER ATIVO
                          </span>
                          <span className="text-[#3478F6]">GPS: OK</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#080A0F]/90 backdrop-blur-md border border-[#252D3B] text-left space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#F4F6FA]">Refeição Auditada</span>
                            <span className="text-xs font-mono text-[#75A7FF] font-bold">100% Ao Vivo</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-xs font-mono text-[#A7B0C0]">
                            <div>Prot: <strong className="text-[#F4F6FA]">38g</strong></div>
                            <div>Carb: <strong className="text-[#F4F6FA]">42g</strong></div>
                            <div>Kcal: <strong className="text-[#3478F6]">460</strong></div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1B2330] via-[#121722] to-[#080A0F] flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-[#3478F6]/30" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#121722] border border-[#252D3B] space-y-2 text-left">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#F4F6FA]">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#3478F6]" />
                          Bloqueio de Galeria Ativo
                        </span>
                        <span className="text-[#3478F6] font-mono text-xs font-bold">+50 XP</span>
                      </div>
                      <p className="text-xs text-[#A7B0C0] leading-relaxed">
                        Sensor óptico em tempo real impede envio de fotos antigas da galeria, mantendo 100% de justiça no desafio.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'pix_split' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="p-4 rounded-2xl bg-[#121722] border border-[#3478F6]/40 shadow-[0_0_20px_rgba(52,120,246,0.15)] space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-[#3478F6]/20 border border-[#3478F6]/30 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-[#3478F6]" />
                          </div>
                          <span className="text-xs sm:text-sm font-black text-[#F4F6FA]">Split Pix Recebido</span>
                        </div>
                        <span className="text-xs font-mono text-[#75A7FF]">Agora</span>
                      </div>
                      <div className="text-2xl font-black font-mono text-[#F4F6FA]">
                        + R$ 97,00
                      </div>
                      <div className="text-xs text-[#A7B0C0] flex items-center justify-between border-t border-[#252D3B] pt-2 font-mono">
                        <span>Inscrição: R$ 97,00</span>
                        <span className="text-[#3478F6] font-bold">Taxa Plataforma: 0% (Pro)</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#121722] border border-[#252D3B] space-y-1.5 text-left">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F4F6FA]">
                        <CheckCircle2 className="w-4 h-4 text-[#3478F6] shrink-0" />
                        <span>Lucro Direto na Sua Conta</span>
                      </div>
                      <p className="text-xs text-[#A7B0C0] leading-relaxed">
                        No plano Pro, 100% da inscrição cai na sua conta via Pix D+0 (deduzida apenas a tarifa bancária fixa do Asaas, a partir de R$ 0,99). Zero chargeback.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-center font-mono">
                      <div className="p-3 rounded-xl bg-[#080A0F] border border-[#252D3B]">
                        <span className="text-xs text-[#A7B0C0] block">Alunos Pagos</span>
                        <span className="text-sm sm:text-base font-bold text-[#F4F6FA]">48 alunos</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#080A0F] border border-[#252D3B]">
                        <span className="text-xs text-[#A7B0C0] block">Seu Faturamento</span>
                        <span className="text-sm sm:text-base font-bold text-[#3478F6]">R$ 4.656,00</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Nav Simulada */}
                <div className="pt-3.5 mt-3 border-t border-[#252D3B] flex items-center justify-around text-[#A7B0C0] text-xs font-medium">
                  <span className="text-[#F4F6FA] font-bold flex flex-col items-center gap-1">
                    <Trophy className="w-4 h-4 text-[#3478F6]" />
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
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121722] border border-[#252D3B] text-xs font-mono text-[#A7B0C0] mb-5 self-center lg:self-start">
              <Monitor className="w-3.5 h-3.5 text-[#3478F6]" />
              <span>Painel do Treinador & Nutricionista (Web + Celular em Tempo Real)</span>
            </div>

            <div className="rounded-3xl p-6 sm:p-8 border border-[#252D3B] bg-[#121722] shadow-2xl text-left space-y-6">
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
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#F4F6FA] bg-[#1B2330] border border-[#252D3B] px-3.5 py-1 rounded-full font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3478F6]" />
                  Zero Trabalho Manual no WhatsApp
                </span>
              </div>

              {activeTab === 'podium' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#3478F6] font-bold block mb-1.5">
                      RETENÇÃO ATÉ O ÚLTIMO DIA
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] tracking-tight">
                      Acabe com o silêncio da 2ª semana e faça a turma inteira renovar
                    </h3>
                    <p className="text-sm sm:text-base text-[#A7B0C0] mt-2 leading-relaxed">
                      Enquanto o aluno disputa cada ponto no Pódio ao vivo, seu painel consolida a presença da turma, soma pontos de Squads cooperativos e avisa quem está há 48h sem treinar para você resgatar em 1 clique.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B]">
                      <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Engajamento Ativo</span>
                      <span className="text-2xl font-black text-[#F4F6FA] font-mono mt-1 block">94.8%</span>
                      <span className="text-xs text-[#A7B0C0] font-medium mt-1 block">Turma cumprindo o plano</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B]">
                      <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Squad Líder</span>
                      <span className="text-lg font-bold text-[#F4F6FA] mt-1 block truncate">Esquadrão Alpha</span>
                      <span className="text-xs text-[#3478F6] font-mono font-bold mt-1 block">8.420 XP somados</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B]">
                      <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Radar Anti-Churn</span>
                      <span className="text-lg font-bold text-[#F4F6FA] mt-1 block">1 Toque</span>
                      <span className="text-xs text-[#A7B0C0] mt-1 block">Resgate direto no WhatsApp</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stories_share' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#3478F6] font-bold block mb-1.5">
                      MARKETING VIRAL WHITE-LABEL 9:16
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] tracking-tight">
                      Cada aluno vira um outdoor da SUA consultoria no Instagram
                    </h3>
                    <p className="text-sm sm:text-base text-[#A7B0C0] mt-2 leading-relaxed">
                      Configure seu Logo e o Nome da sua Consultoria em 10 segundos. Toda vez que um aluno ou você compartilhar o Ranking nos Stories, sua marca aparece no topo — gerando directs de seguidores perguntando como entrar na próxima turma.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B]">
                      <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Identidade Visual</span>
                      <span className="text-lg font-bold text-[#F4F6FA] mt-1 block">Seu Logo + Nome</span>
                      <span className="text-xs text-[#A7B0C0] mt-1 block">Destaque no topo do card</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B]">
                      <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Formatos Prontos</span>
                      <span className="text-lg font-bold text-[#F4F6FA] mt-1 block">2 Cards × 3 Fundos</span>
                      <span className="text-xs text-[#A7B0C0] mt-1 block">Foto, Galeria ou Sticker PNG</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B]">
                      <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Aquisição de Alunos</span>
                      <span className="text-lg font-bold text-[#3478F6] mt-1 block">100% Orgânica</span>
                      <span className="text-xs text-[#A7B0C0] mt-1 block">Prova social diária nos Stories</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai_camera' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#3478F6] font-bold block mb-1.5">
                      AUDITORIA AUTOMÁTICA + IA NUTRICIONAL
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] tracking-tight">
                      Economize 2 horas por dia sem precisar abrir 300 fotos no WhatsApp
                    </h3>
                    <p className="text-sm sm:text-base text-[#A7B0C0] mt-2 leading-relaxed">
                      A câmera nativa bloqueia fotos antigas da galeria e a IA Nutricional lê o prato do aluno estimando calorias, proteínas, carboidratos e gorduras na hora. Você só acompanha o placar subir.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#F4F6FA]">Câmera Antifraude Ao Vivo</span>
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-[#3478F6] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#3478F6]" />
                          <span>Sem Galeria</span>
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#A7B0C0] leading-relaxed">
                        Impede fotos repetidas ou tiradas em outros dias, garantindo disputa 100% justa no pódio.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#F4F6FA]">Leitura de Macronutrientes</span>
                        <span className="text-xs font-mono text-[#3478F6] font-bold">IA Vision</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#A7B0C0] leading-relaxed">
                        Estimativa instantânea de proteínas, carboidratos, gorduras e calorias em cada refeição postada.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pix_split' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#3478F6] font-bold block mb-1.5">
                      FATURAMENTO AUTOMÁTICO PIX D+0
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] tracking-tight">
                      Receba 100% à vista na sua conta sem cobrar comprovante no privado
                    </h3>
                    <p className="text-sm sm:text-base text-[#A7B0C0] mt-2 leading-relaxed">
                      O aluno clica no seu link, paga o Pix e já entra na turma em 3 segundos. O valor líquido cai direto na sua conta bancária no mesmo dia (D+0), sem risco de chargeback e sem bitributação.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B]">
                      <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Liberação do Saldo</span>
                      <span className="text-2xl font-black text-[#F4F6FA] font-mono mt-1 block">D+0</span>
                      <span className="text-xs text-[#A7B0C0] mt-1 block">Dinheiro na mão na hora</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B]">
                      <span className="text-xs font-mono text-[#A7B0C0] uppercase block">Taxa da Plataforma</span>
                      <span className="text-lg font-bold text-[#3478F6] mt-1 block">0% no Plano Pro</span>
                      <span className="text-xs text-[#A7B0C0] mt-1 block">100% do lucro da inscrição é seu</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1B2330] border border-[#252D3B]">
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
    </div>
  );
}
