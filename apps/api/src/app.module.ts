import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { IngredientsModule } from './ingredients/ingredients.module';
import { RecipesModule } from './recipes/recipes.module';
import { UsersModule } from './users/users.module';
import { ProcessingMethodsModule } from './processing-methods/processing-methods.module';
import { MenusModule } from './menus/menus.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { AuditModule } from './audit/audit.module';
import { ProcurementModule } from './procurement/procurement.module';
import { SalesMenusModule } from './sales-menus/sales-menus.module';
import { CuisinesModule } from './cuisines/cuisines.module';
import { DishesModule } from './dishes/dishes.module';
import { UnitsModule } from './units/units.module';
import { PublisherModule } from './publisher/publisher.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'tools', 'dita-plugins'),
      serveRoot: '/plugins-static',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.boolean().default(false),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
          ttl: 24 * 60 * 60 * 1000, // Default 1 day in milliseconds
        }),
      }),
      inject: [ConfigService],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname,req,res,responseTime',
                  messageFormat: '{msg}',
                },
              }
            : undefined,
        level: process.env.LOG_LEVEL || 'info',
        serializers: {
          req: (req: IncomingMessage) => ({ method: req.method, url: req.url }),
          res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        customSuccessMessage: (req: IncomingMessage, _res: ServerResponse) => {
          return `[${req.method}] ${req.url}`;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        customErrorMessage: (req: IncomingMessage, res: ServerResponse, _err: Error) => {
          return `[${req.method}] ${req.url} - ${res.statusCode}`;
        },
        ...(process.env.NODE_ENV === 'production' && {
          formatters: {
            level: (label) => {
              return { level: label };
            },
          },
        }),
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      }),
      inject: [ConfigService],
    }),
    IngredientsModule,
    RecipesModule,
    UsersModule,
    ProcessingMethodsModule,
    MenusModule,
    AuthModule,
    HealthModule,
    AuditModule,
    ProcurementModule,
    SalesMenusModule,
    CuisinesModule,
    DishesModule,
    UnitsModule,
    PublisherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
