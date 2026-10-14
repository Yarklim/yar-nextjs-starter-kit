import { defineRouting } from 'next-intl/routing';

import { defaultLocale, localesKey } from './config/locales';

export const routing = defineRouting({
  locales: localesKey,
  defaultLocale: defaultLocale,
  localePrefix: 'always',
});
