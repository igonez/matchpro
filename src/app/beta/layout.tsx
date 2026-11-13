import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Programa Beta Founders',
  description:
    'Candidate-se ao programa de treinadores fundadores da ArenaFitPro com condições exclusivas.',
};

export default function BetaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
