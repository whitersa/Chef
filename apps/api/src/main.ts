import * as crypto from 'crypto';

// Polyfill for Node.js < 19
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if (!(global as any).crypto) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { Logger as NestLogger } from '@nestjs/common';
import helmet from 'helmet';
import { ValidationPipe, Logger as NestLogger } from '@nestjs/common';
import { Request, Response, Application } from 'express';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { API_PORT } from '@chefos/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // 1. Enable CORS first
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.CORS_ORIGIN].filter(
      Boolean,
    ) as string[],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Security Middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Content Security Policy can sometimes block requests if not configured
      contentSecurityPolicy: false,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');

  // Root redirect middleware
  const server = app.getHttpAdapter().getInstance() as Application;
  server.get('/', (_req: Request, res: Response) => {
    res.redirect('/api/docs');
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      transform: true, // Transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw error if extra properties are present
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ChefOS API')
    .setDescription('The ChefOS API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global Error Handling for Uncaught Exceptions and Rejections
  process.on('uncaughtException', (err: unknown) => {
    const logger = new NestLogger('UncaughtException');
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    logger.error(message, stack);
    // In production, you might want to exit here to let PM2 restart the process
    // process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const logger = new NestLogger('UnhandledRejection');
    logger.error(
      `Unhandled Rejection: ${reason instanceof Error ? reason.message : String(reason)}`,
    );
  });

  console.log('Starting application listen on 0.0.0.0...');
  let port = process.env.PORT ? parseInt(process.env.PORT) : API_PORT;
  if (isNaN(port)) {
    port = 4000;
  }

  try {
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (err) {
    console.error('Failed to start application:', err);
  }
}
void bootstrap();
