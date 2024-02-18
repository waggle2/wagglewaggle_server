import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class CommentFindDto {
  @ApiProperty({
    description: '게시글 아이디',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Expose()
  readonly postId: number;
}
