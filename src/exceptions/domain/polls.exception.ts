import { PollExceptionEnum } from '@/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@/exceptions/base.exception';

export class PollConflictException extends BaseException {
  constructor(message: string) {
    super(PollExceptionEnum.POLL_CONFLICT, HttpStatus.CONFLICT, message);
  }
}

export class PollNotFoundException extends BaseException {
  constructor(message: string) {
    super(PollExceptionEnum.POLL_NOT_FOUND, HttpStatus.CONFLICT, message);
  }
}
