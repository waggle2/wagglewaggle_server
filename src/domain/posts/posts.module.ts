import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Repository<Post>])],
  exports: [PostsService, Repository<Post>],
  controllers: [PostsController],
  providers: [PostsService, Repository<Post>],
})
export class PostsModule {}
