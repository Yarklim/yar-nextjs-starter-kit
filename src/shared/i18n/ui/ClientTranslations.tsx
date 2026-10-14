import 'server-only';

import type { ReactNode } from 'react';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import type { ClientMessageNamespace } from '../config/clientMessages.config';
import { pickMessages } from '../utils/pickMessages';

export async function ClientTranslations({
  children,
  namespaces,
}: {
  children: ReactNode;
  namespaces: readonly ClientMessageNamespace[];
}) {
  const messages = pickMessages(await getMessages(), namespaces);

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
