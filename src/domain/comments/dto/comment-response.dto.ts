import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class CommentResponseDto {
  @ApiProperty({ description: '댓글 ID', type: Number })
  @IsNumber()
  @Expose()
  id: number;
}
