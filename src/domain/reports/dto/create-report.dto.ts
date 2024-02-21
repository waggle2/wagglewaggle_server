import { IsEnum, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportReason } from '@/@types/enum/report-reason.enum';

export class CreateReportDto {
  @ApiProperty({
    example: '심한 비방 & 욕설',
    description:
      '신고 사유: "부적절한 표현", "심한 비방 & 욕설", "광고성 컨텐츠", "음란성이 포함된 글", "기타"',
    enum: ReportReason,
  })
  @IsEnum(ReportReason)
  readonly reason: ReportReason;

  @ApiProperty({
    example: '저 자식이 욕했어요 ㅠㅠ',
    description: '신고 사유 디테일, 300자 이내',
  })
  @IsString()
  @Length(1, 300, {
    message: '신고 사유는 1글자 이상 300글자 이하여야 합니다.',
  })
  readonly content: string;
}
