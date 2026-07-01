import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RequestContextModule } from '../common/request-context.module';
import { AppConfigService } from '../config/app.config';
import { FeatureFlagsConfigService } from '../config/feature-flags.config';
import { EmailModule } from '../email/email.module';
import { NotificationsFacade } from './notifications.facade';
import { NotificationsListener } from './notifications.listener';
import { TemplateRendererService } from './template-renderer.service';
import { UrlBuilderService } from './url-builder.service';

@Module({
  imports: [ConfigModule, EmailModule, RequestContextModule],
  providers: [
    AppConfigService,
    FeatureFlagsConfigService,
    UrlBuilderService,
    TemplateRendererService,
    NotificationsListener,
    NotificationsFacade,
  ],
  exports: [NotificationsFacade, UrlBuilderService],
})
export class NotificationsModule {}
