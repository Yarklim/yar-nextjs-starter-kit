import 'server-only';

import type { Locale } from '../../i18n/types/locale.type';

const OG_BY_LOCALE: Record<Locale, string> = {
  uk: '/og/og-uk.jpg',
  en: '/og/og-en.jpg',
};

export function getOgImageForLocale(locale: string): string {
  if (locale === 'uk' || locale === 'en') {
    return OG_BY_LOCALE[locale];
  }
  return OG_BY_LOCALE.en;
}
