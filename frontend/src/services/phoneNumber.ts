import { AsYouType, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js';

export const PHONE_COUNTRY_OPTIONS = [
  { country: 'TN', label: 'Tunisia', dialCode: '+216' },
  { country: 'FR', label: 'France', dialCode: '+33' },
  { country: 'DE', label: 'Germany', dialCode: '+49' },
  { country: 'IT', label: 'Italy', dialCode: '+39' },
  { country: 'ES', label: 'Spain', dialCode: '+34' },
  { country: 'GB', label: 'United Kingdom', dialCode: '+44' },
  { country: 'US', label: 'United States', dialCode: '+1' },
  { country: 'CA', label: 'Canada', dialCode: '+1' },
  { country: 'MA', label: 'Morocco', dialCode: '+212' },
  { country: 'DZ', label: 'Algeria', dialCode: '+213' },
  { country: 'BE', label: 'Belgium', dialCode: '+32' },
  { country: 'CH', label: 'Switzerland', dialCode: '+41' },
] as const;

export type PhoneCountryCode = (typeof PHONE_COUNTRY_OPTIONS)[number]['country'];

export interface PhoneInputValue {
  country: PhoneCountryCode;
  nationalNumber: string;
}

export const DEFAULT_PHONE_COUNTRY: PhoneCountryCode = 'TN';

function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function getFlagEmoji(country: PhoneCountryCode): string {
  return country
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

export function getPhoneCountryOption(country: PhoneCountryCode) {
  return PHONE_COUNTRY_OPTIONS.find((option) => option.country === country) ?? PHONE_COUNTRY_OPTIONS[0];
}

export function formatNationalPhone(country: PhoneCountryCode, nationalNumber: string): string {
  const digits = normalizeDigits(nationalNumber);
  if (!digits) return '';

  const formatter = new AsYouType(country);
  return formatter.input(digits);
}

export function validateNationalPhone(country: PhoneCountryCode, nationalNumber: string): boolean {
  const digits = normalizeDigits(nationalNumber);
  if (!digits) return true;

  const parsed = parsePhoneNumberFromString(digits, country);
  return Boolean(parsed?.isValid() || parsed?.isPossible());
}

export function buildInternationalPhone(country: PhoneCountryCode, nationalNumber: string): string {
  const digits = normalizeDigits(nationalNumber);
  if (!digits) return '';

  const parsed = parsePhoneNumberFromString(digits, country);
  if (parsed?.number) {
    return parsed.number;
  }

  return `+${getCountryCallingCode(country)}${digits}`;
}

export function parseInternationalPhoneValue(phone?: string | null): PhoneInputValue {
  if (!phone || !phone.trim()) {
    return {
      country: DEFAULT_PHONE_COUNTRY,
      nationalNumber: '',
    };
  }

  const normalized = phone.trim();
  const parsed = parsePhoneNumberFromString(normalized);

  if (parsed?.country) {
    return {
      country: parsed.country as PhoneCountryCode,
      nationalNumber: String(parsed.nationalNumber ?? normalizeDigits(parsed.formatNational())),
    };
  }

  return {
    country: DEFAULT_PHONE_COUNTRY,
    nationalNumber: normalizeDigits(normalized),
  };
}

export function countryFlagEmoji(country: PhoneCountryCode): string {
  return getFlagEmoji(country);
}
