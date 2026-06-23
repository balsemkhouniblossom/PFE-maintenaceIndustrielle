import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import * as hpp from 'hpp';
import * as compression from 'compression';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { validateEnvironment } from './config/env.validation';

async function bootstrap() {
  const env = validateEnvironment();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(hpp());
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS
  app.enableCors({
    origin: env.corsOrigins,
    credentials: true,
  });

  // ✅ IMPORTANT: correct static serving for PDFs
  app.use(
    '/uploads',
    express.static(join(__dirname, '..', 'uploads')),
  );

  app.use(
  '/files/uploads',
  express.static(join(__dirname, '..', 'uploads')),
);

  app.enableShutdownHooks();

  await app.listen(env.port);
  logger.log(`Backend running in ${env.nodeEnv} mode on port ${env.port}`);

  const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  shutdownSignals.forEach((signal) => {
    process.on(signal, () => {
      logger.warn(`Received ${signal}, shutting down gracefully`);
    });
  });
}
bootstrap();