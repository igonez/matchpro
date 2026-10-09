'use client';

import React from 'react';
import Link from 'next/link';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans relative overflow-x-hidden">
      {/* 1. Background 3D Animado em Todo o Site */}
      <Monochrome3DBackground />

      {/* 2. Top Specular Release Pill */}
      <div className="pt-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-zinc-950/80 backdrop-blur-xl text-zinc-300 text-[11px] font-medium tracking-wide shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-white font-semibold">Arena Fit Pro 3.0</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400 hidden sm:inline">Arquitetura Monocromática & Gamificação de Alta Performance</span>
            <Link
              href="/login"
              className="text-white hover:text-zinc-300 font-bold ml-1 inline-flex items-center gap-1 group"
            >
              Acessar
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

      {/* 3. Floating Navbar Monocromática Estilo 21st.dev / Linear */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 mt-2">
        <div className="max-w-5xl mx-auto mono-glass-pill px-6 h-16 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo Monocromático em Metal Cromo */}
            <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-white via-zinc-400 to-zinc-900 p-px shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-black rounded-[11px] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                Arena Fit Pro
              </span>
              <span className="text-[8px] uppercase font-mono tracking-widest text-zinc-500 block mt-0.5">
                Enterprise OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wider uppercase text-zinc-400">
            <a href="#solucoes" className="hover:text-white transition-colors">Infraestrutura</a>
            <a href="#sistema-3d" className="hover:text-white transition-colors">Sistema 3D</a>
            <a href="#retencao" className="hover:text-white transition-colors">Retenção</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="text-xs font-semibold text-zinc-400 hover:text-white px-3.5 py-1.5 rounded-full transition-colors">
                Entrar
              </button>
            </Link>
            <Link href="/login">
              <button className="mono-button-primary px-5 py-2 text-xs">
                Começar
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* 4. Hero Section com Elementos 3D e Estrelas Cromadas Flutuantes */}
      <section className="relative pt-20 sm:pt-28 pb-20 px-6 perspective-container">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Estrelas Cromadas 3D Flutuantes (Idênticas à Referência do Usuário) */}
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
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white leading-[1.02] mb-6">
              Escalabilidade <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600">
                Monocromática 3D
              </span>
            </h1>

            <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
              A infraestrutura definitiva para Personais e Academias liderarem desafios fitness de alto valor percebido. 
              Validação por geolocalização e câmera nativa em tempo real.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/login" className="w-full sm:w-auto">
                <button className="mono-button-primary w-full sm:w-auto h-13 px-8 text-sm flex items-center justify-center gap-2">
                  <span>Iniciar Plataforma</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="mono-button-secondary w-full sm:w-auto h-13 px-8 text-sm">
                  Acessar Check-in de Aluno
                </button>
              </Link>
            </div>
          </div>

          {/* 5. Showcase Bento 3D Inclinado em Perspectiva (Inspirado na Imagem de Referência) */}
          <div className="w-full max-w-5xl mt-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
              
              {/* Card Grande 1: Câmera & GPS Auditoria */}
              <SpotlightCard3D className="md:col-span-7 p-7 min-h-[320px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      GEO_VERIFICATION_ACTIVE
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 border border-white/10 px-2 py-0.5 rounded-full">
                      Antifraude v3
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight mt-6 mb-2">
                    Câmera Nativa & Coordenadas GPS
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                    Check-in obrigatório em tempo real pelo dispositivo. Fotos salvas na galeria são bloqueadas pelo kernel de segurança.
                  </p>
                </div>

                {/* Sub-card Monocromático com Efeito 3D */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] backdrop-blur-xl mt-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-zinc-500 uppercase">Localização Validada</div>
                    <div className="text-xs font-mono text-white font-bold">-23.550520, -46.633308 • 07:14:02 UTC</div>
                  </div>
                  <div className="h-8 px-3 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center font-mono text-xs text-white">
                    VERIFICADO
                  </div>
                </div>
              </SpotlightCard3D>

              {/* Card 2: Retenção & Streak */}
              <SpotlightCard3D className="md:col-span-5 p-7 min-h-[320px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <span className="font-mono text-xs text-zinc-400">RETENCAO_ALUNOS</span>
                    <span className="text-xs font-mono text-white font-bold">94.8%</span>
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight mt-6 mb-2">
                    Freeze Shield & Ofensiva
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Mecanismo de blindagem contra desistência prematura. O aluno congela o streak em dias imprevistos sem perder o ritmo.
                  </p>
                </div>

                {/* Barra de Progresso Geométrica Minimalista */}
                <div className="space-y-2 mt-6">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Semana 2 de 4</span>
                    <span className="text-white font-bold">100% Meta</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900 border border-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-zinc-500 via-zinc-200 to-white rounded-full w-full" />
                  </div>
                </div>
              </SpotlightCard3D>

              {/* Card 3: Auditoria Express em 1 Clique */}
              <SpotlightCard3D className="md:col-span-4 p-6 min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                    SWIPE_AUDIT_INTERFACE
                  </div>
                  <h4 className="text-xl font-black text-white mb-2">Auditoria Express</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Aprove ou recuse dezenas de check-ins por minuto com feedback imediato pro aluno.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <div className="flex-1 py-2 text-center rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
                    ← Recusar
                  </div>
                  <div className="flex-1 py-2 text-center rounded-xl bg-white text-black text-xs font-mono font-bold">
                    Aprovar →
                  </div>
                </div>
              </SpotlightCard3D>

              {/* Card 4: Squads & Times Cooperativos */}
              <SpotlightCard3D className="md:col-span-4 p-6 min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                    COOPERATIVE_SQUADS
                  </div>
                  <h4 className="text-xl font-black text-white mb-2">Esquadrões</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Equipes cooperativas com pontuação agregada. Pressão social positiva que anula faltas.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">1º Squad Titãs</span>
                  <span className="text-white font-bold">+1.840 pts</span>
                </div>
              </SpotlightCard3D>

              {/* Card 5: Limite Biológico de Treinos */}
              <SpotlightCard3D className="md:col-span-4 p-6 min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                    BIOLOGICAL_LIMIT
                  </div>
                  <h4 className="text-xl font-black text-white mb-2">1 Treino & 1 Cardio/Dia</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Bloqueio com contagem regressiva até 23:59:59 para preservar a saúde e consistência real.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-300 border-t border-white/10 pt-3">
                  <span>Próximo treino:</span>
                  <span className="text-white font-bold">Amanhã 00:00:00</span>
                </div>
              </SpotlightCard3D>

            </div>
          </div>

          {/* Social Proof Stats Bar Monocromática */}
          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl border border-white/[0.08] bg-black/70 backdrop-blur-2xl mt-12 shadow-2xl">
            <div className="text-center p-2">
              <div className="text-3xl font-black text-white mb-1">+94%</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Conclusão</div>
            </div>
            <div className="text-center p-2 border-l border-white/[0.06]">
              <div className="text-3xl font-black text-white mb-1">4.2x</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">LTV Aluno</div>
            </div>
            <div className="text-center p-2 border-l sm:border-l border-white/[0.06]">
              <div className="text-3xl font-black text-white mb-1">0%</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Fraude de Foto</div>
            </div>
            <div className="text-center p-2 border-l border-white/[0.06]">
              <div className="text-3xl font-black text-white mb-1">100k+</div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Check-ins</div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Seção de Arquitetura & Engenharia */}
      <section id="solucoes" className="py-24 px-6 border-t border-white/[0.06] relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
              ENGINEERING_SPEC
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Por que métodos comuns falham e o Arena Fit Pro escala?
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Grupos e planilhas perdem tração em 10 dias. Criamos um sistema automatizado centrado em 
              física de consistência e compromisso comunitário.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpotlightCard3D className="p-7">
              <div className="text-xs font-mono text-zinc-500 mb-3">01 // SEGURANÇA</div>
              <h4 className="text-lg font-black text-white mb-2">Câmera e Metadados</h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Dispositivo aciona sensor fotográfico diretamente no browser. Metadados de hora, data e coordenadas GPS carimbados automaticamente.
              </p>
              <div className="text-[11px] font-mono text-zinc-500">→ Auditoria sem margem de dúvida</div>
            </SpotlightCard3D>

            <SpotlightCard3D className="p-7">
              <div className="text-xs font-mono text-zinc-500 mb-3">02 // RETENÇÃO</div>
              <h4 className="text-lg font-black text-white mb-2">Escudo de Ofensiva</h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Proteção psicológica contra a quebra de sequência. O aluno se mantém motivado mesmo perante imprevistos da rotina.
              </p>
              <div className="text-[11px] font-mono text-zinc-500">→ Zero efeito bola de neve</div>
            </SpotlightCard3D>

            <SpotlightCard3D className="p-7">
              <div className="text-xs font-mono text-zinc-500 mb-3">03 // COOPERAÇÃO</div>
              <h4 className="text-lg font-black text-white mb-2">Ranking e Squads</h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Leaderboard atualizado instantaneamente por triggers do banco de dados. Grupos cobram e estimulam a participação mútua.
              </p>
              <div className="text-[11px] font-mono text-zinc-500">→ Retenção orientada à comunidade</div>
            </SpotlightCard3D>
          </div>
        </div>
      </section>

      {/* 7. CTA / Pricing Section Monocromático */}
      <section id="planos" className="py-24 px-6 border-t border-white/[0.06] relative">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3 block">
            DEPLOY_YOUR_CHALLENGE
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6">
            Pronto para liderar sua comunidade?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-10">
            Configure seu primeiro desafio em minutos. Convide seus alunos com links exclusivos e gerencie tudo a partir do Cockpit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="mono-button-primary w-full sm:w-auto h-13 px-10 text-sm font-bold flex items-center justify-center gap-2">
                Criar Desafio Gratuito
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <button className="mono-button-secondary w-full sm:w-auto h-13 px-8 text-sm">
                Acessar Plataforma
              </button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-zinc-500">
            <span>• Sem cartão para iniciar</span>
            <span>• Auditoria em tempo real</span>
            <span>• Criptografia de ponta a ponta</span>
          </div>
        </div>
      </section>

      {/* 8. Rodapé Institucional Monocromático de Alta Fidelidade */}
      <footer className="border-t border-white/[0.06] bg-black py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm">Arena Fit Pro</span>
            <span>© {new Date().getFullYear()}</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/login" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/login" className="hover:text-white transition-colors">Segurança</Link>
            <Link href="/login" className="hover:text-white transition-colors">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
