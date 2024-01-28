import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheService {
  private readonly redisClient: Redis;
  constructor(private readonly redisService: RedisService) {
    this.redisClient = redisService.getClient();
  }

  async get(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, expireTime?: number): Promise<'OK'> {
    return this.redisClient.set(key, value, 'EX', expireTime ?? 10);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }
}
