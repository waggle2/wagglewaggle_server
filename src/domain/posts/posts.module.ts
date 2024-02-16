import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { LikesController, PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { PostsRepository } from '@/domain/posts/posts.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  exports: [PostsService, Repository<Post>],
  controllers: [PostsController, LikesController],
  providers: [PostsService, Repository<Post>, PostsRepository],
})
export class PostsModule {}
