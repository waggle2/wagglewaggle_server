import { BaseException } from '@/lib/exceptions/base.exception';
import { FeedbackExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';

export class NotAdminNoPermissionException extends BaseException {
  constructor(message: string) {
    super(
      FeedbackExceptionEnum.NOT_ADMIN_NO_PERMISSION,
      HttpStatus.FORBIDDEN,
      message,
    );
  }
}

export class FeedbackNotFoundException extends BaseException {
  constructor(message: string) {
    super(
      FeedbackExceptionEnum.FEEDBACK_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      message,
    );
  }
}
