import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    description: '피드백 제목',
    type: String,
    example: '건의사항 요청드립니다.',
  })
  @Expose()
  @IsString()
  readonly title: string;

  @ApiProperty({
    description: '피드백 내용',
    type: String,
    example: '이거 이거 바꿔주세요!',
  })
  @Expose()
  @IsString()
  readonly content: string;

  @ApiProperty({
    description: '답변 받을 이메일',
    type: String,
    example: 'abcd@gmail.com',
  })
  @Expose()
  @IsString()
  readonly email: string;
}
