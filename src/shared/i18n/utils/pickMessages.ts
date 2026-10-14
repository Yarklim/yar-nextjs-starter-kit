import type { AbstractIntlMessages } from 'next-intl';

export type Messages = AbstractIntlMessages;

export function pickMessages<T extends Messages>(
  messages: T,
  keys: readonly (keyof T & string)[],
): Messages {
  const out: Messages = {};
  for (const k of keys) {
    if (Object.hasOwn(messages, k)) {
      out[k] = messages[k];
    }
  }
  return out;
}
