import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app.config';

@Injectable()
export class UrlBuilderService {
  constructor(private readonly appConfig: AppConfigService) {}

  verificationEmailUrl(
    token: string,
    locale?: string,
    frontendOrigin?: string,
  ): string {
    const safeLocale = this.resolveLocale(locale);
    const base = this.appConfig
      .resolveFrontendBaseUrl(frontendOrigin)
      .replace(/\/$/, '');
    return `${base}/${safeLocale}/auth/verify-email?token=${encodeURIComponent(token)}`;
  }

  resetPasswordUrl(
    token: string,
    locale?: string,
    frontendOrigin?: string,
  ): string {
    const safeLocale = this.resolveLocale(locale);
    const base = this.appConfig
      .resolveFrontendBaseUrl(frontendOrigin)
      .replace(/\/$/, '');
    return `${base}/${safeLocale}/auth/reset-password?token=${encodeURIComponent(token)}`;
  }

  private resolveLocale(locale?: string): string {
    const value = locale?.trim();
    if (!value) {
      return this.appConfig.getDefaultLocale();
    }

    return value;
  }
}
