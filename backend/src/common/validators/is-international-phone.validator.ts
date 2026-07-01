import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

@ValidatorConstraint({ name: 'isInternationalPhone', async: false })
export class IsInternationalPhoneConstraint implements ValidatorConstraintInterface {
  private readonly countryCodes = new Set(
    getCountries().map((country) => getCountryCallingCode(country)),
  );

  validate(value: unknown): boolean {
    if (value === undefined || value === null || value === '') {
      return true;
    }

    if (typeof value !== 'string') {
      return false;
    }

    const normalized = value.trim();

    if (!/^\+\d{8,15}$/.test(normalized)) {
      return false;
    }

    const digits = normalized.slice(1);
    const hasValidCountryCode = [1, 2, 3].some((length) =>
      this.countryCodes.has(digits.slice(0, length)),
    );

    if (!hasValidCountryCode) {
      return false;
    }

    const parsed = parsePhoneNumberFromString(normalized);
    return parsed ? parsed.isValid() || parsed.isPossible() : true;
  }

  defaultMessage(): string {
    return 'phone must be a valid international phone number (e.g. +21612345678)';
  }
}

export function IsInternationalPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsInternationalPhoneConstraint,
    });
  };
}
