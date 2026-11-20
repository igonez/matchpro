'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';
import { useStudentSession } from '@/lib/auth/student-session-context';

export function ReturnToCoachBanner() {
  const router = useRouter();
  const { isPreviewMode } = useStudentSession();
  const [exiting, setExiting] = useState(false);

  const handleReturnToDashboard = async () => {
    if (exiting) return;
    setExiting(true);
    try {
      await fetch('/api/auth/exit-preview', { method: 'POST' }).catch(() => null);
      router.push('/dashboard');
      router.refresh();
    } finally {
      setExiting(false);
    }
  };

  if (!isPreviewMode) {
    return <div className="w-full safe-top-page shrink-0" aria-hidden="true" />;
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-[#0E0E10]/95 backdrop-blur-xl border-b border-[#27272A] px-3.5 safe-top-header pb-3 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center">
          <Shield className="h-3 w-3 text-[#D4D4D8]" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] font-bold">
          Modo Simulação
        </span>
      </div>

      <button
        type="button"
        onClick={handleReturnToDashboard}
        disabled={exiting}
        className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#3478F6] text-white hover:bg-[#75A7FF] disabled:opacity-60 text-[11px] font-mono font-black transition-all active:scale-95 shadow-md cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5 text-white" />
        <span>{exiting ? 'Saindo...' : 'Voltar ao Painel'}</span>
      </button>
    </div>
  );
}
