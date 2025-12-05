import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface RedisStore {
  client: {
    isOpen: boolean;
    quit: () => Promise<void>;
  };
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    if (dataSource) {
      await dataSource.destroy();
    }

    try {
      const cacheManager = app.get<Cache>(CACHE_MANAGER);
      const store = cacheManager.store as unknown as RedisStore;
      if (store && store.client && store.client.isOpen) {
        await store.client.quit();
      }
    } catch (error) {
      console.warn('Failed to close cache manager:', error);
    }

    await app.close();
  });

  it('/ (GET)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });
});
