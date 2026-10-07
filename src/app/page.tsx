import Link from 'next/link';
import { 
  Dumbbell, 
  Trophy, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Camera, 
  Sparkles, 
  Users, 
  Zap, 
  CheckCircle2, 
  BarChart3, 
  Gift, 
  Layers, 
  Lock, 
  ChevronRight, 
  TrendingUp, 
  Star,
  MapPin,
  Clock,
  Eye,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black font-sans relative overflow-x-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-emerald-500/12 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-40 w-[600px] h-[600px] bg-cyan-500/10 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[1600px] -right-40 w-[700px] h-[700px] bg-amber-500/8 blur-[180px] rounded-full pointer-events-none -z-10" />

      {/* Top Specular Notification Ticker */}
      <div className="bg-zinc-950/70 border-b border-white/[0.06] text-zinc-300 py-2.5 px-4 text-xs tracking-wide backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
          <span className="font-semibold text-white">ArenaPro 2.5 Liquid Glass:</span>
          <span className="hidden sm:inline text-zinc-400">
            Câmera com GPS em tempo real, limite biológico de 1 treino/cardio por dia e cofre anti-desistência liberados.
          </span>
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 inline-flex items-center gap-0.5 hover:underline">
            Experimentar Agora <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Floating Dynamic Island Header */}
      <header className="sticky top-4 z-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto liquid-glass-pill px-5 sm:px-8 h-18 flex items-center justify-between shadow-2xl transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white block leading-none">
                Arena<span className="text-emerald-400">Pro</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400 block mt-0.5">
                Enterprise Fitness OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-zinc-300">
            <a href="#solucoes" className="hover:text-emerald-400 transition-colors">Soluções</a>
            <a href="#gamificacao" className="hover:text-emerald-400 transition-colors">Gamificação</a>
            <a href="#antifraude" className="hover:text-emerald-400 transition-colors">Câmera & GPS</a>
            <a href="#resultados" className="hover:text-emerald-400 transition-colors">Resultados</a>
            <a href="#planos" className="hover:text-emerald-400 transition-colors">Planos</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="hidden sm:inline-flex text-xs font-bold text-zinc-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
                Entrar
              </button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-4.5 rounded-xl text-xs shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 transition-all">
                Criar Desafio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-28 pb-24 px-6 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          
          {/* Specular Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-bold mb-8 backdrop-blur-xl shadow-lg shadow-emerald-500/10">
            <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>A Primeira Plataforma B2B2C de Retenção & Desafios Fitness Gamificados</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.05] max-w-5xl mb-8">
            Transforme alunos em <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              uma comunidade viciada
            </span>{' '}
            em disciplina
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 max-w-3xl leading-relaxed mb-10 font-normal">
            O <strong className="text-white font-semibold">ArenaPro</strong> é a infraestrutura completa para Personais, Nutricionistas e Academias 
            multiplicarem o faturamento criando desafios que os alunos completam até o final. Câmera antifraude nativa com GPS, esquadrões, 
            roleta de recompensas e proteção contra desistência.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-sm sm:text-base font-black bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xl shadow-emerald-500/25 gap-2 rounded-2xl active:scale-95 transition-all">
                Criar Meu Desafio Grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-sm sm:text-base font-semibold border-white/10 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-200 rounded-2xl backdrop-blur-xl">
                Sou Aluno — Fazer Check-in
              </Button>
            </Link>
          </div>

          {/* Liquid Glass Interactive Mockup Bento Preview */}
          <div className="w-full max-w-5xl liquid-glass rounded-3xl p-4 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-zinc-400 font-mono ml-2">app.arenapro.com.br/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Ao Vivo no Servidor
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Card 1: Câmera & GPS */}
              <div className="liquid-glass-emerald rounded-2xl p-5 space-y-3 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Camera className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Antifraude Ativo
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-base">Check-in com GPS & Horário</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Fotos só podem ser tiradas na hora pela câmera nativa com carimbo de geolocalização auditável. Bloqueio automático de fotos salvas.
                </p>
                <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-emerald-300/80">
                  <MapPin className="h-3.5 w-3.5" /> -23.5505, -46.6333 • 07:14:02
                </div>
              </div>

              {/* Card 2: Freeze Shield & Retenção */}
              <div className="liquid-glass-cyan rounded-2xl p-5 space-y-3 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    Retenção 94%
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-base">Freeze Shield & Limite Biológico</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Limite de 1 treino e 1 cardio por dia com contagem regressiva até meia-noite. Escudo protetor de streak congela falhas sem desanimar.
                </p>
                <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-cyan-300/80">
                  <Clock className="h-3.5 w-3.5" /> Próximo cardio libera em 14h 22m
                </div>
              </div>

              {/* Card 3: Mystery Box & Ranking */}
              <div className="liquid-glass-amber rounded-2xl p-5 space-y-3 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Gift className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Dopamina Saudável
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-base">Roleta, Mystery Box & Squads</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Quem conclui 100% da semana ganha bônus de pontuação (+20 pts) e abre caixas de recompensas com prêmios de marcas patrocinadoras.
                </p>
                <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-amber-300/80">
                  <Trophy className="h-3.5 w-3.5" /> 1º Lugar: Esquadrão Titãs
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Stats Bar */}
          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl border border-white/[0.08] bg-zinc-900/30 backdrop-blur-xl mt-12 shadow-xl">
            <div className="text-center p-2">
              <div className="text-3xl font-black text-white mb-1">+94%</div>
              <div className="text-xs text-zinc-400 font-medium">Taxa de Conclusão</div>
            </div>
            <div className="text-center p-2 border-l border-white/[0.06]">
              <div className="text-3xl font-black text-emerald-400 mb-1">4.2x</div>
              <div className="text-xs text-zinc-400 font-medium">Mais Retenção Mensal</div>
            </div>
            <div className="text-center p-2 border-l sm:border-l border-white/[0.06]">
              <div className="text-3xl font-black text-cyan-400 mb-1">0%</div>
              <div className="text-xs text-zinc-400 font-medium">Fraude de Galeria</div>
            </div>
            <div className="text-center p-2 border-l border-white/[0.06]">
              <div className="text-3xl font-black text-amber-400 mb-1">100k+</div>
              <div className="text-xs text-zinc-400 font-medium">Check-ins Validados</div>
            </div>
          </div>

        </div>
      </section>

      {/* Solutions & Architecture Section */}
      <section id="solucoes" className="py-24 px-6 border-b border-white/[0.06] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 mb-3">Engenharia de Engajamento</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Por que grupos de WhatsApp falham e o ArenaPro escala?
            </h3>
            <p className="text-zinc-400 text-base sm:text-lg">
              Grupos viram uma bagunça ilegível e planilhas exigem horas de conferência manual. O ArenaPro automatiza 100% da auditoria, pontuação e rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="liquid-glass rounded-3xl p-8 hover:border-emerald-500/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Câmera & GPS Antifraude</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Captura ao vivo no dispositivo com registro de geolocalização e carimbo de horário na foto. Zero fotos recicladas de meses atrás.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Sem fotos antigas da galeria</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Carimbo de coordenadas e hora</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Comentários integrados ao feed</li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="liquid-glass rounded-3xl p-8 hover:border-cyan-500/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Auditoria Tinder-Style</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Interface de swipe ultrarrápida: deslize para a direita para aprovar e esquerda para reprovar dezenas de check-ins por minuto.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Aprovação com atalhos de teclado</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Feedback instantâneo para o aluno</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Pontuação calculada via banco</li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="liquid-glass rounded-3xl p-8 hover:border-amber-500/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Ranking Realtime & Squads</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Placar em tempo real por pontos individuais e pontuação agregada de equipes. Ninguém quer ser o elo fraco do esquadrão.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" /> Disputa de times cooperativos</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" /> Proteção de streak com escudo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" /> Feed com curtidas e comentários</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Engine & Behavioral Science */}
      <section id="gamificacao" className="py-24 px-6 border-b border-white/[0.06] bg-zinc-950/40 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-400 text-xs font-bold mb-4">
                <Flame className="h-4 w-4" /> Psicologia Comportamental Aplicada
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                Mecanismos que impedem <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                  o abandono precoce
                </span>
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-8">
                Adaptamos os mesmos gatilhos de engajamento do Duolingo e Strava para que alunos nunca desanimem ou abandonem o desafio na segunda semana:
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base mb-1">Freeze Shield (Proteção de Falha)</h4>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Evita o efeito abandono: se o aluno falhar por um dia imprevisto, o escudo salva o streak, mantendo o sentimento de progresso ininterrupto.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Gift className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base mb-1">Mystery Boxes & Roleta</h4>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Caixas misteriosas desbloqueadas por disciplina contínua. Prêmios físicos e cupons de marcas locais para os mais dedicados.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base mb-1">Squads & Pressão Social Positiva</h4>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      Grupos de 4 a 6 pessoas somam pontos conjuntamente. Quando alguém pensa em faltar, a equipe incentiva e cobra a presença.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Glass Showcase Card */}
            <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Status Semanal</span>
                  <h3 className="text-lg font-black text-white">Semana 2 de 4 • Foco Total</h3>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                  92% Meta Concluída
                </div>
              </div>

              {/* Weekly Rings / Progress Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-zinc-300">Treinos (6 por semana)</span>
                    <span className="text-emerald-400">5 / 6 concluidos</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '83%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-zinc-300">Cardios (7 por semana)</span>
                    <span className="text-cyan-400">6 / 7 concluidos</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-zinc-300">Refeições Limpas (4 diárias)</span>
                    <span className="text-amber-400">100% no alvo</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                    +20
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Bônus Semanal Liberado!</p>
                    <p className="text-[10px] text-zinc-400">Conclua 100% da grade e ganhe 20 pontos extras.</p>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  Pronto
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section id="planos" className="py-24 px-6 border-b border-white/[0.06] relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-6">
            <Sparkles className="h-4 w-4" /> Acesso Instantâneo Sem Risco
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
            Pronto para faturar alto e fidelizar seus alunos?
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
            Crie sua conta profissional em menos de 2 minutos. Lance turmas com link de convite exclusivo, 
            defina se é gratuito ou pago e tenha total controle sobre sua marca.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-base font-black bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xl shadow-emerald-500/25 rounded-2xl active:scale-95 transition-all">
                Começar Desafio Gratuito
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base border-white/10 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-200 rounded-2xl">
                Acessar Plataforma
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sem cartão de crédito</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Cancele quando quiser</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Suporte dedicado via WhatsApp</span>
          </div>
        </div>
      </section>

      {/* Institutional Enterprise Footer */}
      <footer className="bg-zinc-950 border-t border-white/[0.06] py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5">
                <div className="h-full w-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <Dumbbell className="h-4.5 w-4.5 text-emerald-400" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Arena<span className="text-emerald-400">Pro</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mb-6">
              Plataforma B2B2C de gamificação de hábitos saudáveis, treinos e nutrição. Aumente o LTV de alunos e fidelize sua comunidade através da tecnologia e psicologia comportamental.
            </p>
            <div className="text-xs text-zinc-500">
              Feito para impulsionar treinadores, academias e atletas em todo o Brasil.
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Produto</h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><a href="#solucoes" className="hover:text-emerald-400 transition-colors">Câmera & GPS Antifraude</a></li>
              <li><a href="#solucoes" className="hover:text-emerald-400 transition-colors">Auditoria Tinder-Style</a></li>
              <li><a href="#gamificacao" className="hover:text-emerald-400 transition-colors">Leaderboard em Tempo Real</a></li>
              <li><a href="#gamificacao" className="hover:text-emerald-400 transition-colors">Esquadrões & Squads</a></li>
              <li><a href="#gamificacao" className="hover:text-emerald-400 transition-colors">Freeze Shield</a></li>
              <li><a href="#gamificacao" className="hover:text-emerald-400 transition-colors">Cofre de Transformação</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Públicos</h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Personal Trainers</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Nutricionistas</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Academias & Studios</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Boxes de Cross Training</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Marcas Patrocinadoras</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Segurança & Legal</h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Termos de Uso</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Privacidade & LGPD</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Política Antifraude</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Status do Sistema</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Central de Suporte</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} ArenaPro Technologies. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-400" /> Criptografia de Ponta a Ponta</span>
            <span>Arquitetura Supabase & Vercel Edge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
