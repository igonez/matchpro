'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  Camera, 
  Utensils, 
  Trophy, 
  Smartphone, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StudentTourStep {
  id: string;
  stepNumber: number;
  title: string;
  tag: string;
  description: string;
  highlightText: string;
  actionLabel: string;
  actionHref: string;
  icon: React.ElementType;
  bullets: string[];
}

const STUDENT_TOUR_STEPS: StudentTourStep[] = [
  {
    id: 'step-streak',
    stepNumber: 1,
    title: '1. Sua Sequência Diária (Streak)',
    tag: 'CONSTÂNCIA & DISCIPLINA',
    description:
      'Bem-vindo ao desafio! Cada dia que você cumprir suas missões, o seu fogo de Streak aumenta. A constância é o segredo para transformar o seu corpo e somar pontos de XP.',
    highlightText: 'Mantenha o fogo aceso: não passe mais de 24h sem check-in para não perder sua sequência!',
    actionLabel: 'Ver Minhas Missões de Hoje',
    actionHref: '/app',
    icon: Flame,
    bullets: [
      'Streak ativo multiplica seus pontos na classificação geral',
      'Receba avisos diretos do seu treinador no topo da tela',
      'Acompanhe seu nível de atleta e evolução diária',
    ],
  },
  {
    id: 'step-camera',
    stepNumber: 2,
    title: '2. Check-in com Câmera ao Vivo',
    tag: 'INTEGRIDADE & ANTIFRAUDE',
    description:
      'Para validar seus treinos de musculação e cardios, tire uma foto ao vivo direto pela câmera do app. O envio de fotos antigas da galeria é bloqueado para garantir um jogo 100% justo.',
    highlightText: 'Nosso sensor óptico valida o horário e o local do treino em tempo real!',
    actionLabel: 'Abrir Câmera de Treino',
    actionHref: '/app/missions',
    icon: Camera,
    bullets: [
      'Foto capturada na hora dentro da academia ou treino em casa',
      'Cardio com cronômetro integrado no próprio aplicativo',
      'Seus pontos entram no placar assim que aprovados',
    ],
  },
  {
    id: 'step-nutrition',
    stepNumber: 3,
    title: '3. IA Nutricional no seu Prato',
    tag: 'VISÃO COMPUTACIONAL',
    description:
      'Nas missões de refeição, aponte a câmera para o seu prato. Nossa Inteligência Artificial reconhece os alimentos na hora e estima as calorias e macronutrientes da sua refeição.',
    highlightText: 'Zero complicação: você não precisa pesar no aplicativo ou digitar grama por grama!',
    actionLabel: 'Ver Missões Nutricionais',
    actionHref: '/app/missions',
    icon: Utensils,
    bullets: [
      'Reconhecimento automático de proteínas, carboidratos e saladas',
      'Estimativa imediata de calorias (kcal) aprovando sua missão',
      'Feedback instantâneo para ajudar você a manter a dieta limpa',
    ],
  },
  {
    id: 'step-ranking',
    stepNumber: 4,
    title: '4. Pódio da Turma & Squads',
    tag: 'DISPUTA SAUDÁVEL & EQUIPE',
    description:
      'Dispute as medalhas de Ouro, Prata e Bronze no Ranking Oficial ao Vivo! Além da sua posição individual, seus pontos somam para o seu Squad (equipe cooperativa).',
    highlightText: 'A vitória do seu time depende de você: comemore conquistas no Feed Social da turma!',
    actionLabel: 'Ver Pódio e Classificação',
    actionHref: '/app/ranking',
    icon: Trophy,
    bullets: [
      'Pódio atualizado em tempo real a cada check-in de aluno',
      'Feed Social com fotos auditadas para curtir e motivar os colegas',
      'Squads: cooperação em equipe para ninguém ficar para trás',
    ],
  },
  {
    id: 'step-pwa',
    stepNumber: 5,
    title: '5. Instale o App no seu Celular',
    tag: 'ACESSO EM 1 TOQUE',
    description:
      'Você não precisa ocupar memória baixando apps pesados de 150MB na loja: fixe a ArenaFitPro direto na tela inicial do seu iPhone ou Android.',
    highlightText: 'No Safari do iPhone: toque em Compartilhar ➔ "Adicionar à Tela de Início". No Android: toque no aviso de instalação!',
    actionLabel: 'Voltar ao Início',
    actionHref: '/app',
    icon: Smartphone,
    bullets: [
      'Abre em tela cheia como se fosse um app nativo',
      'Carregamento ultra-rápido mesmo no 3G/4G',
      'Acesso direto com 1 toque pelo ícone na tela do smartphone',
    ],
  },
];

const STUDENT_STORAGE_KEY = 'arenafit_student_tour_completed_v1';

export function StudentOnboardingTour() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Abrir automaticamente no primeiro acesso do aluno
    const hasCompleted = localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!hasCompleted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Ouvinte customizado para reabrir o tour quando solicitado pelo aluno
  useEffect(() => {
    const handleOpenStudentTour = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener('open-arenafit-student-tour', handleOpenStudentTour);
    return () => window.removeEventListener('open-arenafit-student-tour', handleOpenStudentTour);
  }, []);

  const handleClose = () => {
    localStorage.setItem(STUDENT_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStepIndex < STUDENT_TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  if (!isOpen) return null;

  const currentStep = STUDENT_TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const progressPercent = ((currentStepIndex + 1) / STUDENT_TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/20 p-6 sm:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.95)] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-tour-title"
      >
        {/* Barra de Progresso Animada */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-800 rounded-t-3xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-white to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Botão Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Pular Tour"
          title="Pular Tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header do Passo */}
        <div className="space-y-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white px-3 py-1 rounded-full border border-white/15 font-bold">
              {currentStep.tag}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              Passo {currentStep.stepNumber} de {STUDENT_TOUR_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <StepIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 id="student-tour-title" className="text-lg sm:text-xl font-black text-white tracking-tight">
                {currentStep.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Descrição & Destaque */}
        <div className="space-y-3.5 mb-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <p>{currentStep.description}</p>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs leading-snug">{currentStep.highlightText}</p>
          </div>

          {/* Bullets */}
          <ul className="space-y-1.5 pt-2 border-t border-white/[0.08] text-zinc-300">
            {currentStep.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Botão de Atalho para a Tela */}
        <div className="mb-5">
          <Button
            onClick={() => handleNavigate(currentStep.actionHref)}
            variant="outline"
            className="w-full min-h-[42px] border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 rounded-xl cursor-pointer"
          >
            <span>{currentStep.actionLabel}</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Button>
        </div>

        {/* Rodapé de Navegação */}
        <div className="flex items-center justify-between pt-3.5 border-t border-white/10">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-1 text-xs font-mono font-bold transition-colors cursor-pointer ${
              currentStepIndex === 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {/* Indicadores */}
          <div className="flex items-center gap-1.5">
            {STUDENT_TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-5 bg-white'
                    : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Ir para passo ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-3.5 min-h-[36px] rounded-xl flex items-center gap-1 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <span>{currentStepIndex === STUDENT_TOUR_STEPS.length - 1 ? 'Bora Começar!' : 'Próximo'}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Disparador para reabrir o Tour do Aluno
 */
export function triggerStudentTour() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-arenafit-student-tour'));
  }
}
