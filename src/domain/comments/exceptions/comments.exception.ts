import { BaseException } from '@/lib/exceptions/base.exception';
import { CommentExceptionEnum } from '@/lib/exceptions/exception.enum';
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

export class CommentBadRequestException extends BaseException {
  constructor(message: string) {
    super(
      CommentExceptionEnum.COMMENT_BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      message,
    );
  }
}

export class CommentAuthorDifferentException extends BaseException {
  constructor(message: string) {
    super(
      CommentExceptionEnum.AUTHOR_DIFFERENT_USER,
      HttpStatus.FORBIDDEN,
      message,
    );
  }
}

export class CommentAlreadyDeletedException extends BaseException {
  constructor(message: string) {
    super(
      CommentExceptionEnum.COMMENT_ALREADY_DELETED,
      HttpStatus.BAD_REQUEST,
      message,
    );
  }
}
