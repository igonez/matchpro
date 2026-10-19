import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Central de Ajuda e Suporte',
  description:
    'Tire dúvidas sobre validação por Câmera Antifraude, IA Nutricional, regras de pontuação, PWA e recebimento via Split Pix D+0 no ArenaFitPro.',
  alternates: {
    canonical: 'https://arenafitpro.com.br/ajuda',
  },
  openGraph: {
    title: 'Central de Ajuda & FAQ — ArenaFitPro',
    description:
      'Respostas rápidas sobre desafios fitness, auditoria de check-ins e pagamentos com Split Pix D+0.',
    url: 'https://arenafitpro.com.br/ajuda',
  },
};

export default function AjudaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
