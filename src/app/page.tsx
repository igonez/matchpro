'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';
import { HeroInteractiveMockup } from '@/components/ui/hero-interactive-mockup';
import { SocialProofTestimonials } from '@/components/ui/social-proof-testimonials';
import { GoldMedalBadge, SilverMedalBadge, BronzeMedalBadge } from '@/components/ui/metallic-badges';
import { JsonLd } from '@/components/seo/json-ld';
import { CorporateFooter } from '@/components/layout/corporate-footer';
import {
  Check,
  X,
  ChevronDown,
  Zap,
  ShieldCheck,
  Trophy,
  Users,
  Sparkles,
  ArrowRight,
  Flame,
  HelpCircle,
  Smartphone,
  Percent,
  KeyRound,
  Crown,
  Heart,
  Activity,
  Menu,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  // Menu mobile da Landing Page
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Ciclo de cobrança (mensal ou anual com 20% off)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Calculadora Interativa de Lucro
  const [studentsCount, setStudentsCount] = useState<number>(35);
  const [ticketPrice, setTicketPrice] = useState<number>(97);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Modal de Aviso de Fase de Testes Fechada (Bloqueio de Aluno / Plataforma)
  const [isBetaClosedModalOpen, setIsBetaClosedModalOpen] = useState(false);

  // Cálculos da Calculadora
  const grossRevenue = studentsCount * ticketPrice;
  const netStarter = grossRevenue * 0.85; // 15% taxa
  const netPro = grossRevenue; // 0% taxa da plataforma!
  const proAdvantage = netPro - netStarter;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };



  const faqItems = [
    {
      q: 'Eu preciso cadastrar fichas de treino ou cardápios detalhados dentro do app?',
      a: 'Não! E esse é o maior alívio para o profissional: zero tempo perdido digitando exercícios ou alimentos. Você continua prescrevendo seus treinos ou planos alimentares onde você já tem costume (PDF, planilha, WhatsApp ou seu software habitual). A ArenaFitPro não é um app de prescrição — é a camada de gamificação e auditoria de hábitos que faz o seu aluno realmente CUMPRIR o que você passou, comprovando a execução com Câmera ao vivo e IA para disputar o pódio da turma.',
    },
    {
      q: 'Como meus alunos entram no desafio? Eles precisam baixar app pesado ou criar senha?',
      a: 'Zero complicação! O aluno entra em menos de 10 segundos através do Código de Convite exclusivo do seu desafio (ex: VERAO-2026) ou clicando direto no link do WhatsApp. Ele não precisa baixar nenhum aplicativo de 150MB na App Store: a ArenaFitPro é um PWA ultra-rápido que abre no navegador e pode ser fixado na tela de início com 1 toque.',
    },
    {
      q: 'O que acontece se o aluno já participou de desafios anteriores ou trocou de aparelho?',
      a: 'A nossa tela de acesso possui modo inteligente duplo: "Tenho um Código" para quem está entrando agora e "Já sou da Turma" para alunos que já possuem histórico. Com apenas 1 toque via Google ou e-mail, todo o streak, XP acumulado e medalhas são restaurados instantaneamente.',
    },
    {
      q: 'O ranking, pódio e feed de fotos funcionam no celular do aluno e no meu painel?',
      a: 'Sim, em sincronia absoluta e tempo real! O treinador conta com a central de Auditoria e o Leaderboard no Dashboard para acompanhar cada aluno e enviar incentivos via WhatsApp. Ao mesmo tempo, no app do aluno existe a aba "Ranking" com o Pódio Oficial (Ouro, Prata e Bronze) e a aba "Feed Social" com todas as fotos auditadas de treinos e refeições aprovadas da turma.',
    },
    {
      q: 'Como funciona a Câmera Antifraude e a IA Nutricional nas missões?',
      a: 'Para garantir 100% de integridade e honestidade, nosso algoritmo bloqueia uploads de fotos antigas da galeria. O aluno fotografa o treino ao vivo com sensor óptico e coordenadas GPS. Em missões de alimentação, nossa IA de Visão Computacional analisa a foto do prato, estimando macronutrientes (proteínas, carboidratos, gorduras) e calorias para validação imediata sem você precisar conferir manualmente.',
    },
    {
      q: 'Como funciona o recebimento das inscrições dos alunos e o Split Pix D+0?',
      a: 'A ArenaFitPro é integrada nativamente à infraestrutura bancária do Asaas. Quando seu aluno paga a inscrição por Pix Copia e Cola ou QR Code, o dinheiro é liberado imediatamente (D+0) com divisão automática no nível bancário: a comissão da plataforma (0% no Pro ou 15% no Starter) é separada na hora e o seu lucro líquido cai direto na sua carteira sem travas de 14 ou 30 dias.',
    },
    {
      q: 'Por que o aluno paga exclusivamente via Pix? Existe risco de estorno (chargeback)?',
      a: 'O Pix exclusivo é uma decisão de segurança máxima para o Personal Trainer. No cartão de crédito, o aluno pode participar do desafio, consumir seus treinos e depois solicitar estorno no banco (chargeback), deixando o treinador no prejuízo com multas financeiras. No Pix, o pagamento é 100% à vista, irreversível, sem risco de golpe de chargeback, com liberação em 3 segundos e taxa fixa muito mais baixa do que as porcentagens abusivas de maquininhas e operadoras de cartão.',
    },
    {
      q: 'Quais são as taxas bancárias exatas envolvidas no Pix e no Cartão?',
      a: 'Transparência radical: no Plano Pro, a taxa da ArenaFitPro é ZERO (0%). A única dedução na venda de um desafio é a tarifa bancária de liquidação Pix do Asaas (a partir de R$ 0,99 fixo promocional nos primeiros meses e R$ 1,99 fixo padrão, sem percentuais abusivos e sem taxa de antecipação). Já a assinatura mensal do personal para uso da plataforma (R$ 49,90/mês no Pro) pode ser paga tanto via Pix quanto no Cartão de Crédito com renovação automática.',
    },
    {
      q: 'O que é a proteção contra bitributação no Split bancário?',
      a: 'Em plataformas antigas de checkout, todo o faturamento bruto passa pela sua conta pessoal/PJ e você é tributado sobre 100% do valor, pagando imposto até sobre as taxas da plataforma. No split nativo da ArenaFitPro, a transação é dividida na raiz bancária: você emite nota fiscal apenas sobre o seu lucro real e nós emitimos sobre a nossa taxa.',
    },
    {
      q: 'Como funcionam os Squads Cooperativos e o Radar de Frequência?',
      a: 'São mecânicas comprovadas de retenção: os Squads dividem a turma em equipes colaborativas (pressão social positiva onde ninguém quer decepcionar os parceiros, aumentando a disciplina e conclusão de treinos); e o Radar de Frequência monitora alunos em risco com alertas automáticos para intervenção ágil via WhatsApp.',
    },
    {
      q: 'Preciso pagar algo para criar minha conta e lançar meu primeiro desafio?',
      a: 'Não! O plano Starter Coach é 100% gratuito de mensalidade. Você pode criar seu cadastro em 1 minuto, configurar seu desafio de até 10 alunos e lançar sem cadastrar cartão de crédito. Você só compartilha a taxa de split de 15% quando seus alunos efetuarem o pagamento.',
    },
  ];

  // Schemas JSON-LD estruturados para SEO e Google Rich Snippets (/schema-markup-generator)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ArenaFitPro',
    url: 'https://arenafitpro.com.br',
    description: 'Gamification OS para Desafios Fitness e Gestão de Alunos com Split Pix D+0.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://arenafitpro.com.br/join/{search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ArenaFitPro',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Fitness Gamification & Coaching SaaS',
    operatingSystem: 'Web, iOS, Android (PWA)',
    url: 'https://arenafitpro.com.br',
    description:
      'Plataforma SaaS multi-tenant de gamificação fitness com câmera antifraude, estimativa de macros por IA e divisão bancária Pix instantânea para personal trainers, nutricionistas e academias.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BRL',
      lowPrice: '0.00',
      highPrice: '49.90',
      offerCount: 2,
    },
    featureList: [
      'Pódio e Ranking de Turmas em Tempo Real',
      'Câmera Antifraude com Bloqueio de Galeria',
      'IA Nutricional com Estimativa de Macronutrientes',
      'Split Pix D+0 integrado ao Asaas',
      'Squads Cooperativos e Equipes',
      'Radar de Frequência e Alertas Anti-Churn',
      'Isolamento Multi-Tenant com Row-Level Security (RLS)',
    ],
    provider: {
      '@type': 'Organization',
      name: 'ArenaFitPro Ltda',
      url: 'https://arenafitpro.com.br',
    },
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como lançar e operar um desafio fitness gamificado na ArenaFitPro',
    description: 'Passo a passo rápido para conectar alunos por código de convite e auditar hábitos com IA.',
    totalTime: 'PT3M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Crie a turma e gere o Código de Convite',
        text: 'Configure seu desafio no painel do treinador e compartilhe o código exclusivo (ex: FIT-2026) ou link direto no WhatsApp.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Acesso instantâneo via Web App PWA',
        text: 'Seus alunos entram em segundos pelo navegador do celular Android ou iPhone sem precisar baixar arquivos pesados nas lojas.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Check-ins ao vivo, IA Nutricional e Pódio',
        text: 'Os alunos comprovam treinos e refeições na câmera antifraude, ganham XP automaticamente e disputam o pódio da turma em tempo real.',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const navLinks = [
    { label: 'Como Funciona', href: '#fluxo' },
    { label: 'App & Cockpit', href: '#mockup' },
    { label: 'Tecnologia & IA', href: '#gamificacao' },
    { label: 'Resultados', href: '#provasocial' },
    { label: 'Pódio & Feed', href: '#podio' },
    { label: 'Calculadora', href: '#calculadora' },
    { label: 'Planos', href: '#planos', highlight: true },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans relative overflow-x-hidden">
      {/* Schemas JSON-LD independentes para Rich Results */}
      <JsonLd data={websiteSchema} />
      <JsonLd data={softwareApplicationSchema} />
      <JsonLd data={howToSchema} />
      <JsonLd data={faqSchema} />

      {/* Link de Pulo para Acessibilidade por Teclado (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-white text-black font-bold text-xs uppercase font-mono rounded-xl shadow-2xl focus:outline-none"
      >
        Pular para o conteúdo principal
      </a>

      {/* 1. Background 3D com Partículas Monocromáticas */}
      <Monochrome3DBackground />

      {/* 2. Floating Navbar Monocromática (Mobile-First + Desktop com Safe Area iOS) */}
      <header className="sticky top-0 z-50 px-3 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="max-w-6xl mx-auto mono-glass-pill rounded-full px-4 sm:px-6 h-16 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.12)] group-hover:scale-105 transition-transform bg-black shrink-0">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block leading-none">
                ArenaFitPro
              </span>
              <span className="text-[11px] uppercase font-mono tracking-widest text-zinc-400 block mt-1">
                Gamification OS
              </span>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold tracking-wider uppercase text-zinc-300">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`hover:text-white transition-colors ${
                  item.highlight ? 'text-white font-extrabold' : ''
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsBetaClosedModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white px-3.5 py-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Sou Aluno</span>
            </button>
            <Link href="/beta">
              <button className="mono-button-primary min-h-[44px] px-4 sm:px-5 py-2 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer">
                <span>Participe da Fase de Testes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Abrir menu de navegação"
              className="xl:hidden h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown Responsivo */}
        {mobileNavOpen && (
          <div className="xl:hidden max-w-6xl mx-auto mt-2 p-5 rounded-3xl bg-zinc-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/10 flex items-center justify-between transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  setIsBetaClosedModalOpen(true);
                }}
                className="mono-button-secondary w-full min-h-[46px] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer text-zinc-400"
              >
                <Lock className="w-4 h-4 text-zinc-500" />
                <span>Acesso Aluno (Fase Fechada)</span>
              </button>
              <Link href="/beta" onClick={() => setMobileNavOpen(false)} className="flex-1">
                <button className="mono-button-primary w-full min-h-[46px] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer">
                  <Sparkles className="w-4 h-4" />
                  <span>Participe da Fase de Testes</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section de Alta Conversão com Duplo Foco e Mockup Interativo */}
      <main id="main-content" className="relative pt-10 sm:pt-16 md:pt-20 pb-14 sm:pb-20 px-4 sm:px-6 perspective-container">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Estrelas Cromadas 3D Flutuantes */}
          <div className="absolute top-0 right-4 sm:right-12 hidden md:block">
            <Chrome3DStar size={110} delay={0} />
          </div>
          <div className="absolute top-28 right-24 sm:right-44 hidden lg:block opacity-70">
            <Chrome3DStar size={60} delay={1.5} />
          </div>
          <div className="absolute -top-6 left-8 hidden lg:block opacity-40">
            <Chrome3DStar size={50} delay={2.2} />
          </div>

          <div className="max-w-4xl w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-wider text-zinc-200 mb-6 shadow-lg">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span>Gamificação & Disciplina • Compatível com Qualquer Método</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6 text-balance">
              O Sistema Operacional para{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
                Desafios Fitness Gamificados
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-8 font-normal text-pretty">
              Você já tem o seu método de treino ou dieta. A ArenaFitPro é a{' '}
              <strong className="text-white">camada de gamificação e auditoria</strong> que faz seus alunos{' '}
              <strong className="text-white">cumprirem o planejado até o último dia</strong>. Câmera Antifraude ao vivo, IA Nutricional e Pódio em tempo real — sem perder horas no WhatsApp.
            </p>

            {/* CTAs Principais com Touch Targets Confortáveis (>= 52px) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-8">
              <Link href="/beta" className="w-full sm:w-auto">
                <button className="mono-button-primary w-full sm:w-auto min-h-[52px] px-8 py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 cursor-pointer">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Participe da Fase de Testes</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </Link>

              <a href="#mockup" className="w-full sm:w-auto">
                <button className="mono-button-secondary w-full sm:w-auto min-h-[52px] px-7 py-3.5 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 cursor-pointer">
                  <Smartphone className="w-4 h-4 text-zinc-300 shrink-0" />
                  <span>Ver App & Cockpit ao Vivo</span>
                </button>
              </a>
            </div>


            {/* Badges de Confiança */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm text-zinc-200 font-mono">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Zero digitação de fichas
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Split Pix D+0 direto na conta
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Câmera Antifraude + IA Nutricional
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Pódio & Feed da Turma ao Vivo
              </span>
            </div>
          </div>

          {/* 3.1 Showcase Interativo Duplo (Mobile PWA + Web Cockpit) */}
          <div id="mockup" className="w-full pt-6">
            <HeroInteractiveMockup />
          </div>

        </div>
      </main>

      {/* 4. Metrics & Social Proof Bar (Grid 2x2 Simétrico no Mobile e 4 Colunas no Desktop) */}
      <section className="px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          <div className="text-center p-5 sm:p-6 rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-xl">
            <div className="text-3xl sm:text-4xl font-black text-white mb-1.5">Alta</div>
            <div className="text-xs font-mono text-zinc-300 uppercase tracking-wider">Conclusão de Desafios</div>
          </div>
          <div className="text-center p-5 sm:p-6 rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-xl">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1.5">D+0</div>
            <div className="text-xs font-mono text-zinc-300 uppercase tracking-wider">Liberação Pix na Conta</div>
          </div>
          <div className="text-center p-5 sm:p-6 rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-xl">
            <div className="text-3xl sm:text-4xl font-black text-white mb-1.5">0 min</div>
            <div className="text-xs font-mono text-zinc-300 uppercase tracking-wider">Digitando Fichas ou Cardápios</div>
          </div>
          <div className="text-center p-5 sm:p-6 rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-xl">
            <div className="text-3xl sm:text-4xl font-black text-white mb-1.5">0%</div>
            <div className="text-xs font-mono text-zinc-300 uppercase tracking-wider">Fotos Falsas de Galeria</div>
          </div>
        </div>
      </section>

      {/* 5. A Jornada do Aluno sem Fricção (Código de Convite + WhatsApp) */}
      <section id="fluxo" className="py-20 sm:py-24 px-4 sm:px-6 relative border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 block">
              EXPERIÊNCIA DO ALUNO
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Como funciona o acesso ultra-rápido por Código
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
              Diga adeus a downloads pesados na App Store e formulários intermináveis. O aluno entra na turma em 3 passos simples.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Passo 1 */}
            <SpotlightCard3D className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono font-black text-base mb-6">
                  01
                </div>
                <h3 className="text-xl font-black text-white mb-3 flex items-center gap-2.5">
                  <KeyRound className="w-5 h-5 text-zinc-300 shrink-0" />
                  <span>Seu Método + Código</span>
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  Você passa o treino ou plano alimentar como já faz hoje (PDF, WhatsApp ou planilha). A ArenaFitPro gera o código exclusivo (ex:{' '}
                  <code className="text-white bg-white/10 px-2 py-0.5 rounded font-mono text-xs sm:text-sm">FIT-2026</code>) para o aluno entrar na arena e pontuar.
                </p>
              </div>
              <div className="mt-6 p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm font-mono text-zinc-200 flex items-center justify-between">
                <span>Código: FIT-2026</span>
                <span className="text-emerald-400 font-bold">✓ Verificado</span>
              </div>
            </SpotlightCard3D>

            {/* Passo 2 */}
            <SpotlightCard3D className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono font-black text-base mb-6">
                  02
                </div>
                <h3 className="text-xl font-black text-white mb-3 flex items-center gap-2.5">
                  <Smartphone className="w-5 h-5 text-zinc-300 shrink-0" />
                  <span>Acesso Instantâneo PWA</span>
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  Sem download de 150MB. O web app abre instantaneamente em qualquer smartphone Android, iPhone ou computador com experiência nativa fluida e veloz.
                </p>
              </div>
              <div className="mt-6 p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm font-mono text-zinc-200 flex items-center justify-between">
                <span>Modo de Acesso</span>
                <span className="text-white font-bold">1 Toque no Google</span>
              </div>
            </SpotlightCard3D>

            {/* Passo 3 */}
            <SpotlightCard3D className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono font-black text-base mb-6">
                  03
                </div>
                <h3 className="text-xl font-black text-white mb-3 flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Streaks, Pódio e Feed</span>
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  O aluno cumpre as missões diárias com a Câmera Antifraude, ganha XP, disputa o Pódio ao vivo e compartilha as conquistas com os colegas no Feed Social.
                </p>
              </div>
              <div className="mt-6 p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm font-mono text-zinc-200 flex items-center justify-between">
                <span>Engajamento Diário</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-4 h-4" /> Streak Ativo
                </span>
              </div>
            </SpotlightCard3D>
          </div>
        </div>
      </section>

      {/* 5.1 Seção de Prova Social e Resultados Reais */}
      <div id="provasocial">
        <SocialProofTestimonials />
      </div>

      {/* 6. Bento Grid de Features & Moat Tecnológico */}
      <section id="gamificacao" className="py-20 sm:py-24 px-4 sm:px-6 relative border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 block">
              INFRAESTRUTURA SAAS MULTI-TENANT
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              A ciência de manter alunos motivados até o último dia
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
              Grupos de WhatsApp perdem o engajamento na primeira semana. A ArenaFitPro combina psicologia comportamental, cooperação em times, IA e fintech nativa com isolamento de dados por treinador.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
            {/* Card 1: Antifraude Câmera e IA Nutricional */}
            <SpotlightCard3D className="md:col-span-7 p-6 sm:p-8 min-h-[320px] flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    Câmera Nativa + IA Nutricional
                  </div>
                  <span className="text-xs uppercase tracking-wider text-zinc-200 border border-white/15 px-3 py-1 rounded-full font-medium">
                    Auditoria Automática
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-6 mb-3">
                  Câmera ao Vivo Antifraude & Triagem por IA
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  Chega de passar o dia abrindo 400 fotos de pratos e academias no WhatsApp. O aluno comprova a execução ao vivo na câmera (sem fotos da galeria), e a{' '}
                  <strong className="text-white">IA Nutricional</strong> calcula automaticamente proteínas, carboidratos e calorias liberando os pontos na hora.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs text-zinc-400 font-medium">Validação de Integridade</div>
                  <div className="text-xs sm:text-sm text-white font-semibold">Sensor Óptico + GPS + IA de Calorias</div>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                  100% Auditado
                </div>
              </div>
            </SpotlightCard3D>

            {/* Card 2: Split Pix D+0 no Asaas */}
            <SpotlightCard3D className="md:col-span-5 p-6 sm:p-8 min-h-[320px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <span className="text-xs sm:text-sm text-zinc-200 font-semibold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-400" /> Split Pix Automático
                  </span>
                  <span className="text-xs text-emerald-400 font-bold font-mono">D+0 Instantâneo</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-6 mb-3">
                  Checkout Pix com Split Automático
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  Sem intermediários e sem riscos de estorno. O aluno paga via Pix Copia e Cola ou QR Code, e a sua comissão cai na hora na sua subconta. Zero bitributação, zero chargebacks de cartão e saque imediato D+0.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 mt-6 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-zinc-400 block text-xs">Inscrição de aluno</span>
                    <span className="text-white font-bold font-mono">R$ 97,00 (Pix D+0)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-400 block text-xs">Seu líquido (Plano Pro)</span>
                    <span className="text-emerald-400 font-bold font-mono">R$ 96,01 (100% seu)</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Tarifa bancária Asaas: a partir de R$ 0,99 fixo</span>
                  <span className="text-emerald-400">Taxa Plataforma: 0%</span>
                </div>
              </div>
            </SpotlightCard3D>

            {/* Card 3: Squads e Times Cooperativos */}
            <SpotlightCard3D className="md:col-span-6 p-6 sm:p-8 min-h-[260px] flex flex-col justify-between">
              <div>
                <div className="text-xs sm:text-sm text-zinc-300 font-semibold tracking-wide mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-300" /> Squads Cooperativos
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white mb-2.5">Esquadrões & Times</h4>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  Os alunos se unem em equipes colaborativas. A pontuação é somada, gerando um ambiente de companheirismo e responsabilidade coletiva onde ninguém quer deixar o time na mão.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs sm:text-sm mt-6">
                <span className="text-zinc-200 font-medium flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> Squad Guerreiros
                </span>
                <span className="text-white font-bold font-mono">1º Lugar (2.450 pts)</span>
              </div>
            </SpotlightCard3D>

            {/* Card 4: Radar Anti-Churn & Resgate WhatsApp */}
            <SpotlightCard3D className="md:col-span-6 p-6 sm:p-8 min-h-[260px] flex flex-col justify-between">
              <div>
                <div className="text-xs sm:text-sm text-zinc-300 font-semibold tracking-wide mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-zinc-300" /> Prevenção Ativa de Abandono
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white mb-2.5">Radar Anti-Churn & WhatsApp</h4>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  Monitoramento inteligente que identifica alunos inativos há mais de 48 horas. Você recebe alertas em tempo real e dispara mensagens de resgate no WhatsApp com 1 toque.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs sm:text-sm mt-6">
                <span className="text-zinc-200 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Alerta de Risco
                </span>
                <span className="text-emerald-400 font-bold font-mono">Resgate em 1 Toque</span>
              </div>
            </SpotlightCard3D>
          </div>
        </div>
      </section>

      {/* 7. Pódio em Tempo Real com Medalhas Vetoriais Metálicas */}
      <section id="podio" className="py-20 sm:py-24 px-4 sm:px-6 relative border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 block">
              COMPETIÇÃO & COMUNIDADE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Pódio ao Vivo e Feed Social da Turma
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
              O que faz as pessoas se dedicarem de verdade é ver o progresso compartilhado e a disputa saudável pela liderança.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual do Pódio 3D com Medalhas Vetoriais Metálicas */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-6 border-b border-white/[0.08] mb-8">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                    Leaderboard Oficial • Desafio Ativo
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  Atualizado em Tempo Real
                </span>
              </div>

              {/* Podium Visual (1st, 2nd, 3rd) */}
              <div className="grid grid-cols-3 gap-3 sm:gap-5 items-end pt-4 pb-6">
                {/* 2º Lugar - Prata */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <SilverMedalBadge size={46} className="shadow-lg" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white text-center truncate max-w-[95px]">Mariana S.</span>
                  <span className="text-xs font-mono text-zinc-300">1.820 pts</span>
                  <div className="w-full h-24 bg-gradient-to-t from-zinc-900 to-zinc-800/80 rounded-t-2xl border-t border-x border-zinc-600/40 mt-3 flex items-center justify-center">
                    <span className="font-mono font-black text-zinc-300 text-lg sm:text-xl">2º</span>
                  </div>
                </div>

                {/* 1º Lugar - Ouro */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                    </div>
                    <GoldMedalBadge size={54} className="drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
                  </div>
                  <span className="text-sm sm:text-base font-black text-white text-center truncate max-w-[110px]">Carlos E.</span>
                  <span className="text-xs font-mono text-amber-400 font-bold">2.140 pts</span>
                  <div className="w-full h-32 bg-gradient-to-t from-amber-500/20 via-zinc-900 to-amber-500/30 rounded-t-2xl border-t border-x border-amber-400/50 mt-3 flex items-center justify-center">
                    <span className="font-mono font-black text-amber-300 text-2xl sm:text-3xl">1º</span>
                  </div>
                </div>

                {/* 3º Lugar - Bronze */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <BronzeMedalBadge size={42} className="shadow-lg" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white text-center truncate max-w-[95px]">Rodrigo F.</span>
                  <span className="text-xs font-mono text-zinc-300">1.690 pts</span>
                  <div className="w-full h-20 bg-gradient-to-t from-zinc-900 to-zinc-800/60 rounded-t-2xl border-t border-x border-amber-800/40 mt-3 flex items-center justify-center">
                    <span className="font-mono font-black text-amber-600 text-base sm:text-lg">3º</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                <span className="text-zinc-200">Incentivo com 1 clique para alunos em perigo:</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  Disparar WhatsApp →
                </span>
              </div>
            </div>

            {/* Visual do Feed Social */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 sm:p-7 rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Feed da Turma
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-300 bg-white/5 px-2.5 py-1 rounded-full">Fotos Auditadas</span>
                </div>

                {/* Post Simulado 1 */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] mb-3.5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                        C
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">Carlos E.</div>
                        <div className="text-xs text-zinc-400">Missão: Treino Superior 45min</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                      Aprovado ✓
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-200 mt-1.5 flex items-center justify-between">
                    <span>Streak de 14 dias atingido!</span>
                    <span className="text-zinc-400 text-xs">18 reações</span>
                  </div>
                </div>

                {/* Post Simulado 2 - Refeição com IA */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                        M
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">Mariana S.</div>
                        <div className="text-xs text-zinc-400">Missão: Almoço Saudável</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-200 bg-white/10 px-2.5 py-0.5 rounded-full shrink-0">
                      IA: 480 kcal
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-200 mt-1.5 flex items-center justify-between">
                    <span>35g Proteína detectada</span>
                    <span className="text-zinc-400 text-xs">12 reações</span>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/[0.08] text-center">
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Disponível no painel web do treinador para aprovação rápida e no celular do aluno para máxima interação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Calculadora Interativa de Faturamento & Economia */}
      <section id="calculadora" className="py-20 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06] relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 block">
              SIMULADOR DE LUCRO REAL
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Veja quanto você lucra em cada desafio
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
              Arraste os seletores abaixo para simular a quantidade de alunos e o valor da inscrição do seu desafio:
            </p>
          </div>

          <div className="p-6 sm:p-10 rounded-3xl border border-white/10 bg-zinc-950/90 backdrop-blur-2xl shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Sliders de Controle */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center gap-2 mb-2.5">
                    <label className="text-sm sm:text-base font-semibold text-zinc-200">
                      Quantidade de Alunos no Desafio
                    </label>
                    <span className="text-base sm:text-lg font-mono font-bold text-white bg-white/10 px-3.5 py-1 rounded-xl shrink-0">
                      {studentsCount} alunos
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={studentsCount}
                    onChange={(e) => setStudentsCount(Number(e.target.value))}
                    className="w-full accent-white h-2.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mt-1.5">
                    <span>10 alunos</span>
                    <span>50 alunos</span>
                    <span>150 alunos</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center gap-2 mb-2.5">
                    <label className="text-sm sm:text-base font-semibold text-zinc-200">
                      Valor da Inscrição por Aluno
                    </label>
                    <span className="text-base sm:text-lg font-mono font-bold text-white bg-white/10 px-3.5 py-1 rounded-xl shrink-0">
                      R$ {ticketPrice},00
                    </span>
                  </div>
                  <input
                    type="range"
                    min="47"
                    max="297"
                    step="10"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full accent-white h-2.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mt-1.5">
                    <span>R$ 47</span>
                    <span>R$ 147</span>
                    <span>R$ 297</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  <p>
                    <strong className="text-white">Dica Pro:</strong> No plano Pro Coach, sua taxa da plataforma cai de 15% para <strong className="text-emerald-400">ZERO (0%)</strong>. Com {studentsCount} alunos a R$ {ticketPrice}, você ganha{' '}
                    <strong className="text-emerald-400">
                      +R$ {proAdvantage.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>{' '}
                    a mais no seu bolso — o plano de R$ 49,90 se paga sozinho no primeiro desafio!
                  </p>
                </div>
              </div>

              {/* Card de Resultados */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-black border border-white/10 space-y-5">
                <div className="text-center pb-4 border-b border-white/[0.08]">
                  <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                    Faturamento Bruto Total
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs sm:text-sm">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/60">
                    <div>
                      <span className="text-zinc-200 block font-sans text-xs sm:text-sm font-medium">Plano Starter (Taxa 15%)</span>
                      <span className="text-xs text-zinc-400">Mensalidade R$ 0</span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-zinc-200">
                      R$ {netStarter.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/10 border border-white/20">
                    <div>
                      <span className="text-white font-sans text-xs sm:text-sm font-bold flex flex-wrap items-center gap-1.5">
                        Plano Pro (Taxa ZERO • 0%)
                        <span className="text-[11px] bg-white text-black px-2 py-0.5 rounded font-bold">RECOMENDADO</span>
                      </span>
                      <span className="text-xs text-zinc-300">R$ 49,90/mês</span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-emerald-400 shrink-0">
                      R$ {netPro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <Link href="/login" className="block w-full">
                  <button className="mono-button-primary w-full min-h-[48px] py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer">
                    <span>Começar Meu Desafio Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-white/10 max-w-3xl mx-auto space-y-2 text-center font-mono">
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-300">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                  <Zap className="w-3.5 h-3.5" /> Pix Instantâneo D+0 (Sem Risco de Chargeback)
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/5 text-zinc-300 px-3 py-1 rounded-full border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" /> Tarifa Bancária Asaas: a partir de R$ 0,99 fixo
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                * Transparência Financeira: No plano Pro, a taxa da ArenaFitPro é 0% (você retém 100% do valor da inscrição deduzida apenas a tarifa bancária fixa do gateway de pagamento Asaas). Os alunos pagam via Pix à vista, eliminando estornos e inadimplência.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Pricing Section com os 2 Planos Detalhados */}
      <section id="planos" className="py-20 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 block">
              TABELA DE INVESTIMENTO TRANSPARENTE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Escolha o plano ideal para a sua escala
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
              Comece 100% grátis sem cartão de crédito e faça upgrade conforme sua comunidade crescer.
            </p>

            {/* Toggle Mensal / Anual */}
            <div className="mt-8 inline-flex items-center p-1.5 rounded-full border border-white/15 bg-zinc-950 shadow-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`min-h-[40px] px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`min-h-[40px] px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <span>Anual</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                  billingCycle === 'yearly' ? 'bg-black text-white' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Grid dos 2 Cards de Preço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            
            {/* PLANO 1: Starter Coach */}
            <SpotlightCard3D className="p-6 sm:p-8 flex flex-col justify-between border-white/10 bg-zinc-950/80">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Iniciante
                  </span>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 text-white font-bold">
                    GRÁTIS
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">Starter Coach</h3>
                <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                  Perfeito para personais lançando seu primeiro desafio online com zero risco financeiro.
                </p>

                <div className="mb-6 pb-6 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">R$ 0</span>
                    <span className="text-xs sm:text-sm text-zinc-400 font-mono">/mês</span>
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-zinc-300 mt-2.5 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-zinc-300 shrink-0" />
                    <span>Taxa de split: <strong className="text-white">15% sobre inscrições</strong></span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-1">
                    + tarifa bancária Asaas por Pix recebido D+0
                  </div>
                </div>

                {/* Lista O que vem */}
                <div className="space-y-3 mb-6">
                  <div className="text-xs font-mono uppercase text-zinc-300 font-bold">
                    O que está incluído:
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-zinc-200">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>1 Desafio ativo</strong> por vez</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Até <strong>10 alunos</strong> no desafio</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Acesso por <strong>Código de Convite</strong> & Link</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Câmera Nativa Antifraude & GPS</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Pódio & Leaderboard</strong> da Turma</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Feed Social</strong> com fotos auditadas</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Saque Pix D+0 direto na sua conta</span>
                    </li>
                  </ul>
                </div>

                {/* Lista O que NÃO vem */}
                <div className="space-y-2.5 mb-8 pt-4 border-t border-white/[0.08]">
                  <div className="text-xs font-mono uppercase text-zinc-400">
                    Não inclui:
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-zinc-400">
                    <li className="flex items-center gap-2.5">
                      <X className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span>Squads & Times Cooperativos</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <X className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span>IA Nutricional Avançada</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <X className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span>Radar Anti-Churn & WhatsApp</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <X className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span>Múltiplos desafios simultâneos</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link href="/beta" className="block w-full">
                <button className="mono-button-secondary w-full min-h-[48px] py-3.5 text-xs sm:text-sm font-bold cursor-pointer flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-300" />
                  <span>Participe da Fase de Testes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </SpotlightCard3D>

            {/* PLANO 2: Pro Coach (DESTAQUE / MAIS ESCOLHIDO) */}
            <SpotlightCard3D className="p-6 sm:p-8 flex flex-col justify-between border-white/30 bg-zinc-950/90 shadow-[0_0_40px_rgba(255,255,255,0.15)] relative md:scale-[1.03]">
              {/* Badge Flutuante no Topo */}
              <div className="inline-flex self-start mb-3 bg-white text-black px-3.5 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow-xl items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-black shrink-0" />
                <span>MAIS ESCOLHIDO • 94.8% RETENÇÃO</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Profissional
                  </span>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-white text-black font-extrabold">
                    PRO
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">Pro Coach</h3>
                <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                  Para personais e consultorias que buscam escala, gamificação avançada e taxa reduzida.
                </p>

                <div className="mb-6 pb-6 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      R$ {billingCycle === 'monthly' ? '49,90' : '39,90'}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-400 font-mono">/mês</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <span className="text-xs font-mono text-emerald-400 block mt-1.5">
                      Cobrado anualmente (economia de R$ 120/ano)
                    </span>
                  )}
                  <div className="text-xs sm:text-sm font-mono text-emerald-400 mt-2.5 flex items-center gap-1.5 font-bold">
                    <Percent className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Taxa ZERO da plataforma: 0% (100% do lucro é seu!)</span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-1">
                    Deduzida apenas a tarifa bancária Asaas (a partir de R$ 0,99 fixo/Pix D+0)
                  </div>
                </div>

                {/* Lista O que vem */}
                <div className="space-y-3 mb-8">
                  <div className="text-xs font-mono uppercase text-white font-bold">
                    Tudo do Starter, mais:
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-zinc-200">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Até <strong>5 Desafios simultâneos</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Até <strong>100 alunos por desafio</strong> (total 500)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>IA Nutricional Integrada</strong> em fotos de refeições</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Squads & Times Cooperativos</strong> liberados</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Radar Anti-Churn & Resgate WhatsApp</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Suporte prioritário via WhatsApp</span>
                    </li>
                  </ul>
                </div>

              </div>

              <Link href="/beta" className="block w-full">
                <button className="mono-button-primary w-full min-h-[48px] py-3.5 text-xs sm:text-sm font-black shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 cursor-pointer">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Participe da Fase de Testes</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </Link>
            </SpotlightCard3D>
          </div>

          {/* 10. Tabela Comparativa Detalhada Estilo Dark Matrix */}
          <div className="mt-20">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Comparativo Detalhado de Recursos
              </h3>
              <p className="text-sm text-zinc-300 mt-1">
                Entenda exatamente o que está contemplado em cada nível
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[540px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-4 sm:p-5 font-mono text-zinc-300 uppercase tracking-wider text-xs">Recursos & Capacidade</th>
                    <th className="p-4 sm:p-5 font-bold text-center text-zinc-200">Starter Coach</th>
                    <th className="p-4 sm:p-5 font-bold text-center text-white bg-white/5">Pro Coach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Mensalidade</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-300 font-mono font-bold">R$ 0</td>
                    <td className="p-4 sm:p-5 text-center text-white font-mono font-bold bg-white/5">R$ 49,90/mês</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Taxa de Split da Plataforma</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-300 font-mono">15%</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-mono font-bold bg-white/5">0% (Taxa ZERO)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Entrada por Código de Convite & Link</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Desafios Ativos Simultâneos</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-300">1 Desafio</td>
                    <td className="p-4 sm:p-5 text-center text-white font-bold bg-white/5">Até 5 Desafios</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Limite de Alunos por Desafio</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-300">Até 10 alunos</td>
                    <td className="p-4 sm:p-5 text-center text-white font-bold bg-white/5">Até 100 alunos</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Câmera Nativa Antifraude & GPS</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Pódio & Ranking Oficial da Turma</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Feed Social com Fotos Auditadas</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">IA Nutricional (Estimativa de Macros/Kcal)</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-500 font-bold">✗</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Saque Pix D+0 no Asaas</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓ Imediato</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓ Imediato</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Cobrança de Alunos em Desafios</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-300 font-mono">Pix D+0 (Anti-Chargeback)</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-mono font-bold bg-white/5">Pix D+0 (Anti-Chargeback)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Tarifa Bancária do Gateway (Asaas)</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-400 font-mono text-xs">Tarifa fixa Asaas (a partir de R$ 0,99/Pix)</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-300 font-mono text-xs bg-white/5">Tarifa fixa Asaas (a partir de R$ 0,99/Pix)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Forma de Pagamento da Assinatura Pro</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-500">Gratuito (R$ 0)</td>
                    <td className="p-4 sm:p-5 text-center text-white font-bold bg-white/5">Pix ou Cartão de Crédito</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Squads & Times Cooperativos</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-500 font-bold">✗</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Radar Anti-Churn & Resgate WhatsApp</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-500 font-bold">✗</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-200 font-medium">Canal de Suporte</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-300">Comunidade & Docs</td>
                    <td className="p-4 sm:p-5 text-center text-white font-bold bg-white/5">WhatsApp Prioritário</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 11. Seção FAQ com Accordion Interativo */}
      <section id="faq" className="py-20 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06] relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> DÚVIDAS FREQUENTES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Perguntas e Respostas
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
              Tudo o que você precisa saber sobre o funcionamento da plataforma, pagamentos e regras.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-zinc-950/80 overflow-hidden transition-colors hover:border-white/20"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-zinc-100 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-0 text-sm sm:text-base text-zinc-300 leading-relaxed border-t border-white/[0.06]">
                      <p className="pt-4">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center p-6 sm:p-8 rounded-3xl border border-white/10 bg-zinc-950/60">
            <p className="text-sm sm:text-base text-zinc-300">
              Ainda tem alguma dúvida específica para o seu modelo de desafio?
            </p>
            <Link
              href="/ajuda"
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white hover:underline"
            >
              <span>Acessar Central de Ajuda & Suporte</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 12. Grand Final CTA Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06] relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-wider text-zinc-200 mb-6">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Junte-se aos Melhores Treinadores</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight text-balance">
            Transforme seus alunos em uma{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
              comunidade imparável
            </span>
          </h2>

          <p className="text-zinc-300 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Crie seu primeiro desafio em menos de 3 minutos. Convide seus alunos via código ou link, receba inscrições por Pix e lidere com a tecnologia mais moderna do mercado fitness.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/beta" className="w-full sm:w-auto">
              <button className="mono-button-primary w-full sm:w-auto min-h-[54px] px-10 py-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(255,255,255,0.3)] cursor-pointer">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Participe da Fase de Testes</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </Link>
            <a href="#mockup" className="w-full sm:w-auto">
              <button className="mono-button-secondary w-full sm:w-auto min-h-[54px] px-8 py-4 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 cursor-pointer">
                <Smartphone className="w-4 h-4 text-zinc-300" />
                <span>Ver App & Cockpit ao Vivo</span>
              </button>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-mono text-zinc-400">
            <span>• Sem taxa de adesão</span>
            <span>• Sem fidelidade contratual</span>
            <span>• Configuração em 3 minutos</span>
          </div>
        </div>
      </section>

      {/* 13. Rodapé Institucional e Legal Completo */}
      <CorporateFooter />

      {/* Modal de Aviso de Fase de Testes Fechada */}
      {isBetaClosedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-zinc-950 border border-white/20 p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsBetaClosedModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mx-auto mb-4 text-white shadow-inner">
              <Lock className="w-6 h-6 text-zinc-200" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-zinc-300 font-mono text-[11px] uppercase tracking-wider mb-3">
              <span>Piloto Exclusivo</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
              Fase de Testes Fechada
            </h3>

            <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
              O acesso aos desafios e ao cockpit está restrito aos treinadores e turmas pioneiras do programa piloto. Novas vagas e turmas de alunos são liberadas por ordem de inscrição.
            </p>

            <div className="space-y-3">
              <Link
                href="/beta"
                onClick={() => setIsBetaClosedModalOpen(false)}
                className="block w-full"
              >
                <button className="mono-button-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Participar da Fase de Testes</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </Link>

              <button
                onClick={() => setIsBetaClosedModalOpen(false)}
                className="w-full py-2.5 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Voltar à Página Principal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
