import { BaseException } from '@/lib/exceptions/base.exception';
import { HttpStatus } from '@nestjs/common';
import { ItemExceptionEnum } from '../../../lib/exceptions/exception.enum';

export class ItemNotFoundException extends BaseException {
  constructor(message: string) {
    super(ItemExceptionEnum.ITEM_NOT_FOUND, HttpStatus.NOT_FOUND, message);
  }
}

export class ItemBadRequestException extends BaseException {
  constructor(message: string) {
    super(ItemExceptionEnum.ITEM_BAD_REQUEST, HttpStatus.BAD_REQUEST, message);
  }
}
