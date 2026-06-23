import {getRequestConfig} from 'next-intl/server';
import {AbstractIntlMessages} from 'next-intl';
import {locales, defaultLocale} from '@/i18n/config';

import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import ar from '../../messages/ar.json';
import es from '../../messages/es.json';
import de from '../../messages/de.json';
import it from '../../messages/it.json';

const messagesMap: Record<string, AbstractIntlMessages> = {
  en,
  fr,
  ar,
  es,
  de,
  it
};

export default getRequestConfig(async ({locale}) => {
  const validLocale =
    locale && locales.includes(locale as any)
      ? locale
      : defaultLocale;

  return {
    locale: validLocale,
    messages: messagesMap[validLocale] ?? messagesMap[defaultLocale]
  };
});