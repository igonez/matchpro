import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade e Proteção de Dados',
  description:
    'Entenda como o ArenaFitPro protege seus dados cadastrais, métricas de saúde e fotos de check-in em conformidade integral com a LGPD.',
  alternates: {
    canonical: 'https://arenafitpro.com.br/privacidade',
  },
};

export default function PrivacidadeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
