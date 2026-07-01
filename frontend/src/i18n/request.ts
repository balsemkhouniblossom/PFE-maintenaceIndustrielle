import { getRequestConfig } from 'next-intl/server';
import { AbstractIntlMessages } from 'next-intl';
import { locales, defaultLocale, AppLocale } from '@/i18n/config';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeMessages(base: AbstractIntlMessages, override: AbstractIntlMessages): AbstractIntlMessages {
  if (!isRecord(base) || !isRecord(override)) {
    return override;
  }

  const merged: Record<string, unknown> = { ...base };

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = merged[key];

    if (isRecord(baseValue) && isRecord(overrideValue)) {
      merged[key] = mergeMessages(baseValue as AbstractIntlMessages, overrideValue as AbstractIntlMessages);
      continue;
    }

    merged[key] = overrideValue;
  }

  return merged as AbstractIntlMessages;
}

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

  const baseMessages = await messagesMap.en();
  const loader = messagesMap[validLocale] ?? messagesMap[defaultLocale];
  const localeMessages = await loader();
  const messages = validLocale === 'en' ? baseMessages : mergeMessages(baseMessages, localeMessages);

  return {
    locale: validLocale,
    messages
  };
});