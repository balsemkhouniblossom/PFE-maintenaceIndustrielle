'use client';

import { ChangeEvent } from 'react';
import {
  countryFlagEmoji,
  formatNationalPhone,
  PHONE_COUNTRY_OPTIONS,
  PhoneCountryCode,
  PhoneInputValue,
} from '@/services/phoneNumber';

interface InternationalPhoneInputProps {
  value: PhoneInputValue;
  onChange: (value: PhoneInputValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  selectClassName?: string;
  name?: string;
  autoComplete?: string;
}

export default function InternationalPhoneInput({
  value,
  onChange,
  placeholder = 'Local number',
  disabled = false,
  className = '',
  inputClassName = '',
  selectClassName = '',
  name,
  autoComplete = 'tel-national',
}: InternationalPhoneInputProps) {
  const formattedValue = formatNationalPhone(value.country, value.nationalNumber);

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCountry = event.target.value as PhoneCountryCode;
    onChange({
      country: nextCountry,
      nationalNumber: value.nationalNumber,
    });
  };

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, '');
    onChange({
      country: value.country,
      nationalNumber: digitsOnly,
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-3">
        <label className="sr-only" htmlFor={`${name || 'international-phone'}-country`}>
          Phone country
        </label>
        <select
          id={`${name || 'international-phone'}-country`}
          value={value.country}
          onChange={handleCountryChange}
          disabled={disabled}
          className={`w-56 px-3 py-3 border border-gray-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 ${selectClassName}`}
          aria-label="Phone country"
        >
          {PHONE_COUNTRY_OPTIONS.map((option) => (
            <option key={option.country} value={option.country}>
              {countryFlagEmoji(option.country)} {option.label} {option.dialCode}
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center text-xs font-semibold text-slate-500 pointer-events-none">
            {PHONE_COUNTRY_OPTIONS.find((option) => option.country === value.country)?.dialCode}
          </div>
          <input
            id={name}
            name={name}
            type="tel"
            inputMode="numeric"
            autoComplete={autoComplete}
            value={formattedValue}
            onChange={handleNumberChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`input-field pl-20 ${inputClassName}`}
          />
        </div>
      </div>
    </div>
  );
}
