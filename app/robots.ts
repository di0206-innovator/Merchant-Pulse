import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://merchantpulse.io';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/auth', '/privacy', '/terms', '/thank-you'],
        disallow: ['/api/', '/overview', '/dashboard', '/reviewer', '/audit', '/history', '/knowledge'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
