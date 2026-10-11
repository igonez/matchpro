'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';
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
  Gift,
  Building2,
  Flame,
  Calculator,
  HelpCircle,
  Activity,
  Award,
  Smartphone,
  CreditCard,
  Percent,
} from 'lucide-react';

export default function HomePage() {
  // Estado para ciclo de cobrança (mensal ou anual com 20% off)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Estado para a Calculadora Interativa de Lucro
  const [studentsCount, setStudentsCount] = useState<number>(35);
  const [ticketPrice, setTicketPrice] = useState<number>(97);

  // Estado para FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Cálculos da Calculadora
  const grossRevenue = studentsCount * ticketPrice;
  const netStarter = grossRevenue * 0.82; // 18% taxa
  const netPro = grossRevenue * 0.88; // 12% taxa
  const netStudio = grossRevenue * 0.92; // 8% taxa
  const proAdvantage = netPro - netStarter;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      q: 'Preciso pagar algo para criar minha conta e lançar meu primeiro desafio?',
      a: 'Não! O plano Starter Coach é 100% gratuito de mensalidade. Você pode criar seu cadastro em 1 minuto, configurar seu desafio de até 15 alunos e lançar sem cadastrar nenhum cartão de crédito. Você só compartilha uma taxa de 18% quando seus alunos pagam.',
    },
    {
      q: 'Como funciona o recebimento das inscrições dos alunos e o Split Pix?',
      a: 'A ArenaFitPro é integrada nativamente à infraestrutura bancária do Asaas. Quando seu aluno paga a inscrição por Pix, o dinheiro cai imediatamente (D+0) com divisão automática: a taxa da plataforma é separada e o seu lucro líquido fica disponível na hora na sua conta para transferência sem burocracia.',
    },
    {
      q: 'O que é a proteção contra bitributação no Split bancário?',
      a: 'Diferente de plataformas antigas (onde todo o faturamento passa pela sua conta e você é tributado sobre 100% do valor bruto, inclusive sobre as taxas da plataforma), o split nativo divide a transação no nível bancário. Você emite nota fiscal apenas sobre o seu lucro real e a plataforma emite sobre a taxa dela.',
    },
    {
      q: 'O que impede o aluno de fraudar os treinos ou enviar fotos antigas da galeria?',
      a: 'Nosso algoritmo de auditoria exige acesso à câmera em tempo real pelo navegador do smartphone e bloqueia upload de fotos salvas na galeria. Além disso, cada foto é carimbada com coordenadas de GPS, fuso horário UTC e metadados de integridade invioláveis.',
    },
    {
      q: 'O que são os Squads Cooperativos e a Mystery Box?',
      a: 'Squads são equipes formadas dentro do seu desafio. A pontuação é média/coletiva, criando pressão social positiva: se um membro faltar, prejudica o time. A Mystery Box (Caixa Misteriosa) é desbloqueada quando o aluno atinge metas de ofensiva (streaks de 7, 14 ou 21 dias), entregando medalhas virtuais e recompensas exclusivas.',
    },
    {
      q: 'Como funciona o Escudo de Ofensiva (Freeze Shield)?',
      a: 'O maior vilão dos desafios é a desistência por imprevistos: o aluno perde um dia de treino por doença ou viagem e desiste do resto do mês. O Freeze Shield permite "congelar" o streak em dias críticos sem zerar o progresso, mantendo a taxa de conclusão do desafio em até 94%.',
    },
    {
      q: 'Posso mudar de plano ou cancelar a qualquer momento?',
      a: 'Sim, sem fidelidade e sem letras miúdas. Você pode fazer upgrade do plano Starter para o Pro ou Studio a qualquer instante para liberar mais alunos e reduzir suas taxas de split. O cancelamento pode ser feito com 1 clique direto no seu painel.',
    },
    {
      q: 'Meus alunos precisam baixar algum aplicativo pesado das lojas?',
      a: 'Não! A ArenaFitPro é uma aplicação web progressiva (PWA) ultra-leve e veloz. O aluno acessa pelo link exclusivo do seu desafio, coloca o link na tela de início do iPhone ou Android em 2 toques e usa com interface nativa de aplicativo, sem ocupar memória.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans relative overflow-x-hidden">
      {/* 1. Background 3D com Partículas Monocromáticas */}
      <Monochrome3DBackground />

      {/* 2. Top Specular Release Pill */}
      <div className="pt-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-zinc-950/80 backdrop-blur-xl text-zinc-300 text-[11px] font-medium tracking-wide shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-white font-semibold">ArenaFitPro 3.0</span>
            <span className="text-zinc-500 hidden sm:inline">|</span>
            <span className="text-zinc-400 hidden sm:inline">
              Infraestrutura de Desafios Fitness & Split Pix D+0
            </span>
            <Link
              href="/login"
              className="text-white hover:text-zinc-300 font-bold ml-1 inline-flex items-center gap-1 group"
            >
              Criar Conta Grátis
              <svg
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Floating Navbar Monocromática Estilo Linear / 21st.dev */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 mt-2">
        <div className="max-w-5xl mx-auto mono-glass-pill px-5 sm:px-6 h-16 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-white via-zinc-400 to-zinc-900 p-px shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-black rounded-[11px] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                ArenaFitPro
              </span>
              <span className="text-[8px] uppercase font-mono tracking-widest text-zinc-500 block mt-0.5">
                Gamification OS
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium tracking-wider uppercase text-zinc-400">
            <a href="#solucoes" className="hover:text-white transition-colors">Infraestrutura</a>
            <a href="#gamificacao" className="hover:text-white transition-colors">Gamificação</a>
            <a href="#calculadora" className="hover:text-white transition-colors">Calculadora</a>
            <a href="#planos" className="hover:text-white transition-colors text-white font-bold">Planos & Taxas</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-full transition-colors">
                Entrar
              </button>
            </Link>
            <Link href="/login">
              <button className="mono-button-primary px-4 sm:px-5 py-2 text-xs flex items-center gap-1.5">
                <span>Começar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* 4. Hero Section de Alta Conversão */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-6 perspective-container">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Estrelas Cromadas 3D Flutuantes */}
          <div className="absolute top-0 right-4 sm:right-12 hidden md:block">
            <Chrome3DStar size={130} delay={0} />
          </div>
          <div className="absolute top-28 right-28 sm:right-48 hidden lg:block opacity-70">
            <Chrome3DStar size={70} delay={1.5} />
          </div>
          <div className="absolute -top-10 left-10 hidden lg:block opacity-40">
            <Chrome3DStar size={55} delay={2.2} />
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-6">
              <Flame className="w-3.5 h-3.5 text-white" />
              Retenção Comprovada de até 94% em Desafios
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05] mb-6">
              Monetize seus Alunos com <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600">
                Desafios Fitness Gamificados
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
              A plataforma definitiva para <strong className="text-white">Personais, Consultorias e Academias</strong> criarem 
              desafios com validação por câmera nativa antifraude, squads cooperativos e 
              recebimento de inscrições via <strong className="text-white">Pix instantâneo D+0</strong> sem bitributação.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/login" className="w-full sm:w-auto">
                <button className="mono-button-primary w-full sm:w-auto h-13 px-8 text-sm flex items-center justify-center gap-2.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Criar Meu Desafio Grátis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <a href="#calculadora" className="w-full sm:w-auto">
                <button className="mono-button-secondary w-full sm:w-auto h-13 px-8 text-sm flex items-center justify-center gap-2">
                  <Calculator className="w-4 h-4 text-zinc-400" />
                  <span>Simular Meus Lucros</span>
                </button>
              </a>
            </div>

            {/* Badges de Confiança */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-white" /> Sem cartão para começar
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-white" /> Split Pix D+0 direto na conta
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-white" /> Antifraude GPS + Câmera Real
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Metrics & Social Proof Bar */}
      <section className="px-6 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl border border-white/[0.08] bg-zinc-950/70 backdrop-blur-2xl shadow-2xl">
          <div className="text-center p-3">
            <div className="text-3xl sm:text-4xl font-black text-white mb-1">94.8%</div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Conclusão de Desafios</div>
          </div>
          <div className="text-center p-3 border-l border-white/[0.06]">
            <div className="text-3xl sm:text-4xl font-black text-white mb-1">D+0</div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Liberação Pix na Conta</div>
          </div>
          <div className="text-center p-3 border-l sm:border-l border-white/[0.06]">
            <div className="text-3xl sm:text-4xl font-black text-white mb-1">0%</div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Fotos Antigas da Galeria</div>
          </div>
          <div className="text-center p-3 border-l border-white/[0.06]">
            <div className="text-3xl sm:text-4xl font-black text-white mb-1">4.2x</div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Aumento de LTV do Aluno</div>
          </div>
        </div>
      </section>

      {/* 6. Bento Grid de Features & Moat Tecnológico */}
      <section id="gamificacao" className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
              INFRAESTRUTURA COMPLETA
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              A ciência de manter alunos motivados até o último dia
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Grupos de WhatsApp perdem o engajamento na primeira semana. A ArenaFitPro combina 
              psicologia comportamental, cooperação em times e fintech nativa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
            {/* Card 1: Antifraude Câmera e GPS */}
            <SpotlightCard3D className="md:col-span-7 p-7 min-h-[320px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    CAMERA_GPS_VERIFIED
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 border border-white/10 px-2.5 py-0.5 rounded-full">
                    Patente Antifraude
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight mt-6 mb-2">
                  Câmera Nativa em Tempo Real & Coordenadas GPS
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                  O aluno precisa acionar a câmera dentro do app na hora do treino. É terminantemente 
                  impossível fazer upload de fotos da galeria ou fingir localização.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] backdrop-blur-xl mt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Validação Criptográfica</div>
                  <div className="text-xs font-mono text-white font-bold">UTC Timestamp + Sensor Gyro + GPS</div>
                </div>
                <div className="h-8 px-3 rounded-lg border border-white/20 bg-white/10 flex items-center justify-center font-mono text-xs text-white">
                  100% AUDITADO
                </div>
              </div>
            </SpotlightCard3D>

            {/* Card 2: Split Pix D+0 no Asaas */}
            <SpotlightCard3D className="md:col-span-5 p-7 min-h-[320px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-white" /> ASAAS_PIX_SPLIT
                  </span>
                  <span className="text-xs font-mono text-white font-bold">D+0 INSTANTÂNEO</span>
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight mt-6 mb-2">
                  Checkout Pix com Split Automático
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Sem intermediários. Quando o aluno se inscreve, sua comissão vai direto para a sua subconta. 
                  Zero bitributação e saque instantâneo para sua chave Pix.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] mt-6 flex items-center justify-between">
                <div className="text-xs font-mono">
                  <span className="text-zinc-500 block text-[10px]">INSCRIÇÃO RECEBIDA</span>
                  <span className="text-white font-bold">R$ 97,00 (Pix Copia e Cola)</span>
                </div>
                <div className="text-right text-xs font-mono">
                  <span className="text-zinc-500 block text-[10px]">SEU LÍQUIDO</span>
                  <span className="text-emerald-400 font-bold">R$ 85,36 (Liberado)</span>
                </div>
              </div>
            </SpotlightCard3D>

            {/* Card 3: Squads e Times Cooperativos */}
            <SpotlightCard3D className="md:col-span-4 p-6 min-h-[260px] flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-400" /> SQUADS_COOPERATIVOS
                </div>
                <h4 className="text-xl font-black text-white mb-2">Esquadrões & Times</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Os alunos se unem em equipes. A pontuação é somada, gerando um ambiente de companheirismo 
                  onde ninguém quer deixar o time na mão.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">🏆 Squad Guerreiros</span>
                <span className="text-white font-bold">1º Lugar (2.450 pts)</span>
              </div>
            </SpotlightCard3D>

            {/* Card 4: Mystery Box & Recompensas */}
            <SpotlightCard3D className="md:col-span-4 p-6 min-h-[260px] flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-zinc-400" /> GAMIFICATION_REWARDS
                </div>
                <h4 className="text-xl font-black text-white mb-2">Mystery Box & Streaks</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Caixas de recompensas que abrem conforme a sequência de treinos avança. Medalhas exclusivas 
                  e brindes que geram dopamina saudável.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">🎁 Ofensiva 14 Dias</span>
                <span className="text-amber-400 font-bold">DESBLOQUEADA</span>
              </div>
            </SpotlightCard3D>

            {/* Card 5: Freeze Shield & Anti-Churn */}
            <SpotlightCard3D className="md:col-span-4 p-6 min-h-[260px] flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> RETENTION_ENGINE
                </div>
                <h4 className="text-xl font-black text-white mb-2">Freeze Shield & Resgate</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  O aluno congela o streak em dias de emergência sem abandonar o desafio. Radar automático que 
                  avisa o treinador se algum aluno sumir por mais de 48h.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300">🛡️ Escudo Ativo</span>
                <span className="text-white font-bold">Streak Preservado</span>
              </div>
            </SpotlightCard3D>
          </div>
        </div>
      </section>

      {/* 7. Calculadora Interativa de Faturamento & Economia */}
      <section id="calculadora" className="py-20 px-6 border-t border-white/[0.06] relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
              SIMULADOR DE LUCRO REAL
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Veja quanto você lucra em cada desafio
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Arraste os seletores abaixo para simular a quantidade de alunos e o valor da inscrição do seu desafio:
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-zinc-950/90 backdrop-blur-2xl shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Sliders de Controle */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-zinc-300">
                      Quantidade de Alunos no Desafio
                    </label>
                    <span className="text-lg font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-xl">
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
                    className="w-full accent-white h-2 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-1">
                    <span>10 alunos</span>
                    <span>50 alunos</span>
                    <span>150 alunos</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-zinc-300">
                      Valor da Inscrição por Aluno
                    </label>
                    <span className="text-lg font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-xl">
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
                    className="w-full accent-white h-2 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-1">
                    <span>R$ 47</span>
                    <span>R$ 147</span>
                    <span>R$ 297</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-400 space-y-1">
                  <p>
                    💡 <strong className="text-white">Dica Pro:</strong> No plano Pro Coach, sua taxa cai de 18% para apenas 12%. 
                    Com {studentsCount} alunos a R$ {ticketPrice}, você ganha{' '}
                    <strong className="text-emerald-400">
                      +R$ {proAdvantage.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>{' '}
                    extras a mais — o plano de R$ 89,90 se paga sozinho e sobra lucro!
                  </p>
                </div>
              </div>

              {/* Card de Resultados */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-black border border-white/10 space-y-5">
                <div className="text-center pb-4 border-b border-white/[0.08]">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block mb-1">
                    Faturamento Bruto Total
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-900/60">
                    <div>
                      <span className="text-zinc-400 block font-sans text-xs">Plano Starter (Taxa 18%)</span>
                      <span className="text-[10px] text-zinc-500">Gratuito</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-300">
                      R$ {netStarter.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/10 border border-white/20">
                    <div>
                      <span className="text-white font-sans text-xs font-bold flex items-center gap-1.5">
                        Plano Pro (Taxa 12%) <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded font-bold">RECOMENDADO</span>
                      </span>
                      <span className="text-[10px] text-zinc-400">R$ 89,90/mês</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">
                      R$ {netPro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-900/60">
                    <div>
                      <span className="text-zinc-300 font-sans text-xs">Plano Studio (Taxa 8%)</span>
                      <span className="text-[10px] text-zinc-500">Academias & Boxes</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      R$ {netStudio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <Link href="/login" className="block w-full">
                  <button className="mono-button-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2">
                    Começar Meu Desafio Agora
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 8. Pricing Section com os 3 Planos Detalhados */}
      <section id="planos" className="py-24 px-6 border-t border-white/[0.06] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
              TABELA DE INVESTIMENTO TRANSPARENTE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Escolha o plano ideal para a sua escala
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Comece 100% grátis sem cartão de crédito e faça upgrade conforme sua comunidade crescer.
            </p>

            {/* Toggle Mensal / Anual */}
            <div className="mt-8 inline-flex items-center p-1.5 rounded-full border border-white/10 bg-zinc-950 shadow-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Anual</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  billingCycle === 'yearly' ? 'bg-black text-white' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Grid dos 3 Cards de Preço */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* PLANO 1: Starter Coach */}
            <SpotlightCard3D className="p-8 flex flex-col justify-between border-white/[0.08] bg-zinc-950/80">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Iniciante
                  </span>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/10 text-white font-bold">
                    GRÁTIS
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-2">Starter Coach</h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Perfeito para personais lançando seu primeiro desafio online com zero risco financeiro.
                </p>

                <div className="mb-6 pb-6 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">R$ 0</span>
                    <span className="text-xs text-zinc-500 font-mono">/mês</span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-2 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-zinc-400" />
                    Taxa de split: <strong className="text-white">18% sobre inscrições</strong>
                  </div>
                </div>

                {/* Lista O que vem */}
                <div className="space-y-3 mb-6">
                  <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold">
                    O que está incluído:
                  </div>
                  <ul className="space-y-2.5 text-xs text-zinc-300">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>1 Desafio ativo</strong> por vez</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Até <strong>15 alunos</strong> no desafio</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Validação com Câmera Nativa antifraude</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Geolocalização GPS em tempo real</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Ranking individual automático</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Saque Pix D+0 direto na sua conta</span>
                    </li>
                  </ul>
                </div>

                {/* Lista O que NÃO vem */}
                <div className="space-y-2 mb-8 pt-4 border-t border-white/[0.06]">
                  <div className="text-[11px] font-mono uppercase text-zinc-500">
                    Não inclui:
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-500">
                    <li className="flex items-center gap-2.5">
                      <X className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span>Squads & Times Cooperativos</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <X className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span>Mystery Box de Recompensas</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <X className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span>Módulo de Patrocinadores (Sponsors)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <X className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span>Múltiplos desafios simultâneos</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link href="/login" className="block w-full">
                <button className="mono-button-secondary w-full py-3 text-xs font-bold">
                  Começar Grátis Sem Cartão
                </button>
              </Link>
            </SpotlightCard3D>

            {/* PLANO 2: Pro Coach (DESTAQUE / MAIS ESCOLHIDO) */}
            <SpotlightCard3D className="p-8 flex flex-col justify-between border-white/30 bg-zinc-950/90 shadow-[0_0_40px_rgba(255,255,255,0.15)] relative scale-[1.02]">
              {/* Badge Flutuante no Topo */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider shadow-xl flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-black" />
                MAIS ESCOLHIDO • 94% RETENÇÃO
              </div>

              <div>
                <div className="flex justify-between items-center mb-4 mt-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Profissional
                  </span>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white text-black font-extrabold">
                    PRO
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-2">Pro Coach</h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Para personais e consultorias que buscam escala, gamificação avançada e taxa reduzida.
                </p>

                <div className="mb-6 pb-6 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      R$ {billingCycle === 'monthly' ? '89,90' : '71,90'}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">/mês</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                      Cobrado anualmente (economia de R$ 216/ano)
                    </span>
                  )}
                  <div className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-1.5 font-bold">
                    <Percent className="w-3.5 h-3.5 text-emerald-400" />
                    Taxa reduzida: 12% (Economize 33% em taxas!)
                  </div>
                </div>

                {/* Lista O que vem */}
                <div className="space-y-3 mb-6">
                  <div className="text-[11px] font-mono uppercase text-white font-bold">
                    Tudo do Starter, mais:
                  </div>
                  <ul className="space-y-2.5 text-xs text-zinc-200">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span>Até <strong>5 Desafios simultâneos</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span>Até <strong>100 alunos por desafio</strong> (total 500)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span><strong>Squads & Times Cooperativos</strong> liberados</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span><strong>Mystery Box de Recompensas</strong> & Badges</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span><strong>Freeze Shield (Escudo de Ofensiva)</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span><strong>Radar Anti-Churn</strong> (Alunos em risco)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span>Suporte prioritário via WhatsApp</span>
                    </li>
                  </ul>
                </div>

                {/* Lista O que NÃO vem */}
                <div className="space-y-2 mb-8 pt-4 border-t border-white/[0.06]">
                  <div className="text-[11px] font-mono uppercase text-zinc-500">
                    Não inclui:
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-500">
                    <li className="flex items-center gap-2.5">
                      <X className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span>Módulo de Patrocinadores Locais (Sponsors)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <X className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span>Múltiplos treinadores vinculados (Multi-Coach)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link href="/login" className="block w-full">
                <button className="mono-button-primary w-full py-3.5 text-xs font-black shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2">
                  <span>Assinar Pro Coach</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </SpotlightCard3D>

            {/* PLANO 3: Studio & Gym Elite */}
            <SpotlightCard3D className="p-8 flex flex-col justify-between border-white/[0.08] bg-zinc-950/80">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Academias & Boxes
                  </span>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/10 text-white font-bold">
                    ELITE
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-2">Studio & Gym Elite</h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Para boxes de CrossFit, estúdios funcionais e academias com grandes comunidades e marcas parceiras.
                </p>

                <div className="mb-6 pb-6 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      R$ {billingCycle === 'monthly' ? '279,90' : '223,90'}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">/mês</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                      Cobrado anualmente (economia de R$ 672/ano)
                    </span>
                  )}
                  <div className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-1.5 font-bold">
                    <Percent className="w-3.5 h-3.5 text-emerald-400" />
                    Menor taxa do mercado: <strong className="text-white">Apenas 8%</strong>
                  </div>
                </div>

                {/* Lista O que vem */}
                <div className="space-y-3 mb-6">
                  <div className="text-[11px] font-mono uppercase text-white font-bold">
                    Tudo do Pro, mais:
                  </div>
                  <ul className="space-y-2.5 text-xs text-zinc-200">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Desafios ILIMITADOS (∞)</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Alunos ILIMITADOS (∞)</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Módulo de Patrocinadores (Sponsors)</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Cupons e parcerias com marcas locais</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Acesso Multi-Coach</strong> (vários professores)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Split Pix D+0 com a menor taxa: <strong>8%</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Gerente de contas VIP dedicado</span>
                    </li>
                  </ul>
                </div>

                {/* Lista O que NÃO vem */}
                <div className="space-y-2 mb-8 pt-4 border-t border-white/[0.06]">
                  <div className="text-[11px] font-mono uppercase text-zinc-500">
                    Não inclui:
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-400">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Sem limites! 100% dos recursos desbloqueados.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link href="/login" className="block w-full">
                <button className="mono-button-secondary w-full py-3 text-xs font-bold">
                  Contratar Studio Elite
                </button>
              </Link>
            </SpotlightCard3D>

          </div>

          {/* 9. Tabela Comparativa Detalhada Estilo Dark Matrix */}
          <div className="mt-20">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Comparativo Detalhado de Recursos
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Entenda exatamente o que está contemplado em cada nível
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-zinc-950/70 backdrop-blur-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-4 sm:p-5 font-mono text-zinc-400 uppercase tracking-wider text-[11px]">Recursos & Capacidade</th>
                    <th className="p-4 sm:p-5 font-bold text-center text-zinc-300">Starter Coach</th>
                    <th className="p-4 sm:p-5 font-bold text-center text-white bg-white/5">Pro Coach</th>
                    <th className="p-4 sm:p-5 font-bold text-center text-zinc-300">Studio & Gym</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Mensalidade</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-400 font-mono font-bold">R$ 0</td>
                    <td className="p-4 sm:p-5 text-center text-white font-mono font-bold bg-white/5">R$ 89,90/mês</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-300 font-mono font-bold">R$ 279,90/mês</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Taxa de Split da Plataforma</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-400 font-mono">18%</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-mono font-bold bg-white/5">12%</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-mono font-bold">8% (mínima)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Desafios Ativos Simultâneos</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-400">1 Desafio</td>
                    <td className="p-4 sm:p-5 text-center text-white font-bold bg-white/5">Até 5 Desafios</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">Ilimitados (∞)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Limite de Alunos por Desafio</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-400">Até 15 alunos</td>
                    <td className="p-4 sm:p-5 text-center text-white font-bold bg-white/5">Até 100 alunos</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">Ilimitados (∞)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Câmera Nativa Antifraude & GPS</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Saque Pix D+0 no Asaas</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Squads & Times Cooperativos</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-600 font-bold">✗</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓ Liberado</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Mystery Box & Streaks de Treino</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-600 font-bold">✗</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓ Liberado</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Radar Anti-Churn (Alunos em Risco)</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-600 font-bold">✗</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold bg-white/5">✓ Liberado</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Módulo de Patrocinadores (Sponsors)</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-600 font-bold">✗</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-600 font-bold bg-white/5">✗</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Multi-Coach (Equipe de Treinadores)</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-600 font-bold">✗</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-600 font-bold bg-white/5">✗</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✓ Liberado</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 text-zinc-300 font-medium">Canal de Suporte</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-400">Comunidade & Docs</td>
                    <td className="p-4 sm:p-5 text-center text-white font-bold bg-white/5">WhatsApp Prioritário</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">Gerente VIP Dedicado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 10. Seção FAQ com Accordion Interativo */}
      <section id="faq" className="py-24 px-6 border-t border-white/[0.06] relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 block flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> DÚVIDAS FREQUENTES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Perguntas e Respostas
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Tudo o que você precisa saber sobre o funcionamento da plataforma, pagamentos e regras.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/[0.08] bg-zinc-950/70 overflow-hidden transition-colors hover:border-white/20"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-200 hover:text-white transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-0 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04] mt-2">
                      <p className="pt-3">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center p-6 rounded-3xl border border-white/[0.08] bg-zinc-950/50">
            <p className="text-xs text-zinc-400">
              Ainda tem alguma dúvida específica para o seu negócio?
            </p>
            <Link
              href="/login"
              className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-white hover:underline"
            >
              Falar com o time pelo suporte
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Grand Final CTA Section */}
      <section className="py-24 px-6 border-t border-white/[0.06] relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-6">
            <Trophy className="w-3.5 h-3.5 text-white" />
            Junte-se à Elite dos Treinadores
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            Transforme seus alunos em uma <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600">
              comunidade imparável
            </span>
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Crie seu primeiro desafio em menos de 3 minutos. Convide seus alunos, receba inscrições por Pix 
            e lidere com a tecnologia mais moderna do mercado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="mono-button-primary w-full sm:w-auto h-14 px-10 text-sm font-bold flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(255,255,255,0.3)]">
                <span>Criar Meu Desafio Grátis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <button className="mono-button-secondary w-full sm:w-auto h-14 px-8 text-sm">
                Acessar Minha Conta
              </button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-zinc-500">
            <span>• Sem taxa de adesão</span>
            <span>• Sem fidelidade contratual</span>
            <span>• Configuração em 3 minutos</span>
          </div>
        </div>
      </section>

      {/* 12. Rodapé Institucional Monocromático de Alta Fidelidade */}
      <footer className="border-t border-white/[0.06] bg-black py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-xs text-zinc-500 font-mono">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" />
                </svg>
              </div>
              <span className="font-extrabold text-white text-sm">ArenaFitPro</span>
            </div>
            <span>© {new Date().getFullYear()} ArenaFitPro Ltda. Todos os direitos reservados.</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#solucoes" className="hover:text-white transition-colors">Infraestrutura</a>
            <a href="#gamificacao" className="hover:text-white transition-colors">Gamificação</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos & Taxas</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-white transition-colors">Painel do Treinador</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
