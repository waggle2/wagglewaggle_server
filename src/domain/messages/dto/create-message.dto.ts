import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    example: 'kj2kjb3jk234jb3k',
    description: '쪽지 받을 유저 id',
    required: true,
  })
  @IsString()
  readonly receiver: string;

  @ApiProperty({
    example: '안녕하세요!',
    description: '쪽지 내용',
    required: true,
  })
  @IsString()
  readonly content: string;
}
