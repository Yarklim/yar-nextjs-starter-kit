import 'server-only';

import { getSiteUrl } from '@/shared/utils/getBaseUrl';

export function getLogoUrl(): string {
  return `${getSiteUrl()}/images/logo.webp`;
}
