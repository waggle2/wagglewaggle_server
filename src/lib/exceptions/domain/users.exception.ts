import { BaseException } from '@/lib/exceptions/base.exception';
import { UserExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends BaseException {
  constructor(message: string) {
    super(UserExceptionEnum.USER_NOT_FOUND, HttpStatus.NOT_FOUND, message);
  }
}
