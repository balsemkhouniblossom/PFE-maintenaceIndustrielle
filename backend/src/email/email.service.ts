import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private fromAddress: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    this.fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
      },
    });
  }

  async sendMail(options: SendEmailOptions): Promise<string | undefined> {
    if (!process.env.SMTP_HOST) {
      if (process.env.NODE_ENV === 'production') {
        this.logger.error('SMTP_HOST is not configured in production. Email will not be sent.');
        throw new Error('SMTP provider is not configured');
      }

      this.logger.warn('SMTP_HOST is not configured. Using Ethereal email service for development.');
      const testAccount = await nodemailer.createTestAccount();
      const etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await etherealTransporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      this.logger.log(`Ethereal email sent to ${options.to}: ${options.subject}`);
      if (previewUrl) {
        this.logger.log(`Preview URL: ${previewUrl}`);
      }
      return previewUrl;
    }

    try {
      await this.transporter.verify();
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      return nodemailer.getTestMessageUrl(info) ?? undefined;
    } catch (error) {
      this.logger.error('Failed to send email', error as Error);
      throw error;
    }
  }
}
