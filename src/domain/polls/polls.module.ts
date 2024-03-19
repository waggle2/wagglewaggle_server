import { Module } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './entities/poll.entity';
import { Post } from '../posts/entities/post.entity';
import { PostsModule } from '../posts/posts.module';
import { PollItem } from '@/domain/polls/entities/pollItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, PollItem, Post]), PostsModule],
  controllers: [PollsController],
  providers: [PollsService],
  exports: [PollsService],
})
export class PollsModule {}
