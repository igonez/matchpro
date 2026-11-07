'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { JsonLd } from '@/components/seo/json-ld';
import { CONTACT_CONFIG } from '@/lib/constants';
import { CorporateFooter } from '@/components/layout/corporate-footer';

const FAQ_ITEMS = [
  {
    q: 'Como funciona a validação das missões por câmera ao vivo?',
    a: 'Para garantir a integridade dos pontos e prevenir fraudes, o aplicativo utiliza a câmera do dispositivo em tempo real com captura de data, horário e localização GPS. O envio por arquivos da galeria é bloqueado.',
  },
  {
    q: 'Como e quando o treinador recebe os repasses das inscrições?',
    a: 'Os pagamentos feitos pelos alunos via Pix são processados com split automático na API do Asaas. O saldo líquido fica disponível imediatamente na Central Financeira para saque via Pix D+0 direto na conta bancária cadastrada.',
  },
  {
    q: 'Por que as inscrições de alunos são cobradas apenas via Pix?',
    a: 'O Pix exclusivo é uma proteção essencial para o Personal Trainer: o aluno recebe aprovação instantânea em 3 segundos e o treinador fica 100% livre do risco de chargeback (o golpe em que um aluno consome o desafio no cartão de crédito e depois contesta a compra no banco, gerando prejuízo e multas). No Pix, a liquidação é definitiva, segura e imediata.',
  },
  {
    q: 'Quais são as taxas da plataforma e a tarifa bancária do Pix?',
    a: 'No Plano Pro, a ArenaFitPro tem taxa ZERO (0% de comissão da plataforma). No Starter, a taxa é de 15%. Em ambos os planos, a única dedução na venda do desafio é a tarifa bancária de liquidação Pix do Asaas (a partir de R$ 0,99 fixo promocional nos primeiros meses e R$ 1,99 fixo padrão, sem percentuais abusivos e sem taxa de antecipação). Já a mensalidade Pro do treinador pode ser paga via Pix ou Cartão de Crédito.',
  },
  {
    q: 'O que é a medição calórica por Inteligência Artificial?',
    a: 'Ao fotografar o seu prato na missão de refeição, a IA multimodal analisa os alimentos visíveis e calcula uma estimativa imediata de calorias (kcal) e distribuição aproximada de macronutrientes (proteínas, carboidratos e gorduras).',
  },
  {
    q: 'O que acontece se um aluno denunciar uma foto inadequada no feed?',
    a: 'A foto denunciada é imediatamente destacada no painel do treinador na aba "Denunciadas" da central de auditoria, permitindo ao coach rejeitar o check-in ou remover a pontuação com 1 clique.',
  },
  {
    q: 'Como comprovar a execução dos treinos e cardios?',
    a: 'Basta tocar no botão de check-in ou selecionar a missão. Para treinos e cardios, você pode acionar o cronômetro ativo e registrar a foto ao vivo na câmera antifraude com sensor de horário e localização.',
  },
  {
    q: 'Posso usar o ArenaFitPro no computador e no celular?',
    a: 'Sim! A plataforma é uma Progressive Web App (PWA) totalmente responsiva, funcionando no navegador do celular, tablet ou computador sem necessidade de download na loja.',
  },
];

const helpFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

const helpBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Início',
      item: 'https://arenafitpro.com.br',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Central de Ajuda & FAQ',
      item: 'https://arenafitpro.com.br/ajuda',
    },
  ],
};

export default function HelpFaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) => 
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080A0F] text-[#F4F6FA] relative overflow-x-hidden font-sans">
      <JsonLd data={helpFaqSchema} />
      <JsonLd data={helpBreadcrumbSchema} />

      <main className="max-w-4xl mx-auto p-6 sm:p-12">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-mono text-[#A7B0C0] hover:text-[#F4F6FA] transition-colors px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#121722] border border-[#252D3B]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao Início
          </Link>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 border-b border-[#252D3B] pb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-[#3478F6]/10 text-[#75A7FF] px-3 py-1 rounded-full border border-[#3478F6]/25">
                SUPORTE & CONHECIMENTO
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F4F6FA]">
              Central de Ajuda & FAQ
            </h1>
            <p className="text-xs sm:text-sm text-[#A7B0C0] font-mono">
              Tire suas dúvidas sobre o funcionamento do ArenaFitPro para treinadores e atletas.
            </p>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-[#A7B0C0]" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar dúvida ou tópico (ex: Pix, câmera, squads, calorias)..."
              className="pl-10 h-12 bg-[#121722] border-[#252D3B] text-[#F4F6FA] rounded-2xl text-xs placeholder:text-[#A7B0C0]/60 focus:border-[#3478F6]"
            />
          </div>

          {/* Lista de Acordeão de FAQ */}
          <div className="space-y-3 pt-2">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#252D3B] bg-[#121722] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-4 min-h-[48px] text-left flex items-center justify-between gap-4 hover:bg-[#181F2E] transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-bold text-[#F4F6FA] flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-[#75A7FF] shrink-0" />
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-[#75A7FF] shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#A7B0C0] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 text-xs text-[#A7B0C0] leading-relaxed border-t border-[#252D3B] bg-[#080A0F]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Card de Atendimento Direto */}
          <div className="p-6 rounded-2xl bg-[#121722] border border-[#252D3B] flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div>
              <h3 className="text-sm font-bold text-[#F4F6FA] font-mono">Ainda precisa de auxílio?</h3>
              <p className="text-xs text-[#A7B0C0] mt-0.5">
                Nossa equipe técnica atende treinadores e alunos em horário comercial.
              </p>
            </div>
            <a
              href={CONTACT_CONFIG.getDirectWhatsappUrl('Olá, preciso de suporte sobre o ArenaFitPro.')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#3478F6] hover:bg-[#2563EB] text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 shrink-0 shadow-[0_0_20px_rgba(52,120,246,0.3)]"
            >
              <MessageCircle className="h-4 w-4" /> Suporte WhatsApp
            </a>
          </div>
        </div>
      </main>

      <CorporateFooter />
    </div>
  );
}
