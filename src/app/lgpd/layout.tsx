import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal de Privacidade & Atendimento ao Titular (LGPD)',
  description:
    'Exercite seus direitos previstos no Art. 18 da LGPD junto ao Encarregado de Dados (DPO) da ArenaFitPro.',
};

export default function LgpdLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
