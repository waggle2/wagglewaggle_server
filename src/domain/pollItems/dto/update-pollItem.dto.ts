import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Length } from 'class-validator';

export class UpdatePollItemDto {
  @ApiProperty({
    description: '투표 항목 아이디',
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: '투표 항목 내용, 1~50글자',
    example: '치킨',
    required: true,
  })
  @IsString()
  @Length(1, 50, {
    message: '투표 항목 내용은 1글자 이상 50글자 이하여야 합니다.',
  })
  readonly content: string;
}
