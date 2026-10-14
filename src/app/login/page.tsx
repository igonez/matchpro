'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';
import { Trophy, ArrowRight, Check, Clipboard, Sparkles, User, ShieldCheck } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const redirectParam = searchParams.get('redirect') || '';

  const supabase = createClient();

  // Perfis: 'student' | 'professional'
  const [role, setRole] = useState<'student' | 'professional'>('student');

  // Modos do Aluno: 'code' (novo aluno com convite) | 'signin' (já é aluno e volta)
  const [studentMode, setStudentMode] = useState<'code' | 'signin'>('code');

  // Modos do Profissional: 'signin' | 'signup'
  const [coachMode, setCoachMode] = useState<'signin' | 'signup'>('signin');

  // Estados de Código de Convite
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [validatingCode, setValidatingCode] = useState(false);
  const [validatedChallenge, setValidatedChallenge] = useState<any | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  // Formulário Geral
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState<'personal_trainer' | 'nutritionist' | 'holistic_coach' | 'gym_owner'>('personal_trainer');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-validar código se vier na URL (?code=...)
  useEffect(() => {
    if (initialCode) {
      handleValidateCode(initialCode);
    }
  }, [initialCode]);

  // Validar Código da Turma
  const handleValidateCode = async (codeToTest?: string) => {
    const targetCode = (codeToTest || inviteCode).trim();
    if (!targetCode) {
      setCodeError('Digite o código ou link da turma.');
      return;
    }

    setValidatingCode(true);
    setCodeError(null);

    try {
      const res = await fetch('/api/challenges/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: targetCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        throw new Error(data.message || 'Código de turma não encontrado.');
      }

      setValidatedChallenge(data.challenge);
    } catch (err: any) {
      setCodeError(err.message || 'Código inválido ou turma inativa.');
      setValidatedChallenge(null);
    } finally {
      setValidatingCode(false);
    }
  };

  // Colar código da área de transferência
  const handlePasteCode = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInviteCode(text.trim());
          handleValidateCode(text.trim());
        }
      }
    } catch (err) {
      console.warn('Não foi possível ler a área de transferência:', err);
    }
  };

  // OAuth Google
  const handleOAuthSignIn = async (targetRole: 'student' | 'professional', challengeId?: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      let redirectUrl = `${window.location.origin}/auth/callback?role=${targetRole}`;
      if (challengeId) {
        redirectUrl += `&next=/join/${challengeId}`;
      } else if (redirectParam) {
        redirectUrl += `&next=${encodeURIComponent(redirectParam)}`;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
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
      setErrorMessage(err.message || 'Erro ao conectar com Google.');
      setLoading(false);
    }
  };

  // Submissão de Formulário E-mail / Senha
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. FLUXO ALUNO COM CÓDIGO VALIDADO (Cadastro e Matrícula Instantânea)
      if (role === 'student' && studentMode === 'code' && validatedChallenge) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              role: 'student',
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          if (typeof document !== 'undefined') {
            document.cookie = `arena_role=student; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
          }

          // Criar registro na tabela students
          await supabase.from('students').insert({
            id: authData.user.id,
            full_name: fullName || 'Aluno ArenaFitPro',
            phone: phone || null,
          });

          // Matricular o aluno na turma validada
          const isFree = Number(validatedChallenge.price || 0) === 0;
          await supabase.from('challenge_participants').upsert({
            challenge_id: validatedChallenge.id,
            student_id: authData.user.id,
            payment_status: isFree ? 'paid' : 'pending',
          });

          setSuccessMessage(`Bem-vindo à turma "${validatedChallenge.title}"! Entrando no app...`);
          setTimeout(() => {
            router.push(isFree ? '/app' : `/join/${validatedChallenge.id}`);
          }, 1000);
          return;
        }
      }

      // 2. FLUXO ALUNO RECORRENTE (Sign In)
      if (role === 'student' && studentMode === 'signin') {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          if (typeof document !== 'undefined') {
            document.cookie = `arena_role=student; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
          }
          await supabase.auth.updateUser({ data: { role: 'student' } }).catch(() => {});
          router.push(redirectParam || '/app');
          return;
        }
      }

      // 3. FLUXO PROFISSIONAL (Sign In ou Sign Up)
      if (role === 'professional') {
        if (coachMode === 'signup') {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                phone: phone,
                role: 'professional',
              },
            },
          });

          if (authError) throw authError;

          if (authData.user) {
            if (typeof document !== 'undefined') {
              document.cookie = `arena_role=professional; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
            }

            await supabase.from('professionals').insert({
              id: authData.user.id,
              full_name: fullName || 'Treinador ArenaFitPro',
              phone: phone || null,
              specialty: specialty,
            });

            setSuccessMessage('Conta de treinador criada com sucesso! Abrindo Cockpit...');
            setTimeout(() => router.push('/dashboard'), 1000);
            return;
          }
        } else {
          // Coach Sign In
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) throw authError;

          if (authData.user) {
            if (typeof document !== 'undefined') {
              document.cookie = `arena_role=professional; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
            }
            await supabase.auth.updateUser({ data: { role: 'professional' } }).catch(() => {});
            router.push('/dashboard');
            return;
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
          <div className="h-8 w-8 rounded-xl overflow-hidden border border-white/20 bg-black flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <img src="/app-logo.png" alt="ArenaFitPro" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">ArenaFitPro</span>
        </Link>

        <Link href="/" className="text-xs font-mono text-zinc-500 hover:text-white transition-colors">
          ← Início
        </Link>
      </div>

      {/* 2. Card Central com 3D Spotlight */}
      <div className="max-w-md w-full mx-auto my-auto py-6 z-10 relative">
        <div className="absolute -top-7 -right-3 hidden sm:block opacity-40 hover:opacity-80 transition-opacity">
          <Chrome3DStar size={50} />
        </div>

        <SpotlightCard3D className="p-6 sm:p-7">
          {/* Header do Card */}
          <div className="text-center mb-5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
              PORTAL DE ACESSO
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {role === 'student' ? 'Área do Atleta' : 'Portal do Treinador'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {role === 'student'
                ? 'Entre na turma do seu coach e dispute o ranking oficial'
                : 'Cockpit de gestão, auditoria de check-ins e financeiro'}
            </p>
          </div>

          {/* Seletor de Perfil Monocromático: Sou Aluno vs Sou Profissional */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black border border-white/[0.08] mb-4">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrorMessage(null);
              }}
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
              onClick={() => {
                setRole('professional');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === 'professional'
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sou Treinador
            </button>
          </div>

          {/* Mensagens de Alerta */}
          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-xs font-mono text-rose-300 animate-in fade-in">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 mb-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs font-mono text-emerald-300 animate-in fade-in">
              {successMessage}
            </div>
          )}

          {/* ============================================================ */}
          {/* SEÇÃO 1: FLUXO DO ALUNO                                       */}
          {/* ============================================================ */}
          {role === 'student' && (
            <div className="space-y-4">
              {/* Sub-abas do Aluno: Tenho um Código vs Já sou da Turma */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-950 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('code');
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    studentMode === 'code'
                      ? 'bg-white text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Tenho um Código</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    studentMode === 'signin'
                      ? 'bg-white text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <User className="h-3 w-3" />
                  <span>Já sou da Turma</span>
                </button>
              </div>

              {/* MODO A: NOVO ALUNO COM CÓDIGO DE CONVITE */}
              {studentMode === 'code' && (
                <div className="space-y-3.5">
                  {!validatedChallenge ? (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                            Código do Desafio ou Link
                          </label>
                          <button
                            type="button"
                            onClick={handlePasteCode}
                            className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <Clipboard className="h-3 w-3" /> Colar link
                          </button>
                        </div>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Cole o link ou código da turma..."
                            value={inviteCode}
                            onChange={(e) => {
                              setInviteCode(e.target.value);
                              setCodeError(null);
                            }}
                            className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs pr-10 font-mono"
                          />
                        </div>
                      </div>

                      {codeError && (
                        <p className="text-[11px] font-mono text-rose-400">{codeError}</p>
                      )}

                      <button
                        type="button"
                        onClick={() => handleValidateCode()}
                        disabled={validatingCode || !inviteCode.trim()}
                        className="mono-button-primary w-full h-11 text-xs font-bold flex items-center justify-center gap-2"
                      >
                        {validatingCode ? (
                          <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Validar Turma</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-zinc-500 text-center">
                        Recebeu um link pelo WhatsApp? Cole acima para entrar na turma do seu personal.
                      </p>
                    </div>
                  ) : (
                    /* CARD DA TURMA RECONHECIDA + ENTRADA RÁPIDA */
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                            ✓ TURMA ENCONTRADA
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setValidatedChallenge(null);
                              setInviteCode('');
                            }}
                            className="text-[10px] font-mono text-zinc-400 hover:text-white underline"
                          >
                            Trocar turma
                          </button>
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">{validatedChallenge.title}</h3>
                          <p className="text-xs text-zinc-300 mt-0.5">
                            Coach: <strong className="text-white">{validatedChallenge.professionalName}</strong>
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono mt-1">
                            Inscrição: {Number(validatedChallenge.price) === 0 ? 'Gratuita' : `R$ ${Number(validatedChallenge.price).toFixed(2)}`}
                          </p>
                        </div>
                      </div>

                      {/* Opção 1: Entrada com Google 1-clique */}
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleOAuthSignIn('student', validatedChallenge.id)}
                        className="w-full h-11 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs font-semibold text-white shadow-sm group"
                      >
                        <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        <span>Entrar com Google (1 Clique)</span>
                      </button>

                      {/* Divisor */}
                      <div className="relative flex items-center justify-center my-3">
                        <div className="border-t border-white/10 w-full" />
                        <span className="bg-[#09090b] px-3 text-[10px] font-mono uppercase text-zinc-500 absolute">
                          ou informe seus dados
                        </span>
                      </div>

                      {/* Opção 2: Formulário com e-mail */}
                      <form onSubmit={handleEmailAuth} className="space-y-3">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                            Seu Nome Completo
                          </label>
                          <Input
                            type="text"
                            placeholder="Ex: Matheus Oliveira"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-10 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                            WhatsApp (para rankings e avisos do coach)
                          </label>
                          <Input
                            type="tel"
                            placeholder="(11) 99999-9999"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-10 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
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
                              className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-10 text-xs"
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
                              className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-10 text-xs"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="mono-button-primary w-full h-11 text-xs font-bold mt-2"
                        >
                          {loading ? 'Confirmando inscrição...' : 'Entrar na Turma Agora'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* MODO B: ALUNO RECORRENTE (Sign In para manter pontos e streak) */}
              {studentMode === 'signin' && (
                <div className="space-y-4">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleOAuthSignIn('student')}
                    className="w-full h-11 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs font-semibold text-white shadow-sm group"
                  >
                    <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Continuar com Google</span>
                  </button>

                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-white/10 w-full" />
                    <span className="bg-[#09090b] px-3 text-[10px] font-mono uppercase text-zinc-500 absolute">
                      ou com e-mail cadastrado
                    </span>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-3">
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
                      className="mono-button-primary w-full h-11 text-xs font-bold mt-2"
                    >
                      {loading ? 'Acessando...' : 'Acessar Meu App'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* SEÇÃO 2: FLUXO DO PROFISSIONAL / TREINADOR                    */}
          {/* ============================================================ */}
          {role === 'professional' && (
            <div className="space-y-4">
              {/* Login Social do Treinador */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuthSignIn('professional')}
                className="w-full h-11 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs font-semibold text-white shadow-sm group"
              >
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Entrar como Coach com Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#09090b] px-3 text-[10px] font-mono uppercase text-zinc-500 absolute">
                  ou com credenciais
                </span>
              </div>

              {/* Formulário do Treinador */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {coachMode === 'signup' && (
                  <>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Nome Completo
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: Lucas Ferreira Coach"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        WhatsApp Profissional *
                      </label>
                      <Input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
                      />
                    </div>

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
                  </>
                )}

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                    E-mail Profissional
                  </label>
                  <Input
                    type="email"
                    placeholder="coach@arenafit.com"
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
                  className="mono-button-primary w-full h-11 text-xs font-bold mt-2"
                >
                  {loading
                    ? 'Processando...'
                    : coachMode === 'signin'
                    ? 'Acessar Cockpit do Treinador'
                    : 'Criar Minha Conta de Treinador'}
                </button>
              </form>

              {/* Toggle Sign In / Sign Up do Coach */}
              <div className="mt-4 text-center pt-3 border-t border-white/[0.06]">
                {coachMode === 'signin' ? (
                  <p className="text-xs text-zinc-400">
                    Novo treinador?{' '}
                    <button
                      type="button"
                      onClick={() => setCoachMode('signup')}
                      className="text-white font-bold hover:underline"
                    >
                      Cadastre-se como Coach
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400">
                    Já possui conta de coach?{' '}
                    <button
                      type="button"
                      onClick={() => setCoachMode('signin')}
                      className="text-white font-bold hover:underline"
                    >
                      Fazer login
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </SpotlightCard3D>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-zinc-500 z-10 pb-2 font-mono">
        ArenaFitPro • Gamificação para Personal Trainers & Atletas
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 text-xs font-mono">
          Carregando portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
