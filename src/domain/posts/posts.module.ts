import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { RedisCacheModule } from '@/domain/redis-cache/redis-cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), RedisCacheModule],
  exports: [PostsService, Repository<Post>],
  controllers: [PostsController],
  providers: [PostsService, Repository<Post>],
})
export class PostsModule {}
