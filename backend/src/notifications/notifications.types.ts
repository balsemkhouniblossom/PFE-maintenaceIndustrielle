export type NotificationLocale = string;

export interface VerificationEmailIntent {
  to: string;
  token: string;
  locale?: NotificationLocale;
  frontendOrigin?: string;
}

export interface ResetPasswordEmailIntent {
  to: string;
  resetToken: string;
  locale?: NotificationLocale;
  frontendOrigin?: string;
}
