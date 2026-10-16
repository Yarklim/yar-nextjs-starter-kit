import type { MetadataRoute } from 'next';

import { FALLBACK_SITE_URL } from '@/shared/seo';

const FALLBACK_PROD_URL = FALLBACK_SITE_URL;
const FALLBACK_DEV_URL = 'http://localhost:3000';

const isProd = process.env.NODE_ENV === 'production';

const SITE_URL = (
  process.env.SITE_URL ?? (isProd ? FALLBACK_PROD_URL : FALLBACK_DEV_URL)
).replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
  if (!isProd) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
