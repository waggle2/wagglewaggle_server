import { Module } from '@nestjs/common';
import { StickerService } from './sticker.service';
import { StickerController } from './sticker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sticker } from '@/domain/sticker/entities/sticker.entity';
import { CommentsModule } from '@/domain/comments/comments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sticker]), CommentsModule],
  controllers: [StickerController],
  providers: [StickerService],
})
export class StickerModule {}
