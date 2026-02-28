import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'ru', 'en'],
  defaultLocale: 'fr',
});

export type Locale = (typeof routing.locales)[number];
