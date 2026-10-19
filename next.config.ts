import type { NextConfig } from "next";

const securityHeaders = [
  // 1. Enforce HTTPS (TLS 1.3/1.2) - 2 anos com subdomínios e preload
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // 2. Prevenir Clickjacking - proibir embedding em iframes de outros domínios
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // 3. Prevenir MIME Sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // 4. Referrer Policy segura
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // 5. Isolamento de contexto de janela
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  // 6. Restrição de APIs nativas do navegador
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(), browsing-topics=(), payment=(self)',
  },
  // 7. Content Security Policy (CSP)
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.asaas.com https://generativelanguage.googleapis.com; frame-ancestors 'self';",
  },
  // 8. Proteção XSS legada para navegadores mais antigos
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
];

const nextConfig: NextConfig = {
  // Headers globais de segurança e controle de cache
  async headers() {
    return [
      {
        // Aplica cabeçalhos de segurança em todas as rotas
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Configuração de CORS estrita para endpoints de API (origem explícita para evitar rejeição com credentials)
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || 'https://arenafitpro.com.br' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, asaas-access-token',
          },
        ],
      },
      {
        // Prevenção de cache em páginas autenticadas e dinâmicas
        source: '/((?!_next/static|_next/image|favicon.png|icon-.*\\.png).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
