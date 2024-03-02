import { Module } from '@nestjs/common';
import { StickersService } from './stickers.service';
import { StickersController } from './stickers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sticker } from '@/domain/stickers/entities/sticker.entity';
import { CommentsModule } from '@/domain/comments/comments.module';
import { Comment } from '@/domain/comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sticker, Comment, User]), CommentsModule],
  controllers: [StickersController],
  providers: [StickersService],
})
export class StickersModule {}
