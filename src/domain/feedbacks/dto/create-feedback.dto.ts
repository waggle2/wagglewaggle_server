import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    description: '피드백 제목, 1~50글자',
    type: String,
    example: '건의사항 요청드립니다.',
  })
  @Expose()
  @IsString()
  @Length(1, 50, {
    message: '피드백 제목은 1글자 이상 50글자 이하여야 합니다.',
  })
  readonly title: string;

  @ApiProperty({
    description: '피드백 내용, 1~300글자',
    type: String,
    example: '이거 이거 바꿔주세요!',
  })
  @Expose()
  @IsString()
  @Length(1, 300, {
    message: '피드백 내용은 1글자 이상 300글자 이하여야 합니다.',
  })
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
