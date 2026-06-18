export const locales = [
  "en",
  "fr",
  "ar",
  "es",
  "de",
  "it",
] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export function isRtlLocale(locale: string) {
  return locale === "ar";
}