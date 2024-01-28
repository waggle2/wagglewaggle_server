import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './config/typeorm.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PostsModule } from './domain/posts/posts.module';
import { CommentsModule } from './domain/comments/comments.module';
import { PollsModule } from './domain/polls/polls.module';
import { CategoriesModule } from './domain/categories/categories.module';
import { PollItemsModule } from './domain/pollItems/pollItems.module';
import { UsersModule } from './domain/users/users.module';
import { ItemsModule } from './domain/items/items.module';
import { FilesModule } from '@/domain/files/files.module';
import { PresignUrlsModule } from '@/domain/presign-urls/presign-urls.module';
import { AuthenticationModule } from './domain/authentication/authentication.module';
import * as Joi from 'joi';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RedisConfigService } from './config/redis.config';
import { RedisCacheModule } from './domain/redis-cache/redis-cache.module';
import { mailerConfigFactory } from './config/mailer.config';

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
      imports: [ConfigModule],
      useClass: RedisConfigService,
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: mailerConfigFactory,
      inject: [ConfigService],
    }),
    PostsModule,
    CommentsModule,
    PollsModule,
    CategoriesModule,
    PollItemsModule,
    UsersModule,
    ItemsModule,
    FilesModule,
    PresignUrlsModule,
    AuthenticationModule,
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
