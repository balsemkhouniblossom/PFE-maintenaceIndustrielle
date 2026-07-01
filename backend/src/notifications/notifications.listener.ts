import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import {
  ResetPasswordEmailIntent,
  VerificationEmailIntent,
} from './notifications.types';
import { TemplateRendererService } from './template-renderer.service';
import { UrlBuilderService } from './url-builder.service';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly templateRenderer: TemplateRendererService,
    private readonly urlBuilder: UrlBuilderService,
  ) {}

  async onVerificationEmailIntent(
    intent: VerificationEmailIntent,
  ): Promise<string | undefined> {
    const url = this.urlBuilder.verificationEmailUrl(
      intent.token,
      intent.locale,
      intent.frontendOrigin,
    );
    const rendered = this.templateRenderer.renderVerificationEmail(url);

    return this.emailService.sendMail({
      to: intent.to,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
  }

  async onResetPasswordEmailIntent(
    intent: ResetPasswordEmailIntent,
  ): Promise<string | undefined> {
    const url = this.urlBuilder.resetPasswordUrl(
      intent.resetToken,
      intent.locale,
      intent.frontendOrigin,
    );
    const rendered = this.templateRenderer.renderResetPasswordEmail(url);

    return this.emailService.sendMail({
      to: intent.to,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
  }
}
