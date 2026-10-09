'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function ReturnToCoachBanner() {
  const router = useRouter();
  const [isProfessional, setIsProfessional] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const isMetaProf = user.user_metadata?.role === 'professional';
        const { data: prof } = await supabase
          .from('professionals')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        const isProf = isMetaProf || !!prof;

        if (isProf) {
          const isPreview = typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('preview') === 'true'
            : false;

          // Se for profissional e não houver flag de preview explícita, redireciona para o cockpit
          if (!isPreview) {
            router.replace('/dashboard');
            return;
          }

          setIsProfessional(true);
        }
      }
    }
    checkRole();
  }, [supabase, router]);

  if (!isProfessional) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-zinc-950/90 backdrop-blur-xl border-b border-white/15 px-3 py-2 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">
          <Shield className="h-3 w-3 text-white" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 font-bold">
          Modo Simulação
        </span>
      </div>

      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black hover:bg-zinc-200 text-[11px] font-mono font-black transition-all active:scale-95 shadow-md"
      >
        <ArrowLeft className="h-3 w-3 text-black" />
        <span>Voltar ao Painel</span>
      </Link>
    </div>
  );
}
