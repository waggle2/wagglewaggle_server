import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePollItemDto {
  @ApiProperty({
    description: '투표 항목 내용',
    example: '치킨',
    required: true,
  })
  @IsString()
  readonly content: string;
}
