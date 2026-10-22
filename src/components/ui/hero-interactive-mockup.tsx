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
  Lock
} from 'lucide-react';

export function HeroInteractiveMockup() {
  const [activeTab, setActiveTab] = useState<'podium' | 'ai_camera' | 'pix_split'>('podium');

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 sm:mt-14 mb-6 perspective-container">
      {/* Tab Switcher Interativo Superior — Responsivo & Mobile-First (Touch Target >= 44px) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-2 rounded-3xl sm:rounded-full bg-zinc-950/90 border border-white/15 backdrop-blur-xl w-full sm:w-fit mx-auto shadow-2xl">
        <button
          onClick={() => setActiveTab('podium')}
          className={`flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-2xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'podium'
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
              : 'text-zinc-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <span>Pódio & Ranking</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_camera')}
          className={`flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-2xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'ai_camera'
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
              : 'text-zinc-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span>Câmera IA Antifraude</span>
        </button>

        <button
          onClick={() => setActiveTab('pix_split')}
          className={`flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-2xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'pix_split'
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
              : 'text-zinc-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span>Split Pix D+0</span>
        </button>
      </div>

      {/* Showcase Sincronizado: Mobile-First PWA (Aluno) + Web Cockpit Multi-Tenant (Treinador) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* COLUNA 1: Smartphone PWA do Aluno (Mobile-First Ergonomics) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Visão Mobile PWA do Aluno</span>
          </div>

          <div className="relative w-full max-w-[360px] sm:max-w-[380px] rounded-[48px] p-3 sm:p-3.5 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_40px_rgba(255,255,255,0.08)]">
            {/* Botões físicos laterais */}
            <div className="absolute -left-1 top-24 w-1 h-8 bg-zinc-600 rounded-l-md hidden sm:block" />
            <div className="absolute -left-1 top-36 w-1 h-12 bg-zinc-600 rounded-l-md hidden sm:block" />
            <div className="absolute -right-1 top-28 w-1 h-14 bg-zinc-600 rounded-r-md hidden sm:block" />

            {/* Display interno */}
            <div className="relative rounded-[38px] overflow-hidden bg-black border border-white/10 text-white min-h-[560px] flex flex-col justify-between">
              
              {/* Barra de Status e Dynamic Island */}
              <div className="pt-3.5 px-6 flex items-center justify-between z-20 text-xs font-mono text-zinc-300">
                <span>09:41</span>
                <div className="h-6 w-28 rounded-full bg-zinc-950 border border-white/15 flex items-center justify-between px-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-200 font-bold">
                    <Flame className="w-3 h-3 text-amber-400" />
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
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-left">
                      <div>
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                          Desafio Verão 2026
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white">Leaderboard da Turma</h4>
                      </div>
                      <span className="text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        AO VIVO
                      </span>
                    </div>

                    {/* Pódio 3 Colunas */}
                    <div className="grid grid-cols-3 gap-2.5 items-end pt-2 pb-1">
                      <div className="flex flex-col items-center">
                        <SilverMedalBadge size={34} className="mb-1.5" />
                        <span className="text-xs font-bold text-white truncate max-w-[80px]">Mariana</span>
                        <span className="text-[11px] font-mono text-zinc-300">1.820 pts</span>
                        <div className="w-full h-20 bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-t-xl border-t border-x border-zinc-600/40 mt-1.5 flex items-center justify-center">
                          <span className="font-mono font-black text-zinc-300 text-base">2º</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <Crown className="w-4 h-4 text-amber-400 absolute -top-3.5 left-1/2 -translate-x-1/2 animate-bounce" />
                          <GoldMedalBadge size={42} className="mb-1.5 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-white truncate max-w-[90px]">Carlos E.</span>
                        <span className="text-[11px] font-mono text-amber-400 font-bold">2.140 pts</span>
                        <div className="w-full h-28 bg-gradient-to-t from-amber-500/20 via-zinc-900 to-amber-500/30 rounded-t-xl border-t border-x border-amber-400/50 mt-1.5 flex items-center justify-center">
                          <span className="font-mono font-black text-amber-300 text-xl">1º</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <BronzeMedalBadge size={32} className="mb-1.5" />
                        <span className="text-xs font-bold text-white truncate max-w-[80px]">Rodrigo</span>
                        <span className="text-[11px] font-mono text-zinc-300">1.690 pts</span>
                        <div className="w-full h-16 bg-gradient-to-t from-zinc-900 to-zinc-800/60 rounded-t-xl border-t border-x border-amber-800/40 mt-1.5 flex items-center justify-center">
                          <span className="font-mono font-black text-amber-600 text-base">3º</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Pessoal */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-between text-left">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                          VC
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white">Você (4º Lugar)</div>
                          <div className="text-xs text-zinc-300">Faltam 45 pts para o Pódio</div>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400">1.645 pts</span>
                    </div>

                    {/* Feed Rápido */}
                    <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-between text-xs">
                      <span className="text-zinc-200 flex items-center gap-1.5 truncate">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                        <span><strong>Larissa M.</strong> concluiu Treino</span>
                      </span>
                      <span className="text-zinc-400 font-mono shrink-0 ml-2">há 2m</span>
                    </div>
                  </div>
                )}

                {activeTab === 'ai_camera' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-zinc-900 aspect-4/3 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45 z-10" />
                      
                      <div className="absolute inset-3.5 border border-dashed border-white/30 rounded-xl z-20 flex flex-col justify-between p-2.5">
                        <div className="flex justify-between items-center text-[11px] font-mono text-emerald-400 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                            AI SCANNER ATIVO
                          </span>
                          <span>GPS: OK</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 text-left space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Refeição Auditada</span>
                            <span className="text-[11px] font-mono text-emerald-400 font-bold">100% Ao Vivo</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono text-zinc-200">
                            <div>Prot: <strong className="text-white">38g</strong></div>
                            <div>Carb: <strong className="text-white">42g</strong></div>
                            <div>Kcal: <strong className="text-amber-400">460</strong></div>
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
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Bloqueio de Galeria Ativo
                        </span>
                        <span className="text-emerald-400 font-mono text-xs font-bold">+50 XP</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Sensor óptico em tempo real impede envio de fotos antigas da galeria, mantendo 100% de justiça no desafio.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'pix_split' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-emerald-400" />
                          </div>
                          <span className="text-xs sm:text-sm font-black text-white">Split Pix Recebido</span>
                        </div>
                        <span className="text-xs font-mono text-zinc-300">Agora</span>
                      </div>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        + R$ 97,00
                      </div>
                      <div className="text-xs text-zinc-300 flex items-center justify-between border-t border-white/10 pt-2 font-mono">
                        <span>Inscrição: R$ 97,00</span>
                        <span className="text-emerald-400 font-bold">Taxa Plataforma: 0% (Pro)</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-1.5 text-left">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Divisão no Nível Bancário</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        No plano Pro, 100% do valor da inscrição vai para a sua conta. Sem retenções na plataforma.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-center font-mono">
                      <div className="p-3 rounded-xl bg-zinc-950 border border-white/10">
                        <span className="text-[11px] text-zinc-400 block">Alunos Pagos</span>
                        <span className="text-sm sm:text-base font-bold text-white">48 alunos</span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-white/10">
                        <span className="text-[11px] text-zinc-400 block">Seu Líquido</span>
                        <span className="text-sm sm:text-base font-bold text-emerald-400">R$ 4.656,00</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Nav Simulada com Touch Targets Proporcionais */}
                <div className="pt-3.5 mt-3 border-t border-white/10 flex items-center justify-around text-zinc-400 text-xs font-medium">
                  <span className="text-white font-bold flex flex-col items-center gap-1">
                    <Trophy className="w-4 h-4 text-white" />
                    Hoje
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

        {/* COLUNA 2: Cockpit Web do Treinador & Isolamento SaaS Multi-Tenant */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 mb-4 self-center lg:self-start">
            <Monitor className="w-3.5 h-3.5 text-white" />
            <span>Cockpit Web & Mobile do Treinador (Sincronizado em Tempo Real)</span>
          </div>

          <div className="mono-glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-zinc-950/90 shadow-2xl text-left space-y-6">
            {/* Barra de Janela do Cockpit Web */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-xs font-mono text-zinc-300 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  arenafitpro.com.br/dashboard
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full font-bold">
                <Lock className="w-3.5 h-3.5" />
                Multi-Tenant RLS Isolado
              </span>
            </div>

            {activeTab === 'podium' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                    GESTÃO DE ENGAJAMENTO & RETENÇÃO
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Acompanhe o Ranking, Squads e Alunos em Risco sem Planilhas
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-300 mt-2 leading-relaxed">
                    Enquanto o aluno visualiza sua posição no app mobile, o seu painel web consolida métricas de presença da turma e alerta automaticamente quem ficou 48h sem check-in.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-black/70 border border-white/10">
                    <span className="text-xs font-mono text-zinc-400 uppercase block">Taxa de Presença</span>
                    <span className="text-2xl font-black text-white font-mono mt-1 block">94.8%</span>
                    <span className="text-xs text-emerald-400 font-medium mt-1 block">Turma engajada hoje</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/70 border border-white/10">
                    <span className="text-xs font-mono text-zinc-400 uppercase block">Squad Líder</span>
                    <span className="text-lg font-black text-white mt-1 block truncate">Esquadrão Alpha</span>
                    <span className="text-xs text-amber-400 font-mono font-bold mt-1 block">8.420 XP somados</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/70 border border-white/10">
                    <span className="text-xs font-mono text-zinc-400 uppercase block">Radar Anti-Churn</span>
                    <span className="text-lg font-black text-emerald-400 mt-1 block">1 Toque</span>
                    <span className="text-xs text-zinc-300 mt-1 block">Resgate direto no WhatsApp</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai_camera' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                    AUDITORIA SWIPE + VISÃO COMPUTACIONAL
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Economize 2 Horas por Dia na Conferência de Pratos e Treinos
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-300 mt-2 leading-relaxed">
                    A IA Nutricional pré-valida calorias, proteínas e autenticidade da foto tirada ao vivo. No seu cockpit, você aprova ou modera toda a turma em segundos com o modo Auditoria Swipe.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-black/70 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Metadados Antifraude</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">✓ Verificado</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      Captura direta da câmera com timestamp criptográfico e validação de sessão ativa.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/70 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Leitura de Macronutrientes</span>
                      <span className="text-xs font-mono text-amber-400 font-bold">Gemini Vision</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      Estimativa instantânea de proteínas, carboidratos, gorduras e densidade calórica no feed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pix_split' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                    INFRAESTRUTURA FINTECH ASAAS D+0
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Liquidação Instantânea na Sua Conta com Zero Bitributação
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-300 mt-2 leading-relaxed">
                    Cada treinador possui isolamento multi-tenant completo e subconta financeira integrada. O aluno paga o Pix da inscrição, o sistema libera o acesso na hora e transfere seu lucro líquido automaticamente.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-black/70 border border-white/10">
                    <span className="text-xs font-mono text-zinc-400 uppercase block">Liberação do Saldo</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">D+0</span>
                    <span className="text-xs text-zinc-300 mt-1 block">Saque Pix imediato</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/70 border border-white/10">
                    <span className="text-xs font-mono text-zinc-400 uppercase block">Proteção Fiscal</span>
                    <span className="text-lg font-black text-white mt-1 block">Split Bancário</span>
                    <span className="text-xs text-zinc-300 mt-1 block">Sem imposto sobre a taxa</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/70 border border-white/10">
                    <span className="text-xs font-mono text-zinc-400 uppercase block">Matrícula Automática</span>
                    <span className="text-lg font-black text-white mt-1 block">Webhook Real-Time</span>
                    <span className="text-xs text-zinc-300 mt-1 block">Liberação em 2 segundos</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rodapé Informativo de Responsividade Multi-Dispositivo */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Arquitetura Web + Mobile-First nativa sem exigir download nas lojas</span>
              </span>
              <span className="font-mono text-white font-bold">iOS • Android • Desktop</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
