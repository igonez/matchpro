'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';
import { Crown, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { isMasterAdmin } from '@/lib/master-auth';

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

      // Validação Estrita de Super Admin
      let authorized = isMasterAdmin(authData.user);

      if (!authorized) {
        // Checagem de fallback no banco
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
        // Se a conta não for master, desconecta imediatamente
        await supabase.auth.signOut();
        throw new Error('Acesso restrito. Este portal é exclusivo para o Super Admin fundador da ArenaFitPro.');
      }

      // Configuração de cookies de sessão master
      if (typeof document !== 'undefined') {
        document.cookie = `arena_role=master; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      }

      router.push('/admin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar login mestre.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden antialiased">
      {/* Background 3D Monocromático */}
      <Monochrome3DBackground />

      {/* Topo Minimalista com Logo Oficial */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pt-2 z-10">
        <Link href="/" className="flex items-center gap-3 group min-h-[44px]">
          <div className="h-9 w-9 rounded-2xl overflow-hidden border border-white/20 bg-zinc-950 p-1 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-105 group-hover:border-amber-400/50 transition-all shrink-0">
            <img src="/app-logo.png" alt="ArenaFitPro" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-white block leading-tight">
              ArenaFitPro
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
              SaaS Multi-Tenant
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm">
          <Crown className="w-3.5 h-3.5 text-amber-400" /> Portal Mestre
        </div>
      </header>

      {/* Card Central de Login Mestre */}
      <main className="max-w-md w-full mx-auto z-10 my-auto py-8">
        <div className="relative">
          {/* Estrela 3D cromada decorativa */}
          <div className="absolute -top-12 -right-6 hidden sm:block opacity-35 pointer-events-none">
            <Chrome3DStar size={64} delay={0.2} />
          </div>

          <SpotlightCard3D glowIntensity={0.2} className="p-7 sm:p-10 space-y-7 bg-zinc-950/85 border border-white/[0.1] border-t-white/25 rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.9)]">
            
            <div className="space-y-3 text-center">
              <div className="relative inline-block">
                <div className="w-14 h-14 rounded-3xl bg-zinc-900 border border-amber-400/40 p-2 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(251,191,36,0.25)]">
                  <img src="/app-logo.png" alt="ArenaFitPro" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-black border border-amber-400/80 flex items-center justify-center text-amber-400">
                  <Crown className="w-3 h-3" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Cockpit do Fundador
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mt-1 font-sans">
                  Terminal de Operações Globais & Moderação Mestre
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleMasterSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  E-mail do Administrador
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@dominio.com"
                  className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/70 transition-all min-h-[48px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Chave de Acesso / Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/70 transition-all min-h-[48px]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs sm:text-sm tracking-wider py-4 transition-all shadow-[0_10px_25px_rgba(255,255,255,0.2)] active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px] cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Validando Credenciais Mestre...
                  </span>
                ) : (
                  <>
                    Acessar Terminal Mestre <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 text-center pt-2 font-mono">
                <Lock className="w-3.5 h-3.5 text-zinc-400" /> Acesso seguro com criptografia e auditoria IP.
              </div>
            </form>

          </SpotlightCard3D>
        </div>
      </main>

      {/* Rodapé Minimalista */}
      <footer className="max-w-md w-full mx-auto text-center z-10 pb-2">
        <span className="text-xs font-mono text-zinc-400">
          ArenaFitPro • Internal Master Terminal
        </span>
      </footer>
    </div>
  );
}
