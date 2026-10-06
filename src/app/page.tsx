import Link from 'next/link';
import { Dumbbell, Trophy, ArrowRight, ShieldCheck, Flame, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Navbar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Match<span className="text-emerald-400">Pro</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6">
          <Flame className="h-4 w-4" /> Gestão Gamificada de Desafios Fitness B2B2C
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6">
          Engaje seus alunos com missões diárias,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            fotos em tempo real e leaderboard
          </span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mb-10">
          O MatchPro conecta Personais, Nutricionistas e Academias a seus alunos com validação de fotos antifraude e pontuação automatizada por banco de dados.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full text-base">
              Sou Profissional — Criar Desafio
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full text-base">
              Sou Aluno — Participar
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Captura Nativa e Antifraude</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              O aluno é obrigado a fotografar a refeição ou treino na hora pelo app mobile, impedindo uploads prévios da galeria.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Auditoria Tinder-Style</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Interface ultrarrápida de aprovação e rejeição de fotos para o profissional revisar dezenas de tarefas em segundos.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Leaderboard Realtime</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Pontuação calculada por trigger no PostgreSQL e refletida instantaneamente na tela dos alunos via Supabase Realtime.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        &copy; {new Date().getFullYear()} MatchPro — Gestão Gamificada de Saúde e Fitness. Todos os direitos reservados.
      </footer>
    </div>
  );
}
