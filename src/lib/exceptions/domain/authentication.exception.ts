import { BaseException } from '@/lib/exceptions/base.exception';
import { AuthExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';

export class SocialLoginForbiddenException extends BaseException {
  constructor(message: string) {
    super(
      AuthExceptionEnum.SOCIAL_LOGIN_FORBIDDEN,
      HttpStatus.FORBIDDEN,
      message,
    );
  }
}
export class UserUnauthorizedException extends BaseException {
  constructor(message: string) {
    super(
      AuthExceptionEnum.USER_UNAUTHORIZED,
      HttpStatus.UNAUTHORIZED,
      message,
    );
  }
}
