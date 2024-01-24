import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: '댓글 내용 예시',
    description: '댓글 내용',
    required: true,
  })
  @IsString()
  readonly content: string;
}
