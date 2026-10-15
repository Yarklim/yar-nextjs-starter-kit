import 'server-only';

import type { Locale } from '@/shared/i18n';

import { getSiteUrl } from '@/shared/utils/getBaseUrl';
import { toSeoText } from './toSeoText';

export type PageJsonLdInput = {
  locale: Locale;
  pathname: string;
  title: string;
  description?: string;
  type?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ProfilePage';
  mainEntity?: Record<string, unknown>;
};

export function buildPageJsonLd({
  locale,
  pathname,
  title,
  description,
  type = 'WebPage',
  mainEntity,
}: PageJsonLdInput) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${pathname}`;

  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: toSeoText(title),
    description: toSeoText(description) || undefined,
    inLanguage: locale,
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#organization` },
    ...(mainEntity && {
      mainEntity: { '@id': `${url}#main-entity`, ...mainEntity },
    }),
  };
}
