'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  HelpCircle, 
  FileText, 
  Scale, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { CORPORATE_CONFIG } from '@/lib/corporate-config';

interface CorporateFooterProps {
  showNavigation?: boolean;
}

export function CorporateFooter({ showNavigation = true }: CorporateFooterProps) {
  return (
    <footer 
      role="contentinfo"
      aria-label="Rodapé Institucional e Legal"
      className="border-t border-white/[0.08] bg-black text-zinc-400 py-12 sm:py-16 px-4 sm:px-6 relative z-10 font-sans"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Linha Superior: Logo, Descrição e Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Coluna Institucional */}
          <div className="md:col-span-5 space-y-4 text-left">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-white rounded-lg"
              aria-label="ArenaFitPro - Ir para página inicial"
            >
              <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" />
                </svg>
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">ArenaFitPro</span>
            </Link>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-sm">
              Infraestrutura SaaS Multi-Tenant para desafios esportivos com validação óptica antifraude, inteligência artificial nutricional e split bancário Pix D+0 integrado ao Asaas.
            </p>

            <div className="space-y-1 text-xs text-zinc-300 font-mono">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                <span>{CORPORATE_CONFIG.address.formatted}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-zinc-400">CNPJ:</span>
                <span className="text-zinc-200">{CORPORATE_CONFIG.cnpj}</span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-200">{CORPORATE_CONFIG.legalName}</span>
              </p>
            </div>
          </div>

          {/* Links Rápidos e Suporte */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Navegação & Suporte
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
              <li>
                <Link href="/beta" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded flex items-center gap-1.5">
                  <span>Programa Beta Pioneers</span>
                  <span className="text-[9px] font-mono uppercase bg-white/10 text-white px-1.5 py-0.5 rounded border border-white/20">Vagas</span>
                </Link>
              </li>
              <li>
                <Link href="/ajuda" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded">
                  Central de Ajuda & FAQ
                </Link>
              </li>
              <li>
                <Link href="/login?role=professional" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded">
                  Portal do Treinador
                </Link>
              </li>
              <li>
                <Link href="/login?role=student" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded">
                  Área do Aluno
                </Link>
              </li>
              <li>
                <a 
                  href={`mailto:${CORPORATE_CONFIG.contacts.supportEmail}`}
                  className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  SAC: {CORPORATE_CONFIG.contacts.supportEmail}
                </a>
              </li>
            </ul>
          </div>

          {/* Conformidade e LGPD */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacidade & Direitos do Titular</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
              <li>
                <Link href="/privacidade" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded">
                  Política de Privacidade & Proteção de Dados
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded">
                  Termos de Uso & Contrato SaaS
                </Link>
              </li>
              <li>
                <Link href="/lgpd" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 rounded flex items-center gap-1">
                  <span>Formulário de Requisições LGPD (Art. 18)</span>
                </Link>
              </li>
              <li className="text-xs text-zinc-400 pt-1">
                <span>DPO: {CORPORATE_CONFIG.contacts.dpoName}</span>
                <br />
                <a href={`mailto:${CORPORATE_CONFIG.contacts.dpoEmail}`} className="underline hover:text-white">
                  {CORPORATE_CONFIG.contacts.dpoEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Isenções Legais e Avisos Mandatórios (CDC & Saúde) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-2 text-xs text-zinc-300 leading-relaxed font-normal">
          <div className="flex items-center gap-2 text-zinc-200 font-mono text-[11px] uppercase tracking-wider font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
            <span>Avisos Legais & Isenção de Responsabilidade Técnica (CDC & CFM/CFN)</span>
          </div>
          <p>
            {CORPORATE_CONFIG.disclaimers.medical}
          </p>
          <p>
            {CORPORATE_CONFIG.disclaimers.results}
          </p>
          <p className="text-zinc-400 text-[11px]">
            Conforme o Art. 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990), o consumidor tem o direito de solicitar o cancelamento e reembolso de sua inscrição em até 7 (sete) dias corridos a partir da confirmação do pagamento.
          </p>
        </div>

        {/* Linha Final: Copyright e Legislação */}
        <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div>
            © {new Date().getFullYear()} {CORPORATE_CONFIG.legalName} • Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4 text-zinc-300">
            <span>Versão {CORPORATE_CONFIG.legal.version}</span>
            <span>•</span>
            <span>{CORPORATE_CONFIG.legal.applicableLaw}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
