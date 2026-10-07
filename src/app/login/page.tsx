'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';

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

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?role=${role}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setErrorMessage(err.message || `Erro ao iniciar autenticação com ${provider}.`);
      setLoading(false);
    }
  };

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

          setSuccessMessage('Conta criada com sucesso! Redirecionando...');
          setTimeout(() => {
            router.push(role === 'professional' ? '/dashboard' : '/app');
          }, 1000);
        }
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Checar se perfil existe para a permissão selecionada
          const { data: prof } = await supabase
            .from('professionals')
            .select('id')
            .eq('id', authData.user.id)
            .maybeSingle();

          const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (role === 'professional') {
            if (!prof) {
              // Se não existir perfil profissional, cria para o usuário acessar o dashboard
              await supabase.from('professionals').insert({
                id: authData.user.id,
                full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
                specialty: 'personal_trainer',
              });
            }
            router.push('/dashboard');
          } else {
            if (!student) {
              // Se não existir perfil de aluno, cria para o atleta acessar
              await supabase.from('students').insert({
                id: authData.user.id,
                full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
              });
            }
            router.push('/app');
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* 1. Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Top Bar Minimalista */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2 z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">ArenaPro</span>
        </Link>

        <Link href="/" className="text-xs font-mono text-zinc-500 hover:text-white transition-colors">
          ← Voltar ao Início
        </Link>
      </div>

      {/* 2. Card Central com 3D Spotlight e Estrela Cromada */}
      <div className="max-w-md w-full mx-auto my-auto py-8 z-10 relative">
        {/* Estrela Cromada 3D Flutuando Acima do Card */}
        <div className="absolute -top-12 -right-6 hidden sm:block">
          <Chrome3DStar size={85} />
        </div>

        <SpotlightCard3D className="p-7 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
              SYSTEM_AUTHENTICATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {mode === 'signin' ? 'Acessar Terminal' : 'Criar Credencial'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {role === 'professional' ? 'Painel de Gestão do Coach' : 'Terminal de Check-in do Atleta'}
            </p>
          </div>

          {/* Seletor de Perfil Monocromático */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black border border-white/[0.08] mb-5">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === 'student'
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sou Aluno
            </button>
            <button
              type="button"
              onClick={() => setRole('professional')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === 'professional'
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sou Profissional
            </button>
          </div>

          {/* Mensagens de Alerta Monocromáticas */}
          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl border border-white/20 bg-black/80 text-xs font-mono text-zinc-300">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 mb-4 rounded-xl border border-white/40 bg-zinc-900 text-xs font-mono text-white">
              {successMessage}
            </div>
          )}

          {/* Opções de Login Social OAuth */}
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOAuthSignIn('google')}
              className="w-full h-11 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs font-semibold text-white shadow-sm"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.326 0-6.03-2.705-6.03-6.03s2.704-6.03 6.03-6.03c1.49 0 2.85.55 3.9 1.45l2.42-2.42C17.06 3.51 14.77 2.67 12.24 2.67 7.09 2.67 2.92 6.84 2.92 12s4.17 9.33 9.32 9.33c5.38 0 8.95-3.78 8.95-9.11 0-.64-.06-1.12-.17-1.6L12.24 10.285z" />
              </svg>
              <span>Continuar com Google</span>
            </button>
          </div>

          {/* Divisor Visual Monocromático */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#09090b] px-3 text-[10px] font-mono uppercase text-zinc-500 absolute">
              ou com e-mail
            </span>
          </div>

          {/* Formulário */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                  Nome Completo
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Lucas Ferreira"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
                />
              </div>
            )}

            {mode === 'signup' && role === 'professional' && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                  Especialidade
                </label>
                <select
                  value={specialty}
                  onChange={(e: any) => setSpecialty(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 text-white rounded-xl px-3 h-11 text-xs focus:outline-none focus:border-white/40"
                >
                  <option value="personal_trainer">Personal Trainer</option>
                  <option value="nutritionist">Nutricionista</option>
                  <option value="holistic_coach">Coach / Consultor</option>
                  <option value="gym_owner">Gestor de Academia</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                E-mail
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mono-button-primary w-full h-11 text-xs mt-2"
            >
              {loading ? 'Processando...' : mode === 'signin' ? 'Entrar no Sistema' : 'Criar Minha Conta'}
            </button>
          </form>

          {/* Toggle entre Sign In e Sign Up */}
          <div className="mt-5 text-center pt-4 border-t border-white/[0.06]">
            {mode === 'signin' ? (
              <p className="text-xs text-zinc-400">
                Não tem uma credencial?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-white font-bold hover:underline"
                >
                  Criar conta
                </button>
              </p>
            ) : (
              <p className="text-xs text-zinc-400">
                Já possui uma credencial?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-white font-bold hover:underline"
                >
                  Fazer login
                </button>
              </p>
            )}
          </div>
        </SpotlightCard3D>
      </div>

      {/* Footer Minimalista */}
      <div className="max-w-md w-full mx-auto text-center text-[10px] font-mono text-zinc-600 z-10 pb-2">
        ArenaPro Security Kernel • 256-Bit Encrypted
      </div>
    </div>
  );
}
