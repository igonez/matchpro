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
  MessageSquare,
  Lock,
  ChevronRight,
  TrendingUp,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black font-sans relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-40 w-[500px] h-[500px] bg-teal-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[1400px] -right-40 w-[600px] h-[600px] bg-orange-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      {/* Institutional Top Notification Bar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 text-zinc-300 py-2 px-4 text-xs tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Nova Versão 2.4 Liberada:</span>
          <span className="hidden sm:inline text-zinc-400">Esquadrões, Cofre da Transformação e Mystery Boxes agora ativos para todos os planos.</span>
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 inline-flex items-center gap-0.5 underline">
            Experimente Grátis <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-white block leading-none">
                Match<span className="text-emerald-400">Pro</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mt-0.5">
                Enterprise Fitness Platform
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#solucoes" className="hover:text-emerald-400 transition-colors">Soluções</a>
            <a href="#gamificacao" className="hover:text-emerald-400 transition-colors">Gamificação</a>
            <a href="#como-funciona" className="hover:text-emerald-400 transition-colors">Como Funciona</a>
            <a href="#depoimentos" className="hover:text-emerald-400 transition-colors">Resultados</a>
            <a href="#planos" className="hover:text-emerald-400 transition-colors">Planos</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white font-medium hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
                Acessar Plataforma
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 shadow-lg shadow-emerald-500/25">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-semibold mb-8 backdrop-blur-md shadow-inner shadow-emerald-500/10">
            <Sparkles className="h-4 w-4 animate-spin text-emerald-400" style={{ animationDuration: '6s' }} />
            <span>A Primeira Plataforma B2B2C de Retenção e Desafios Gamificados</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-5xl mb-8">
            Transforme alunos ocasionais em <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              uma comunidade viciada em resultados
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 max-w-3xl leading-relaxed mb-10">
            O MatchPro é a infraestrutura definitiva para Personais Trainers, Nutricionistas e Academias criarem 
            desafios de alto engajamento. Check-in com câmera antifraude nativa, esquadrões cooperativos, rankings em tempo real e proteção de ofensiva.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xl shadow-emerald-500/25 gap-2">
                Criar Desafio com Teste Grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-medium border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-white">
                Sou Aluno — Fazer Check-in
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats Bar */}
          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md">
            <div className="text-center p-2">
              <div className="text-3xl font-black text-white mb-1">+94%</div>
              <div className="text-xs text-zinc-400 font-medium">Taxa de Conclusão</div>
            </div>
            <div className="text-center p-2 border-l border-zinc-800/80">
              <div className="text-3xl font-black text-emerald-400 mb-1">4.2x</div>
              <div className="text-xs text-zinc-400 font-medium">Mais Retenção Mensal</div>
            </div>
            <div className="text-center p-2 border-l sm:border-l border-zinc-800/80">
              <div className="text-3xl font-black text-white mb-1">0%</div>
              <div className="text-xs text-zinc-400 font-medium">Fraude em Check-ins</div>
            </div>
            <div className="text-center p-2 border-l border-zinc-800/80">
              <div className="text-3xl font-black text-teal-400 mb-1">100k+</div>
              <div className="text-xs text-zinc-400 font-medium">Treinos Validados</div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Feature Pillars */}
      <section id="solucoes" className="py-24 px-6 border-b border-zinc-900 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 mb-3">Engenharia de Engajamento</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Por que métodos tradicionais falham e o MatchPro escala?
            </h3>
            <p className="text-zinc-400 text-base sm:text-lg">
              Grupos de WhatsApp e planilhas são caóticos e perdem o ritmo em 10 dias. Criamos um sistema automatizado baseado em princípios validados da psicologia comportamental.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-8 rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 backdrop-blur hover:border-zinc-700 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Câmera Nativa Antifraude</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Exige captura em tempo real dentro do navegador do aluno. O sistema bloqueia fotos salvas na galeria, assegurando honestidade em pratos e treinos.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Sem fotos antigas da galeria</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Carimbo de hora e data auditável</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Revisão rápida pelo profissional</li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 backdrop-blur hover:border-zinc-700 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Auditoria Tinder-Style</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Uma interface desenhada para economizar horas do seu dia. Deslize para a direita para aprovar e esquerda para reprovar dezenas de tarefas por minuto.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" /> Aprovação em 1 clique</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" /> Feedback instantâneo pro aluno</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" /> Pontuação calculada via banco</li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 backdrop-blur hover:border-zinc-700 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Ranking Realtime & Squads</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                O aluno não quer ficar para trás. O placar atualiza em tempo real enquanto os esquadrões incentivam a cooperação mútua entre participantes.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" /> Disputa individual e por equipes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" /> Pontuação por consistência e ofensiva</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" /> Estímulo ao espírito de equipe</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Engine Section */}
      <section id="gamificacao" className="py-24 px-6 border-b border-zinc-900 bg-zinc-950/60">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-400 text-xs font-semibold mb-4">
                <Flame className="h-4 w-4" /> Recursos de Retenção Psicológica
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                Mecanismos que impedem <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  o abandono do desafio
                </span>
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-8">
                Desenvolvemos os mesmos gatilhos de lealdade que tornaram apps como Duolingo gigantes mundiais, adaptados para nutrição, treinos e hábitos saudáveis:
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base mb-1">Freeze Shield (Proteção de Ofensiva)</h4>
                    <p className="text-sm text-zinc-400">
                      Evita o efeito bola de neve: se o aluno falhar um dia, seu escudo congela o streak, impedindo o desânimo e a desistência prematura.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base mb-1">Mystery Boxes (Recompensas Surpresa)</h4>
                    <p className="text-sm text-zinc-400">
                      Caixas misteriosas liberadas por metas de missões com prêmios físicos ou virtuais patrocinados por lojas e marcas parceiras.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base mb-1">Cofre da Transformação (Antes e Depois)</h4>
                    <p className="text-sm text-zinc-400">
                      Comparativo visual interativo seguro que gera stories automáticos no Instagram para atrair novos clientes organicamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Preview Mockup Box */}
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl relative">
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
                    MP
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Desafio Shape 30D • Squad Titânio</div>
                    <div className="text-xs text-zinc-400">Leaderboard da 3ª Semana</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  98% Ativos
                </span>
              </div>

              {/* Sample Ranking list */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-extrabold text-sm w-4 text-center">1º</span>
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold">CA</div>
                    <div>
                      <div className="text-xs font-bold text-white">Carlos Amorim</div>
                      <div className="text-[10px] text-zinc-400">🔥 21 dias seguidos • Escudo Ativo</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400">1.850 XP</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-300 font-extrabold text-sm w-4 text-center">2º</span>
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold">BM</div>
                    <div>
                      <div className="text-xs font-bold text-white">Bruna Martins</div>
                      <div className="text-[10px] text-zinc-400">🔥 19 dias seguidos</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400">1.620 XP</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-600 font-extrabold text-sm w-4 text-center">3º</span>
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold">RL</div>
                    <div>
                      <div className="text-xs font-bold text-white">Rodrigo Lima</div>
                      <div className="text-[10px] text-zinc-400">🔥 18 dias seguidos</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400">1.540 XP</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Sincronização Supabase Realtime</span>
                <span className="text-emerald-400 font-semibold">Atualização em ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-24 px-6 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 mb-3">Fluxo Operacional</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Simples para o profissional, viciante para o aluno
            </h3>
            <p className="text-zinc-400 text-base sm:text-lg">
              Em menos de 5 minutos seu desafio está no ar pronto para receber inscrições e faturar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <div className="text-emerald-400 font-black text-2xl mb-4">01</div>
              <h4 className="font-bold text-white text-lg mb-2">Crie as Missões</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Defina as missões diárias de treino, água e dieta com regras de fotos, pontos de XP e duração do desafio.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <div className="text-teal-400 font-black text-2xl mb-4">02</div>
              <h4 className="font-bold text-white text-lg mb-2">Convide sua Turma</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Compartilhe o link exclusivo do desafio. Seus alunos entram sem precisar baixar nada nas lojas de apps.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <div className="text-cyan-400 font-black text-2xl mb-4">03</div>
              <h4 className="font-bold text-white text-lg mb-2">Check-in Antifraude</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Os alunos usam a câmera nativa do MatchPro e acumulam XP, subindo no ranking individual e de esquadrão.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <div className="text-orange-400 font-black text-2xl mb-4">04</div>
              <h4 className="font-bold text-white text-lg mb-2">Auditoria Rápida</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No seu painel, aprove os check-ins num piscar de olhos e receba alertas automáticos de alunos com risco de churn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences / Institutional Solutions */}
      <section className="py-24 px-6 border-b border-zinc-900 bg-zinc-950/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 mb-3">Feito Sob Medida</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Quem usa o MatchPro para multiplicar faturamento?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/40">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Personal Trainers & Consultorias</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Crie desafios mensais de 21 ou 30 dias que monetizam sua audiência do Instagram e garantem receita recorrente sem sobrecarga de WhatsApp.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/40">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Nutricionistas & Clínicas</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Monitore a adesão à dieta de dezenas de pacientes simultaneamente com comprovação por foto e engajamento em hábitos consistentes.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/40">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
                <Dumbbell className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Boxes de CrossFit & Academias</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Aumente a retenção de alunos da sua academia física criando campeonatos internos por esquadrões e atraindo patrocinadores locais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <section id="depoimentos" className="py-24 px-6 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 mb-3">Casos Reais</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              O que dizem os profissionais que já faturam com o MatchPro
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed italic mb-6">
                  &ldquo;Antes eu perdia 3 horas por noite checando fotos de alunos no WhatsApp. Com o MatchPro audito tudo em 15 minutos e os alunos ficam enlouquecidos pelo ranking.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  FL
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Felipe Leitão</div>
                  <div className="text-xs text-zinc-500">Personal & Coach Online (340 alunos)</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed italic mb-6">
                  &ldquo;A função de esquadrões mudou o jogo. Os alunos começaram a cobrar uns aos outros de não faltar aos treinos. Minha taxa de desistência caiu para quase zero.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                <div className="h-10 w-10 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs">
                  MN
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Mariana Nogueira</div>
                  <div className="text-xs text-zinc-500">Nutricionista Esportiva</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed italic mb-6">
                  &ldquo;Conseguimos atrair 3 lojas de suplementos locais como patrocinadores do desafio usando o painel de parceiros. O desafio pagou a plataforma 10x só em patrocínios.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                <div className="h-10 w-10 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-xs">
                  TC
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Thiago Carvalho</div>
                  <div className="text-xs text-zinc-500">Head Coach CrossFit Titanium</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section id="planos" className="py-24 px-6 border-b border-zinc-900 bg-zinc-950/60 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="h-4 w-4" /> Acesso Imediato
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            Pronto para transformar sua retenção e faturar mais com seus desafios?
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
            Comece agora com sua conta profissional. Crie seu primeiro desafio, configure as regras e veja a mágica do engajamento acontecer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xl shadow-emerald-500/25">
                Iniciar Agora Gratuitamente
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300">
                Falar com Especialista
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sem cartão para começar</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Cancele quando quiser</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Suporte dedicado</span>
          </div>
        </div>
      </section>

      {/* Institutional Enterprise Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Dumbbell className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Match<span className="text-emerald-400">Pro</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mb-6">
              Plataforma B2B2C de gamificação de hábitos saudáveis, treinos e nutrição. Aumente o LTV de alunos e fidelize sua comunidade através da tecnologia e psicologia comportamental.
            </p>
            <div className="text-xs text-zinc-400">
              Feito para impulsionar treinadores, academias e atletas em todo o Brasil.
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Produto</h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><a href="#solucoes" className="hover:text-emerald-400 transition-colors">Câmera Antifraude</a></li>
              <li><a href="#solucoes" className="hover:text-emerald-400 transition-colors">Auditoria Express</a></li>
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
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Política de Antifraude</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Status do Sistema</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Central de Ajuda</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <div>
            &copy; {new Date().getFullYear()} MatchPro Technologies Ltd. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-400" /> Criptografia de Ponta a Ponta</span>
            <span>Hospedado com Supabase & Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
