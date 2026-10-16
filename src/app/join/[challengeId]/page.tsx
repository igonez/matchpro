'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, QrCode, Sparkles, User, ArrowRight } from 'lucide-react';

function JoinChallengeContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = params?.challengeId as string;
  const autoJoinParam = searchParams?.get('autojoin') === '1';
  const supabase = createClient();

  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de Cadastro / Login Direto na página do convite
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados do Modal Pix Dinâmico
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixData, setPixData] = useState<{ code: string; qrBase64?: string } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [checkingPixStatus, setCheckingPixStatus] = useState(false);
  const [pixFeedback, setPixFeedback] = useState<string | null>(null);

  const enrollAuthenticatedStudent = async (activeUser: any, loadedChallenge: any) => {
    const targetChallenge = loadedChallenge || challenge;
    if (!targetChallenge || !activeUser) return;

    setError(null);
    setJoining(true);

    try {
      if (typeof document !== 'undefined') {
        document.cookie = `arena_role=student; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      }

      const { data: studentRecord } = await supabase
        .from('students')
        .select('id')
        .eq('id', activeUser.id)
        .maybeSingle();

      const studentDisplayName =
        fullName.trim() ||
        activeUser.user_metadata?.full_name ||
        activeUser.user_metadata?.name ||
        activeUser.email?.split('@')[0] ||
        'Aluno';

      if (!studentRecord) {
        await supabase.from('students').insert({
          id: activeUser.id,
          full_name: studentDisplayName,
          phone: phone.trim() || activeUser.user_metadata?.phone || null,
        });
      }

      const isFree = Number(targetChallenge?.price || 0) === 0;

      // Se for pago, chamamos o Asaas para gerar o Pix com Split
      if (!isFree) {
        const response = await fetch('/api/checkout/pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId: targetChallenge.id,
            studentName: studentDisplayName,
            studentEmail: activeUser.email || email.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Falha ao gerar cobrança Pix.');
        }

        setPixData({
          code: data.pixCode,
          qrBase64: data.pixQrBase64,
        });

        // Inscreve com status pending
        await supabase
          .from('challenge_participants')
          .upsert({
            challenge_id: targetChallenge.id,
            student_id: activeUser.id,
            payment_status: 'pending',
          });

        setPixModalOpen(true);
        setJoining(false);
        return;
      }

      // Se for gratuito, validar capacidade antes de liberar
      const { count: currentStudents } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', targetChallenge.id);

      const coachTier = targetChallenge?.professionals?.plan_tier || 'starter';
      const maxAllowed = coachTier === 'pro' ? 100 : 10;
      if ((currentStudents || 0) >= maxAllowed) {
        throw new Error(`Esta turma atingiu a capacidade máxima de ${maxAllowed} alunos.`);
      }

      const { error: joinError } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: targetChallenge.id,
          student_id: activeUser.id,
          payment_status: 'paid',
        });

      if (joinError && !joinError.message.includes('unique')) {
        throw joinError;
      }

      try {
        await supabase
          .from('leaderboard_standings')
          .insert({
            challenge_id: targetChallenge.id,
            student_id: activeUser.id,
            total_points: 0,
          });
      } catch (leadErr) {
        console.warn('Leaderboard já inicializado:', leadErr);
      }

      setAlreadyJoined(true);
      router.push('/app');
    } catch (err: any) {
      console.error('Erro ao ingressar:', err);
      setError(err.message || 'Erro ao ingressar no desafio.');
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    async function loadChallenge() {
      if (!challengeId) return;
      setLoading(true);

      try {
        let resolvedId = challengeId;
        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(challengeId);

        if (!isUUID) {
          try {
            const valRes = await fetch('/api/challenges/validate-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: challengeId }),
            });
            const valData = await valRes.json();
            if (valData.valid && valData.challenge?.id) {
              resolvedId = valData.challenge.id;
            } else {
              throw new Error(valData.message || 'Código de turma não encontrado.');
            }
          } catch (codeErr: any) {
            throw new Error(codeErr.message || 'Código de turma ou link de convite inválido.');
          }
        }

        const { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select(`
            *,
            professionals (
              full_name,
              specialty,
              plan_tier
            ),
            missions (
              id,
              title,
              points_rewarded
            )
          `)
          .eq('id', resolvedId)
          .single();

        if (challengeError) throw challengeError;
        setChallenge(challengeData);

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: participant } = await supabase
            .from('challenge_participants')
            .select('id, payment_status')
            .eq('challenge_id', challengeData.id)
            .eq('student_id', currentUser.id)
            .maybeSingle();

          if (participant && participant.payment_status === 'paid') {
            setAlreadyJoined(true);
          } else if (autoJoinParam) {
            // Se voltou do login Google com autojoin=1, já inicia a matrícula/checkout!
            await enrollAuthenticatedStudent(currentUser, challengeData);
          }
        }
      } catch (err: any) {
        console.error('Erro ao buscar desafio:', err);
        setError('Desafio não encontrado ou encerrado.');
      } finally {
        setLoading(false);
      }
    }

    loadChallenge();
  }, [challengeId, supabase]);

  // Escutar liberação do pagamento via Supabase Realtime
  useEffect(() => {
    const targetChallengeId = challenge?.id || challengeId;
    if (!targetChallengeId || !user?.id) return;

    const channel = supabase
      .channel(`payment-check-${targetChallengeId}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
          filter: `challenge_id=eq.${targetChallengeId}`,
        },
        async (payload: any) => {
          if (
            payload.new?.student_id === user.id &&
            payload.new?.payment_status === 'paid'
          ) {
            try {
              const confetti = await import('canvas-confetti');
              confetti.default({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
              });
            } catch (e) {
              console.log('Confetti loaded');
            }
            setPixModalOpen(false);
            setAlreadyJoined(true);
            setTimeout(() => {
              router.push('/app');
            }, 1200);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challenge?.id, challengeId, user?.id, supabase, router]);

  const handleJoin = async () => {
    if (!user) return;
    await enrollAuthenticatedStudent(user, challenge);
  };

  const handleGoogleQuickJoin = async () => {
    setError(null);
    setJoining(true);
    try {
      const targetId = challenge?.id || challengeId;
      const nextUrl = encodeURIComponent(`/join/${targetId}?autojoin=1`);
      const redirectUrl = `${window.location.origin}/auth/callback?role=student&next=${nextUrl}`;

      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthErr) throw oauthErr;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com Google.');
      setJoining(false);
    }
  };

  const handleDirectAuthAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setJoining(true);

    try {
      if (authMode === 'signup') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              role: 'student',
            },
          },
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Não foi possível criar sua conta.');

        setUser(authData.user);
        await enrollAuthenticatedStudent(authData.user, challenge);
      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;
        if (!authData.user) throw new Error('Credenciais inválidas.');

        setUser(authData.user);
        await enrollAuthenticatedStudent(authData.user, challenge);
      }
    } catch (err: any) {
      console.error('Erro na autenticação direta:', err);
      setError(err.message || 'Erro ao autenticar e entrar na turma.');
      setJoining(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 gap-3 font-mono text-xs">
        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        CARREGANDO CREDENCIAL DO DESAFIO...
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="mono-glass-card max-w-md w-full p-8 text-center rounded-3xl">
          <p className="font-bold text-sm text-white font-mono uppercase mb-2">CONVITE EXPIRADO OU INATIVO</p>
          <p className="text-xs text-zinc-400 mb-6 font-sans">
            O desafio foi arquivado pelo organizador ou o link foi desativado.
          </p>
          <Link href="/login">
            <button className="mono-button-primary px-5 py-2 text-xs font-mono">
              Ir para o Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const missionsList = challenge.missions || [];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black font-sans relative overflow-x-hidden">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Top Navbar */}
      <header className="border-b border-white/[0.06] bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">ArenaFitPro</span>
          </Link>

          <button
            onClick={copyLink}
            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            {copied ? 'Link copiado!' : 'Copiar link'}
          </button>
        </div>
      </header>

      {/* Hero do Convite com Spotlight 3D */}
      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full relative z-10">
        <div className="absolute -top-6 -right-4 hidden sm:block">
          <Chrome3DStar size={85} />
        </div>

        <SpotlightCard3D className="p-7 sm:p-9 space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <span className="text-xs font-semibold text-zinc-400">
                Convite Oficial
              </span>
              <span className="text-xs font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                {Number(challenge.price) > 0 ? `R$ ${Number(challenge.price).toFixed(2)}` : 'Gratuito'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {challenge.title}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Treinador: {challenge.professionals?.full_name || 'Coach Certificado'}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
            {challenge.description || 'Desafio fitness focado em disciplina, consistência diária e evolução física com auditoria em tempo real.'}
          </p>

          {/* Cronograma */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/60 border border-white/[0.08] text-xs">
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Início Oficial</span>
              <span className="font-bold text-white">{new Date(challenge.start_date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Término</span>
              <span className="font-bold text-white">{new Date(challenge.end_date).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Resumo de Missões */}
          {missionsList.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold tracking-wide text-zinc-400 block">
                Grade de Missões ({missionsList.length})
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {missionsList.map((m: any) => (
                  <div key={m.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{m.title}</span>
                    <span className="text-white font-bold font-mono">+{m.points_rewarded} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 text-xs font-mono text-rose-300">
              {error}
            </div>
          )}

          {/* Área de Ação / Cadastro Direto sem sair da tela */}
          <div className="pt-4 border-t border-white/[0.08]">
            {alreadyJoined ? (
              <Link href="/app" className="block">
                <button className="mono-button-primary w-full h-12 text-xs font-semibold">
                  Você já está inscrito • Acessar App →
                </button>
              </Link>
            ) : user ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="mono-button-primary w-full h-13 text-xs font-semibold"
              >
                {joining
                  ? 'Processando inscrição...'
                  : Number(challenge.price) > 0
                  ? `Confirmar Vaga (R$ ${Number(challenge.price).toFixed(2)}) →`
                  : 'Confirmar Minha Inscrição →'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Crie sua conta para entrar na turma
                  </span>
                </div>

                {/* Alternador: Criar Conta vs Já Tenho Conta */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-950 border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setError(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      authMode === 'signup'
                        ? 'bg-white text-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Criar Conta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setError(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      authMode === 'signin'
                        ? 'bg-white text-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Já tenho conta</span>
                  </button>
                </div>

                {/* Entrada 1-Clique com Google */}
                <button
                  type="button"
                  disabled={joining}
                  onClick={handleGoogleQuickJoin}
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs font-semibold text-white shadow-sm group"
                >
                  <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continuar com Google (1 Clique)</span>
                </button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-[#09090b] px-3 text-[10px] font-mono uppercase text-zinc-500 absolute">
                    ou preencha abaixo
                  </span>
                </div>

                {/* Formulário Direto */}
                <form onSubmit={handleDirectAuthAndJoin} className="space-y-3">
                  {authMode === 'signup' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          WhatsApp
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
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-10 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={joining}
                    className="mono-button-primary w-full h-12 text-xs font-bold flex items-center justify-center gap-2 mt-2"
                  >
                    {joining ? (
                      <>
                        <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Entrando na turma...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {authMode === 'signup'
                            ? Number(challenge.price) > 0
                              ? `Criar Conta e Ir para o Pix (R$ ${Number(challenge.price).toFixed(2)})`
                              : 'Criar Conta e Entrar na Turma'
                            : Number(challenge.price) > 0
                            ? `Entrar e Ir para o Pix (R$ ${Number(challenge.price).toFixed(2)})`
                            : 'Entrar na Turma Agora'}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </SpotlightCard3D>
      </main>

      {/* Modal de Pagamento Pix Dinâmico Asaas */}
      <CustomDialog
        isOpen={pixModalOpen}
        onClose={() => setPixModalOpen(false)}
        title="Pagamento da Inscrição via Pix"
        hideFooter
      >
        <div className="space-y-4 pt-2 text-center">
          <p className="text-xs text-zinc-400">
            Escaneie o QR Code abaixo no app do seu banco ou copie o código Pix para confirmar sua vaga instantaneamente.
          </p>

          {pixData?.qrBase64 && (
            <div className="flex justify-center p-3 bg-white rounded-xl mx-auto w-48 h-48 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <img
                src={`data:image/png;base64,${pixData.qrBase64}`}
                alt="QR Code Pix"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Código Copia e Cola</span>
            <div className="flex gap-2">
              <input
                readOnly
                value={pixData?.code || ''}
                className="w-full bg-black/80 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 select-all"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (pixData?.code) {
                    navigator.clipboard.writeText(pixData.code);
                    setCopiedPix(true);
                    setTimeout(() => setCopiedPix(false), 2000);
                  }
                }}
                className="bg-white text-black hover:bg-zinc-200 font-bold px-3 shrink-0"
              >
                {copiedPix ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Aguardando liquidação bancária em tempo real...</span>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono pt-1">
            ⚡ A confirmação é instantânea. Assim que o Pix for aprovado pelo seu banco, sua tela abrirá automaticamente.
          </div>

          {pixFeedback && (
            <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs font-mono text-center">
              {pixFeedback}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="button"
              disabled={checkingPixStatus}
              onClick={async () => {
                if (!user || !challenge) return;
                setCheckingPixStatus(true);
                setPixFeedback(null);
                try {
                  const { data: part } = await supabase
                    .from('challenge_participants')
                    .select('payment_status')
                    .eq('challenge_id', challenge.id)
                    .eq('student_id', user.id)
                    .maybeSingle();

                  if (part && (part.payment_status === 'paid' || part.payment_status === 'complimentary')) {
                    setPixModalOpen(false);
                    setAlreadyJoined(true);
                    router.push('/app');
                  } else {
                    setPixFeedback('Pagamento ainda não compensado no Asaas. Se já transferiu, aguarde alguns instantes que a tela abrirá automaticamente!');
                  }
                } catch (e: any) {
                  setPixFeedback('Erro ao checar status: ' + e.message);
                } finally {
                  setCheckingPixStatus(false);
                }
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-11 text-xs"
            >
              {checkingPixStatus ? 'Verificando com o Banco...' : 'Já Realizei o Pagamento • Verificar Liberação'}
            </Button>
          </div>
        </div>
      </CustomDialog>

      {/* Footer Minimalista */}
      <footer className="border-t border-white/[0.06] py-8 px-6 text-center text-[10px] font-mono text-zinc-600 relative z-10">
        ArenaFitPro Technologies • Autenticação Criptografada
      </footer>
    </div>
  );
}

export default function JoinChallengePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 gap-3 font-mono text-xs">
          <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          CARREGANDO CREDENCIAL DO DESAFIO...
        </div>
      }
    >
      <JoinChallengeContent />
    </Suspense>
  );
}
