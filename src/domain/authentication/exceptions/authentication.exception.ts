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

export class UserForbiddenException extends BaseException {
  constructor(message: string) {
    super(AuthExceptionEnum.USER_FORBIDDEN, HttpStatus.FORBIDDEN, message);
  }
}

export class UserReportForbiddenException extends BaseException {
  constructor(message: string) {
    super(AuthExceptionEnum.REPORT_FORBIDDEN, HttpStatus.FORBIDDEN, message);
  }
}

export class UserBlockForbiddenException extends BaseException {
  constructor(message: string) {
    super(AuthExceptionEnum.BLOCK_FORBIDDEN, HttpStatus.FORBIDDEN, message);
  }
}

export class NeedSelfVerificationException extends BaseException {
  constructor(message: string) {
    super(
      AuthExceptionEnum.NEED_SELF_VERIFICATION,
      HttpStatus.FORBIDDEN,
      message,
    );
  }
}

export class NotAdultException extends BaseException {
  constructor(message: string) {
    super(AuthExceptionEnum.NOT_ADULT, HttpStatus.FORBIDDEN, message);
  }
}

export class UserWithdrawnException extends BaseException {
  constructor(message: string) {
    super(AuthExceptionEnum.USER_WITHDRAWN, HttpStatus.FORBIDDEN, message);
  }
}

export class UserExpelledException extends BaseException {
  constructor(message: string) {
    super(AuthExceptionEnum.USER_EXPELLED, HttpStatus.FORBIDDEN, message);
  }
}
