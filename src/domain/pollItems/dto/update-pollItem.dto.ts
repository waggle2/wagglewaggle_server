import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdatePollItemDto {
  @ApiProperty({
    description: '투표 항목 아이디',
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: '투표 항목 내용',
    example: '치킨',
    required: true,
  })
  @IsString()
  readonly content: string;
}
