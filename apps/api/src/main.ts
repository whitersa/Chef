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
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Configure helmet with CORS-friendly settings
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
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

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Error Handling for Uncaught Exceptions and Rejections
  process.on('uncaughtException', (err) => {
    const logger = new NestLogger('UncaughtException');
    logger.error(err.message, err.stack);
    // In production, you might want to exit here to let PM2 restart the process
    // process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    const logger = new NestLogger('UnhandledRejection');
    logger.error(
      `Unhandled Rejection: ${reason instanceof Error ? reason.message : String(reason)}`,
    );
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
