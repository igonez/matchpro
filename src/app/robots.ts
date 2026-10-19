import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/termos',
          '/privacidade',
          '/ajuda',
          '/vip',
          '/beta',
          '/join/',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: ['/api/', '/dashboard/', '/app/', '/auth/', '/admin/', '/mestre/'],
      },
    ],
    sitemap: 'https://arenafitpro.com.br/sitemap.xml',
    host: 'https://arenafitpro.com.br',
  };
}
