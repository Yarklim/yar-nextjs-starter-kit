import type { Metadata, ResolvingMetadata } from 'next';

import { getLocale, getTranslations } from 'next-intl/server';

import {
  buildOpenGraph,
  buildTwitter,
  getRobotsMetadata,
  PageJsonLd,
  resolveParent,
} from '@/shared/seo';

import { routing } from '@/shared/i18n';

const isProd = process.env.NODE_ENV === 'production';

export async function generateMetadata(
  _props: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const locale = await getLocale();
  const base = await resolveParent(parent);

  const t = await getTranslations('Metadata');

  const title = t('home_title');
  const description = t('home_description');

  const pathname = `/${locale}`;

  return {
    title,
    description,

    alternates: isProd
      ? {
          canonical: pathname,
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `/${l}`]),
          ),
        }
      : undefined,

    openGraph: buildOpenGraph(base, {
      title,
      description,
      pathname,
    }),

    twitter: buildTwitter(base, {
      title,
      description,
      pathname,
    }),

    robots: getRobotsMetadata(),
  };
}

export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations('Metadata');

  return (
    <>
      <PageJsonLd
        locale={locale}
        pathname={`/${locale}`}
        title={t('home_title')}
        description={t('home_description')}
      />
      <h1>{t('home_title')}</h1>
    </>
  );
}
