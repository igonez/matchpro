import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/termos', '/ajuda', '/join/'],
        disallow: ['/api/', '/dashboard/', '/app/', '/auth/'],
      },
    ],
    sitemap: 'https://arenafitpro.com.br/sitemap.xml',
    host: 'https://arenafitpro.com.br',
  };
}
