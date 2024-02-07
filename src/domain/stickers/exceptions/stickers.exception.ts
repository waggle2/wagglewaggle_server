import { StickerExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@/lib/exceptions/base.exception';

export class StickerAlreadyExistsException extends BaseException {
  constructor(message: string) {
    super(StickerExceptionEnum.ALREADY_STICKER, HttpStatus.CONFLICT, message);
  }
}

export class StickerDifferentUserException extends BaseException {
  constructor(message: string) {
    super(StickerExceptionEnum.DIFFERENT_USER, HttpStatus.FORBIDDEN, message);
  }
}
