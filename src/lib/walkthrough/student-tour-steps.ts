'use client';

import { WalkthroughStep } from '@/components/ui/walkthrough-spotlight';

export const STUDENT_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  // 1. App Home - Saudação e Barra de Progresso
  {
    id: 'student-welcome',
    route: '/app',
    targetSelector: '[data-tour="student-welcome-header"]',
    title: 'Sua Jornada Fitness',
    badge: 'BOAS-VINDAS',
    description:
      'Aqui você acompanha seu nível atual, seus pontos de experiência (XP) acumulados e seu streak de dias consecutivos sem furar!',
    tip: 'Mantenha a chama do streak acesa para desbloquear multiplicadores de pontos para o seu time.',
  },
  // 2. Missões do Dia
  {
    id: 'student-missions',
    route: '/app/missions',
    targetSelector: '[data-tour="student-missions-list"]',
    title: 'Suas Missões Diárias',
    badge: 'MISSÕES',
    description:
      'Cumpra os objetivos estabelecidos pelo seu treinador: foto ao vivo do treino, cronômetro de cardio, copo de água e prato saudável.',
    tip: 'Ao completar 100% das missões da semana você ganha um super bônus de XP para subir no pódio!',
  },
  // 3. Câmera Antifraude / Check-in
  {
    id: 'student-checkin',
    route: '/app/missions',
    targetSelector: '[data-tour="student-checkin-btn"]',
    title: 'Check-in ao Vivo com a Câmera',
    badge: 'CÂMERA REAL',
    description:
      'Clique no botão da câmera para comprovar sua missão. A foto é tirada na hora pelo aplicativo garantindo a pontuação justa de todos.',
    tip: 'Nas missões de refeição, a IA da Arena analisa o seu prato e estima as calorias e proteínas em segundos!',
  },
  // 4. Ranking Geral da Turma
  {
    id: 'student-ranking',
    route: '/app/leaderboard',
    targetSelector: '[data-tour="student-ranking-card"]',
    title: 'Ranking & Pódio da Turma',
    badge: 'AO VIVO',
    description:
      'Dispute as primeiras colocações do ranking individual. Cada check-in aprovado coloca você mais perto do troféu da turma!',
    tip: 'O pódio atualiza em tempo real a cada missão cumprida pelos seus colegas de desafio.',
  },
  // 5. Squad (Esquadrão em Equipe)
  {
    id: 'student-squad',
    route: '/app/leaderboard',
    targetSelector: '[data-tour="student-squad-card"]',
    title: 'Disputa de Squads (Equipes)',
    badge: 'TRABALHO EM EQUIPE',
    description:
      'Você também pontua pelo seu time! Alterne para a aba "SQUADS" para acompanhar a média do seu grupo e ver qual equipe leva o título da consultoria.',
    tip: 'Ninguém fica para trás: cada missão cumprida eleva a pontuação geral do seu esquadrão!',
  },
];
