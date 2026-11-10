'use client';

import React from 'react';
import { X, Check, ArrowRight, MessageSquare, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function BeforeAfterComparison() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 relative border-t border-[#27272A]">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho Editorial com Espaço Negativo Generoso */}
        <div className="max-w-3xl mb-14 sm:mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#27272A] bg-[#0E0E10] text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-4">
            <ShieldAlert className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
            <span>O FIM DO CAOS OPERACIONAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#FAFAFA] tracking-tight leading-[1.1] text-balance mb-4">
            A diferença brutal entre gerenciar no WhatsApp e escalar com a ArenaFit Pro
          </h2>
          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed font-normal">
            Você não precisa de mais um app de treino genérico que seus alunos abandonam. Você precisa de um motor de engajamento diário, auditoria antifraude e faturamento instantâneo no Pix.
          </p>
        </div>

        {/* Grid Comparativo Balanceado de 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Lado Esquerdo: O Caos do WhatsApp */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#0E0E10]/60 border border-[#27272A] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#27272A] mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-[#A1A1AA]">
                  <MessageSquare className="w-4 h-4 text-[#A1A1AA]" />
                  <span>Grupos de WhatsApp & Planilhas</span>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                  Caos Manual
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] mb-6">
                Por que desafios em grupos comuns morrem no 10º dia:
              </h3>

              <ul className="space-y-5 text-xs sm:text-sm text-[#A1A1AA]">
                <li className="flex items-start gap-3.5">
                  <div className="h-6 w-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <strong className="text-[#FAFAFA] block text-sm font-bold mb-0.5">Fotos antigas da galeria:</strong>
                    <span>Alunos enviam fotos tiradas dias antes. Sem auditoria em tempo real, os alunos dedicados desanimam com a injustiça.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="h-6 w-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <strong className="text-[#FAFAFA] block text-sm font-bold mb-0.5">Cobrança e controle manual:</strong>
                    <span>Você passa horas da noite rolando 300 mensagens para anotar pontos no Excel e cobrar comprovante no privado.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="h-6 w-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <strong className="text-[#FAFAFA] block text-sm font-bold mb-0.5">Abandono e grupo silencioso:</strong>
                    <span>Sem pódio ao vivo nem streaks, mais de 60% dos participantes silenciam a conversa na 2ª semana e não renovam.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="h-6 w-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <strong className="text-[#FAFAFA] block text-sm font-bold mb-0.5">Zero atração de novos alunos:</strong>
                    <span>O resultado do desafio fica preso dentro do WhatsApp. Nenhum seguidor do Instagram descobre seu trabalho.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-[#27272A] text-xs font-mono text-[#A1A1AA] flex items-center justify-between">
              <span>Taxa de conclusão média: <strong>38%</strong></span>
              <span className="text-red-400 font-bold">45h perdidas/mês</span>
            </div>
          </div>

          {/* Lado Direito: Com a ArenaFit Pro (Destaque Tecnológico) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0E0E10] border-2 border-[#3478F6]/60 shadow-[0_20px_50px_rgba(52,120,246,0.15)] flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient Glow sutil no canto superior direito */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/[0.06] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-4 border-b border-[#27272A] mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-[#FAFAFA] font-bold">
                  <Zap className="w-4 h-4 text-[#3478F6]" />
                  <span>Plataforma SaaS ArenaFit Pro</span>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#3478F6] text-white font-extrabold uppercase tracking-wider shadow-md">
                  Padrão Premium
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] mb-6">
                Como o seu desafio funciona com tecnologia automatizada:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#3478F6] font-bold font-mono text-sm">
                    <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Câmera Antifraude + IA
                  </div>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    Bloqueio obrigatório de fotos da galeria. A foto é batida ao vivo e a IA estima proteínas, calorias e carboidratos liberando o XP na hora.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#3478F6] font-bold font-mono text-sm">
                    <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Split Pix D+0 no Asaas
                  </div>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    O aluno paga a inscrição por Pix Copia e Cola / QR Code com liberação em 2 segundos. O dinheiro cai direto na sua conta bancária sem intermediários.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#3478F6] font-bold font-mono text-sm">
                    <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Pódio & Gamificação 24h
                  </div>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    Ranking em tempo real, ofensivas diárias (streaks), squads cooperativos e radar anti-churn que avisa quem sumiu há 48h para resgate em 1 clique.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#3478F6] font-bold font-mono text-sm">
                    <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Stories 9:16 White-Label
                  </div>
                  <p className="text-[#A1A1AA] leading-relaxed">
                    Cards profissionais para Stories com a <strong>SUA marca no topo</strong>. Seus alunos viralizam seu trabalho no Instagram e trazem novos clientes.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-[#27272A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="text-xs font-mono text-[#FAFAFA] text-center sm:text-left">
                Taxa de conclusão média: <strong className="text-[#3478F6]">94.8%</strong> • Zero digitação de treinos
              </div>
              <Link href="/login?role=professional&mode=signup" className="w-full sm:w-auto">
                <button className="mono-button-primary w-full sm:w-auto min-h-[48px] px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(52,120,246,0.3)] active:scale-[0.98] transition-all">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Experimentar Grátis Agora</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
