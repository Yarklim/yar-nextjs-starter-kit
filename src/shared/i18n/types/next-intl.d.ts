import type { Locale } from './locale.type';

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
  }
}
