import { BaseException } from '@/lib/exceptions/base.exception';
import { SearchHistoryExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';

export class SearchHistoryDifferentUserException extends BaseException {
  constructor(message: string) {
    super(
      SearchHistoryExceptionEnum.DIFFERENT_USER,
      HttpStatus.FORBIDDEN,
      message,
    );
  }
}
