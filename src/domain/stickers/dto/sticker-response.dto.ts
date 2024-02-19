import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Animal } from '@/@types/enum/animal.enum';
import { Sticker } from '@/domain/stickers/entities/sticker.entity';

export class StickerResponseDto {
  @ApiProperty({
    description: '스티커 ID',
    type: Number,
  })
  @Expose()
  readonly id: number;

  @ApiProperty({
    description: '유저 ID',
    type: String,
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: '댓글 ID',
    type: Number,
  })
  @Expose()
  commentId: number;

  @ApiProperty({
    description: '동물',
    enum: Animal,
  })
  @Expose()
  animal: Animal;

  constructor(sticker: Sticker) {
    this.id = sticker.id;
    this.userId = sticker.userId;
    this.commentId = sticker.comment.id;
    this.animal = sticker.animal;
  }
}
