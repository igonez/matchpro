'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { HeroInteractiveMockup } from '@/components/ui/hero-interactive-mockup';
import { ViralStoriesShowcase } from '@/components/ui/viral-stories-showcase';
import { BeforeAfterComparison } from '@/components/ui/before-after-comparison';
import { JsonLd } from '@/components/seo/json-ld';
import { CorporateFooter } from '@/components/layout/corporate-footer';
import { trackMarketingEvent } from '@/lib/analytics/tracking';
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
  Activity,
  Menu,
  Share2,
  Calculator,
} from 'lucide-react';

export default function HomePage() {
  // Menu mobile da Landing Page
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Ciclo de cobrança (mensal ou anual com 20% off)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Calculadora Interativa de Lucro
  const [studentsCount, setStudentsCount] = useState<number>(35);
  const [ticketPrice, setTicketPrice] = useState<number>(97);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      a: 'Não! E esse é o maior alívio para o Personal Trainer e Nutricionista: zero tempo perdido digitando exercícios ou alimentos. Você continua prescrevendo seus treinos ou planos alimentares onde já tem costume (PDF, planilha, WhatsApp ou seu software habitual). A ArenaFitPro não substitui sua prescrição — ela é a camada de gamificação, ranking e auditoria que faz o seu aluno realmente CUMPRIR o que você passou até o último dia.',
    },
    {
      q: 'Como funciona o Compartilhamento de Ranking 9:16 com a minha marca nos Stories?',
      a: 'Você cadastra o seu Logo e o Nome da sua Consultoria (ex: Team Silva) no painel. Sempre que um aluno — ou você mesmo — clicar em Compartilhar Ranking, o sistema gera automaticamente um card 1080x1920 (formato Stories 9:16) com a SUA marca em destaque no topo, podendo usar foto da câmera, foto da galeria ou modo Sticker Transparente (PNG sem fundo) para colar direto no Instagram.',
    },
    {
      q: 'Como meus alunos entram no desafio? Eles precisam baixar app pesado na loja?',
      a: 'Zero complicação! O aluno entra em menos de 10 segundos através do Código de Convite exclusivo do seu desafio (ex: VERAO-2026) ou clicando direto no seu link no WhatsApp. Ele não precisa baixar nenhum aplicativo pesado na App Store ou Google Play: a ArenaFitPro abre instantaneamente no navegador do celular e pode ser fixada na tela de início com 1 toque.',
    },
    {
      q: 'Como funciona a Câmera Antifraude e a IA Nutricional nas missões?',
      a: 'Para garantir 100% de justiça na disputa do pódio, nosso sensor bloqueia uploads de fotos antigas da galeria: o aluno comprova o treino ao vivo na câmera. Nas missões de alimentação, nossa IA de Visão Computacional analisa a foto do prato na hora, estimando proteínas, carboidratos, gorduras e calorias automaticamente sem você precisar conferir 300 fotos manualmente no WhatsApp.',
    },
    {
      q: 'Como funciona o recebimento das inscrições dos alunos e o Split Pix D+0?',
      a: 'A ArenaFitPro é integrada nativamente à infraestrutura bancária do Asaas. Quando seu aluno paga a inscrição por Pix Copia e Cola ou QR Code, o acesso dele é liberado na hora e o dinheiro vai direto para a sua carteira no mesmo dia (D+0), já com divisão bancária automática (0% de taxa da plataforma no Plano Pro ou 15% no Starter).',
    },
    {
      q: 'Por que o aluno paga a inscrição via Pix? Existe risco de estorno (chargeback)?',
      a: 'O Pix exclusivo nas inscrições dos alunos protege 100% o seu bolso. No cartão de crédito, o aluno pode participar do desafio, consumir seu método e depois pedir estorno no banco (chargeback), deixando você no prejuízo. No Pix, o pagamento é à vista, irreversível, sem risco de calote, liberado em segundos e com tarifa bancária fixa centavos (a partir de R$ 0,99 no Asaas).',
    },
    {
      q: 'Quais são os custos exatos para começar? Preciso cadastrar cartão agora?',
      a: 'Você começa 100% grátis no plano Starter Coach, sem mensalidade e sem precisar cadastrar cartão de crédito. Nele você já pode lançar seu desafio com até 10 alunos pagando apenas 15% de split quando vender. Quando quiser escalar para até 100 alunos por turma e ter TAXA ZERO (0%) da plataforma, basta fazer o upgrade para o Pro Coach por apenas R$ 49,90/mês.',
    },
    {
      q: 'Como funcionam os Squads Cooperativos e o Radar Anti-Churn?',
      a: 'Os Squads dividem sua turma em equipes colaborativas onde a pontuação de todos soma — criando uma pressão social positiva em que ninguém quer deixar o time na mão. Já o Radar Anti-Churn monitora sua turma 24h e avisa quais alunos estão há mais de 48h sem fazer check-in, permitindo que você envie uma mensagem de resgate no WhatsApp com 1 clique.',
    },
  ];

  // Schemas JSON-LD estruturados para SEO e Google Rich Snippets
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ArenaFitPro',
    url: 'https://arenafitpro.com.br',
    description:
      'Plataforma de Desafios Fitness Gamificados para Personal Trainers e Nutricionistas com Pódio Ao Vivo, Stories 9:16 White-Label, Câmera IA Antifraude e Pix D+0.',
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
      'Transforme grupos de WhatsApp em desafios fitness gamificados que engajam até o último dia, divulgam sua marca nos Stories 9:16 e faturam no Pix D+0.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BRL',
      lowPrice: '0.00',
      highPrice: '49.90',
      offerCount: 2,
    },
    featureList: [
      'Compartilhamento Viral 9:16 nos Stories com Marca do Personal no Topo (White-Label)',
      'Pódio e Ranking de Turmas em Tempo Real',
      'Câmera Antifraude com Bloqueio de Galeria',
      'IA Nutricional com Estimativa de Macronutrientes',
      'Split Pix D+0 integrado ao Asaas (Taxa 0% no Plano Pro)',
      'Squads Cooperativos e Equipes',
      'Radar de Frequência e Alertas Anti-Churn 48h',
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
    name: 'Como lançar e faturar com um desafio fitness gamificado na ArenaFitPro',
    description: 'Passo a passo em 3 minutos para criar sua turma, engajar alunos e viralizar sua consultoria nos Stories.',
    totalTime: 'PT3M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Crie sua turma em 3 minutos e gere o Código/Link',
        text: 'Personalize com seu Logo e Nome de Consultoria, defina o valor da inscrição via Pix (ou entrada por código) e compartilhe no WhatsApp.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Seus alunos entram em 10 segundos sem baixar app',
        text: 'Acesso imediato pelo navegador do iPhone ou Android, sem ocupar memória e sem você precisar digitar fichas de treino.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Check-ins com IA, Pódio ao Vivo e Stories 9:16 com sua Marca',
        text: 'Os alunos comprovam treinos e refeições na câmera ao vivo, disputam o pódio e compartilham o Ranking 9:16 nos Stories divulgando sua consultoria.',
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

  // Navegação refinada com espaçamento generoso e termos objetivos
  const navLinks = [
    { label: 'Cockpit', href: '#mockup' },
    { label: 'Stories 9:16', href: '#stories', highlight: true },
    { label: 'Comparativo', href: '#provasocial' },
    { label: 'Como Funciona', href: '#fluxo' },
    { label: 'Simulador', href: '#calculadora' },
    { label: 'Planos', href: '#planos' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <div className="min-h-screen bg-[#080A0F] text-[#F4F6FA] selection:bg-[#3478F6] selection:text-white font-sans relative overflow-x-hidden">
      {/* Schemas JSON-LD independentes para Rich Results */}
      <JsonLd data={websiteSchema} />
      <JsonLd data={softwareApplicationSchema} />
      <JsonLd data={howToSchema} />
      <JsonLd data={faqSchema} />

      {/* Link de Pulo para Acessibilidade por Teclado (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-[#3478F6] text-white font-bold text-xs uppercase font-mono rounded-xl shadow-2xl focus:outline-none"
      >
        Pular para o conteúdo principal
      </a>

      {/* 1. Background 3D com Partículas Monocromáticas Sutis */}
      <Monochrome3DBackground />

      {/* 2. Header / Floating Navbar com Navegação Arejada e Alinhamento Perfeito */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 safe-top-header">
        <div className="max-w-6xl mx-auto bg-[#080A0F]/90 backdrop-blur-xl border border-[#252D3B] rounded-full px-5 sm:px-6 h-16 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-[#252D3B] shadow-[0_0_15px_rgba(52,120,246,0.2)] group-hover:scale-105 group-hover:border-[#3478F6] transition-all bg-[#121722] shrink-0 flex items-center justify-center">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-base tracking-tight text-[#F4F6FA] block leading-tight">
                ArenaFitPro
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A7B0C0] block">
                SaaS Fitness
              </span>
            </div>
          </Link>

          {/* Links desktop com espaçamento equilibrado (gap-7) e alta legibilidade */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium tracking-normal text-[#A7B0C0]">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`transition-colors py-2 ${
                  item.highlight
                    ? 'text-[#3478F6] font-bold hover:text-[#75A7FF]'
                    : 'hover:text-[#F4F6FA]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login?role=student"
              onClick={() => trackMarketingEvent('ViewContent', { content_name: 'Navbar Sou Aluno' })}
              className="hidden sm:inline-flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm font-semibold text-[#A7B0C0] hover:text-[#F4F6FA] px-3 py-2 rounded-full hover:bg-[#121722] transition-colors"
            >
              <span>Sou Aluno</span>
            </Link>
            <Link
              href="/login?role=professional&mode=signup"
              onClick={() => trackMarketingEvent('Lead', { content_name: 'Navbar Criar Conta Grátis' })}
            >
              <button className="mono-button-primary min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(52,120,246,0.3)]">
                <span>Criar Conta Grátis</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Abrir menu de navegação"
              className="lg:hidden h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-[#121722] border border-[#252D3B] flex items-center justify-center text-[#A7B0C0] hover:text-[#F4F6FA] transition-colors cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown Responsivo */}
        {mobileNavOpen && (
          <div className="lg:hidden max-w-6xl mx-auto mt-2 p-5 rounded-3xl bg-[#121722]/98 border border-[#252D3B] backdrop-blur-2xl shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1B2330] border border-[#252D3B] text-xs sm:text-sm font-semibold text-[#A7B0C0] hover:text-[#F4F6FA] hover:border-[#3478F6] flex items-center justify-between transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#3478F6]" />
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-[#252D3B] flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/login?role=student"
                onClick={() => {
                  setMobileNavOpen(false);
                  trackMarketingEvent('ViewContent', { content_name: 'Mobile Nav Sou Aluno' });
                }}
                className="flex-1"
              >
                <button className="mono-button-secondary w-full min-h-[46px] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border-[#252D3B] text-[#F4F6FA]">
                  <Smartphone className="w-4 h-4 text-[#3478F6]" />
                  <span>Sou Aluno (Tenho Código)</span>
                </button>
              </Link>
              <Link
                href="/login?role=professional&mode=signup"
                onClick={() => {
                  setMobileNavOpen(false);
                  trackMarketingEvent('Lead', { content_name: 'Mobile Nav Criar Conta' });
                }}
                className="flex-1"
              >
                <button className="mono-button-primary w-full min-h-[46px] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer">
                  <span>Criar Conta Grátis Agora</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section — Headline Impactante, Espaçamentos Controlados e Protagonismo da Demonstração */}
      <main id="main-content" className="relative pt-14 sm:pt-20 md:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          
          <div className="max-w-4xl w-full">
            {/* Kicker Pill Focado no Posicionamento Profissional */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#252D3B] bg-[#121722] text-xs font-mono uppercase tracking-wider text-[#A7B0C0] mb-6 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#3478F6] animate-pulse" />
              <span>Para Personal Trainers, Nutricionistas e Consultorias • Comece Grátis</span>
            </div>

            {/* Headline de Alto Impacto (48-64px desktop) com Entrelinha Equilibrada */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#F4F6FA] leading-[1.06] mb-6 text-balance">
              Transforme grupos mortos de WhatsApp em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4F6FA] via-[#75A7FF] to-[#3478F6]">
                Desafios que Engajam, Viralizam e Faturam no Pix
              </span>
            </h1>

            {/* Subtítulo Conciso com Excelente Ritmo de Leitura */}
            <p className="text-base sm:text-lg md:text-xl text-[#A7B0C0] max-w-3xl mx-auto leading-relaxed mb-8 font-normal text-pretty">
              Continue prescrevendo seus treinos e dietas como já faz hoje. A ArenaFitPro automatiza o{' '}
              <strong className="text-[#F4F6FA]">Pódio ao Vivo</strong>, a{' '}
              <strong className="text-[#F4F6FA]">Câmera Antifraude com IA</strong> e os{' '}
              <strong className="text-[#3478F6]">Cards 9:16 com a sua marca para os Stories</strong> — para seus alunos cumprirem o plano até o fim e você faturar de{' '}
              <strong className="text-[#F4F6FA]">R$ 1.500 a R$ 10.000+ por turma</strong> sem trabalho manual.
            </p>

            {/* CTAs com Hierarquia Clara e Espaçamento Respirável */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-5">
              <Link
                href="/login?role=professional&mode=signup"
                onClick={() => trackMarketingEvent('Lead', { content_name: 'Hero Criar Conta Grátis' })}
                className="w-full sm:w-auto"
              >
                <button className="mono-button-primary w-full sm:w-auto min-h-[54px] px-8 py-4 text-sm sm:text-base font-black flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_30px_rgba(52,120,246,0.35)]">
                  <span>Criar Minha Conta Grátis</span>
                  <ArrowRight className="w-4 h-4 text-white shrink-0" />
                </button>
              </Link>

              <a
                href="#calculadora"
                onClick={() => trackMarketingEvent('ViewContent', { content_name: 'Hero Simular Lucro' })}
                className="w-full sm:w-auto"
              >
                <button className="mono-button-secondary w-full sm:w-auto min-h-[54px] px-7 py-4 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 cursor-pointer border border-[#252D3B] bg-[#121722] hover:bg-[#1B2330] hover:border-[#3478F6] text-[#F4F6FA]">
                  <Calculator className="w-4 h-4 text-[#3478F6] shrink-0" />
                  <span>Simular Meu Lucro</span>
                </button>
              </a>

              <Link
                href="/login?role=student"
                onClick={() => trackMarketingEvent('ViewContent', { content_name: 'Hero Sou Aluno' })}
                className="w-full sm:w-auto"
              >
                <button className="mono-button-secondary w-full sm:w-auto min-h-[54px] px-6 py-4 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 cursor-pointer text-[#A7B0C0] hover:text-[#F4F6FA]">
                  <Smartphone className="w-4 h-4 text-[#A7B0C0] shrink-0" />
                  <span>Sou Aluno</span>
                </button>
              </Link>
            </div>

            {/* Micro-copy de Redução de Fricção */}
            <p className="text-xs font-mono text-[#A7B0C0] mb-8">
              ✓ Sem cartão de crédito • ✓ Lançamento em 3 minutos • ✓ Taxa 0% no Plano Pro
            </p>

            {/* Badges de Diferenciais com Espaçamento Limpo */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-[#A7B0C0] font-mono">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Sua Marca nos Stories 9:16
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Zero digitação de fichas
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Split Pix D+0 direto na conta
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Câmera Antifraude + IA
              </span>
            </div>
          </div>

          {/* 3.1 Demonstração do Produto em Evidência (Cockpit Web + Smartphone PWA) */}
          <div id="mockup" className="w-full pt-12 sm:pt-16">
            <HeroInteractiveMockup />
          </div>

        </div>
      </main>

      {/* 4. Metrics & Impact Bar — Destaque em Números e Legibilidade */}
      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center p-6 rounded-3xl border border-[#252D3B] bg-[#121722] backdrop-blur-2xl shadow-lg">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#3478F6] mb-1.5 font-mono">9:16</div>
            <div className="text-xs font-mono text-[#A7B0C0] uppercase tracking-wider">Stories com a Sua Marca</div>
          </div>
          <div className="text-center p-6 rounded-3xl border border-[#252D3B] bg-[#121722] backdrop-blur-2xl shadow-lg">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#3478F6] mb-1.5 font-mono">D+0</div>
            <div className="text-xs font-mono text-[#A7B0C0] uppercase tracking-wider">Liberação Pix na Conta</div>
          </div>
          <div className="text-center p-6 rounded-3xl border border-[#252D3B] bg-[#121722] backdrop-blur-2xl shadow-lg">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4F6FA] mb-1.5 font-mono">0 min</div>
            <div className="text-xs font-mono text-[#A7B0C0] uppercase tracking-wider">Digitando Fichas ou Dietas</div>
          </div>
          <div className="text-center p-6 rounded-3xl border border-[#252D3B] bg-[#121722] backdrop-blur-2xl shadow-lg">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F4F6FA] mb-1.5 font-mono">0%</div>
            <div className="text-xs font-mono text-[#A7B0C0] uppercase tracking-wider">Fotos Falsas de Galeria</div>
          </div>
        </div>
      </section>

      {/* 5. Vitrine Demonstrativa: Compartilhamento Viral 9:16 White-Label nos Stories */}
      <ViralStoriesShowcase />

      {/* 6. Comparativo Editorial & Demonstrativo: O Caos do WhatsApp vs. A Máquina ArenaFitPro */}
      <div id="provasocial">
        <BeforeAfterComparison />
      </div>

      {/* 7. Como Funciona em 3 Passos — Composição Editorial Arejada e Conectiva */}
      <section id="fluxo" className="py-20 sm:py-28 px-4 sm:px-6 relative border-t border-[#252D3B]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <span className="text-xs font-mono uppercase tracking-widest text-[#3478F6] mb-3 block font-bold">
              PASSO A PASSO EM 3 MINUTOS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F4F6FA] tracking-tight mb-4">
              Como você lança seu desafio sem mudar sua rotina
            </h2>
            <p className="text-[#A7B0C0] text-base sm:text-lg leading-relaxed">
              Sem downloads pesados de 150MB e sem precisar redigitar treinos. Veja como sua turma entra em ação:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Passo 1 */}
            <div className="p-8 rounded-3xl border border-[#252D3B] bg-[#121722] flex flex-col justify-between space-y-6 shadow-md hover:border-[#3478F6]/40 transition-colors">
              <div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-[#3478F6] mb-4">
                  01
                </div>
                <h3 className="text-xl font-bold text-[#F4F6FA] mb-3 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#3478F6] shrink-0" />
                  <span>Seu Método + Seu Link</span>
                </h3>
                <p className="text-sm text-[#A7B0C0] leading-relaxed">
                  Você entrega seu treino ou dieta como já faz hoje (PDF, WhatsApp ou app habitual). Na ArenaFitPro, você cria o desafio em 3 minutos e envia o código exclusivo ou link direto para a turma.
                </p>
              </div>
              <div className="pt-4 border-t border-[#252D3B] text-xs font-mono text-[#3478F6] font-bold">
                ✓ Setup em 3 minutos
              </div>
            </div>

            {/* Passo 2 */}
            <div className="p-8 rounded-3xl border border-[#252D3B] bg-[#121722] flex flex-col justify-between space-y-6 shadow-md hover:border-[#3478F6]/40 transition-colors">
              <div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-[#3478F6] mb-4">
                  02
                </div>
                <h3 className="text-xl font-bold text-[#F4F6FA] mb-3 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#3478F6] shrink-0" />
                  <span>Entrada em 10s (Sem Loja)</span>
                </h3>
                <p className="text-sm text-[#A7B0C0] leading-relaxed">
                  O aluno entra com 1 toque no navegador do celular (iPhone ou Android) sem baixar nada na App Store. Se for um desafio pago, o Pix D+0 libera o acesso na hora.
                </p>
              </div>
              <div className="pt-4 border-t border-[#252D3B] text-xs font-mono text-[#3478F6] font-bold">
                ✓ 1 Toque no Navegador
              </div>
            </div>

            {/* Passo 3 */}
            <div className="p-8 rounded-3xl border border-[#252D3B] bg-[#121722] flex flex-col justify-between space-y-6 shadow-md hover:border-[#3478F6]/40 transition-colors">
              <div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-[#3478F6] mb-4">
                  03
                </div>
                <h3 className="text-xl font-bold text-[#F4F6FA] mb-3 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#3478F6] shrink-0" />
                  <span>Pódio, IA e Stories 9:16</span>
                </h3>
                <p className="text-sm text-[#A7B0C0] leading-relaxed">
                  Alunos comprovam treinos ao vivo na câmera, disputam o pódio e postam o Ranking 9:16 nos Stories com a SUA marca no topo — atraindo novos alunos no piloto automático.
                </p>
              </div>
              <div className="pt-4 border-t border-[#252D3B] text-xs font-mono text-[#3478F6] font-bold">
                ✓ Divulgação Orgânica Diária
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Bento Grid de Retenção & Fintech — Cartões Respiráveis com Hierarquia Clara */}
      <section id="gamificacao" className="py-20 sm:py-28 px-4 sm:px-6 relative border-t border-[#252D3B]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <span className="text-xs font-mono uppercase tracking-widest text-[#3478F6] mb-3 block font-bold">
              TECNOLOGIA DE RETENÇÃO & ESCALA
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F4F6FA] tracking-tight mb-4">
              Tudo o que mantém seus alunos viciados em cumprir o plano
            </h2>
            <p className="text-[#A7B0C0] text-base sm:text-lg leading-relaxed">
              Combinamos psicologia de jogos, visão computacional por IA e pagamentos instantâneos para você escalar de 10 para 500 alunos sem aumentar seu trabalho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 text-left">
            {/* Card 1: Antifraude Câmera e IA Nutricional */}
            <SpotlightCard3D className="md:col-span-7 p-6 sm:p-8 min-h-[300px] flex flex-col justify-between border-[#252D3B] bg-[#121722]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#252D3B]">
                  <span className="text-xs font-mono text-[#75A7FF] font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#3478F6] animate-pulse" />
                    AUDITORIA AUTOMÁTICA
                  </span>
                  <span className="text-xs font-mono text-[#A7B0C0] bg-[#1B2330] border border-[#252D3B] px-3 py-1 rounded-full">
                    100% Ao Vivo
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-[#F4F6FA] tracking-tight mt-6 mb-3">
                  Câmera Antifraude & Leitura de Pratos por IA
                </h3>
                <p className="text-sm sm:text-base text-[#A7B0C0] leading-relaxed">
                  Chega de passar a noite abrindo 300 fotos no WhatsApp. O aluno bate a foto ao vivo na câmera (sem fotos da galeria) e a IA Nutricional estima proteínas, carboidratos e calorias liberando os pontos na hora.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#252D3B] flex items-center justify-between text-xs font-mono text-[#A7B0C0]">
                <span>Sensor Óptico + IA de Macros</span>
                <span className="text-[#3478F6] font-bold">Zero Fraudes</span>
              </div>
            </SpotlightCard3D>

            {/* Card 2: Split Pix D+0 no Asaas */}
            <SpotlightCard3D className="md:col-span-5 p-6 sm:p-8 min-h-[300px] flex flex-col justify-between border-[#252D3B] bg-[#121722]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#252D3B]">
                  <span className="text-xs font-mono text-[#75A7FF] font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#3478F6]" />
                    SPLIT PIX D+0
                  </span>
                  <span className="text-xs font-mono text-[#3478F6] font-bold">Instantâneo</span>
                </div>

                <h3 className="text-2xl font-bold text-[#F4F6FA] tracking-tight mt-6 mb-3">
                  Checkout Pix com Lucro Direto na Conta
                </h3>
                <p className="text-sm sm:text-base text-[#A7B0C0] leading-relaxed">
                  Sem cobrar comprovante no privado e sem risco de estorno de cartão. O aluno paga via Pix, entra na turma na hora e o dinheiro cai na sua conta no mesmo dia com 0% de taxa no Pro.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#252D3B] flex items-center justify-between text-xs font-mono text-[#A7B0C0]">
                <span>Integrado ao Asaas</span>
                <span className="text-[#3478F6] font-bold">Taxa 0% no Pro</span>
              </div>
            </SpotlightCard3D>

            {/* Card 3: Squads e Times Cooperativos */}
            <SpotlightCard3D className="md:col-span-6 p-6 sm:p-8 min-h-[260px] flex flex-col justify-between border-[#252D3B] bg-[#121722]">
              <div>
                <div className="text-xs font-mono text-[#75A7FF] font-bold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#3478F6]" /> PRESSÃO SOCIAL POSITIVA
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] mb-2.5">
                  Squads em Equipe & Escudos de Streak
                </h4>
                <p className="text-sm sm:text-base text-[#A7B0C0] leading-relaxed">
                  Divida sua turma em equipes cooperativas onde a pontuação de todos soma. Alunos cobram uns aos outros para treinar todo dia e ninguém deixa o time na mão.
                </p>
              </div>
              <div className="pt-4 border-t border-[#252D3B] flex items-center justify-between text-xs font-mono text-[#A7B0C0]">
                <span>Gamificação Cooperativa</span>
                <span className="text-[#3478F6] font-bold">94.8% Retenção</span>
              </div>
            </SpotlightCard3D>

            {/* Card 4: Radar Anti-Churn & Resgate WhatsApp */}
            <SpotlightCard3D className="md:col-span-6 p-6 sm:p-8 min-h-[260px] flex flex-col justify-between border-[#252D3B] bg-[#121722]">
              <div>
                <div className="text-xs font-mono text-[#75A7FF] font-bold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#3478F6]" /> RESGATE ATIVO 24H
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] mb-2.5">
                  Radar Anti-Churn 48h em 1 Toque
                </h4>
                <p className="text-sm sm:text-base text-[#A7B0C0] leading-relaxed">
                  O painel identifica automaticamente qualquer aluno que fique mais de 48 horas sem bater ponto, permitindo que você envie uma mensagem de resgate no WhatsApp com 1 clique.
                </p>
              </div>
              <div className="pt-4 border-t border-[#252D3B] flex items-center justify-between text-xs font-mono text-[#A7B0C0]">
                <span>Alerta Automático</span>
                <span className="text-[#3478F6] font-bold">Resgate em 1 Toque</span>
              </div>
            </SpotlightCard3D>
          </div>
        </div>
      </section>

      {/* 9. Calculadora Interativa de Lucro Real */}
      <section id="calculadora" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-[#252D3B] relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-[#3478F6] mb-3 block font-bold">
              SIMULADOR DE LUCRO REAL
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F4F6FA] tracking-tight mb-4">
              Veja quanto dinheiro você coloca no bolso em cada desafio
            </h2>
            <p className="text-[#A7B0C0] text-base sm:text-lg leading-relaxed">
              Arraste os seletores abaixo para simular a quantidade de alunos e o valor da inscrição da sua próxima turma:
            </p>
          </div>

          <div className="p-6 sm:p-10 rounded-3xl border border-[#252D3B] bg-[#121722] backdrop-blur-2xl shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* Sliders de Controle */}
              <div className="lg:col-span-7 space-y-7">
                <div>
                  <div className="flex justify-between items-center gap-2 mb-3">
                    <label htmlFor="students-range" className="text-sm sm:text-base font-semibold text-[#F4F6FA]">
                      Quantidade de Alunos no Desafio
                    </label>
                    <span className="text-base sm:text-lg font-mono font-bold text-[#3478F6] bg-[#1B2330] border border-[#252D3B] px-4 py-1 rounded-xl shrink-0">
                      {studentsCount} alunos
                    </span>
                  </div>
                  <input
                    id="students-range"
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={studentsCount}
                    onChange={(e) => setStudentsCount(Number(e.target.value))}
                    className="w-full accent-[#3478F6] h-2.5 bg-[#1B2330] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-mono text-[#A7B0C0] mt-2">
                    <span>10 alunos</span>
                    <span>50 alunos</span>
                    <span>150 alunos</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center gap-2 mb-3">
                    <label htmlFor="ticket-range" className="text-sm sm:text-base font-semibold text-[#F4F6FA]">
                      Valor da Inscrição por Aluno
                    </label>
                    <span className="text-base sm:text-lg font-mono font-bold text-[#3478F6] bg-[#1B2330] border border-[#252D3B] px-4 py-1 rounded-xl shrink-0">
                      R$ {ticketPrice},00
                    </span>
                  </div>
                  <input
                    id="ticket-range"
                    type="range"
                    min="47"
                    max="297"
                    step="10"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full accent-[#3478F6] h-2.5 bg-[#1B2330] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-mono text-[#A7B0C0] mt-2">
                    <span>R$ 47</span>
                    <span>R$ 147</span>
                    <span>R$ 297</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#1B2330] border border-[#252D3B] text-xs sm:text-sm text-[#A7B0C0] leading-relaxed">
                  <p>
                    <strong className="text-[#F4F6FA]">Economia Real no Plano Pro:</strong> Ao migrar da taxa de 15% para a <strong className="text-[#3478F6]">Taxa ZERO (0%)</strong> com {studentsCount} alunos a R$ {ticketPrice}, você economiza{' '}
                    <strong className="text-[#75A7FF] font-bold">
                      +R$ {proAdvantage.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>{' '}
                    diretamente no seu bolso. A assinatura de R$ 49,90 se paga sozinha já nas primeiras inscrições!
                  </p>
                </div>
              </div>

              {/* Card de Resultados */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#080A0F] border border-[#252D3B] space-y-6">
                <div className="text-center pb-5 border-b border-[#252D3B]">
                  <span className="text-xs font-mono uppercase text-[#A7B0C0] block mb-1">
                    Faturamento Bruto da Turma
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#F4F6FA] font-mono">
                    R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs sm:text-sm">
                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-[#121722] border border-[#252D3B]">
                    <div>
                      <span className="text-[#F4F6FA] block font-sans text-xs sm:text-sm font-medium">Plano Starter (Taxa 15%)</span>
                      <span className="text-xs text-[#A7B0C0]">Mensalidade R$ 0</span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#A7B0C0]">
                      R$ {netStarter.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-[#1B2330] border border-[#3478F6]/50 shadow-[0_0_25px_rgba(52,120,246,0.15)]">
                    <div>
                      <span className="text-[#F4F6FA] font-sans text-xs sm:text-sm font-bold flex flex-wrap items-center gap-1.5">
                        Plano Pro (Taxa ZERO • 0%)
                        <span className="text-[11px] bg-[#3478F6] text-white px-2 py-0.5 rounded font-bold">100% SEU</span>
                      </span>
                      <span className="text-xs text-[#A7B0C0]">R$ 49,90/mês</span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#3478F6] shrink-0">
                      R$ {netPro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <Link
                  href="/login?role=professional&mode=signup"
                  onClick={() => trackMarketingEvent('Lead', { content_name: 'Calculadora Começar Desafio Agora' })}
                  className="block w-full"
                >
                  <button className="mono-button-primary w-full min-h-[50px] py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(52,120,246,0.3)]">
                    <span>Criar Conta Grátis e Lançar Turma</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </Link>
              </div>

            </div>

            <div className="mt-8 pt-5 border-t border-[#252D3B] max-w-3xl mx-auto space-y-2 text-center font-mono">
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#A7B0C0]">
                <span className="inline-flex items-center gap-1.5 bg-[#1B2330] text-[#75A7FF] px-3.5 py-1 rounded-full border border-[#252D3B]">
                  <Zap className="w-3.5 h-3.5 text-[#3478F6]" /> Pix Instantâneo D+0 (Sem Risco de Chargeback)
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#121722] text-[#A7B0C0] px-3.5 py-1 rounded-full border border-[#252D3B]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3478F6]" /> Tarifa Bancária Asaas: a partir de R$ 0,99 fixo
                </span>
              </div>
              <p className="text-xs text-[#A7B0C0]/80 leading-relaxed">
                * Transparência Financeira: No plano Pro, a taxa da ArenaFitPro é 0% (você retém 100% do valor da inscrição deduzida apenas a tarifa bancária fixa do gateway de pagamento Asaas). Os alunos pagam via Pix à vista, eliminando estornos e inadimplência.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Seção de Preços & Planos — Destaque Cirúrgico no Pro Coach e Tabela Dark Matrix Arejada */}
      <section id="planos" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-[#252D3B] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-[#3478F6] mb-3 block font-bold">
              INVESTIMENTO TRANSPARENTE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F4F6FA] tracking-tight mb-4">
              Comece grátis hoje e escale com Taxa ZERO
            </h2>
            <p className="text-[#A7B0C0] text-base sm:text-lg leading-relaxed">
              Crie sua conta sem cartão de crédito no Starter ou ative o Pro Coach para ficar com 100% do lucro das inscrições.
            </p>

            {/* Toggle Mensal / Anual */}
            <div className="mt-8 inline-flex items-center p-1.5 rounded-full border border-[#252D3B] bg-[#121722] shadow-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`min-h-[42px] px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-[#3478F6] text-white shadow-lg'
                    : 'text-[#A7B0C0] hover:text-[#F4F6FA]'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`min-h-[42px] px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-[#3478F6] text-white shadow-lg'
                    : 'text-[#A7B0C0] hover:text-[#F4F6FA]'
                }`}
              >
                <span>Anual</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                  billingCycle === 'yearly' ? 'bg-[#080A0F] text-white' : 'bg-[#1B2330] text-[#75A7FF]'
                }`}>
                  20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Grid dos 2 Cards de Preço com Espaçamento e Hierarquia Sólida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            
            {/* PLANO 1: Starter Coach */}
            <SpotlightCard3D className="p-7 sm:p-9 flex flex-col justify-between border-[#252D3B] bg-[#121722] rounded-3xl">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A7B0C0]">
                    Para Começar Agora
                  </span>
                  <span className="text-xs font-mono px-3.5 py-1 rounded-full bg-[#1B2330] border border-[#252D3B] text-[#A7B0C0] font-bold">
                    GRÁTIS
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#F4F6FA] mb-2">Starter Coach</h3>
                <p className="text-sm text-[#A7B0C0] mb-6 leading-relaxed">
                  Perfeito para validar seu primeiro desafio online com zero custo fixo e sem cartão de crédito.
                </p>

                <div className="mb-6 pb-6 border-b border-[#252D3B]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-[#F4F6FA] font-mono">R$ 0</span>
                    <span className="text-sm text-[#A7B0C0] font-mono">/mês</span>
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-[#A7B0C0] mt-3 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-[#3478F6] shrink-0" />
                    <span>Taxa de split: <strong className="text-[#F4F6FA]">15% apenas quando vender</strong></span>
                  </div>
                  <div className="text-xs font-mono text-[#A7B0C0]/80 mt-1">
                    + tarifa bancária Asaas por Pix recebido D+0
                  </div>
                </div>

                {/* Lista O que vem com espaçamento vertical respirável */}
                <div className="space-y-3.5 mb-8">
                  <div className="text-xs font-mono uppercase text-[#F4F6FA] font-bold">
                    O que está incluído:
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-[#A7B0C0]">
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span><strong className="text-[#F4F6FA]">1 Desafio ativo</strong> (até <strong className="text-[#F4F6FA]">10 alunos</strong>)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span><strong className="text-[#F4F6FA]">Stories 9:16 White-Label</strong> com sua Marca no topo</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span>Acesso rápido por <strong className="text-[#F4F6FA]">Código de Convite</strong> & Link</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span>Câmera Nativa Antifraude & GPS</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span><strong className="text-[#F4F6FA]">Pódio Ao Vivo & Feed Social</strong> da Turma</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span>Recebimento Pix D+0 direto na sua conta</span>
                    </li>
                  </ul>
                </div>

                {/* Lista O que NÃO vem */}
                <div className="space-y-2.5 mb-8 pt-5 border-t border-[#252D3B]">
                  <div className="text-xs font-mono uppercase text-[#A7B0C0]">
                    Exclusivo do Pro Coach:
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#A7B0C0]/70">
                    <li className="flex items-center gap-3">
                      <X className="w-4 h-4 text-[#A7B0C0]/50 shrink-0" />
                      <span>Taxa ZERO (0%) sobre as inscrições</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <X className="w-4 h-4 text-[#A7B0C0]/50 shrink-0" />
                      <span>IA Nutricional (Cálculo de Calorias e Macros)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <X className="w-4 h-4 text-[#A7B0C0]/50 shrink-0" />
                      <span>Squads Cooperativos & Radar Anti-Churn 48h</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <X className="w-4 h-4 text-[#A7B0C0]/50 shrink-0" />
                      <span>Até 5 desafios e 100 alunos por turma</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href="/login?role=professional&mode=signup"
                onClick={() => trackMarketingEvent('Lead', { content_name: 'Plano Starter Treinador' })}
                className="block w-full"
              >
                <button className="mono-button-secondary w-full min-h-[50px] py-3.5 text-xs sm:text-sm font-bold cursor-pointer flex items-center justify-center gap-2 border-[#252D3B] text-[#F4F6FA] hover:border-[#3478F6]">
                  <Sparkles className="w-4 h-4 text-[#3478F6]" />
                  <span>Criar Conta Grátis no Starter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </SpotlightCard3D>

            {/* PLANO 2: Pro Coach (DESTAQUE COM AZUL ELÉTRICO #3478F6) */}
            <SpotlightCard3D className="p-7 sm:p-9 flex flex-col justify-between border-2 border-[#3478F6] bg-[#121722] shadow-[0_0_50px_rgba(52,120,246,0.22)] relative md:scale-[1.03] rounded-3xl">
              {/* Badge Flutuante no Topo em Azul Elétrico */}
              <div className="inline-flex self-start mb-4 bg-[#3478F6] text-white px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow-lg items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-white shrink-0" />
                <span>MAIS ESCOLHIDO • TAXA 0% NA PLATAFORMA</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#75A7FF] font-bold">
                    Escala Profissional
                  </span>
                  <span className="text-xs font-mono px-3.5 py-1 rounded-full bg-[#3478F6]/20 border border-[#3478F6]/40 text-[#75A7FF] font-extrabold">
                    PRO
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#F4F6FA] mb-2">Pro Coach</h3>
                <p className="text-sm text-[#A7B0C0] mb-6 leading-relaxed">
                  Para personais e nutricionistas que querem ficar com 100% do lucro das inscrições e liberar a IA Nutricional.
                </p>

                <div className="mb-6 pb-6 border-b border-[#252D3B]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-[#F4F6FA] font-mono">
                      R$ {billingCycle === 'monthly' ? '49,90' : '39,90'}
                    </span>
                    <span className="text-sm text-[#A7B0C0] font-mono">/mês</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <span className="text-xs font-mono text-[#75A7FF] block mt-2 font-bold">
                      Cobrado anualmente (economia de R$ 120/ano)
                    </span>
                  )}
                  <div className="text-xs sm:text-sm font-mono text-[#75A7FF] mt-3 flex items-center gap-1.5 font-bold">
                    <Percent className="w-4 h-4 text-[#3478F6] shrink-0" />
                    <span>Taxa ZERO da plataforma: 0% (100% do lucro é seu!)</span>
                  </div>
                  <div className="text-xs font-mono text-[#A7B0C0]/80 mt-1">
                    Deduzida apenas a tarifa bancária Asaas (a partir de R$ 0,99 fixo/Pix D+0)
                  </div>
                </div>

                {/* Lista O que vem */}
                <div className="space-y-3.5 mb-8">
                  <div className="text-xs font-mono uppercase text-[#F4F6FA] font-bold">
                    Tudo do Starter, mais:
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-[#F4F6FA]">
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span>Até <strong className="text-white">5 Desafios simultâneos</strong> (até <strong className="text-white">100 alunos/cada</strong>)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span><strong className="text-white">Stories 9:16 White-Label</strong> (Foto, Galeria e Sticker PNG)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span><strong className="text-white">IA Nutricional Integrada</strong> em fotos de refeições</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span><strong className="text-white">Squads & Times Cooperativos</strong> liberados</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span><strong className="text-white">Radar Anti-Churn 48h & Resgate WhatsApp</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#3478F6] shrink-0" />
                      <span>Suporte prioritário direto no WhatsApp</span>
                    </li>
                  </ul>
                </div>

              </div>

              <Link
                href="/login?role=professional&mode=signup"
                onClick={() =>
                  trackMarketingEvent('InitiateCheckout', {
                    content_name: 'Plano Pro Treinador',
                    value: billingCycle === 'monthly' ? 49.9 : 478.8,
                    currency: 'BRL',
                  })
                }
                className="block w-full"
              >
                <button className="mono-button-primary w-full min-h-[50px] py-3.5 text-xs sm:text-sm font-black shadow-[0_0_30px_rgba(52,120,246,0.35)] flex items-center justify-center gap-2 cursor-pointer">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Começar Agora com Pro Coach</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </Link>
            </SpotlightCard3D>
          </div>

          {/* 10.1 Tabela Comparativa Detalhada Estilo Dark Matrix Arejada */}
          <div className="mt-24">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-black text-[#F4F6FA]">
                Comparativo Detalhado de Recursos
              </h3>
              <p className="text-sm sm:text-base text-[#A7B0C0] mt-1.5">
                Transparência total em cada etapa da sua evolução
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-[#252D3B] bg-[#121722]/90 backdrop-blur-xl shadow-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-[#252D3B] bg-[#1B2330]">
                    <th className="p-5 font-mono text-[#A7B0C0] uppercase tracking-wider text-xs">Recursos & Capacidade</th>
                    <th className="p-5 font-bold text-center text-[#F4F6FA]">Starter Coach</th>
                    <th className="p-5 font-bold text-center text-[#75A7FF] bg-[#3478F6]/10">Pro Coach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252D3B]">
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Mensalidade</td>
                    <td className="p-5 text-center text-[#A7B0C0] font-mono font-bold">R$ 0</td>
                    <td className="p-5 text-center text-[#3478F6] font-mono font-bold bg-[#3478F6]/10">R$ 49,90/mês</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Taxa de Split da Plataforma</td>
                    <td className="p-5 text-center text-[#A7B0C0] font-mono">15%</td>
                    <td className="p-5 text-center text-[#3478F6] font-mono font-bold bg-[#3478F6]/10">0% (Taxa ZERO)</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Compartilhamento Stories 9:16 com Sua Marca (White-Label)</td>
                    <td className="p-5 text-center text-[#F4F6FA] font-bold">✓</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">✓ Completo (Foto + Sticker PNG)</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Entrada por Código de Convite & Link</td>
                    <td className="p-5 text-center text-[#F4F6FA] font-bold">✓</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">✓</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Desafios Ativos Simultâneos</td>
                    <td className="p-5 text-center text-[#A7B0C0]">1 Desafio</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">Até 5 Desafios</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Limite de Alunos por Desafio</td>
                    <td className="p-5 text-center text-[#A7B0C0]">Até 10 alunos</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">Até 100 alunos</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Câmera Nativa Antifraude & GPS</td>
                    <td className="p-5 text-center text-[#F4F6FA] font-bold">✓</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">✓</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Pódio Ao Vivo & Feed Social da Turma</td>
                    <td className="p-5 text-center text-[#F4F6FA] font-bold">✓</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">✓</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">IA Nutricional (Estimativa de Macros/Kcal)</td>
                    <td className="p-5 text-center text-[#A7B0C0]/50 font-bold">✗</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Saque Pix D+0 no Asaas</td>
                    <td className="p-5 text-center text-[#F4F6FA] font-bold">✓ Imediato</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">✓ Imediato</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Tarifa Bancária do Gateway (Asaas)</td>
                    <td className="p-5 text-center text-[#A7B0C0] font-mono text-xs">Tarifa fixa Asaas (R$ 0,99/Pix)</td>
                    <td className="p-5 text-center text-[#A7B0C0] font-mono text-xs bg-[#3478F6]/10">Tarifa fixa Asaas (R$ 0,99/Pix)</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Squads & Times Cooperativos</td>
                    <td className="p-5 text-center text-[#A7B0C0]/50 font-bold">✗</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Radar Anti-Churn 48h & Resgate WhatsApp</td>
                    <td className="p-5 text-center text-[#A7B0C0]/50 font-bold">✗</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-5 text-[#F4F6FA] font-medium">Canal de Suporte</td>
                    <td className="p-5 text-center text-[#A7B0C0]">Central de Ajuda</td>
                    <td className="p-5 text-center text-[#3478F6] font-bold bg-[#3478F6]/10">WhatsApp Prioritário</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 11. Seção FAQ com Accordion Interativo */}
      <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-[#252D3B] relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#3478F6] mb-3 flex items-center justify-center gap-1.5 font-bold">
              <HelpCircle className="w-4 h-4 text-[#3478F6]" /> DÚVIDAS FREQUENTES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F4F6FA] tracking-tight mb-4">
              Perguntas e Respostas
            </h2>
            <p className="text-[#A7B0C0] text-base sm:text-lg leading-relaxed">
              Tudo o que você precisa saber antes de criar sua conta grátis e lançar sua primeira turma.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#252D3B] bg-[#121722] overflow-hidden transition-colors hover:border-[#3478F6]/50"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#F4F6FA] hover:text-[#75A7FF] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#A7B0C0] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#3478F6]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-0 text-sm sm:text-base text-[#A7B0C0] leading-relaxed border-t border-[#252D3B]">
                      <p className="pt-4">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center p-6 sm:p-8 rounded-3xl border border-[#252D3B] bg-[#121722]">
            <p className="text-sm sm:text-base text-[#A7B0C0]">
              Ainda tem alguma dúvida específica para o seu modelo de desafio?
            </p>
            <Link
              href="/ajuda"
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#3478F6] hover:text-[#75A7FF] hover:underline"
            >
              <span>Acessar Central de Ajuda & Suporte</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 12. Grand Final CTA Section — Alto Contraste e Ação Clara */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 border-t border-[#252D3B] relative bg-gradient-to-b from-[#121722] to-[#080A0F]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3478F6]/30 bg-[#3478F6]/10 text-xs font-mono uppercase tracking-wider text-[#75A7FF] mb-6">
            <Trophy className="w-4 h-4 text-[#3478F6]" />
            <span>Comece Agora em Menos de 3 Minutos</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#F4F6FA] tracking-tight mb-6 leading-tight text-balance">
            Lote sua próxima turma e coloque{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4F6FA] via-[#75A7FF] to-[#3478F6]">
              sua marca nos Stories de cada aluno
            </span>
          </h2>

          <p className="text-[#A7B0C0] text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Crie sua conta grátis sem cartão de crédito, configure seu desafio em 3 minutos e receba inscrições via Pix D+0 com a tecnologia mais desejada do mercado fitness.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?role=professional&mode=signup"
              onClick={() => trackMarketingEvent('Lead', { content_name: 'Footer Criar Conta Grátis' })}
              className="w-full sm:w-auto"
            >
              <button className="mono-button-primary w-full sm:w-auto min-h-[54px] px-10 py-4 text-sm sm:text-base font-black flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(52,120,246,0.35)] cursor-pointer">
                <Sparkles className="w-4 h-4 text-white shrink-0" />
                <span>Criar Minha Conta Grátis Agora</span>
                <ArrowRight className="w-4 h-4 text-white shrink-0" />
              </button>
            </Link>
            <Link
              href="/login?role=student"
              onClick={() => trackMarketingEvent('ViewContent', { content_name: 'Footer Sou Aluno' })}
              className="w-full sm:w-auto"
            >
              <button className="mono-button-secondary w-full sm:w-auto min-h-[54px] px-8 py-4 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 cursor-pointer border-[#252D3B] text-[#F4F6FA]">
                <Smartphone className="w-4 h-4 text-[#3478F6]" />
                <span>Sou Aluno • Entrar na Turma</span>
              </button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-mono text-[#A7B0C0]">
            <span>• Zero digitação de treinos</span>
            <span>• Sem cartão para criar conta</span>
            <span>• Saque Pix D+0 imediato</span>
          </div>
        </div>
      </section>

      {/* 13. Rodapé Institucional e Legal Completo */}
      <CorporateFooter />
    </div>
  );
}
