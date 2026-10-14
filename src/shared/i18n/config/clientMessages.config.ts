// These namespaces also cover content rendered by the shared ModalRoot.
export const CLIENT_GLOBAL_NAMESPACES = [
  'Navigation',
  'MobileMenu',
  'Buttons',
  'Forms',
  'Contacts',
  'ErrorPage',
] as const;

// Nested providers replace messages, so include the namespaces of their imports.
export const CLIENT_MESSAGES = {
  home: ['Buttons'],
} as const;

export type ClientMessageNamespace =
  | (typeof CLIENT_GLOBAL_NAMESPACES)[number]
  | (typeof CLIENT_MESSAGES)[keyof typeof CLIENT_MESSAGES][number];
