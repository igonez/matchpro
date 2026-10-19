import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Entrar na Plataforma',
  description:
    'Acesse seu painel de treinador ou entre no desafio da sua turma com seu código de convite no ArenaFitPro.',
  alternates: {
    canonical: 'https://arenafitpro.com.br/login',
  },
  openGraph: {
    title: 'Entrar — ArenaFitPro',
    description:
      'Acesse sua conta ou informe seu código de turma para entrar no desafio fitness gamificado.',
    url: 'https://arenafitpro.com.br/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
