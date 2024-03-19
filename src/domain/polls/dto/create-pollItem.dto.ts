import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePollItemDto {
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
