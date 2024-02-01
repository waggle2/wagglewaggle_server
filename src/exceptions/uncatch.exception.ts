import { BaseException } from '@/exceptions/base.exception';
import { UncatchedExceptionEnum } from '@/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';

export class UncatchedException extends BaseException {
  constructor() {
    super(
      UncatchedExceptionEnum.UNCATCHED,
      HttpStatus.INTERNAL_SERVER_ERROR,
      '현재 이용이 원할하지 않습니다.',
    );
  }
}
