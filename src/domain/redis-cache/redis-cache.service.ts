import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get(key: string): Promise<string> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, expireTime?: number): Promise<'OK'> {
    return this.redis.set(key, value, 'EX', expireTime ?? 10);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }
}
