import { BaseException } from '@/lib/exceptions/base.exception';
import { PostExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';

export class PostNotFoundException extends BaseException {
  constructor(message: string) {
    super(PostExceptionEnum.POST_NOT_FOUND, HttpStatus.NOT_FOUND, message);
  }
}

export class PostBadRequestException extends BaseException {
  constructor(message: string) {
    super(PostExceptionEnum.POST_BAD_REQUEST, HttpStatus.BAD_REQUEST, message);
  }
}
