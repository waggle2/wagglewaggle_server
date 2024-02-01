import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from '@/domain/likes/entities/like.entity';
import { PostsModule } from '@/domain/posts/posts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), PostsModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
