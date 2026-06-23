import { getRequestConfig } from 'next-intl/server';
import { AbstractIntlMessages } from 'next-intl';
import { locales, defaultLocale, AppLocale } from '@/i18n/config';

// Properly typed message loader map
const messagesMap: Record<
  AppLocale,
  () => Promise<AbstractIntlMessages>
> = {
  en: () => import('../../messages/en.json').then(m => m.default),
  fr: () => import('../../messages/fr.json').then(m => m.default),
  ar: () => import('../../messages/ar.json').then(m => m.default),
  es: () => import('../../messages/es.json').then(m => m.default),
  de: () => import('../../messages/de.json').then(m => m.default),
  it: () => import('../../messages/it.json').then(m => m.default)
};

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is strictly one of the allowed values
  const validLocale: AppLocale =
    locale && (locales as readonly string[]).includes(locale)
      ? (locale as AppLocale)
      : defaultLocale;

  // Safe fallback loader
  const loader =
    messagesMap[validLocale] ?? messagesMap[defaultLocale];

  const messages = await loader();

  return {
    locale: validLocale,
    messages
  };
});