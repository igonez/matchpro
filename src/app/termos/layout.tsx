import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso e Serviço',
  description:
    'Consulte os termos legais, regras de intermediação de pagamentos com Split Pix e responsabilidades de uso da plataforma ArenaFitPro.',
  alternates: {
    canonical: 'https://arenafitpro.com.br/termos',
  },
};

export default function TermosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
