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
  Activity,
  Layers,
  Zap
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
          if (role === 'professional') {
            await supabase.from('professionals').insert({
              id: authData.user.id,
              full_name: fullName || 'Profissional ArenaPro',
              specialty: specialty,
            });
          } else {
            await supabase.from('students').insert({
              id: authData.user.id,
              full_name: fullName || 'Aluno ArenaPro',
            });
          }

          setSuccessMessage('Conta criada com sucesso! Entrando...');
          setTimeout(() => {
            router.push(role === 'professional' ? '/dashboard' : '/app');
          }, 1000);
        }
      } else {
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signinError) throw signinError;

        if (signinData.user) {
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
      console.error('Erro na autenticação:', err);
      setErrorMessage(err.message || 'Falha ao autenticar. Verifique seus dados.');
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
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black relative overflow-hidden font-sans">
      
      {/* Background Liquid Atmosphere Glows */}
      <div className="ambient-glow top-0 left-1/4 w-[600px] h-[500px] bg-emerald-500/10 blur-[140px]" />
      <div className="ambient-glow bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 blur-[150px]" />
      <div className="ambient-glow top-1/2 left-3/4 w-[400px] h-[400px] bg-orange-500/5 blur-[160px]" />

      {/* Grid Pattern Subjacente de Alta Precisão */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

      {/* Top Header Floating Glass Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/25">
            <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Dumbbell className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white block leading-none">
              Arena<span className="text-emerald-400">Pro</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-extrabold mt-0.5 block">
              Enterprise Fitness System
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass text-xs text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-[11px] text-white">Desafios Ativos no Brasil</span>
        </div>
      </header>

      {/* Hero & Glass Card Container */}
      <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 flex-1">
        
        {/* Left Column: Social Proof & Feature Highlights (Desktop) */}
        <div className="lg:col-span-6 space-y-6 hidden lg:block pr-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl liquid-glass text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Zap className="h-4 w-4 fill-emerald-400 text-emerald-400" />
            Engajamento Máximo em Desafios
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.12]">
            A arena onde alunos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              viram atletas leais
            </span> e seu faturamento multiplica.
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
            Câmera antifraude com geolocalização nativa, guerra de esquadrões (Squads), cofres antes/depois e roleta de prêmios semanais para transformar a consistência física em rotina inegociável.
          </p>

          {/* Cards de Destaque com Efeito Liquid Glass */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-3xl liquid-glass space-y-1.5 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                <Trophy className="h-4 w-4" /> Guerra de Squads
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">Micro-equipes cooperativas de 3 a 5 alunos que reduzem o abandono em 70%.</p>
            </div>

            <div className="p-4 rounded-3xl liquid-glass space-y-1.5 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center gap-2 text-orange-400 font-black text-xs">
                <Flame className="h-4 w-4" /> Mystery Boxes
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">Caixas misteriosas de domingo para quem bate 100% das metas da semana.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Liquid Glass Auth Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="p-6 sm:p-8 rounded-[32px] liquid-glass space-y-6 relative overflow-hidden">
            
            {/* Top Specular Edge Line */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />

            {/* Alternador de Modo: Entrar vs Cadastrar */}
            <div className="flex p-1 rounded-2xl bg-zinc-950/80 border border-white/5">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/25'
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>

            {/* Título do Card */}
            <div>
              <h2 className="text-2xl font-black text-white">
                {mode === 'signin' ? 'Bem-vindo de volta 👋' : 'Crie seu acesso 🚀'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {mode === 'signin'
                  ? 'Acesse seu painel com segurança e acompanhe o desafio.'
                  : 'Selecione abaixo seu papel para configurar a interface ideal.'}
              </p>
            </div>

            {/* Seletor Aluno vs Profissional */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                  Perfil de Acesso
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-black transition-all ${
                      role === 'student'
                        ? 'liquid-glass-emerald text-emerald-300 border-emerald-500/60'
                        : 'border-white/5 bg-zinc-950/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="h-4 w-4" /> Aluno / Atleta
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('professional')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-black transition-all ${
                      role === 'professional'
                        ? 'liquid-glass-emerald text-emerald-300 border-emerald-500/60'
                        : 'border-white/5 bg-zinc-950/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Activity className="h-4 w-4" /> Personal / Coach
                  </button>
                </div>
              </div>
            )}

            {/* Alertas */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Formulário Principal */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="text-zinc-300 text-xs font-bold block mb-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      type="text"
                      placeholder="Ex: Carlos Amorim"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10 h-11 rounded-2xl bg-zinc-950/80 border-white/10 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && role === 'professional' && (
                <div>
                  <label className="text-zinc-300 text-xs font-bold block mb-1">Especialidade Principal</label>
                  <select
                    value={specialty}
                    onChange={(e: any) => setSpecialty(e.target.value)}
                    className="w-full h-11 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs text-white px-3 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="personal_trainer">Personal Trainer / Consultoria</option>
                    <option value="nutritionist">Nutricionista Esportivo</option>
                    <option value="gym_owner">Academia / Box de CrossFit</option>
                    <option value="holistic_coach">Coach / Treinador de Hábitos</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-zinc-300 text-xs font-bold block mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-2xl bg-zinc-950/80 border-white/10 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 text-xs font-bold block mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-2xl bg-zinc-950/80 border-white/10 text-xs text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/25 mt-2 transition-all active:scale-[0.99]"
              >
                {loading ? 'Processando...' : mode === 'signin' ? 'Acessar Plataforma' : 'Finalizar Cadastro'}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>

            {/* Separador */}
            <div className="relative flex items-center justify-center my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-zinc-950 px-3 text-[10px] uppercase tracking-widest text-zinc-400 font-extrabold">
                Ou continue com
              </span>
            </div>

            {/* Botão Google Liquid Glass */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 rounded-2xl border-white/10 bg-zinc-950/60 hover:bg-zinc-900 text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7c-1 2-1.6 4.3-1.6 6.9s.6 4.9 1.6 6.9l3.7-3.1z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.1L1.6 16.3C3.5 20.2 7.4 23 12 23z" />
              </svg>
              Continuar com o Google
            </Button>

            <div className="pt-1 text-center text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Ambiente Criptografado & Seguro
            </div>
          </div>
        </div>
      </div>

      {/* Footer Minimalista */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 text-center text-[11px] text-zinc-400 border-t border-white/5 z-20">
        © {new Date().getFullYear()} ArenaPro • Todos os direitos reservados.
      </footer>
    </main>
  );
}
