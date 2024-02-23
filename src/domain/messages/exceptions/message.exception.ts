import { BaseException } from '@/lib/exceptions/base.exception';
import { HttpStatus } from '@nestjs/common';
import { MessageExceptionEnum } from '../../../lib/exceptions/exception.enum';

export class MessageBadRequestException extends BaseException {
  constructor(message: string) {
    super(
      MessageExceptionEnum.MESSAGE_BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      message,
    );
  }
}

export class MessageNotFoundException extends BaseException {
  constructor(message: string) {
    super(
      MessageExceptionEnum.MESSAGE_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      message,
    );
  }
}

export class MessageRoomNotFoundException extends BaseException {
  constructor(message: string) {
    super(
      MessageExceptionEnum.MESSAGEROOM_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      message,
    );
  }
}
