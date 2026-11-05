'use client';

import React from 'react';
import { X, Check, ArrowRight, MessageSquare, Zap } from 'lucide-react';
import Link from 'next/link';

export function BeforeAfterComparison() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 relative border-t border-[#252D3B]">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho Editorial com Espaço Negativo Generoso */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#3478F6] font-bold block mb-3">
            O FIM DO CAOS OPERACIONAL
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F4F6FA] tracking-tight leading-[1.1] text-balance mb-4">
            A diferença brutal entre gerenciar no WhatsApp e escalar com a ArenaFit Pro
          </h2>
          <p className="text-base sm:text-lg text-[#A7B0C0] leading-relaxed font-normal">
            Você não precisa de mais um app de treino complexo que seus alunos abandonam. Você precisa de um motor de engajamento, auditoria e faturamento automático.
          </p>
        </div>

        {/* Grid Comparativo Assimétrico */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Lado Esquerdo: O Caos do WhatsApp */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#121722]/60 border border-[#252D3B] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#252D3B] mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-[#A7B0C0]">
                  <MessageSquare className="w-4 h-4 text-[#A7B0C0]" />
                  <span>Grupos de WhatsApp & Planilhas</span>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                  Ineficiente
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] mb-6">
                Por que desafios em grupos comuns morrem no 10º dia:
              </h3>

              <ul className="space-y-4 text-xs sm:text-sm text-[#A7B0C0]">
                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-400" />
                  </div>
                  <div>
                    <strong className="text-[#F4F6FA] block">Fotos antigas da galeria:</strong>
                    Alunos mandam prints e fotos tiradas dias antes. Zero disciplina e sem como auditar.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-400" />
                  </div>
                  <div>
                    <strong className="text-[#F4F6FA] block">Cobrança e controle manual:</strong>
                    Você passa horas cobrando comprovante no privado, somando pontos no Excel e calculando placares.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-400" />
                  </div>
                  <div>
                    <strong className="text-[#F4F6FA] block">Abandono em massa e silêncio:</strong>
                    Sem gamificação nem pódio ao vivo, a turma desanima após a primeira semana e o grupo vira um cemitério.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-400" />
                  </div>
                  <div>
                    <strong className="text-[#F4F6FA] block">Zero marketing para sua marca:</strong>
                    O esforço fica trancado em conversas privadas. Ninguém de fora vê seus resultados para virar novo cliente.
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-[#252D3B] text-xs font-mono text-[#A7B0C0]">
              Resultado: Horas de trabalho manual e receita limitada.
            </div>
          </div>

          {/* Lado Direito: Com a ArenaFit Pro (Destaque Tecnológico) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#121722] border-2 border-[#3478F6]/60 shadow-[0_20px_50px_rgba(52,120,246,0.12)] flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient Glow sutil no canto superior direito */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#3478F6]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-4 border-b border-[#252D3B] mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-[#F4F6FA] font-bold">
                  <Zap className="w-4 h-4 text-[#3478F6]" />
                  <span>Plataforma SaaS ArenaFit Pro</span>
                </div>
                <span className="text-[11px] font-mono px-3 py-0.5 rounded-full bg-[#3478F6] text-white font-extrabold uppercase tracking-wider">
                  Alta Conversão
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] mb-6">
                Como o seu desafio funciona com tecnologia automatizada:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                  <div className="flex items-center gap-2 text-[#3478F6] font-bold mb-1.5 font-mono">
                    <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Câmera Antifraude + IA
                  </div>
                  <p className="text-[#A7B0C0] leading-relaxed">
                    Bloqueio forçado de fotos de galeria. O aluno bate a foto na hora e a IA lê os macros do prato liberando o XP automaticamente.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                  <div className="flex items-center gap-2 text-[#3478F6] font-bold mb-1.5 font-mono">
                    <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Split Pix D+0 Instantâneo
                  </div>
                  <p className="text-[#A7B0C0] leading-relaxed">
                    Inscrição paga via Pix Copia e Cola / QR Code com liberação na hora. O lucro cai direto na sua conta bancária sem intermediários.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                  <div className="flex items-center gap-2 text-[#3478F6] font-bold mb-1.5 font-mono">
                    <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Pódio & Gamificação 24h
                  </div>
                  <p className="text-[#A7B0C0] leading-relaxed">
                    Ranking ao vivo em tempo real, streaks protegidos, squads em equipe e notificações que mantêm os alunos viciados na rotina.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#1B2330] border border-[#252D3B]">
                  <div className="flex items-center gap-2 text-[#3478F6] font-bold mb-1.5 font-mono">
                    <Check className="w-4 h-4 text-[#3478F6] shrink-0" /> Stories 9:16 White-Label
                  </div>
                  <p className="text-[#A7B0C0] leading-relaxed">
                    Cards profissionais nos Stories do Instagram com a <strong>SUA marca no topo</strong>. Seus alunos viram embaixadores trazendo novos clientes.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-[#252D3B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs font-mono text-[#F4F6FA]">
                Tempo de setup: <strong>3 minutos</strong> • Taxa 0% no Plano Pro
              </div>
              <Link href="/login?role=professional&mode=signup">
                <button className="mono-button-primary min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer">
                  <span>Experimentar Grátis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
