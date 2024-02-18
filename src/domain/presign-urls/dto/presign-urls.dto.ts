import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PresignedUrlDto {
  @ApiProperty({
    description: '업로드하려는 파일 이름(확장자 포함)',
    required: true,
    example: '테스트1.png',
  })
  @Expose()
  @IsString()
  readonly filename: string;
}
