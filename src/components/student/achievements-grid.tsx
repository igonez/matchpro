'use client';

import React, { useState } from 'react';
import { Award, Lock, CheckCircle2, ChevronRight, X, Sparkles, Trophy } from 'lucide-react';
import { StudentAchievementStatus } from '@/lib/achievements';

interface AchievementsGridProps {
  achievements: StudentAchievementStatus[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<StudentAchievementStatus | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalPoints = achievements.filter((a) => a.isUnlocked).reduce((acc, curr) => acc + curr.points_reward, 0);

  const categories = [
    { id: 'all', label: `Todas (${achievements.length})` },
    { id: 'streak', label: 'Ofensiva' },
    { id: 'workout', label: 'Treino' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'nutrition', label: 'Nutrição' },
    { id: 'ranking', label: 'Pódio' },
  ];

  const getBadgeColor = (category: string, isUnlocked: boolean) => {
    if (!isUnlocked) return 'border-white/10 text-zinc-500 bg-white/5';
    switch (category) {
      case 'streak': return 'border-amber-400/40 text-amber-300 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.15)]';
      case 'cardio': return 'border-cyan-400/40 text-cyan-300 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.15)]';
      case 'nutrition': return 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.15)]';
      case 'ranking': return 'border-amber-400/50 text-amber-200 bg-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.25)]';
      case 'points': return 'border-purple-400/40 text-purple-300 bg-purple-400/10 shadow-[0_0_15px_rgba(192,132,252,0.15)]';
      default: return 'border-white/20 text-white bg-white/10';
    }
  };

  const filtered = activeCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Resumo no Topo */}
      <div className="mono-glass-card p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 font-bold">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <span>Medalhas de Mérito</span>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded">
                +{totalPoints} XP
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              {unlockedCount} de {achievements.length} medalhas conquistadas
            </p>
          </div>
        </div>

        {/* Mini Barra de Progresso Circular ou Pílula */}
        <div className="text-right">
          <span className="text-sm font-black font-mono text-white">
            {Math.round((unlockedCount / (achievements.length || 1)) * 100)}%
          </span>
          <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-widest">
            Completude
          </span>
        </div>
      </div>

      {/* Filtro por Categorias */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
              activeCategory === cat.id
                ? 'bg-white text-black shadow-sm'
                : 'bg-zinc-900/70 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Medalhas */}
      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((ach) => {
          return (
            <div
              key={ach.id}
              onClick={() => setSelectedAchievement(ach)}
              className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-3 group ${
                ach.isUnlocked
                  ? 'bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border-white/20 hover:border-white/40 shadow-md hover:scale-[1.01]'
                  : 'bg-zinc-950/40 border-white/5 opacity-60 hover:opacity-85 hover:border-white/15'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center font-mono font-black text-xs uppercase tracking-wider shrink-0 transition-transform group-hover:scale-105 border ${getBadgeColor(
                    ach.category,
                    ach.isUnlocked
                  )}`}
                >
                  {ach.icon}
                </div>

                <div className="shrink-0">
                  {ach.isUnlocked ? (
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-white/5 border border-white/10 text-zinc-500 flex items-center justify-center">
                      <Lock className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h5 className={`text-xs font-bold leading-tight line-clamp-1 ${ach.isUnlocked ? 'text-white' : 'text-zinc-400'}`}>
                  {ach.title}
                </h5>
                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                  {ach.description}
                </p>
              </div>

              {/* Barra de Progresso inferior se bloqueada */}
              {!ach.isUnlocked ? (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                    <span>Progresso</span>
                    <span>{ach.currentValue}/{ach.requirement_value}</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/40 rounded-full transition-all"
                      style={{ width: `${ach.progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400 pt-1 border-t border-white/5">
                  <span>Conquistada</span>
                  <span>+{ach.points_reward} XP</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhes da Conquista */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="mono-glass-card max-w-sm w-full p-6 rounded-3xl border border-white/20 space-y-4 animate-in zoom-in-95 duration-200 text-center relative">
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Insígnia Grande */}
            <div className={`mx-auto w-20 h-20 rounded-3xl border flex items-center justify-center font-mono font-black text-2xl tracking-widest shadow-2xl relative ${getBadgeColor(
              selectedAchievement.category,
              selectedAchievement.isUnlocked
            )}`}>
              {selectedAchievement.icon}
              {selectedAchievement.isUnlocked && (
                <span className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-md">
                  <CheckCircle2 className="h-4 w-4 text-black stroke-[3]" />
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                Medalha de Mérito
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {selectedAchievement.title}
              </h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                {selectedAchievement.description}
              </p>
            </div>

            {/* Recompensa de XP */}
            <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Recompensa:</span>
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> +{selectedAchievement.points_reward} XP
              </span>
            </div>

            {/* Status de Desbloqueio */}
            <div className="pt-2">
              {selectedAchievement.isUnlocked ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Conquistada!
                    {selectedAchievement.unlockedAt && ` • ${new Date(selectedAchievement.unlockedAt).toLocaleDateString('pt-BR')}`}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>Requisito para desbloquear:</span>
                    <span className="text-white font-bold">
                      {selectedAchievement.currentValue}/{selectedAchievement.requirement_value}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
                      style={{ width: `${selectedAchievement.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Faltam {Math.max(0, selectedAchievement.requirement_value - selectedAchievement.currentValue)} para conquistar esta medalha.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedAchievement(null)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow-md"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
