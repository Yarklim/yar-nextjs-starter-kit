import 'server-only';

import { getTranslations } from 'next-intl/server';
import { getSiteUrl } from '@/shared/utils/getBaseUrl';
import { getLogoUrl } from '../utils/getLogoUrl';
import { JsonLd } from './JsonLd';

export async function SiteJsonLd() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const t = await getTranslations('Metadata');
  const siteUrl = getSiteUrl();
  const name = t('site_title');

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${siteUrl}/#organization`,
            name,
            url: siteUrl,
            logo: getLogoUrl(),
          },
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            name,
            url: siteUrl,
            inLanguage: ['uk', 'en'],
            publisher: { '@id': `${siteUrl}/#organization` },
          },
        ],
      }}
    />
  );
}
