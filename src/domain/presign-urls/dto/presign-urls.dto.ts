import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PresignUrlsDto {
  @ApiProperty({
    description: '업로드하려는 파일 이름(확장자 포함)',
    required: true,
  })
  @IsString()
  readonly filename: string;
}
