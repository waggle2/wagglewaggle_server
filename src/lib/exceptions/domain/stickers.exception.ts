import { StickerExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@/lib/exceptions/base.exception';

export class StickerNotFoundException extends BaseException {
  constructor(message: string) {
    super(
      StickerExceptionEnum.STICKER_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      message,
    );
  }
}
