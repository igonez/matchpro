'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  ShieldCheck, 
  Lock, 
  Link2, 
  ArrowRight, 
  LogOut, 
  Sparkles, 
  Clock, 
  HelpCircle,
  QrCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { StudentBottomNav } from '@/components/student/bottom-nav';
import { WorkoutActiveSessionHud } from '@/components/student/workout-active-session-hud';
import { StudentTourTrigger } from '@/components/student/student-tour-trigger';
import { MobileLoadingScreen } from '@/components/ui/mobile-loading-screen';

interface StudentAccessGateProps {
  children: React.ReactNode;
}

export function StudentAccessGate({ children }: StudentAccessGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [pendingChallenge, setPendingChallenge] = useState<any | null>(null);

  // Formulário para colar link ou código de acesso
  const [inviteInput, setInviteInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkStudentEnrollment() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          if (isMounted) {
            router.replace('/login?role=student');
          }
          return;
        }

        if (isMounted) {
          setUserEmail(user.email || null);
        }

        // Buscar dados cadastrais do aluno
        const { data: studentProfile } = await supabase
          .from('students')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (isMounted && studentProfile?.full_name) {
          setUserName(studentProfile.full_name);
        }

        // Verificar matrículas ativas (pagas ou cortesia)
        const { data: activeParticipation } = await supabase
          .from('challenge_participants')
          .select('id, challenge_id, payment_status, challenges(id, title, is_active)')
          .eq('student_id', user.id)
          .in('payment_status', ['paid', 'complimentary'])
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (activeParticipation?.challenges?.id) {
          if (isMounted) {
            setHasAccess(true);
            setLoading(false);
          }
          return;
        }

        // Verificar se existe inscrição pendente de pagamento
        const { data: pendingParticipation } = await supabase
          .from('challenge_participants')
          .select('id, challenge_id, payment_status, challenges(id, title, price, is_active)')
          .eq('student_id', user.id)
          .eq('payment_status', 'pending')
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (isMounted) {
          if (pendingParticipation?.challenges?.id) {
            setPendingChallenge(pendingParticipation.challenges);
          }
          setHasAccess(false);
          setLoading(false);

          // Se o aluno sem turma estiver tentando acessar uma sub-rota (ex: /app/missions), força retorno para /app
          if (pathname !== '/app') {
            router.replace('/app');
          }
        }
      } catch (err) {
        console.error('Erro ao verificar acesso do aluno:', err);
        if (isMounted) {
          setHasAccess(false);
          setLoading(false);
        }
      }
    }

    checkStudentEnrollment();

    return () => {
      isMounted = false;
    };
  }, [pathname, router, supabase]);

  const handleJoinByInput = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const raw = inviteInput.trim();
    if (!raw) {
      setInputError('Cole o link da turma ou digite o código de acesso recebido.');
      return;
    }

    // Extrair ID ou código da URL se o aluno colou o link completo
    let targetCode = raw;
    try {
      if (raw.includes('/join/')) {
        const parts = raw.split('/join/');
        targetCode = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
      } else if (raw.startsWith('http')) {
        const urlObj = new URL(raw);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        targetCode = pathParts[pathParts.length - 1] || raw;
      }
    } catch {
      targetCode = raw;
    }

    if (!targetCode) {
      setInputError('Código ou link inválido. Verifique com seu treinador.');
      return;
    }

    startTransition(() => {
      router.push(`/join/${encodeURIComponent(targetCode)}`);
    });
  };

  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      window.location.href = '/login?role=student';
    } catch (err) {
      console.error('Erro ao deslogar:', err);
      setLoggingOut(false);
    }
  };

  // 1. Tela de Carregamento Ultra-Fluida com Estrela Motion
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[70vh] bg-[#080A0F] text-[#F4F6FA]">
        <MobileLoadingScreen fullScreen={false} />
      </div>
    );
  }

  // 2. Aluno com acesso liberado a uma turma ativa
  if (hasAccess) {
    return (
      <>
        {children}
        <WorkoutActiveSessionHud />
        <StudentBottomNav />
        <StudentTourTrigger />
      </>
    );
  }

  // 3. Página Única Estática de Acesso Bloqueado ("Acesso à Arena / Conecte-se à sua turma")
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:p-8 min-h-[90vh] bg-[#080A0F] text-[#F4F6FA] relative selection:bg-[#3478F6] selection:text-white">
      <Monochrome3DBackground />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center text-center space-y-6">
        {/* Ícone e Emblema de Bloqueio */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#121722] border border-[#252D3B] p-0.5 shadow-[0_0_35px_rgba(52,120,246,0.25)] flex items-center justify-center relative">
            <div className="w-full h-full rounded-[22px] bg-gradient-to-b from-[#1B2330] to-[#080A0F] flex items-center justify-center">
              <Lock className="w-9 h-9 text-[#3478F6]" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#3478F6] text-white p-1.5 rounded-xl shadow-lg border-2 border-[#080A0F]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Título e Posicionamento */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121722] border border-[#252D3B] text-[11px] font-mono font-bold tracking-wider uppercase text-[#3478F6]">
            <Lock className="w-3 h-3" />
            Acesso à Arena
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F4F6FA] tracking-tight">
            Conecte-se à sua Turma
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B0C0] leading-relaxed max-w-sm">
            {userName ? `Olá, ${userName.split(' ')[0]}! ` : ''}
            Para liberar missões diárias, comunidade e ranking, você precisa entrar no desafio exclusivo criado pelo seu treinador.
          </p>
        </div>

        {/* Card de Inscrição Pendente de Pagamento (se houver) */}
        {pendingChallenge && (
          <div className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Inscrição Aguardando Pagamento
                </p>
                <p className="text-xs text-[#F4F6FA] font-medium leading-snug">
                  {pendingChallenge.title || 'Desafio do Treinador'}
                </p>
              </div>
            </div>
            <Link
              href={`/join/${pendingChallenge.id}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4" />
              <span>Concluir Matrícula no Pix</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Card Principal: Instruções e Inserção de Link/Código */}
        <div className="w-full p-5 sm:p-6 rounded-2xl bg-[#121722] border border-[#252D3B] text-left space-y-5 shadow-2xl">
          {/* 3 Passos Rápidos */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F6FA] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#3478F6]" />
              Como liberar seu acesso:
            </h2>
            <ol className="space-y-2.5 text-xs text-[#A7B0C0]">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1B2330] border border-[#252D3B] text-[#3478F6] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>Solicite o <strong>link da turma</strong> ao seu Personal Trainer ou coach.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1B2330] border border-[#252D3B] text-[#3478F6] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Clique diretamente no link recebido pelo WhatsApp ou cole abaixo.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1B2330] border border-[#252D3B] text-[#3478F6] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                  3
                </span>
                <span>Confirme sua matrícula para liberar todos os treinos e o ranking instantaneamente.</span>
              </li>
            </ol>
          </div>

          <div className="h-px w-full bg-[#252D3B]" />

          {/* Campo de Código / Link */}
          <form onSubmit={handleJoinByInput} className="space-y-3">
            <label className="block text-xs font-medium text-[#F4F6FA]">
              Já tem o link ou código da sua turma?
            </label>
            <div className="relative">
              <input
                type="text"
                value={inviteInput}
                onChange={(e) => {
                  setInviteInput(e.target.value);
                  setInputError(null);
                }}
                placeholder="Cole o link ou código (ex: AFIT-XXXX)"
                className="w-full bg-[#1B2330] border border-[#252D3B] rounded-xl px-3.5 py-3 text-xs sm:text-sm text-[#F4F6FA] placeholder:text-[#A7B0C0]/50 focus:outline-none focus:border-[#3478F6] focus:ring-1 focus:ring-[#3478F6] transition-all pr-10"
              />
              <Link2 className="w-4 h-4 text-[#A7B0C0] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {inputError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{inputError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !inviteInput.trim()}
              className="w-full py-3 px-4 rounded-xl bg-[#3478F6] hover:bg-[#75A7FF] disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(52,120,246,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <span>Entrar na Turma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Rodapé: Informações da conta & Desconectar */}
        <div className="w-full pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A7B0C0]">
          <div className="truncate max-w-[240px]">
            Conectado como <span className="text-[#F4F6FA] font-medium">{userEmail || 'atleta'}</span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="flex items-center gap-1.5 text-[#A7B0C0] hover:text-rose-400 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-[#121722]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? 'Saindo...' : 'Sair da conta'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
