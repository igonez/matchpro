'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
    q: 'O que é a medição calórica por Inteligência Artificial?',
    a: 'Ao fotografar o seu prato na missão de refeição, a IA multimodal analisa os alimentos visíveis e calcula uma estimativa imediata de calorias (kcal) e distribuição aproximada de macronutrientes (proteínas, carboidratos e gorduras).',
  },
  {
    q: 'O que acontece se um aluno denunciar uma foto inadequada no feed?',
    a: 'A foto denunciada é imediatamente destacada no painel do treinador na aba "🚨 Denunciadas" da central de auditoria, permitindo ao coach rejeitar o check-in ou remover a pontuação com 1 clique.',
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

export default function HelpFaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) => 
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-12 relative max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors p-2 rounded-xl bg-white/5 border border-white/10"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Início
        </Link>
      </div>

      <div className="space-y-6">
        <div className="space-y-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-white/10 text-white px-2.5 py-0.5 rounded-full border border-white/20">
              SUPORTE & CONHECIMENTO
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Central de Ajuda & FAQ
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Tire suas dúvidas sobre o funcionamento do ArenaFitPro para treinadores e atletas.
          </p>
        </div>

        {/* Campo de Busca */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-zinc-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar dúvida ou tópico (ex: Pix, câmera, squads, calorias)..."
            className="pl-10 h-12 bg-zinc-950 border-white/15 text-white rounded-2xl text-xs placeholder:text-zinc-600 focus:border-white/40"
          />
        </div>

        {/* Lista de Acordeão de FAQ */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-zinc-950/70 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-zinc-400 shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-white/5 bg-black/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Card de Atendimento Direto */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div>
            <h3 className="text-sm font-bold text-white font-mono">Ainda precisa de auxílio?</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Nossa equipe técnica atende treinadores e alunos em horário comercial.
            </p>
          </div>
          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%2C+preciso+de+ajuda+com+o+ArenaFitPro"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 shrink-0"
          >
            <MessageCircle className="h-4 w-4" /> Suporte WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
