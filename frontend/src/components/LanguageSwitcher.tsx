'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { locales, type AppLocale } from '@/i18n/config';

const languageLabels: Record<AppLocale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
};

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = locales.includes(segments[0] as AppLocale)
    ? (segments[0] as AppLocale)
    : 'en';

  const handleLocaleChange = (locale: AppLocale) => {
    const nextSegments = [...segments];

    if (locales.includes(nextSegments[0] as AppLocale)) {
      nextSegments[0] = locale;
    } else {
      nextSegments.unshift(locale);
    }

    const queryString = searchParams.toString();
    const nextPath = `/${nextSegments.join('/')}${queryString ? `?${queryString}` : ''}`;

    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    router.replace(nextPath);
  };

  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
      <span className="sr-only">Language</span>
      <select
        value={currentLocale}
        onChange={(event) => handleLocaleChange(event.target.value as AppLocale)}
        className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
        aria-label="Language"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {languageLabels[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}

