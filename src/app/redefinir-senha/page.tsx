'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';

export default function RedefinirSenhaPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }

      setSuccessMessage('Senha atualizada com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      const raw = String(err?.message || '');
      if (raw.toLowerCase().includes('auth session missing')) {
        setErrorMessage(
          'Sessão de recuperação expirada ou inválida. Solicite um novo link em "Esqueci minha senha".'
        );
      } else {
        setErrorMessage(raw || 'Não foi possível redefinir sua senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FAFAFA] selection:bg-[#3478F6] selection:text-white font-sans flex flex-col justify-between p-4 sm:p-6 safe-top-drawer safe-bottom-drawer relative overflow-hidden">
      <Monochrome3DBackground />

      {/* Top Bar Minimalista */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-1 z-10">
        <Link href="/" className="flex items-center gap-2 group min-h-[44px]">
          <div className="h-8 w-8 rounded-xl overflow-hidden border border-[#27272A] bg-[#0E0E10] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <img
              src="/app-logo.png"
              alt="ArenaFitPro"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#FAFAFA]">
            ArenaFitPro
          </span>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-[#0E0E10] border border-[#27272A] text-xs font-mono text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Login</span>
        </Link>
      </div>

      {/* Card Central */}
      <div className="max-w-md w-full mx-auto my-auto py-6 z-10 relative">
        <SpotlightCard3D className="p-6 sm:p-7">
          <div className="text-center mb-6 space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center mx-auto text-[#3478F6]">
              <KeyRound className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4D4D8] block">
              ATUALIZAÇÃO DE CREDENCIAL
            </span>
            <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">
              Redefinir Senha
            </h1>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Crie uma nova senha segura para acessar sua conta no ArenaFitPro.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 mb-4 rounded-xl border border-rose-500/30 bg-rose-950/30 text-xs font-mono text-rose-300"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="p-4 mb-4 rounded-xl border border-emerald-500/30 bg-emerald-950/25 text-xs font-mono text-emerald-200 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block mb-1.5"
              >
                Nova Senha
              </label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo de 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] rounded-xl focus:border-[#3478F6] h-12 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] block mb-1.5"
              >
                Confirmar Nova Senha
              </label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="bg-[#18181B] border-[#27272A] text-[#FAFAFA] rounded-xl focus:border-[#3478F6] h-12 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#3478F6] hover:bg-[#75A7FF] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-[0_0_20px_rgba(52,120,246,0.35)] transition-all cursor-pointer flex items-center justify-center"
            >
              {loading ? 'Salvando nova senha...' : 'Salvar Nova Senha'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#27272A] text-center">
            <Link
              href="/login"
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-mono text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para o Login</span>
            </Link>
          </div>
        </SpotlightCard3D>
      </div>

      <footer className="max-w-md w-full mx-auto text-center pb-2 z-10">
        <p className="text-[11px] font-mono text-[#A1A1AA]">
          ArenaFitPro • Autenticação Criptografada
        </p>
      </footer>
    </div>
  );
}
