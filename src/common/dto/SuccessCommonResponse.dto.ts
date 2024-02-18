import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EnumToArray } from '@/common/utils/enumNumberToArray';
import { HttpStatus } from '@nestjs/common';

export class SuccessCommonResponseDto<T> {
  @ApiProperty({ enum: EnumToArray(HttpStatus), description: '상태코드' })
  @Expose()
  readonly code: number;

  @ApiProperty({ type: String, description: '성공시 응답 메시지' })
  @Expose()
  readonly message: string;

  @ApiProperty({
    type: 'generic',
    description: 'object 또는 array 형식의 응답데이타가 옵니다.',
  })
  @Expose()
  data: T;
  //
  // constructor(code: number, message: string, data?: T) {
  //   this.code = code;
  //   this.message = message;
  //   this.data = data;
  // }
}
