import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://arenafitpro.com.br'),
  title: 'ArenaFitPro — Gamification OS para Desafios Fitness & Split Pix D+0',
  description:
    'A plataforma definitiva para Personais, Consultorias e Academias criarem desafios fitness gamificados de alta retenção com Câmera Antifraude, IA Nutricional e Split Pix D+0 no Asaas.',
  keywords: [
    'desafio fitness',
    'gamificação fitness',
    'personal trainer',
    'consultoria online',
    'split pix',
    'ranking fitness',
    'app academia',
    'asaas split',
    'nutrição esportiva',
  ],
  authors: [{ name: 'ArenaFitPro Team' }],
  creator: 'ArenaFitPro',
  publisher: 'ArenaFitPro',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://arenafitpro.com.br',
    siteName: 'ArenaFitPro',
    title: 'ArenaFitPro — Gamification OS para Desafios Fitness & Split Pix D+0',
    description:
      'Retenção comprovada de 94.8%. Câmera com IA Nutricional, Pódio ao Vivo e Split Pix D+0 sem bitributação.',
    images: [
      {
        url: '/app-logo.png',
        width: 1200,
        height: 630,
        alt: 'ArenaFitPro Gamification OS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArenaFitPro — Desafios Fitness Gamificados',
    description:
      'Multiplique a retenção dos seus alunos com o sistema operacional para desafios fitness de alta performance.',
    images: ['/app-logo.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ArenaFitPro',
  },
};

import { JsonLd } from '@/components/seo/json-ld';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ArenaFitPro',
  legalName: 'ArenaFitPro Tecnologia e Gamificação Fitness Ltda',
  url: 'https://arenafitpro.com.br',
  logo: 'https://arenafitpro.com.br/app-logo.png',
  description:
    'Infraestrutura SaaS Multi-Tenant de gamificação para desafios fitness com Câmera Antifraude, IA Nutricional e Split Pix D+0.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'suporte@arenafit.pro',
    availableLanguage: ['Portuguese'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark scroll-smooth">
      <body className="min-h-screen bg-black text-zinc-100 antialiased selection:bg-white selection:text-black font-sans text-base leading-relaxed">
        <JsonLd data={organizationSchema} />
        {children}
      </body>
    </html>
  );
}

