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
import { ImmediateSplashManager } from '@/components/ui/immediate-splash-manager';

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
        {/* Splash Screen Instantâneo Inline de Frame 0 (Elimina 100% de tela preta antes do React hidratar) */}
        <div
          id="arena-immediate-splash"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transition: 'opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Radial Gradient de Fundo */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.025) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Container Central com a Estrela Pura Oficial */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            {/* Aura Titânio Volumétrica */}
            <div
              style={{
                position: 'absolute',
                width: '220px',
                height: '220px',
                borderRadius: '9999px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(161,161,170,0.02) 45%, transparent 70%)',
                filter: 'blur(36px)',
                pointerEvents: 'none',
              }}
            />

            {/* Núcleo Luminoso */}
            <div
              style={{
                position: 'absolute',
                width: '112px',
                height: '112px',
                borderRadius: '9999px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(161,161,170,0.05) 50%, transparent 80%)',
                filter: 'blur(20px)',
                pointerEvents: 'none',
              }}
            />

            {/* Estrela Estelar Idêntica ao Ícone Oficial */}
            <div
              style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                viewBox="0 0 2048 2048"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.18)) drop-shadow(0 15px 30px rgba(0,0,0,0.95))',
                }}
              >
                <defs>
                  <linearGradient id="splashStarGrad" x1="1024" y1="420" x2="1024" y2="1628" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="25%" stopColor="#F4F4F5" />
                    <stop offset="65%" stopColor="#A1A1AA" />
                    <stop offset="100%" stopColor="#52525B" />
                  </linearGradient>
                  <linearGradient id="splashBezelGrad" x1="420" y1="420" x2="1628" y2="1628" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#71717A" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#18181B" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="splashGleamLight" x1="-120%" y1="-120%" x2="20%" y2="20%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                    <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
                    <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    <animate attributeName="x1" values="-150%;150%;-150%" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="y1" values="-150%;150%;-150%" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="x2" values="-10%;290%;-10%" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="y2" values="-10%;290%;-10%" dur="3s" repeatCount="indefinite" />
                  </linearGradient>
                  <filter id="splashGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="16" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <g filter="url(#splashGlowFilter)">
                  <path
                    d="M1024 420 L1160 888 L1628 1024 L1160 1160 L1024 1628 L888 1160 L420 1024 L888 888 Z"
                    fill="url(#splashStarGrad)"
                    stroke="url(#splashBezelGrad)"
                    strokeWidth="12"
                  />
                  <path
                    d="M1024 420 L1160 888 L1628 1024 L1160 1160 L1024 1628 L888 1160 L420 1024 L888 888 Z"
                    fill="url(#splashGleamLight)"
                    style={{ mixBlendMode: 'screen' }}
                  />
                  <line x1="1024" y1="420" x2="1024" y2="1628" stroke="#FFFFFF" strokeWidth="8" opacity="0.6" />
                  <line x1="420" y1="1024" x2="1628" y2="1024" stroke="#FFFFFF" strokeWidth="8" opacity="0.6" />
                  <polygon
                    points="1024,710 1120,1024 1024,1338 928,1024"
                    fill="#000000"
                    fillOpacity="0.45"
                  />
                  <circle cx="1024" cy="1024" r="70" fill="#FFFFFF" />
                  <circle cx="1024" cy="1024" r="45" fill="#18181B" />
                  <circle cx="1024" cy="1024" r="16" fill="#FFFFFF" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Script Inline Auto-Destrutivo com Fallback Resiliente */}
        <script
          id="arena-splash-script"
          dangerouslySetInnerHTML={{
            __html: `
              window.dismissArenaSplash = function() {
                var el = document.getElementById('arena-immediate-splash');
                if (!el) return;
                el.style.opacity = '0';
                setTimeout(function() {
                  if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                  }
                }, 300);
              };
              setTimeout(function() {
                if (window.dismissArenaSplash) window.dismissArenaSplash();
              }, 3500);
            `,
          }}
        />

        <ImmediateSplashManager />

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

