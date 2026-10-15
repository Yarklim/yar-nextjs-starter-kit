import 'server-only';

import { JsonLd } from './JsonLd';

import {
  buildPageJsonLd,
  type PageJsonLdInput,
} from '../utils/buildPageJsonLd';

export function PageJsonLd(props: PageJsonLdInput) {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }
  return <JsonLd data={buildPageJsonLd(props)} />;
}
