'use client';

import React from 'react';
import Link from 'next/link';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { 
  X, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Camera, 
  Trophy, 
  Zap, 
  Flame 
} from 'lucide-react';

export function SocialProofTestimonials() {
  const comparisons = [
    {
      title: 'Auditoria & Comprovação',
      icon: Camera,
      badge: 'Zero Tempo com Prints',
      whatsapp: {
        label: 'No WhatsApp Comum',
        text: 'Você passa 2 a 3 horas por dia dando scroll no grupo para ver fotos frias de comida e prints de esteira tirados semana passada.',
      },
      arena: {
        label: 'Na ArenaFitPro',
        text: 'Câmera Antifraude ao vivo que bloqueia galeria com validação por GPS, mais IA Nutricional que estima calorias e macros instantaneamente.',
      },
    },
    {
      title: 'Engajamento & Retenção',
      icon: Trophy,
      badge: '94.8% de Conclusão',
      whatsapp: {
        label: 'No WhatsApp Comum',
        text: 'Metade da turma silencia o grupo no 10º dia. Sem metas visuais, os alunos desistem calados e não voltam para a próxima edição.',
      },
      arena: {
        label: 'Na ArenaFitPro',
        text: 'Pódio em tempo real, streaks diários e Radar Anti-Churn que detecta alunos sem check-in há 48h para você resgatá-los a tempo.',
      },
    },
    {
      title: 'Financeiro & Pagamentos',
      icon: Zap,
      badge: 'Split Pix D+0',
      whatsapp: {
        label: 'No WhatsApp Comum',
        text: 'Ficar cobrando comprovante de Pix no privado, conferindo extrato manualmente e pagando imposto sobre o faturamento bruto total.',
      },
      arena: {
        label: 'Na ArenaFitPro',
        text: 'Inscrição automática com Split Pix D+0 na infraestrutura Asaas: o dinheiro cai na sua conta e você só é tributado sobre seu lucro real.',
      },
    },
  ];

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 relative border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-wider text-zinc-200 mb-3">
            <Flame className="w-4 h-4 text-amber-400" />
            WHATSAPP VS. ARENAFITPRO
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 text-balance">
            Por que o modelo de desafios no WhatsApp quebrou
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed text-pretty font-normal">
            Mais de 60% dos alunos abandonam desafios em grupos desorganizados. Criamos a infraestrutura que transforma grupos caóticos em uma máquina de engajamento e retenção.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comparisons.map((item, index) => {
            const Icon = item.icon;
            return (
              <SpotlightCard3D key={index} className="p-6 sm:p-8 flex flex-col justify-between border-white/10 bg-zinc-950/80 backdrop-blur-xl">
                <div>
                  {/* Top Header Card */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/12 flex items-center justify-center text-white shrink-0 shadow-inner">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* Comparativo: O Caos do WhatsApp (Muted Titanium) */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/[0.06] mb-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-wider">
                      <X className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{item.whatsapp.label}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                      {item.whatsapp.text}
                    </p>
                  </div>

                  {/* Comparativo: A Solução ArenaFitPro (Specular Titanium) */}
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-wider font-bold">
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>{item.arena.label}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                      {item.arena.text}
                    </p>
                  </div>
                </div>

                {/* Badge Inferior de Vantagem */}
                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Diferencial</span>
                  <span className="text-white font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    {item.badge}
                  </span>
                </div>
              </SpotlightCard3D>
            );
          })}
        </div>

        {/* Chamada para o Beta ao final da comparação */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-white/15 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Quer rodar seu próximo desafio nessa estrutura sem custo de mensalidade?
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 font-normal">
              Inscreva-se no programa de Treinadores Pioneiros e teste grátis com sua turma.
            </p>
          </div>
          <Link href="/beta" className="shrink-0 w-full sm:w-auto">
            <button className="mono-button-primary w-full sm:w-auto min-h-[48px] px-7 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Garantir Vaga no Piloto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
