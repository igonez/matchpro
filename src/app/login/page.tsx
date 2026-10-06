'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dumbbell, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Flame, 
  Trophy, 
  CheckCircle2,
  Lock,
  Mail,
  User,
  Activity
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'professional' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState<'personal_trainer' | 'nutritionist' | 'holistic_coach' | 'gym_owner'>('personal_trainer');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        // 1. Cadastrar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // 2. Salvar na tabela correspondente ao papel
          if (role === 'professional') {
            const { error: profError } = await supabase.from('professionals').insert({
              id: authData.user.id,
              full_name: fullName || 'Profissional MatchPro',
              specialty: specialty,
            });
            if (profError) console.error('Erro ao salvar profissional:', profError);
          } else {
            const { error: studentError } = await supabase.from('students').insert({
              id: authData.user.id,
              full_name: fullName || 'Aluno MatchPro',
            });
            if (studentError) console.error('Erro ao salvar aluno:', studentError);
          }

          setSuccessMessage('Conta criada com sucesso! Redirecionando...');
          setTimeout(() => {
            router.push(role === 'professional' ? '/dashboard' : '/app');
          }, 1000);
        }
      } else {
        // Login com e-mail e senha
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signinError) throw signinError;

        if (signinData.user) {
          // Checar se é profissional para redirecionar certo
          const { data: prof } = await supabase
            .from('professionals')
            .select('id')
            .eq('id', signinData.user.id)
            .single();

          if (prof) {
            router.push('/dashboard');
          } else {
            router.push('/app');
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar com Google.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black relative overflow-hidden font-sans">
      
      {/* Luzes de fundo atmosféricas (Cyber Emerald & Amber Glow) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Header Superior Minimalista */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Dumbbell className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block leading-none">
              Match<span className="text-emerald-400">Pro</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-extrabold">
              Gamified Health SaaS
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[11px]">Desafios Ativos em Andamento</span>
        </div>
      </header>

      {/* Conteúdo Central: Card de Login & Apresentação */}
      <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 flex-1">
        
        {/* Coluna Esquerda: Proposta de Valor / Hero (Invisível no mobile super pequeno, visível a partir de tablet) */}
        <div className="lg:col-span-6 space-y-6 hidden lg:block pr-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
            <Flame className="h-4 w-4 fill-emerald-400 text-emerald-400" />
            Revolução na Retenção Fitness
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
            A arena onde alunos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">viram atletas</span> e personais escalam turmas.
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
            Submissão de fotos em tempo real, guerra de micro-equipes (Squads), cofres blindados de evolução e prêmios semanais para transformar consistência em dopamina pura.
          </p>

          {/* Destaques Rápidos com Ícones */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                <Trophy className="h-4 w-4" /> Guerra de Squads
              </div>
              <p className="text-[11px] text-zinc-400">Micro-times de 3 a 5 alunos que reduzem o abandono em 70%.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-orange-400 font-black text-xs">
                <Flame className="h-4 w-4" /> Mystery Box de Domingo
              </div>
              <p className="text-[11px] text-zinc-400">Recompensas variáveis e dopamina para quem bate 100% da semana.</p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Caixa de Autenticação */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl shadow-2xl shadow-black/80 space-y-6 relative overflow-hidden">
            
            {/* Linha de brilho superior */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

            {/* Alternador de Modo (Entrar vs Cadastrar) */}
            <div className="flex p-1 rounded-2xl bg-zinc-950 border border-zinc-800/90">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Entrar na Conta
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>

            {/* Cabeçalho do Form */}
            <div>
              <h2 className="text-xl font-black text-white">
                {mode === 'signin' ? 'Bem-vindo de volta 👋' : 'Comece sua jornada 🚀'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {mode === 'signin'
                  ? 'Digite suas credenciais para entrar no seu painel.'
                  : 'Selecione abaixo se você é Aluno ou Profissional da saúde.'}
              </p>
            </div>

            {/* Seleção de Perfil (Apenas no Cadastro) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                  Tipo de Acesso
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-black transition-all ${
                      role === 'student'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/10'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    Aluno Atleta
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('professional')}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-black transition-all ${
                      role === 'professional'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/10'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Treinador / B2B
                  </button>
                </div>
              </div>
            )}

            {/* Formulário Principal */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Nome Completo</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Ex: Ana Clara"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-11 bg-zinc-950 border-zinc-800 rounded-xl text-xs pl-9 focus:border-emerald-500"
                    />
                    <User className="h-4 w-4 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
              )}

              {mode === 'signup' && role === 'professional' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Sua Atuação Profissional</label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                    value={specialty}
                    onChange={(e: any) => setSpecialty(e.target.value)}
                  >
                    <option value="personal_trainer">Personal Trainer / Preparador Físico</option>
                    <option value="nutritionist">Nutricionista Esportivo</option>
                    <option value="holistic_coach">Coach de Saúde & Hábitos</option>
                    <option value="gym_owner">Gestor de Box / Estúdio / Academia</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">E-mail</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-zinc-950 border-zinc-800 rounded-xl text-xs pl-9 focus:border-emerald-500"
                  />
                  <Mail className="h-4 w-4 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Senha</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-zinc-950 border-zinc-800 rounded-xl text-xs pl-9 focus:border-emerald-500"
                  />
                  <Lock className="h-4 w-4 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <p>{successMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-black shadow-lg shadow-emerald-500/25 mt-2 transition-all active:scale-95"
              >
                {loading ? (
                  'Processando...'
                ) : (
                  <>
                    {mode === 'signin' ? 'Acessar Minha Conta' : 'Finalizar e Começar'}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Divisor "Ou" */}
            <div className="relative my-2 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-zinc-900 px-3 text-[10px] uppercase tracking-widest text-zinc-400 font-extrabold">
                Ou acesse com
              </span>
            </div>

            {/* Botão Google Modernizado */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 rounded-xl border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/80 text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7c-1 2-1.6 4.3-1.6 6.9s.6 4.9 1.6 6.9l3.7-3.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.1L1.6 16.3C3.5 20.2 7.4 23 12 23z"
                />
              </svg>
              Continuar com o Google
            </Button>

            {/* Rodapé de Segurança */}
            <div className="pt-2 text-center text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Autenticação segura via Supabase Auth
            </div>
          </div>
        </div>
      </div>

      {/* Footer Minimalista */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 text-center text-[11px] text-zinc-400 border-t border-zinc-900/60 z-20">
        © {new Date().getFullYear()} MatchPro • Todos os direitos reservados.
      </footer>
    </main>
  );
}
