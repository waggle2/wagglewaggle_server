import { HealthCheckController } from './health-check.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('HealthCheckController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('healthCheck', () => {
    it('헬스 체크에 성공하면, 200으로 응답한다', async () => {
      const response = await request(app.getHttpServer()).get('/health-check');
      expect(response.status).toEqual(HttpStatus.OK);
    });
  });
});
