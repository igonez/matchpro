'use client';

import { WalkthroughStep } from '@/components/ui/walkthrough-spotlight';

export const COACH_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  // 1. Dashboard Overview - Boas-vindas
  {
    id: 'coach-overview',
    route: '/dashboard',
    targetSelector: '[data-tour="coach-welcome-header"]',
    title: 'Visão Geral do Treinador',
    badge: 'INÍCIO',
    description:
      'Aqui você tem o raio-X completo das suas turmas: alunos ativos, receita total acumulada e o radar de frequência.',
    tip: 'O painel atualiza em tempo real a cada check-in de treino ou foto enviada pelos alunos.',
  },
  // 2. Dashboard - Botão Criar Desafio
  {
    id: 'coach-create-challenge-cta',
    route: '/dashboard',
    targetSelector: '[data-tour="create-challenge-cta"]',
    title: 'Lançar Novo Desafio',
    badge: 'AÇÃO PRINCIPAL',
    description:
      'Clique aqui sempre que quiser abrir uma nova turma. No plano Pro você pode ter múltiplos desafios rodando juntos!',
    tip: 'Você define a duração, regras, meta de pontos e se o desafio é gratuito ou pago via Pix.',
  },
  // 3. Financeiro - Configuração da Subconta & Chave Pix
  {
    id: 'coach-finance-account',
    route: '/dashboard/finance',
    targetSelector: '[data-tour="finance-account-card"]',
    title: 'Ativação da Subconta & Chave Pix',
    badge: 'FINANCEIRO D+0',
    description:
      'Cadastre seu CPF/CNPJ e sua Chave Pix. O Asaas cria sua subconta automaticamente e seus ganhos caem direto na sua conta bancária.',
    tip: 'Zero burocracia de enviar fotos de documentos. No plano Pro sua taxa é de 0% de comissão da plataforma!',
  },
  // 4. Financeiro - Solicitação de Saque Pix
  {
    id: 'coach-finance-withdraw',
    route: '/dashboard/finance',
    targetSelector: '[data-tour="finance-withdraw-btn"]',
    title: 'Saque Instantâneo via Pix',
    badge: 'SAQUES D+0',
    description:
      'Assim que os alunos pagam, o saldo fica disponível. Basta clicar em "Solicitar Saque Pix" para transferir na hora.',
    tip: 'Os saques utilizam o sistema PIX do Banco Central, caindo na sua conta em poucos segundos.',
  },
  // 5. Novo Desafio - Criação e Configuração
  {
    id: 'coach-new-challenge-form',
    route: '/dashboard/challenges/new',
    targetSelector: '[data-tour="challenge-form-card"]',
    title: 'Configurando a Turma & Regras',
    badge: 'TURMA VIP',
    description:
      'Dê um nome motivador (ex: "Projeto Seca 30 Dias"), defina o valor da inscrição e as datas de início e encerramento.',
    tip: 'Ao salvar, o sistema gera instantaneamente o seu Código de Convite exclusivo para os alunos.',
  },
  // 6. Missões - Gestão de Hábitos e IA Nutricional
  {
    id: 'coach-missions-list',
    route: '/dashboard/missions',
    targetSelector: '[data-tour="missions-list-card"]',
    title: 'Missões Diárias & Gamificação',
    badge: 'ENGAJAMENTO',
    description:
      'Crie e gerencie as missões que os alunos devem cumprir: Foto do Treino, Cronômetro de Cardio, Beber Água e Foto do Prato.',
    tip: 'Nossa IA de Visão Computacional analisa os pratos automaticamente, calculando calorias e macronutrientes!',
  },
  // 7. Missões - Bônus Semanal de 100%
  {
    id: 'coach-missions-bonus',
    route: '/dashboard/missions',
    targetSelector: '[data-tour="missions-bonus-card"]',
    title: 'Bônus Semanal de Consistência',
    badge: 'BÔNUS 100%',
    description:
      'Defina pontos extras para o aluno que não furar nenhum dia da semana. Você pode personalizar o valor de XP.',
    tip: 'Essa mecânica de bônus reduz o abandono e estimula os alunos a nunca deixarem de bater a meta.',
  },
  // 8. Alunos & Códigos de Convite
  {
    id: 'coach-students-invite',
    route: '/dashboard/students',
    targetSelector: '[data-tour="students-invite-card"]',
    title: 'Convidar Alunos via WhatsApp',
    badge: 'ACESSO RÁPIDO',
    description:
      'Copie o Código da Turma ou o Link Direto com 1 clique e envie no grupo de WhatsApp ou stories do Instagram.',
    tip: 'O aluno entra pelo celular sem precisar baixar nada na Play Store/App Store, direto via Web App!',
  },
  // 9. Auditoria Swipe - Antifraude
  {
    id: 'coach-audit-swipe',
    route: '/dashboard/audit',
    targetSelector: '[data-tour="audit-swipe-container"]',
    title: 'Auditoria Swipe Antifraude',
    badge: 'MODERAÇÃO TINDER',
    description:
      'Avalie os check-ins de treinos e refeições dos alunos: arraste para a direita para Aprovar ou para a esquerda para Rejeitar.',
    tip: 'A câmera do app é nativa e com trava de GPS/horário, impedindo fotos antigas da galeria ou da internet!',
  },
  // 10. Ranking & Squads
  {
    id: 'coach-leaderboard-podium',
    route: '/dashboard/leaderboard',
    targetSelector: '[data-tour="leaderboard-podium-card"]',
    title: 'Pódio Oficial & Competição',
    badge: 'PÓDIO AO VIVO',
    description:
      'Veja em tempo real o Pódio Oficial (Ouro, Prata e Bronze) da turma e a pontuação dos times cooperativos (Squads).',
    tip: 'A pressão social positiva entre os esquadrões faz a retenção dos alunos bater até 94.8% de conclusão!',
  },
];
