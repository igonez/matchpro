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
        className="relative w-full max-w-lg rounded-3xl bg-[#0E0E10] border border-[#27272A] p-6 sm:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.95)] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-tour-title"
      >
        {/* Barra de Progresso Animada */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#18181B] rounded-t-3xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#3478F6] via-[#75A7FF] to-[#3478F6] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Botão Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#18181B] border border-[#27272A] hover:border-[#3478F6]/40 transition-colors cursor-pointer"
          aria-label="Pular Tour"
          title="Pular Tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header do Passo */}
        <div className="space-y-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-white/[0.06] text-[#D4D4D8] px-3 py-1 rounded-full border border-white/10 font-bold">
              {currentStep.tag}
            </span>
            <span className="text-xs font-mono text-[#A1A1AA]">
              Passo {currentStep.stepNumber} de {STUDENT_TOUR_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#D4D4D8] shrink-0 shadow-inner">
              <StepIcon className="w-5 h-5 text-[#3478F6]" />
            </div>
            <div>
              <h2 id="student-tour-title" className="text-lg sm:text-xl font-black text-[#FAFAFA] tracking-tight">
                {currentStep.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Descrição & Destaque */}
        <div className="space-y-3.5 mb-5 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
          <p>{currentStep.description}</p>

          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 text-[#D4D4D8] font-medium flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-[#3478F6] shrink-0 mt-0.5" />
            <p className="text-xs leading-snug">{currentStep.highlightText}</p>
          </div>

          {/* Bullets */}
          <ul className="space-y-1.5 pt-2 border-t border-[#27272A] text-[#A1A1AA]">
            {currentStep.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
                <span className="text-[#FAFAFA]">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Botão de Atalho para a Tela */}
        <div className="mb-5">
          <Button
            onClick={() => handleNavigate(currentStep.actionHref)}
            variant="outline"
            className="w-full min-h-[42px] border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] font-bold text-xs flex items-center justify-center gap-2 rounded-xl cursor-pointer"
          >
            <span>{currentStep.actionLabel}</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#A1A1AA]" />
          </Button>
        </div>

        {/* Rodapé de Navegação */}
        <div className="flex items-center justify-between pt-3.5 border-t border-[#27272A]">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-1 text-xs font-mono font-bold transition-colors cursor-pointer ${
              currentStepIndex === 0 ? 'text-[#A1A1AA]/40 cursor-not-allowed' : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
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
                    ? 'w-5 bg-[#3478F6]'
                    : 'w-2 bg-[#27272A] hover:bg-[#3478F6]/50'
                }`}
                aria-label={`Ir para passo ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-[#3478F6] hover:bg-[#75A7FF] text-white font-extrabold text-xs px-3.5 min-h-[36px] rounded-xl flex items-center gap-1 cursor-pointer shadow-[0_0_15px_rgba(52,120,246,0.35)]"
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
