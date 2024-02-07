import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from '@/lib/config/typeorm.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PostsModule } from './domain/posts/posts.module';
import { CommentsModule } from './domain/comments/comments.module';
import { PollsModule } from './domain/polls/polls.module';
import { PollItemsModule } from './domain/pollItems/pollItems.module';
import { UsersModule } from './domain/users/users.module';
import { ItemsModule } from './domain/items/items.module';
import { FilesModule } from '@/domain/files/files.module';
import { PresignUrlsModule } from '@/domain/presign-urls/presign-urls.module';
import { AuthenticationModule } from './domain/authentication/authentication.module';
import * as Joi from 'joi';
import { RedisCacheModule } from './domain/redis-cache/redis-cache.module';
import { mailerConfigFactory } from '@/lib/config/mailer.config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HealthCheckController } from '@/domain/health-check/health-check.controller';
import { ReportsModule } from '@/domain/reports/reports.module';
import { StickersModule } from '@/domain/stickers/stickers.module';
import { SearchModule } from '@/domain/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        // 설정 값 유효성 검사
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: TypeormConfig,
    }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: mailerConfigFactory,
      inject: [ConfigService],
    }),
    PostsModule,
    CommentsModule,
    PollsModule,
    PollItemsModule,
    UsersModule,
    ItemsModule,
    FilesModule,
    PresignUrlsModule,
    AuthenticationModule,
    RedisCacheModule,
    ReportsModule,
    StickersModule,
    SearchModule,
  ],
  controllers: [AppController, HealthCheckController],
  providers: [AppService],
})
export class AppModule {}
