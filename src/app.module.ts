import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PostsModule } from './domain/posts/posts.module';
import { CommentsModule } from './domain/comments/comments.module';
import { PollsModule } from './domain/polls/polls.module';
import { UsersModule } from './domain/users/users.module';
import { ItemsModule } from './domain/items/items.module';
import { FilesModule } from '@/domain/files/files.module';
import { PresignUrlsModule } from '@/domain/presign-urls/presign-urls.module';
import { AuthenticationModule } from './domain/authentication/authentication.module';
import * as Joi from 'joi';
import { RedisCacheModule } from './domain/redis-cache/redis-cache.module';
import { mailerConfigFactory } from '@/lib/config/mailer.config';
import { HealthCheckController } from '@/domain/health-check/health-check.controller';
import { ReportsModule } from '@/domain/reports/reports.module';
import { StickersModule } from '@/domain/stickers/stickers.module';
import { DatabaseModule } from '@/database/database.module';
import { MessagesModule } from './domain/messages/messages.module';
import { SearchHistoriesModule } from '@/domain/search-histories/search-histories.module';
import { FeedbacksModule } from '@/domain/feedbacks/feedbacks.module';
import { NotificationModule } from './notification/notification.module';
import { SearchModule } from '@/domain/search/search.module';
import { BlocksModule } from './domain/blocks/blocks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        // 설정 값 유효성 검사
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),
    DatabaseModule.forRoot({ isTest: false }),
    RedisCacheModule.forRootAsync(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: mailerConfigFactory,
      inject: [ConfigService],
    }),
    PostsModule,
    CommentsModule,
    PollsModule,
    UsersModule,
    ItemsModule,
    FilesModule,
    PresignUrlsModule,
    AuthenticationModule,
    RedisCacheModule,
    ReportsModule,
    StickersModule,
    MessagesModule,
    SearchHistoriesModule,
    FeedbacksModule,
    NotificationModule,
    SearchModule,
    BlocksModule,
  ],
  controllers: [AppController, HealthCheckController],
  providers: [AppService],
})
export class AppModule {}
