import type { Metadata, ResolvingMetadata } from 'next';

import { routing } from '@/shared/i18n';

import {
  DEFAULT_PER_PAGE,
  listURL,
  type ListQuery,
} from '@/shared/lib/pagination/query';
import { getRobotsMetadata } from '../helpers/getRobotsMetadata';
import { buildOpenGraph, buildTwitter } from './metadata.builders';

const isProd = process.env.NODE_ENV === 'production';

export function buildListMetadata(
  base: Awaited<ResolvingMetadata>,
  {
    title,
    description,
    locale,
    route,
    query,
  }: {
    title: string;
    description: string;
    locale: string;
    route: string;
    query: ListQuery;
  },
): Metadata {
  const pathname = listURL(`/${locale}${route}`, query);
  const filtered = !!query.q || query.perPage !== DEFAULT_PER_PAGE;

  return {
    title,
    description,
    alternates: isProd
      ? {
          canonical: pathname,
          // Search matches translated text and does not define language equivalents.
          languages: query.q
            ? undefined
            : Object.fromEntries(
                routing.locales.map((language) => [
                  language,
                  listURL(`/${language}${route}`, query),
                ]),
              ),
        }
      : undefined,
    openGraph: buildOpenGraph(base, { title, description, pathname }),
    twitter: buildTwitter(base, { title, description, pathname }),
    robots:
      isProd && filtered
        ? {
            index: false,
            follow: true,
            googleBot: { index: false, follow: true },
          }
        : getRobotsMetadata(),
  };
}
