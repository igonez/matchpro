import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://arenafitpro.com.br'),
  title: {
    default: 'ArenaFitPro — Desafios Fitness Gamificados & Split Pix D+0',
    template: '%s | ArenaFitPro',
  },
  description:
    'Plataforma de gamificação para Personal Trainers e Academias criarem desafios fitness com Câmera Antifraude, IA Nutricional e Split Pix D+0 no Asaas.',
  keywords: [
    'desafio fitness',
    'app para personal trainer',
    'gamificação fitness',
    'consultoria online fitness',
    'plataforma de desafios fitness',
    'split pix asaas',
    'ranking fitness em grupo',
    'câmera antifraude fitness',
    'ia nutricional',
    'retenção de alunos academia',
  ],
  authors: [{ name: 'ArenaFitPro Team' }],
  creator: 'ArenaFitPro',
  publisher: 'ArenaFitPro',
  alternates: {
    canonical: 'https://arenafitpro.com.br',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      'facebook-domain-verification':
        process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION ||
        'r9pmhnlils01kccnjjte9gn5ieeuia',
    },
  },
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
      'Infraestrutura de gamificação fitness para Personal Trainers e Nutricionistas. Câmera com IA Nutricional, Pódio ao Vivo e Split Pix D+0 no Asaas sem bitributação.',
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
import { CookieConsentBanner } from '@/components/legal/cookie-consent-banner';
import { MarketingScripts } from '@/components/analytics/marketing-scripts';

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
    <html lang="pt-BR" className={`dark scroll-smooth ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-black text-zinc-100 antialiased selection:bg-white selection:text-black font-sans text-base leading-relaxed">
        {/* Escudo superior para Dynamic Island / Status Bar iOS em modo PWA e Safari */}
        <div
          className="fixed top-0 inset-x-0 h-[env(safe-area-inset-top,0px)] bg-black z-[100] pointer-events-none"
          aria-hidden="true"
        />
        <JsonLd data={organizationSchema} />
        <MarketingScripts />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}

