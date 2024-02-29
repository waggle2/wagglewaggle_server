import { BaseException } from '@/lib/exceptions/base.exception';
import { BlockExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';

export class BlockBadRequestException extends BaseException {
  constructor(message: string) {
    super(
      BlockExceptionEnum.BLOCK_BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      message,
    );
  }
}

export class BlockNotFoundException extends BaseException {
  constructor(message: string) {
    super(BlockExceptionEnum.BLOCK_NOT_FOUND, HttpStatus.NOT_FOUND, message);
  }
}
