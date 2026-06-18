import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
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
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();