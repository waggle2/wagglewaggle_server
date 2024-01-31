import { ExitReasonEnum } from '@/domain/types/enum/user.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, ValidateIf } from 'class-validator';

export class ExitReasonDto {
  @ApiProperty({
    example: '기타',
    description:
      '탈퇴 사유(자주 사용하지 않아요, 서비스 오류가 있어요, 친구들이 마음에 들지 않아요, 기타)',
    required: true,
  })
  @IsEnum(ExitReasonEnum)
  readonly reason: ExitReasonEnum;

  @ApiProperty({
    example: '그냥요',
    description: '탈퇴 사유를 기타로 선택했을 시 기타 사유 작성',
    required: false,
  })
  @IsString()
  @ValidateIf((o) => o.reason === ExitReasonEnum.OTHER)
  readonly otherReasons: string;
}
