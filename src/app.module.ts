import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './config/typeorm.config';
import { PostsModule } from './domain/posts/posts.module';
import { CommentsModule } from './domain/comments/comments.module';
import { PollsModule } from './domain/polls/polls.module';
import { CategoriesModule } from './domain/categories/categories.module';
import { PollItemsModule } from './domain/pollItems/pollItems.module';
import { UsersModule } from './domain/users/users.module';
import { ItemsModule } from './domain/items/items.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: TypeormConfig,
    }),
    PostsModule,
    CommentsModule,
    PollsModule,
    CategoriesModule,
    PollItemsModule,
    UsersModule,
    ItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
