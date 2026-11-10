'use client';

import React, { useState } from 'react';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import {
  Share2,
  Camera,
  Layers,
  Check,
  X,
  Crown,
  Trophy,
  Download,
  Copy,
} from 'lucide-react';

type StoryVariant = 'list' | 'hero';
type StoryBgMode = 'photo' | 'transparent';

const BRAND_PRESETS = [
  { label: 'Team Silva', challenge: 'Desafio 30 Dias Shape' },
  { label: 'Consultoria Elite', challenge: 'Seca Barriga 21D' },
  { label: 'Nutri Carolina', challenge: 'Desafio Reeducação 4 Semanas' },
];

const STANDINGS = [
  { rank: 1, name: 'Ana Clara', pts: 1280, isMe: false },
  { rank: 2, name: 'Bruno M.', pts: 1195, isMe: false },
  { rank: 3, name: 'Carla S.', pts: 1110, isMe: true },
  { rank: 4, name: 'Diego R.', pts: 1040, isMe: false },
  { rank: 5, name: 'Elisa P.', pts: 985, isMe: false },
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
      className="py-20 sm:py-24 px-4 sm:px-6 relative border-t border-[#27272A]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#27272A] bg-[#0E0E10] text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-4">
            <Share2 className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
            <span>MÁQUINA DE AQUISIÇÃO ORGÂNICA 9:16</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#FAFAFA] tracking-tight mb-4 text-balance">
            Seus alunos divulgam a sua consultoria{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAFAFA] via-[#75A7FF] to-[#3478F6]">
              nos Stories do Instagram
            </span>
          </h2>

          <p className="text-[#A1A1AA] text-base sm:text-lg leading-relaxed text-pretty">
            Print de planilha ninguém posta. Mas uma foto pós-treino com o{' '}
            <strong className="text-[#FAFAFA]">Card 9:16 Oficial mostrando o Top 5 e a SUA marca no topo</strong>? Essa todo mundo compartilha — transformando cada aluno em um outdoor gratuito para lotar sua próxima turma.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* COLUNA ESQUERDA: Controles Interativos + Diferenciais White-Label */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-[#27272A] bg-[#0E0E10] shadow-xl space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#3478F6] font-bold block mb-1">
                  TESTE AO VIVO AGORA
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
                  Personalize o Card 9:16 com a Sua Marca
                </h3>
                <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 leading-relaxed">
                  Digite o nome da sua consultoria ou escolha um modelo abaixo para ver como seus alunos divulgam seu trabalho:
                </p>
              </div>

              {/* Input da Marca do Personal */}
              <div className="space-y-2.5">
                <label
                  htmlFor="personal-brand-preview"
                  className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] block font-bold"
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
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#000000] border border-[#27272A] text-sm font-bold text-[#FAFAFA] placeholder-[#A1A1AA]/50 focus:border-[#3478F6] focus:outline-none transition-colors"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {BRAND_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetClick(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                        customBrand.toLowerCase() === preset.label.toLowerCase()
                          ? 'bg-[#3478F6] text-white border-[#3478F6] font-bold shadow-md'
                          : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:text-[#FAFAFA] hover:bg-[#27272A]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seletor de Layout (Card 1 vs Card 2) */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] block font-bold">
                  2. Escolha o Estilo do Card (Carrossel 9:16):
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVariant('list')}
                    className={`min-h-[48px] p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      variant === 'list'
                        ? 'bg-[#3478F6] text-white border-[#3478F6] shadow-[0_0_20px_rgba(52,120,246,0.3)]'
                        : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3478F6]/40'
                    }`}
                  >
                    <Trophy className={`w-4 h-4 shrink-0 ${variant === 'list' ? 'text-white' : 'text-[#A1A1AA]'}`} />
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">Classificação</div>
                      <div className={`text-[11px] font-mono ${variant === 'list' ? 'text-white/80' : 'text-[#A1A1AA]'}`}>
                        Top 5 + Métricas
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVariant('hero')}
                    className={`min-h-[48px] p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      variant === 'hero'
                        ? 'bg-[#3478F6] text-white border-[#3478F6] shadow-[0_0_20px_rgba(52,120,246,0.3)]'
                        : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3478F6]/40'
                    }`}
                  >
                    <Crown className={`w-4 h-4 shrink-0 ${variant === 'hero' ? 'text-white' : 'text-[#A1A1AA]'}`} />
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">Posição Gigante</div>
                      <div className={`text-[11px] font-mono ${variant === 'hero' ? 'text-white/80' : 'text-[#A1A1AA]'}`}>
                        Destaque Herói
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Seletor de Fundo (Foto vs Transparente Sticker) */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] block font-bold">
                  3. Escolha o Modo de Exportação (1080×1920 PNG):
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBgMode('photo')}
                    className={`min-h-[48px] p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      bgMode === 'photo'
                        ? 'bg-[#18181B] text-[#FAFAFA] border-[#3478F6]'
                        : 'bg-[#000000] text-[#A1A1AA] border-[#27272A] hover:border-[#3478F6]/40'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-[#3478F6] shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">Câmera / Galeria</div>
                      <div className="text-[11px] font-mono text-[#A1A1AA]">Foto pós-treino 9:16</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBgMode('transparent')}
                    className={`min-h-[48px] p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      bgMode === 'transparent'
                        ? 'bg-[#18181B] text-[#FAFAFA] border-[#3478F6]'
                        : 'bg-[#000000] text-[#A1A1AA] border-[#27272A] hover:border-[#3478F6]/40'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-[#3478F6] shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold leading-tight">Sticker Transparente</div>
                      <div className="text-[11px] font-mono text-[#A1A1AA]">PNG sem fundo p/ Story</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Comparativo Rápido Por que Viraliza */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#27272A]">
                <div className="p-3.5 rounded-xl bg-[#000000] border border-[#27272A] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-red-400 font-bold">
                    <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>PRINT DE PLANILHA</span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    Visual amador e confuso sem seu logo. Nenhum aluno tem orgulho de postar no Instagram.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#18181B] border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#3478F6] font-bold">
                    <Check className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
                    <span>STORY WHITE-LABEL 9:16</span>
                  </div>
                  <p className="text-xs text-[#FAFAFA] leading-relaxed">
                    Design profissional com <strong>seu Logo e Marca no topo</strong>. Gera curiosidade e novos alunos todo dia.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: Preview Fiel do Smartphone 9:16 */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Callout Badges Superiores */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E0E10] border border-[#27272A] text-xs font-mono text-[#FAFAFA] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#3478F6] animate-pulse" />
                Topo: Seu Logo + Sua Marca
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E0E10] border border-[#27272A] text-xs font-mono text-[#A1A1AA]">
                Exportação 1080×1920 Ultra HD
              </span>
            </div>

            {/* Moldura de Smartphone 9:16 */}
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] rounded-[38px] sm:rounded-[44px] p-2.5 sm:p-3 bg-gradient-to-b from-[#18181B] via-[#0E0E10] to-[#000000] border border-[#27272A] shadow-[0_35px_100px_rgba(0,0,0,0.95),0_0_35px_rgba(52,120,246,0.12)]">
              {/* Dynamic Island */}
              <div className="absolute top-5 sm:top-6 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4.5 sm:h-5 rounded-full bg-black border border-[#27272A] z-30" />

              {/* Tela 9:16 */}
              <div
                className="relative rounded-[30px] sm:rounded-[36px] overflow-hidden border border-[#27272A] aspect-[9/16] flex flex-col justify-end p-5 sm:p-7 select-none transition-all duration-300"
                style={
                  bgMode === 'transparent'
                    ? {
                        backgroundColor: '#000000',
                        backgroundImage:
                          'linear-gradient(45deg,#0E0E10 25%,transparent 25%),linear-gradient(-45deg,#0E0E10 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#0E0E10 75%),linear-gradient(-45deg,transparent 75%,#0E0E10 75%)',
                        backgroundSize: '24px 24px',
                        backgroundPosition: '0 0,0 12px,12px -12px,-12px 0',
                      }
                    : {
                        background:
                          'radial-gradient(circle at 50% 22%, rgba(24, 24, 27,0.75) 0%, rgba(14, 14, 16,0.92) 50%, rgba(0, 0, 0,0.98) 100%)',
                      }
                }
              >
                {/* Foto real pós-treino da aluna de academia ao fundo quando modo Foto */}
                {bgMode === 'photo' && (
                  <>
                    <img
                      src="/images/mockups/student-workout-selfie.jpg"
                      alt="Foto pós-treino da aluna na academia"
                      className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.70] contrast-[1.08]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/65 to-[#000000]/45 z-0 pointer-events-none" />
                    <div className="absolute top-12 inset-x-0 flex flex-col items-center z-10 opacity-90">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-mono text-[#FAFAFA] shadow-md">
                        Foto Pós-Treino Real da Aluna
                      </span>
                    </div>
                  </>
                )}

                {bgMode === 'transparent' && (
                  <div className="absolute top-12 inset-x-0 flex flex-col items-center z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/80 border border-[#27272A] text-[11px] font-mono text-[#FAFAFA]">
                      Fundo Transparente (Sticker PNG)
                    </span>
                  </div>
                )}

                {/* Conteúdo Fiel ao RankingShareCard */}
                <div
                  className={`relative z-20 flex flex-col items-center text-center w-full transition-all duration-200 ${
                    bgMode === 'photo'
                      ? 'p-3.5 sm:p-4 rounded-2xl bg-[#000000]/85 backdrop-blur-md border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.8)]'
                      : ''
                  }`}
                >
                  {/* Logo do Personal no Topo */}
                  <div
                    className="w-11 h-11 rounded-xl border-2 border-[#3478F6] bg-[#0E0E10] flex items-center justify-center text-sm font-black text-white shadow-lg mb-2"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                  >
                    {getInitials(displayBrand)}
                  </div>

                  {/* Nome da Marca do Personal */}
                  <div
                    className="text-xs font-black text-[#FAFAFA] uppercase tracking-[2px] mb-0.5 truncate max-w-full"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}
                  >
                    {displayBrand}
                  </div>

                  {/* Nome do Desafio */}
                  <div
                    className="text-xs font-semibold text-[#A1A1AA] mb-0.5"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.85)' }}
                  >
                    {activePreset.challenge}
                  </div>

                  {variant === 'list' ? (
                    <>
                      <div
                        className="text-xl font-extrabold text-[#FAFAFA] mb-4"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.85)' }}
                      >
                        Ranking
                      </div>

                      {/* 3 Métricas com Divisórias */}
                      <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] items-center w-full pb-3">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-amber-400 leading-tight">3º</span>
                          <span className="text-[11px] text-[#A1A1AA]">posição</span>
                        </div>
                        <div className="w-px h-7 bg-[#27272A]" />
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-amber-300 leading-tight">1110</span>
                          <span className="text-[11px] text-[#A1A1AA]">pontos</span>
                        </div>
                        <div className="w-px h-7 bg-[#27272A]" />
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold text-[#FAFAFA] leading-tight">de 42</span>
                          <span className="text-[11px] text-[#A1A1AA]">atletas</span>
                        </div>
                      </div>

                      {/* Linha Divisória */}
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mb-3.5" />

                      {/* Lista Top 5 com Pódio Ouro / Prata / Bronze */}
                      <div className="w-full space-y-1.5 text-left">
                        <div className="text-[11px] font-bold tracking-[2.5px] uppercase text-[#A1A1AA] mb-1">
                          CLASSIFICAÇÃO
                        </div>
                        {STANDINGS.map((s) => {
                          const badgeStyle =
                            s.rank === 1
                              ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.25)]'
                              : s.rank === 2
                              ? 'bg-slate-300/20 border-slate-300/55 text-slate-200'
                              : s.rank === 3
                              ? 'bg-amber-700/35 border-amber-500/60 text-amber-400'
                              : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA]';

                          const xpStyle =
                            s.rank === 1
                              ? 'text-amber-300 font-bold'
                              : s.rank === 2
                              ? 'text-slate-200 font-bold'
                              : s.rank === 3
                              ? 'text-amber-400 font-extrabold'
                              : 'text-[#FAFAFA] font-semibold';

                          return (
                            <div
                              key={s.name}
                              className={`flex items-center justify-between text-xs transition-colors ${
                                s.isMe
                                  ? 'bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1'
                                  : 'px-1 py-0.5'
                              }`}
                            >
                              <span
                                className={`flex items-center gap-2 truncate ${
                                  s.isMe
                                    ? 'text-[#FAFAFA] font-extrabold'
                                    : s.rank <= 2
                                    ? 'text-[#FAFAFA] font-semibold'
                                    : 'text-[#A1A1AA] font-medium'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono font-black shrink-0 ${badgeStyle}`}
                                >
                                  {s.rank}º
                                </span>
                                <span>{s.name}</span>
                              </span>
                              <span className={`font-mono ${xpStyle}`}>{s.pts} XP</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    /* Variante Herói (Posição Gigante) */
                    <div className="py-3 flex flex-col items-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-700/30 border border-amber-500/50 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest mb-1.5">
                        PÓDIO • BRONZE
                      </span>
                      <div
                        className="text-7xl font-black text-amber-400 leading-none tracking-tight"
                        style={{ textShadow: '0 4px 20px rgba(217,119,6,0.45)' }}
                      >
                        3º
                      </div>
                      <div className="text-sm font-semibold text-[#A1A1AA] mt-2">
                        de 42 atletas
                      </div>
                      <div className="w-16 h-px bg-amber-400/60 my-3.5 shadow" />
                      <div className="text-xl font-extrabold font-mono text-amber-300">1110 XP</div>
                    </div>
                  )}

                  {/* Marca d'água inferior discreta ArenaFitPro */}
                  <div className="flex items-center justify-center gap-1.5 mt-5 opacity-60">
                    <div className="w-3.5 h-3.5 rounded bg-[#3478F6]/30 flex items-center justify-center text-[9px] font-black text-[#D4D4D8]">
                      ✦
                    </div>
                    <span className="text-[11px] font-bold tracking-[1.5px] text-[#FAFAFA]">
                      ARENAFITPRO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Ações Nativa do Aluno abaixo do Smartphone */}
            <div className="mt-5 flex items-center justify-center gap-3 text-xs font-mono text-[#A1A1AA]">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E0E10] border border-[#27272A]">
                <svg className="w-3.5 h-3.5 text-[#3478F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>Story Direto</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E0E10] border border-[#27272A]">
                <Copy className="w-3.5 h-3.5 text-[#3478F6]" /> Copiar Sticker
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E0E10] border border-[#27272A]">
                <Download className="w-3.5 h-3.5 text-[#3478F6]" /> Baixar PNG
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
