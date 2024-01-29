import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: '댓글 내용 예시',
    description: '댓글 내용',
    required: true,
  })
  @IsString()
  readonly content: string;

  @ApiProperty({
    example: 'false',
    description: '익명 여부 설정',
    required: false,
    default: false,
  })
  @IsBoolean()
  readonly isAnonymous: boolean = true;
}
