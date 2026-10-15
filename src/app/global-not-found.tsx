import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import { routing } from '@/shared/i18n';

import { NotFoundContent } from '@/shared/ui/info-content';

import '@styles/globals.css';

const locale = routing.defaultLocale;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'NotFoundPage',
  });

  return {
    title: t('title'),
    description: t('description'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

const GlobalNotFound = async () => {
  const t = await getTranslations({
    locale,
    namespace: 'NotFoundPage',
  });

  return (
    <html lang={locale}>
      <body>
        <main>
          <NotFoundContent
            title={t('title')}
            description={t('description')}
            homeLabel={t('home')}
            homeHref={`/${locale}`}
          />
        </main>
      </body>
    </html>
  );
};

export default GlobalNotFound;
