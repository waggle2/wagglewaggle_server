import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { PostsModule } from '../posts/posts.module';
import { Post } from '@/domain/posts/entities/post.entity';
import { NotificationModule } from '@/notification/notification.module';
import { SearchModule } from '@/domain/search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post]),
    PostsModule,
    NotificationModule,
    SearchModule,
  ],
  exports: [CommentsService],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
