import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisCacheService } from './redis-cache.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({})
export class RedisCacheModule {
  static forRootAsync(): DynamicModule {
    return {
      module: RedisCacheModule,
      imports: [
        RedisModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            type: 'single',
            url: `${configService.get('REDIS_URL')}`,
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [RedisCacheService],
      exports: [RedisCacheService],
    };
  }
}
