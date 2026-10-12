'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, FileText, Lock } from 'lucide-react';

export default function TermsAndPrivacyPage() {
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
              DOCUMENTO LEGAL v2.4
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Termos de Uso & Política de Privacidade
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Última atualização: Outubro de 2026 • Plataforma ArenaFitPro
          </p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed font-sans">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <FileText className="h-4 w-4 text-white" /> 1. Objeto e Natureza da Plataforma
            </h2>
            <p>
              O <strong>ArenaFitPro</strong> é uma plataforma SaaS de infraestrutura de desafios esportivos, gamificação e intermediação financeira para profissionais de educação física, nutricionistas e academias. A plataforma não prescreve treinamentos médicos ou dietéticos diretamente, sendo a responsabilidade técnica integral dos profissionais contratantes devidamente certificados.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-white" /> 2. Proteção de Dados e LGPD (Lei 13.709/2018)
            </h2>
            <p>
              Coletamos exclusivamente os dados estritamente necessários para a prestação dos serviços: nome, e-mail, telefone, registros fotográficos enviados durante as missões com consentimento explícito, e informações bancárias criptografadas para processamento de pagamentos.
            </p>
            <p>
              As fotos do <em>Cofre Antes & Depois</em> possuem criptografia de nível bancário e são restritas ao aluno e ao seu treinador responsável, jamais sendo divulgadas sem autorização prévia por escrito.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Lock className="h-4 w-4 text-white" /> 3. Transações Financeiras e Split de Pagamentos
            </h2>
            <p>
              Todas as transações via Pix e Cartão de Crédito são processadas através da instituição financeira autorizada pelo Banco Central do Brasil (Asaas Gestão Financeira S.A.). Os repasses aos treinadores ocorrem conforme o modelo D+0 Pix e regras de split configuradas, descontadas as taxas administrativas da plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">
              4. Regras de Conduta e Antifraude
            </h2>
            <p>
              Submissões de fotos falsificadas, uso de imagens de terceiros ou tentativa de burla nos sensores ópticos e de geolocalização acarretam na anulação imediata dos pontos no ranking e cancelamento do acesso, sem prejuízo de apuração pelo treinador da turma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono">
              5. Contato e Encarregado de Dados (DPO)
            </h2>
            <p>
              Para dúvidas, retificação ou exclusão de dados pessoais da base, entre em contato através do e-mail oficial: <span className="font-mono text-white">suporte@arenafit.pro</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
