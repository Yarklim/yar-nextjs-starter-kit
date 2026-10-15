import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { notFound } from 'next/navigation';

import { hasLocale, NextIntlClientProvider } from 'next-intl';

import { routing } from '@/shared/i18n';

import '@styles/globals.css';
import { getLocale, getTranslations } from 'next-intl/server';

import {
  FALLBACK_SITE_URL,
  LOCALE_ALTERNATE,
  LOCALE_POSIX,
  OG_DEFAULT_IMAGE,
  OG_IMAGE_BY_LOCALE,
} from '@/shared/seo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const isProd = process.env.NODE_ENV === 'production';

const SITE_URL = process.env.SITE_URL
  ? process.env.SITE_URL.replace(/\/+$/, '')
  : FALLBACK_SITE_URL;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations('Metadata');

  const siteName = t('site_title');
  const description = t('site_description');

  const ogImage = OG_IMAGE_BY_LOCALE[locale] ?? OG_DEFAULT_IMAGE;

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      template: `${siteName} | %s`,
      default: siteName,
    },

    description,

    robots: isProd
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        },

    openGraph: {
      siteName,
      type: 'website',
      title: siteName,
      description,
      url: `${SITE_URL}/${locale}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
      locale: LOCALE_POSIX[locale],
    },

    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      images: [ogImage],
    },

    alternates: {
      canonical: isProd ? `/${locale}` : undefined,
      languages: isProd ? LOCALE_ALTERNATE : undefined,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
