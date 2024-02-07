import { BaseException } from '@/lib/exceptions/base.exception';
import { LikeExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';

export class AlreadyLikeException extends BaseException {
  constructor(message: string) {
    super(LikeExceptionEnum.ALREADY_LIKE, HttpStatus.CONFLICT, message);
  }
}

export class LikeDifferentUserException extends BaseException {
  constructor(message: string) {
    super(LikeExceptionEnum.DIFFERENT_USER, HttpStatus.FORBIDDEN, message);
  }
}
