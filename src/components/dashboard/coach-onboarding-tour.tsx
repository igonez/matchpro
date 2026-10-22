'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Wallet, 
  PlusCircle, 
  Trophy, 
  Users, 
  CheckSquare, 
  Flame, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TourStep {
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

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-finance',
    stepNumber: 1,
    title: '1. Ative sua Subconta & Chave Pix',
    tag: 'ETAPA FINANCEIRA OBRIGATÓRIA',
    description:
      'Cadastre seus dados fiscais (CPF ou CNPJ) e sua Chave Pix. Nossa integração com o Asaas cria sua subconta bancária automaticamente para você receber pagamentos de alunos.',
    highlightText: 'Split Pix D+0 direto na sua conta, com 0% de comissão no plano Pro e proteção contra bitributação!',
    actionLabel: 'Configurar Subconta & Chave Pix',
    actionHref: '/dashboard/finance',
    icon: Wallet,
    bullets: [
      'Alunos pagam exclusivamente via Pix com aprovação em segundos',
      'Zero risco de golpes de estorno (chargeback) comuns em cartões',
      'Saques D+0 instantâneos para a sua chave Pix cadastrada',
    ],
  },
  {
    id: 'step-challenge',
    stepNumber: 2,
    title: '2. Crie seu Primeiro Desafio',
    tag: 'LANÇAMENTO DA TURMA',
    description:
      'Dê um nome impactante (ex: "Seca em 30 Dias - Turma VIP"), defina as datas de início e fim, e escolha o valor da inscrição dos alunos (ou deixe R$ 0 se for gratuito).',
    highlightText: 'A plataforma gera automaticamente o seu Código de Convite exclusivo (ex: SECA-2026)!',
    actionLabel: 'Criar Novo Desafio Agora',
    actionHref: '/dashboard/challenges/new',
    icon: PlusCircle,
    bullets: [
      'Defina a meta de pontos e duração do desafio',
      'Personalize o banner da turma e descrição das regras',
      'Suporte a múltiplos desafios simultâneos no plano Pro',
    ],
  },
  {
    id: 'step-missions',
    stepNumber: 3,
    title: '3. Configure Missões & IA Nutricional',
    tag: 'GAMIFICAÇÃO & HÁBITOS',
    description:
      'O coração da retenção: crie as missões diárias que seus alunos devem cumprir para somar pontos e disputar o pódio da turma.',
    highlightText: 'Economize horas do seu dia: nossa IA de Visão Computacional audita as fotos de pratos dos alunos automaticamente!',
    actionLabel: 'Gerenciar Missões & Regras',
    actionHref: '/dashboard/missions',
    icon: Trophy,
    bullets: [
      'Missões de Treino: foto ao vivo na academia ou em casa',
      'Cardio Ativo: cronômetro integrado no app do aluno',
      'IA Nutricional: calcula calorias e macronutrientes da foto do prato',
      'Hábitos saudáveis: ingestão diária de água e fotos de pesagem',
    ],
  },
  {
    id: 'step-invites',
    stepNumber: 4,
    title: '4. Convide seus Alunos pelo WhatsApp',
    tag: 'ACESSO ZERO FRICÇÃO',
    description:
      'Copie o Código de Convite ou o Link de Acesso com 1 clique e envie no grupo de WhatsApp da sua consultoria ou academia.',
    highlightText: 'Seus alunos não precisam baixar apps pesados de 150MB: a ArenaFitPro abre em segundos no celular via PWA!',
    actionLabel: 'Ver Lista de Alunos & Links',
    actionHref: '/dashboard/students',
    icon: Users,
    bullets: [
      'Aluno digita o código ou clica no link e entra na hora',
      'Opção "Já sou da turma" restaura o histórico e streaks anteriores',
      'Acompanhe em tempo real quem já pagou a inscrição',
    ],
  },
  {
    id: 'step-audit',
    stepNumber: 5,
    title: '5. Auditoria Swipe & Câmera Antifraude',
    tag: 'INTEGRIDADE TOTAL',
    description:
      'Garantia de justiça desportiva: os alunos são obrigados a tirar fotos ao vivo pela câmera nativa com sensor de horário e GPS, bloqueando uploads da galeria.',
    highlightText: 'Interface estilo Tinder/Swipe: arraste para a direita para aprovar e para a esquerda para rejeitar em segundos!',
    actionLabel: 'Acessar Auditoria Swipe',
    actionHref: '/dashboard/audit',
    icon: CheckSquare,
    bullets: [
      'Câmera nativa que impede o envio de fotos antigas da internet',
      'Filtro de denúncias para fotos suspeitas reportadas pela turma',
      'A pontuação do aluno e do time é atualizada instantaneamente',
    ],
  },
  {
    id: 'step-ranking',
    stepNumber: 6,
    title: '6. Pódio ao Vivo & Squads Cooperativos',
    tag: 'RETENÇÃO MÁXIMA DE 94.8%',
    description:
      'Acompanhe o Pódio Oficial (Ouro, Prata e Bronze), o Feed Social da turma com fotos auditadas e o desempenho dos Esquadrões (Squads).',
    highlightText: 'A pressão social positiva dos times impede que o aluno desista no meio do caminho, garantindo taxa recorde de conclusão!',
    actionLabel: 'Ver Ranking & Leaderboard',
    actionHref: '/dashboard/leaderboard',
    icon: Flame,
    bullets: [
      'Pódio em tempo real atualizado a cada check-in aprovado',
      'Squads Cooperativos: a vitória do time depende de cada membro',
      'Radar de Frequência para resgatar alunos ausentes via WhatsApp',
    ],
  },
];

