import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { RedisCacheModule } from '@/domain/redis-cache/redis-cache.module';
import { SearchModule } from '@/search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), RedisCacheModule, SearchModule],
  exports: [PostsService, Repository<Post>],
  controllers: [PostsController],
  providers: [PostsService, Repository<Post>],
})
export class PostsModule {}
