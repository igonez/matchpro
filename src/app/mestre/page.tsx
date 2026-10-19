'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { isMasterAdmin } from '@/lib/master-auth';
import { Input } from '@/components/ui/input';

export default function MasterLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMasterSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Autenticação no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Falha ao autenticar.');
      }

      // Validação de Super Admin
      let authorized = isMasterAdmin(authData.user);

      if (!authorized) {
        const { data: prof } = await supabase
          .from('professionals')
          .select('is_master_admin')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (prof?.is_master_admin) {
          authorized = true;
        }
      }

      if (!authorized) {
        await supabase.auth.signOut();
        throw new Error('Acesso restrito. Este portal é exclusivo para o administrador da plataforma.');
      }

      // Configuração de cookies de sessão master
      if (typeof document !== 'undefined') {
        document.cookie = `arena_role=master; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      }

      router.push('/admin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background 3D Animado igual à área de login de treinador/aluno */}
      <Monochrome3DBackground />

      {/* Top Bar Minimalista */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2 z-10">
        <Link href="/" className="flex items-center gap-2 group min-h-[44px]">
          <div className="h-8 w-8 rounded-xl overflow-hidden border border-white/20 bg-black flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <img src="/app-logo.png" alt="ArenaFitPro" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">ArenaFitPro</span>
        </Link>

        <Link href="/" className="inline-flex items-center px-3 py-2 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
          ← Início
        </Link>
      </div>

      {/* Card Central com 3D Spotlight */}
      <div className="max-w-md w-full mx-auto my-auto py-6 z-10 relative">
        <div className="absolute -top-7 -right-3 hidden sm:block opacity-40 hover:opacity-80 transition-opacity">
          <Chrome3DStar size={50} />
        </div>

        <SpotlightCard3D className="p-6 sm:p-7">
          {/* Header do Card */}
          <div className="text-center mb-5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
              PAINEL ADMINISTRATIVO
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Acesso Mestre
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Cockpit de gestão e operações globais da plataforma
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-xs font-mono text-rose-300 animate-in fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleMasterSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                E-mail de Administrador
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@arenafitpro.com.br"
                className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Senha de Acesso
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mono-button-primary w-full h-11 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Cockpit</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>

            <p className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1.5 pt-1">
              <Lock className="w-3 h-3 text-zinc-500" /> Acesso restrito ao administrador fundador
            </p>
          </form>
        </SpotlightCard3D>
      </div>

      {/* Rodapé Minimalista */}
      <div className="max-w-md w-full mx-auto text-center z-10 pb-2">
        <span className="text-[11px] text-zinc-600 font-mono">
          ArenaFitPro • Painel Mestre
        </span>
      </div>
    </div>
  );
}
