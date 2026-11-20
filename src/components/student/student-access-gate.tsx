'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useStudentSession } from '@/lib/auth/student-session-context';
import {
  ShieldCheck,
  Lock,
  Link2,
  ArrowRight,
  LogOut,
  Sparkles,
  Clock,
  QrCode,
  AlertCircle,
  ArrowLeft,
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
  const {
    user,
    student,
    hasAccess,
    isPreviewMode,
    pendingChallenge,
    isReady,
  } = useStudentSession();

  const [inviteInput, setInviteInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [loggingOut, setLoggingOut] = useState(false);

  const userEmail = user?.email || null;
  const userName = student?.full_name || null;

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace('/login?role=student');
      return;
    }
    if (!hasAccess && !isPreviewMode && pathname !== '/app') {
      router.replace('/app');
    }
  }, [isReady, user, hasAccess, isPreviewMode, pathname, router]);

  const handleJoinByInput = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const raw = inviteInput.trim();
    if (!raw) {
      setInputError('Cole o link da turma ou digite o código de acesso recebido.');
      return;
    }

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
      await fetch('/api/auth/exit-preview', { method: 'POST' }).catch(() => null);
      await supabase.auth.signOut();
      window.location.href = '/login?role=student';
    } catch (err) {
      console.error('Erro ao deslogar:', err);
      setLoggingOut(false);
    }
  };

  const handleExitPreviewToNewChallenge = async () => {
    await fetch('/api/auth/exit-preview', { method: 'POST' }).catch(() => null);
    router.push('/dashboard/challenges/new');
    router.refresh();
  };

  if (!isReady || !user) {
    return <MobileLoadingScreen fullScreen={true} />;
  }

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

  // Coach em Modo Simulação sem nenhum desafio criado ainda
  if (isPreviewMode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:p-8 min-h-[85vh] bg-[#000000] text-[#FAFAFA] relative">
        <Monochrome3DBackground />
        <div className="w-full max-w-md relative z-10 p-6 rounded-2xl bg-[#0E0E10] border border-[#27272A] text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#3478F6]">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#FAFAFA] tracking-tight">
              Nenhum desafio ativo para simular
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              Crie seu primeiro desafio no painel do treinador para visualizar a experiência completa do aluno em modo somente leitura.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExitPreviewToNewChallenge}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#3478F6] hover:bg-[#75A7FF] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Criar Primeiro Desafio</span>
          </button>
        </div>
      </div>
    );
  }

  // Aluno sem turma ativa
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:p-8 min-h-[90vh] bg-[#000000] text-[#FAFAFA] relative selection:bg-[#3478F6] selection:text-white">
      <Monochrome3DBackground />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#0E0E10] border border-[#27272A] p-0.5 shadow-[0_0_35px_rgba(52,120,246,0.25)] flex items-center justify-center relative">
            <div className="w-full h-full rounded-[22px] bg-gradient-to-b from-[#18181B] to-[#000000] flex items-center justify-center">
              <Lock className="w-9 h-9 text-[#3478F6]" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#3478F6] text-white p-1.5 rounded-xl shadow-lg border-2 border-[#000000]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E0E10] border border-[#27272A] text-[11px] font-mono font-bold tracking-wider uppercase text-[#3478F6]">
            <Lock className="w-3 h-3" />
            Acesso à Arena
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FAFAFA] tracking-tight">
            Conecte-se à sua Turma
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-sm">
            {userName ? `Olá, ${userName.split(' ')[0]}! ` : ''}
            Para liberar missões diárias, comunidade e ranking, você precisa entrar no desafio exclusivo criado pelo seu treinador.
          </p>
        </div>

        {pendingChallenge && (
          <div className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Inscrição Aguardando Pagamento
                </p>
                <p className="text-xs text-[#FAFAFA] font-medium leading-snug">
                  {pendingChallenge.title || 'Desafio do Treinador'}
                </p>
              </div>
            </div>
            <Link
              href={`/join/${pendingChallenge.id}`}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4" />
              <span>Concluir Matrícula no Pix</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="w-full p-5 sm:p-6 rounded-2xl bg-[#0E0E10] border border-[#27272A] text-left space-y-5 shadow-2xl">
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FAFAFA] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#3478F6]" />
              Como liberar seu acesso:
            </h2>
            <ol className="space-y-2.5 text-xs text-[#A1A1AA]">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#18181B] border border-[#27272A] text-[#3478F6] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <span>Solicite o <strong>link da turma</strong> ao seu Personal Trainer ou coach.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#18181B] border border-[#27272A] text-[#3478F6] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Clique diretamente no link recebido pelo WhatsApp ou cole abaixo.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#18181B] border border-[#27272A] text-[#3478F6] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                  3
                </span>
                <span>Confirme sua matrícula para liberar todos os treinos e o ranking instantaneamente.</span>
              </li>
            </ol>
          </div>

          <div className="h-px w-full bg-[#27272A]" />

          <form onSubmit={handleJoinByInput} className="space-y-3">
            <label className="block text-xs font-medium text-[#FAFAFA]">
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
                className="w-full min-h-[44px] bg-[#18181B] border border-[#27272A] rounded-xl px-3.5 py-3 text-xs sm:text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA]/50 focus:outline-none focus:border-[#3478F6] focus:ring-1 focus:ring-[#3478F6] transition-all pr-10"
              />
              <Link2 className="w-4 h-4 text-[#A1A1AA] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#3478F6] hover:bg-[#75A7FF] disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(52,120,246,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
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

        <div className="w-full pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A1A1AA]">
          <div className="truncate max-w-[240px]">
            <span className="text-[#FAFAFA] font-medium">{userEmail || 'atleta'}</span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="min-h-[44px] flex items-center gap-1.5 text-[#A1A1AA] hover:text-rose-400 transition-colors cursor-pointer py-2 px-3 rounded-xl hover:bg-[#0E0E10]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? 'Saindo...' : 'Sair da conta'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
