import { BaseException } from '@/exceptions/base.exception';
import { CommentExceptionEnum } from '@/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';

export class CommentNotFoundException extends BaseException {
  constructor(message: string) {
    super(
      CommentExceptionEnum.COMMENT_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      message,
    );
  }
}
