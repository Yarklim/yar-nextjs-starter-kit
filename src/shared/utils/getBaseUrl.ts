import 'server-only';

const FALLBACK_SITE_URL = 'http://localhost:3000';

export function getSiteUrl(): string {
  return (process.env.SITE_URL ?? FALLBACK_SITE_URL).replace(/\/+$/, '');
}

export function getBaseUrl(): string {
  return getSiteUrl();
}
