/**
 * Configurações Institucionais e Legais da ArenaFitPro
 * Em conformidade com o Decreto do Comércio Eletrônico (nº 7.962/2013),
 * Código de Defesa do Consumidor (Lei 8.078/1990) e LGPD (Lei 13.709/2018).
 */

export const CORPORATE_CONFIG = {
  companyName: 'ArenaFitPro',
  legalName: 'ArenaFitPro Tecnologia e Serviços Digitais Ltda.',
  cnpj: '54.892.103/0001-42',
  address: {
    street: 'Av. Paulista, 1106, Sala 01',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-914',
    country: 'Brasil',
    formatted: 'Av. Paulista, 1106, Sala 01 - Bela Vista, São Paulo - SP, CEP 01310-914',
  },
  contacts: {
    supportEmail: 'contato@arenafitpro.com.br',
    privacyEmail: 'privacidade@arenafitpro.com.br',
    legalEmail: 'juridico@arenafitpro.com.br',
    dpoEmail: 'dpo@arenafitpro.com.br',
    dpoName: 'Igor Telmo / Encarregado de Proteção de Dados',
    phone: '+55 (12) 99164-7211',
    businessHours: 'Segunda a Sexta, das 09h às 18h (Horário de Brasília)',
  },
  legal: {
    version: '2.5',
    lastUpdated: '21 de Outubro de 2026',
    applicableLaw: 'Legislação da República Federativa do Brasil',
    disputeForum: 'Foro da Comarca de São Paulo / SP',
    refundDays: 7, // Art. 49 CDC
    dpoResponseDays: 15, // Art. 19, II LGPD (15 dias)
  },
  disclaimers: {
    medical:
      'O ArenaFitPro é uma plataforma tecnológica de software como serviço (SaaS) voltada à gestão, gamificação e engajamento em desafios esportivos. A plataforma não presta serviços médicos, não prescreve treinos físicos nem dietas nutricionais. Toda a orientação esportiva e alimentar é de responsabilidade técnica integral e exclusiva dos Profissionais de Educação Física (CREF) e Nutricionistas (CRN) responsáveis pelas turmas. Consulte sempre um médico antes de iniciar qualquer programa de exercícios.',
    results:
      'Os resultados de perda de peso, condicionamento físico e ganho muscular variam de acordo com a individualidade biológica, o nível de esforço e o protocolo específico de cada treinador. Não há garantia de resultados pré-determinados. Da mesma forma, as projeções financeiras na calculadora são estimativas com base nos valores informados pelo próprio usuário e não constituem garantia de faturamento.',
  },
};
