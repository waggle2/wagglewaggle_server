import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { LikesController, PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { Comment } from '@/domain/comments/entities/comment.entity';
import { SearchHistoriesModule } from '@/domain/search-histories/search-histories.module';
import { JwtModule } from '@nestjs/jwt';
import { SearchModule } from '@/domain/search/search.module';
import { UsersModule } from '@/domain/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment]),
    SearchHistoriesModule,
    JwtModule,
    SearchModule,
    UsersModule,
  ],
  exports: [PostsService, Repository<Post>],
  controllers: [PostsController, LikesController],
  providers: [PostsService, Repository<Post>],
})
export class PostsModule {}
