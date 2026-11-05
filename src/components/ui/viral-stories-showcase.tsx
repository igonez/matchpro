'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { trackMarketingEvent } from '@/lib/analytics/tracking';
import {
  Share2,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Layers,
  Check,
  X,
  ArrowRight,
  Crown,
  Trophy,
  Download,
  Copy,
} from 'lucide-react';

type StoryVariant = 'list' | 'hero';
type StoryBgMode = 'photo' | 'transparent';

const BRAND_PRESETS = [
  { label: 'Team Silva', initials: 'TS', challenge: 'Desafio 30 Dias Shape' },
  { label: 'Consultoria Elite', initials: 'CE', challenge: 'Seca Barriga 21D' },
  { label: 'Nutri Carolina', initials: 'NC', challenge: 'Desafio Reeducação 4 Semanas' },
];

const STANDINGS = [
  { name: 'Ana Clara', pts: 1280, isMe: false },
  { name: 'Bruno M.', pts: 1195, isMe: false },
  { name: 'Carla S.', pts: 1110, isMe: true },
  { name: 'Diego R.', pts: 1040, isMe: false },
  { name: 'Elisa P.', pts: 985, isMe: false },
];

export function ViralStoriesShowcase() {
  const [variant, setVariant] = useState<StoryVariant>('list');
  const [bgMode, setBgMode] = useState<StoryBgMode>('photo');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [customBrand, setCustomBrand] = useState<string>('Team Silva');

  const activePreset = BRAND_PRESETS[selectedPresetIdx];
  const displayBrand = (customBrand.trim() || activePreset.label).toUpperCase();

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'AF';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const handlePresetClick = (idx: number) => {
    setSelectedPresetIdx(idx);
    setCustomBrand(BRAND_PRESETS[idx].label);
  };

  return (
    <section
      id="stories"
      className="py-20 sm:py-24 px-4 sm:px-6 relative border-t border-white/[0.06]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-xs font-mono uppercase tracking-wider text-amber-300 mb-4">
            <Share2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>NOVO • MÁQUINA DE AQUISIÇÃO ORGÂNICA 9:16</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 text-balance">
            Seus alunos agora divulgam a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500">
              sua consultoria nos Stories
            </span>
          </h2>

          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed text-pretty">
            Print de planilha ninguém posta. Mas uma foto pós-treino com o{' '}
            <strong className="text-white">Card 9:16 Oficial mostrando o Top 5 e a SUA marca no topo</strong>? Essa todo mundo compartilha no Instagram — transformando cada aluno em um outdoor gratuito para lotar sua próxima turma.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* COLUNA ESQUERDA: Controles Interativos + Diferenciais White-Label */}
          <div className="lg:col-span-6 space-y-6">
            <SpotlightCard3D className="p-6 sm:p-8 border-white/15 bg-zinc-950/90 space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                  TESTE AO VIVO AGORA
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Personalize o Card 9:16 com a Sua Marca
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                  Digite o nome da sua consultoria ou escolha um modelo abaixo para ver como seus alunos divulgam seu trabalho:
                </p>
              </div>

              {/* Input da Marca do Personal */}
              <div className="space-y-2.5">
                <label
                  htmlFor="personal-brand-preview"
                  className="text-xs font-mono uppercase tracking-wider text-zinc-300 block font-bold"
                >
                  1. Sua Marca no Topo do Story (White-Label):
                </label>
                <input
                  id="personal-brand-preview"
                  type="text"
                  maxLength={28}
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Ex: Team Silva / Consultoria Elite"
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-black border border-white/15 text-sm font-bold text-white placeholder-zinc-400 focus:border-amber-400 focus:outline-none transition-colors"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {BRAND_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetClick(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                        customBrand.toLowerCase() === preset.label.toLowerCase()
                          ? 'bg-amber-400/15 text-amber-300 border-amber-400/40 font-bold'
                          : 'bg-white/5 text-zinc-300 border-white/10 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seletor de Layout (Card 1 vs Card 2) */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 block font-bold">
                  2. Escolha o Estilo do Card (Carrossel 9:16):
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVariant('list')}
                    className={`min-h-[48px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      variant === 'list'
                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : 'bg-black/60 text-zinc-200 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <Trophy className={`w-4 h-4 shrink-0 ${variant === 'list' ? 'text-black' : 'text-amber-400'}`} />
                    <div>
                      <div className="text-xs sm:text-sm font-black leading-tight">Classificação</div>
                      <div className={`text-[11px] font-mono ${variant === 'list' ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        Top 5 + Métricas
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVariant('hero')}
                    className={`min-h-[48px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      variant === 'hero'
                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : 'bg-black/60 text-zinc-200 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <Crown className={`w-4 h-4 shrink-0 ${variant === 'hero' ? 'text-black' : 'text-amber-400'}`} />
                    <div>
                      <div className="text-xs sm:text-sm font-black leading-tight">Posição Gigante</div>
                      <div className={`text-[11px] font-mono ${variant === 'hero' ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        Destaque Herói
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Seletor de Fundo (Foto vs Transparente Sticker) */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 block font-bold">
                  3. Escolha o Modo de Exportação (1080×1920 PNG):
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBgMode('photo')}
                    className={`min-h-[48px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      bgMode === 'photo'
                        ? 'bg-amber-400/15 text-white border-amber-400/50'
                        : 'bg-black/60 text-zinc-300 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">Câmera / Galeria</div>
                      <div className="text-[11px] font-mono text-zinc-400">Foto pós-treino 9:16</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBgMode('transparent')}
                    className={`min-h-[48px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      bgMode === 'transparent'
                        ? 'bg-amber-400/15 text-white border-amber-400/50'
                        : 'bg-black/60 text-zinc-300 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">Sticker Transparente</div>
                      <div className="text-[11px] font-mono text-zinc-400">PNG sem fundo p/ Story</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Comparativo Rápido Por que Viraliza */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 font-bold">
                    <X className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>PRINT DE PLANILHA</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Visual amador, confuso e sem o seu logo. Nenhum aluno tem vontade de postar no Instagram.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-400/[0.06] border border-amber-400/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 font-bold">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>STORY WHITE-LABEL 9:16</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    Estética Titanium + Dourado com <strong>seu Logo e Nome no topo</strong>. Gera curiosidade e novos clientes todo dia.
                  </p>
                </div>
              </div>
            </SpotlightCard3D>
          </div>

          {/* COLUNA DIREITA: Preview Fiel do Smartphone 9:16 */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Callout Badges Superiores */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-xs font-mono text-amber-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Topo: Seu Logo + Sua Marca
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-zinc-300">
                Exportação 1080×1920 Ultra HD
              </span>
            </div>

            {/* Moldura de Smartphone Titanium 9:16 */}
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] rounded-[48px] p-3 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border border-white/25 shadow-[0_35px_100px_rgba(0,0,0,0.95),0_0_45px_rgba(251,191,36,0.08)]">
              {/* Dynamic Island */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black border border-white/10 z-30" />

              {/* Tela 9:16 */}
              <div
                className="relative rounded-[38px] overflow-hidden border border-white/10 aspect-[9/16] flex flex-col justify-end p-6 sm:p-7 select-none transition-all duration-300"
                style={
                  bgMode === 'transparent'
                    ? {
                        backgroundColor: '#0e0e11',
                        backgroundImage:
                          'linear-gradient(45deg,#18181d 25%,transparent 25%),linear-gradient(-45deg,#18181d 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#18181d 75%),linear-gradient(-45deg,transparent 75%,#18181d 75%)',
                        backgroundSize: '24px 24px',
                        backgroundPosition: '0 0,0 12px,12px -12px,-12px 0',
                      }
                    : {
                        background:
                          'radial-gradient(circle at 50% 22%, rgba(63,63,70,0.55) 0%, rgba(24,24,27,0.85) 45%, rgba(5,5,7,0.98) 100%)',
                      }
                }
              >
                {/* Simulação visual de ambiente de treino ao fundo quando modo Foto */}
                {bgMode === 'photo' && (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-zinc-900/60 to-black z-0" />
                    <div className="absolute top-12 inset-x-0 flex flex-col items-center z-10 opacity-80">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/15 text-[11px] font-mono text-zinc-300">
                        Foto Pós-Treino do Aluno
                      </span>
                    </div>
                  </>
                )}

                {bgMode === 'transparent' && (
                  <div className="absolute top-12 inset-x-0 flex flex-col items-center z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/80 border border-amber-400/30 text-[11px] font-mono text-amber-300">
                      Fundo Transparente (Sticker PNG)
                    </span>
                  </div>
                )}

                {/* Conteúdo Fiel ao RankingShareCard */}
                <div className="relative z-20 flex flex-col items-center text-center w-full">
                  {/* Logo do Personal no Topo */}
                  <div
                    className="w-11 h-11 rounded-xl border-2 border-amber-400/70 bg-black/50 flex items-center justify-center text-sm font-black text-amber-400 shadow-lg mb-2"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                  >
                    {getInitials(displayBrand)}
                  </div>

                  {/* Nome da Marca do Personal em Dourado */}
                  <div
                    className="text-xs font-extrabold text-amber-400 uppercase tracking-[2px] mb-0.5 truncate max-w-full"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}
                  >
                    {displayBrand}
                  </div>

                  {/* Nome do Desafio */}
                  <div
                    className="text-xs font-semibold text-white/85 mb-0.5"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}
                  >
                    {activePreset.challenge}
                  </div>

                  {variant === 'list' ? (
                    <>
                      <div
                        className="text-xl font-extrabold text-white mb-4"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.85)' }}
                      >
                        Ranking
                      </div>

                      {/* 3 Métricas com Divisórias */}
                      <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] items-center w-full pb-3">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-extrabold text-white leading-tight">3º</span>
                          <span className="text-[11px] text-white/75">posição</span>
                        </div>
                        <div className="w-px h-7 bg-white/30" />
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-extrabold text-amber-400 leading-tight">1110</span>
                          <span className="text-[11px] text-white/75">pontos</span>
                        </div>
                        <div className="w-px h-7 bg-white/30" />
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-extrabold text-white leading-tight">de 42</span>
                          <span className="text-[11px] text-white/75">atletas</span>
                        </div>
                      </div>

                      {/* Linha Dourada */}
                      <div className="w-full h-[2px] bg-amber-400 shadow mb-3.5" />

                      {/* Lista Top 5 */}
                      <div className="w-full space-y-1.5 text-left">
                        <div className="text-[11px] font-bold tracking-[2.5px] uppercase text-white/75 mb-1">
                          CLASSIFICAÇÃO
                        </div>
                        {STANDINGS.map((s) => (
                          <div key={s.name} className="flex items-center justify-between text-xs">
                            <span
                              className={`flex items-center gap-2 truncate ${
                                s.isMe ? 'text-amber-400 font-extrabold' : 'text-white font-semibold'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  s.isMe ? 'bg-amber-400' : 'bg-white'
                                }`}
                              />
                              <span>{s.name}</span>
                            </span>
                            <span className="text-amber-400 font-extrabold shrink-0">{s.pts} XP</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Variante Herói (Posição Gigante) */
                    <div className="py-3 flex flex-col items-center">
                      <div
                        className="text-7xl font-black text-white leading-none tracking-tight"
                        style={{ textShadow: '0 4px 18px rgba(0,0,0,0.85)' }}
                      >
                        3º
                      </div>
                      <div className="text-sm font-semibold text-white/85 mt-2">
                        de 42 atletas
                      </div>
                      <div className="w-16 h-[2px] bg-amber-400 my-3.5 shadow" />
                      <div className="text-xl font-extrabold text-amber-400">1110 XP</div>
                    </div>
                  )}

                  {/* Marca d'água inferior discreta ArenaFitPro */}
                  <div className="flex items-center justify-center gap-1.5 mt-5 opacity-60">
                    <div className="w-3.5 h-3.5 rounded bg-white/20 flex items-center justify-center text-[9px] font-black text-white">
                      ✦
                    </div>
                    <span className="text-[11px] font-bold tracking-[1.5px] text-white">
                      ARENAFITPRO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Ações Nativa do Aluno abaixo do Smartphone */}
            <div className="mt-5 flex items-center justify-center gap-3 text-xs font-mono text-zinc-300">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10">
                <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>Story Direto</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10">
                <Copy className="w-3.5 h-3.5 text-zinc-300" /> Copiar Sticker
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10">
                <Download className="w-3.5 h-3.5 text-zinc-300" /> Baixar PNG
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
