import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteFilesDto {
  @ApiProperty({
    description: 'S3에 저장된 파일 이름이 key 값이 됩니다',
    type: 'array',
    items: { type: 'string' },
    required: true,
  })
  @IsArray()
  keys: string[];
}
