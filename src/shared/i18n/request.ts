import * as rootParams from 'next/root-params';
import { notFound } from 'next/navigation';

import { getRequestConfig } from 'next-intl/server';

import { MESSAGE_FILES } from './config/messageFiles.config';
import { isLocale, type Locale } from './types/locale.type';

async function getMessages(locale: Locale) {
  return {
    ...(await import(`./messages/${locale}/${MESSAGE_FILES.COMMON}.json`))
      .default,

    ...(await import(`./messages/${locale}/${MESSAGE_FILES.CONTACTS}.json`))
      .default,

    ...(await import(`./messages/${locale}/${MESSAGE_FILES.FOOTER}.json`))
      .default,

    ...(await import(`./messages/${locale}/${MESSAGE_FILES.FORMS}.json`))
      .default,

    ...(await import(`./messages/${locale}/${MESSAGE_FILES.NAVIGATION}.json`))
      .default,
  };
}

export default getRequestConfig(async ({ locale }) => {
  const requestedLocale = locale ?? (await rootParams.locale());

  if (!isLocale(requestedLocale)) {
    notFound();
  }

  return {
    locale: requestedLocale,
    messages: await getMessages(requestedLocale),
  };
});
