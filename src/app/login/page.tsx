'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dumbbell, UserCheck, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

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
    <main className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2 shadow-lg shadow-emerald-500/10">
            <Dumbbell className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Match<span className="text-emerald-400">Pro</span>
          </h1>
          <p className="text-sm text-zinc-400">
            Gestão gamificada de desafios de saúde e fitness
          </p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/70 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 mb-2">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cadastrar-se
              </button>
            </div>

            <CardTitle className="text-lg text-center font-bold">
              {mode === 'signin' ? 'Acessar sua conta' : 'Criar nova conta no MatchPro'}
            </CardTitle>
            <CardDescription className="text-center text-xs">
              {mode === 'signin'
                ? 'Conecte-se para continuar suas missões e desafios'
                : 'Selecione seu perfil para iniciar a jornada'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Escolha do papel (Apenas no cadastro) */}
            {mode === 'signup' && (
              <div className="mb-4 space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Você é:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                      role === 'student'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/50'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <UserCheck className="h-5 w-5" />
                    Aluno / Participante
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('professional')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                      role === 'professional'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/50'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Profissional / Treinador
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Nome Completo
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Ana Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              {mode === 'signup' && role === 'professional' && (
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Especialidade Principal
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                    value={specialty}
                    onChange={(e: any) => setSpecialty(e.target.value)}
                  >
                    <option value="personal_trainer">Personal Trainer</option>
                    <option value="nutritionist">Nutricionista</option>
                    <option value="holistic_coach">Coach Holístico / Saúde</option>
                    <option value="gym_owner">Gestor / Box de Crossfit / Academia</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">E-mail</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Senha</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Processando...' : mode === 'signin' ? 'Acessar Plataforma' : 'Criar Conta'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-zinc-900 px-3 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                Ou continue com
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={loading}
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
              Google
            </Button>
          </CardContent>

          <CardFooter className="justify-center border-t border-zinc-850 pt-4 text-xs text-zinc-500">
            Ambiente seguro com criptografia de ponta a ponta
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
