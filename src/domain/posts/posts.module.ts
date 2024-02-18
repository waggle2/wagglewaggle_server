import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { LikesController, PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { Comment } from '@/domain/comments/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment])],
  exports: [PostsService, Repository<Post>],
  controllers: [PostsController, LikesController],
  providers: [PostsService, Repository<Post>],
})
export class PostsModule {}
