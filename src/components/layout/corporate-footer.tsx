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
      className="border-t border-[#252D3B] bg-[#080A0F] text-[#A7B0C0] py-12 sm:py-16 px-4 sm:px-6 relative z-10 font-sans"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Linha Superior: Logo, Descrição e Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Coluna Institucional */}
          <div className="md:col-span-5 space-y-4 text-left">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-[#3478F6] rounded-lg"
              aria-label="ArenaFitPro - Ir para página inicial"
            >
              <div className="h-8 w-8 rounded-xl bg-[#121722] border border-[#252D3B] flex items-center justify-center text-white shrink-0 group-hover:border-[#3478F6] transition-colors">
                <svg className="w-4 h-4 text-[#3478F6]" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" />
                </svg>
              </div>
              <span className="font-extrabold text-[#F4F6FA] text-lg tracking-tight">ArenaFitPro</span>
            </Link>

            <p className="text-xs sm:text-sm text-[#A7B0C0] leading-relaxed max-w-sm">
              Infraestrutura SaaS Multi-Tenant para desafios esportivos com validação óptica antifraude, inteligência artificial nutricional e split bancário Pix D+0 integrado ao Asaas.
            </p>

            <div className="space-y-1 text-xs text-[#A7B0C0] font-mono">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#3478F6] mt-0.5 shrink-0" />
                <span>{CORPORATE_CONFIG.address.formatted}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-[#A7B0C0]/80">CNPJ:</span>
                <span className="text-[#F4F6FA]">{CORPORATE_CONFIG.cnpj}</span>
                <span className="text-[#252D3B]">•</span>
                <span className="text-[#F4F6FA]">{CORPORATE_CONFIG.legalName}</span>
              </p>
            </div>
          </div>

          {/* Links Rápidos e Suporte */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F6FA]">
              Navegação & Suporte
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A7B0C0]">
              <li>
                <Link href="/beta" className="hover:text-[#F4F6FA] transition-colors focus-visible:ring-2 focus-visible:ring-[#3478F6] rounded flex items-center gap-1.5">
                  <span>Programa Beta Pioneers</span>
                  <span className="text-[9px] font-mono uppercase bg-[#3478F6]/15 text-[#75A7FF] px-1.5 py-0.5 rounded border border-[#3478F6]/30">Vagas</span>
                </Link>
              </li>
              <li>
                <Link href="/ajuda" className="hover:text-[#F4F6FA] transition-colors focus-visible:ring-2 focus-visible:ring-[#3478F6] rounded">
                  Central de Ajuda & FAQ
                </Link>
              </li>
              <li>
                <Link href="/login?role=professional" className="hover:text-[#F4F6FA] transition-colors focus-visible:ring-2 focus-visible:ring-[#3478F6] rounded">
                  Portal do Treinador
                </Link>
              </li>
              <li>
                <Link href="/login?role=student" className="hover:text-[#F4F6FA] transition-colors focus-visible:ring-2 focus-visible:ring-[#3478F6] rounded">
                  Área do Aluno
                </Link>
              </li>
              <li>
                <a 
                  href={`mailto:${CORPORATE_CONFIG.contacts.supportEmail}`}
                  className="hover:text-[#F4F6FA] transition-colors focus-visible:ring-2 focus-visible:ring-[#3478F6] rounded"
                >
                  SAC: {CORPORATE_CONFIG.contacts.supportEmail}
                </a>
              </li>
            </ul>
          </div>

          {/* Conformidade e LGPD */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F6FA] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3478F6]" />
              <span>Privacidade & Direitos do Titular</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A7B0C0]">
              <li>
                <Link href="/privacidade" className="hover:text-[#F4F6FA] transition-colors focus-visible:ring-2 focus-visible:ring-[#3478F6] rounded">
                  Política de Privacidade & Proteção de Dados
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-[#F4F6FA] transition-colors focus-visible:ring-2 focus-visible:ring-[#3478F6] rounded">
                  Termos de Uso & Contrato SaaS
                </Link>
              </li>
              <li>
                <Link href="/lgpd" className="text-[#3478F6] hover:text-[#75A7FF] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#3478F6] rounded flex items-center gap-1">
                  <span>Formulário de Requisições LGPD (Art. 18)</span>
                </Link>
              </li>
              <li className="text-xs text-[#A7B0C0] pt-1">
                <span>DPO: {CORPORATE_CONFIG.contacts.dpoName}</span>
                <br />
                <a href={`mailto:${CORPORATE_CONFIG.contacts.dpoEmail}`} className="underline hover:text-[#F4F6FA]">
                  {CORPORATE_CONFIG.contacts.dpoEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Isenções Legais e Avisos Mandatórios (CDC & Saúde) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121722] border border-[#252D3B] space-y-2 text-xs text-[#A7B0C0] leading-relaxed font-normal">
          <div className="flex items-center gap-2 text-[#F4F6FA] font-mono text-[11px] uppercase tracking-wider font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
            <span>Avisos Legais & Isenção de Responsabilidade Técnica (CDC & CFM/CFN)</span>
          </div>
          <p>
            {CORPORATE_CONFIG.disclaimers.medical}
          </p>
          <p>
            {CORPORATE_CONFIG.disclaimers.results}
          </p>
          <p className="text-[#A7B0C0]/80 text-[11px]">
            Conforme o Art. 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990), o consumidor tem o direito de solicitar o cancelamento e reembolso de sua inscrição em até 7 (sete) dias corridos a partir da confirmação do pagamento.
          </p>
        </div>

        {/* Linha Final: Copyright e Legislação */}
        <div className="pt-6 border-t border-[#252D3B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#A7B0C0]">
          <div>
            © {new Date().getFullYear()} {CORPORATE_CONFIG.legalName} • Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4 text-[#A7B0C0]">
            <span>Versão {CORPORATE_CONFIG.legal.version}</span>
            <span>•</span>
            <span>{CORPORATE_CONFIG.legal.applicableLaw}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
