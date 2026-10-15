import 'server-only';

import logo from '@assets/images/logo.webp';
import { getSiteUrl } from '@/shared/utils/getBaseUrl';

export function getLogoUrl(): string {
  return new URL(logo.src, getSiteUrl()).toString();
}
