'use client';

import React from 'react';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Star, ShieldCheck, TrendingUp, Users, Flame } from 'lucide-react';

export function SocialProofTestimonials() {
  const testimonials = [
    {
      name: 'Rodrigo Vasconcelos',
      role: 'Personal Trainer & Coach Online',
      location: 'São Paulo, SP',
      stats: '142 alunos • R$ 13.700 em 30 dias',
      quote:
        'Antes eu tentava gerenciar desafios em grupos de WhatsApp. Mais da metade dos alunos desistia no 10º dia e eu perdia horas conferindo fotos. Na ArenaFitPro, 96% dos meus alunos foram até a final disputando o pódio. O Split Pix D+0 direto na conta é libertador.',
      retention: '96.2% retenção',
    },
    {
      name: 'Dra. Camila Nogueira',
      role: 'Nutricionista Esportiva',
      location: 'Belo Horizonte, MG',
      stats: '88 alunas • Turma Seca Verão',
      quote:
        'A Câmera com IA Nutricional é um diferencial absurdo. Minhas pacientes não conseguem mais enviar foto antiga tirada semana passada. Elas amam ver os macros calculados na hora e disputar as primeiras colocações no pódio semanal.',
      retention: '93.5% retenção',
    },
    {
      name: 'Felipe Alencar',
      role: 'Fundador do CT Alencar & Studio',
      location: 'Curitiba, PR',
      stats: '3 turmas simultâneas • 210 alunos',
      quote:
        'O recurso de Squads Cooperativos fez a diferença na nossa comunidade. Os alunos cobram uns aos outros para ninguém perder o streak. Nosso faturamento extra com desafios aumentou em 4 vezes sem aumentar minha carga horária.',
      retention: '95.8% retenção',
    },
  ];

  return (
    <section className="py-20 px-6 relative border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-3">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            CASOS DE SUCESSO REAIS
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Quem usa a ArenaFitPro não volta para o WhatsApp
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Veja como treinadores, nutricionistas e academias estão escalando faturamento e fidelização com a nossa tecnologia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <SpotlightCard3D key={index} className="p-7 flex flex-col justify-between">
              <div>
                {/* 5 Estrelas Douradas */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-[10px] font-mono text-zinc-400 ml-2 font-bold">5.0</span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {item.name}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <span className="text-[11px] text-zinc-400 block">{item.role}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{item.location}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-400">{item.stats}</span>
                  <span className="text-emerald-400 font-bold">{item.retention}</span>
                </div>
              </div>
            </SpotlightCard3D>
          ))}
        </div>
      </div>
    </section>
  );
}
