import { BaseException } from '@/lib/exceptions/base.exception';
import { UncatchedExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';

export class UncatchedException extends BaseException {
  constructor(statusCode: number, message: string) {
    super(
      UncatchedExceptionEnum.UNCATCHED,
      HttpStatus.INTERNAL_SERVER_ERROR,
      '현재 이용이 원활하지 않습니다.',
    );
    this.statusCode = statusCode;
    this.message = message;
  }
}