const STORAGE_KEY = 'arenafit_coach_tour_completed_v1';

export function CoachOnboardingTour() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Abrir automaticamente no primeiro acesso
    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) {
      // Pequeno delay para a página carregar suavemente
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Ouvinte de evento customizado para reabrir o tour quando o usuário clica em "Tour do App"
  useEffect(() => {
    const handleOpenTour = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener('open-arenafit-tour', handleOpenTour);
    return () => window.removeEventListener('open-arenafit-tour', handleOpenTour);
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
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
    // Não fecha o tour, apenas navega para a página desejada
    router.push(href);
  };

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const progressPercent = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-white/20 p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-modal-title"
      >
        {/* Barra de Progresso no Topo */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-800 rounded-t-3xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-white to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Botão de Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Pular e Fechar Tour"
          title="Pular Tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header do Passo */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white px-3 py-1 rounded-full border border-white/15 font-bold">
              {currentStep.tag}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              Passo {currentStep.stepNumber} de {TOUR_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <StepIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 id="tour-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentStep.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Descrição & Destaque */}
        <div className="space-y-4 mb-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <p>{currentStep.description}</p>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm leading-snug">{currentStep.highlightText}</p>
          </div>

          {/* Bullets Informativos */}
          <ul className="space-y-2 pt-2 border-t border-white/[0.08] text-zinc-300">
            {currentStep.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Botão de Ação Direta para a Tela (Atalho) */}
        <div className="mb-6">
          <Button
            onClick={() => handleNavigate(currentStep.actionHref)}
            variant="outline"
            className="w-full min-h-[44px] border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 rounded-xl cursor-pointer"
          >
            <span>{currentStep.actionLabel}</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Button>
        </div>

        {/* Footer com Navegação: Anterior, Indicadores, Próximo */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold transition-colors cursor-pointer ${
              currentStepIndex === 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {/* Dots Indicadores */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-white'
                    : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Ir para o passo ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-4 min-h-[38px] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Concluir Guia' : 'Próximo'}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Função utilitária que pode ser chamada de qualquer botão do app para reabrir o Tour
 */
export function triggerCoachTour() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-arenafit-tour'));
  }
}
