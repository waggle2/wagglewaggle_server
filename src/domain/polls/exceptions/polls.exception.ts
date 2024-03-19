import { PollExceptionEnum } from '@/lib/exceptions/exception.enum';
import { HttpStatus } from '@nestjs/common';
import { BaseException } from '@/lib/exceptions/base.exception';

export class NotPolledException extends BaseException {
  constructor(message: string) {
    super(PollExceptionEnum.NOT_POLLED, HttpStatus.CONFLICT, message);
  }
}

export class PollConflictException extends BaseException {
  constructor(message: string) {
    super(PollExceptionEnum.POLL_CONFLICT, HttpStatus.CONFLICT, message);
  }
}

export class PollAlreadyExistsException extends BaseException {
  constructor(message: string) {
    super(PollExceptionEnum.POLL_ALREADY_EXISTS, HttpStatus.CONFLICT, message);
  }
}

export class PollEndedException extends BaseException {
  constructor(message: string) {
    super(PollExceptionEnum.POLL_ENDED, HttpStatus.FORBIDDEN, message);
  }
}

export class PollNotFoundException extends BaseException {
  constructor(message: string) {
    super(PollExceptionEnum.POLL_NOT_FOUND, HttpStatus.CONFLICT, message);
  }
}

export class PollItemNotFoundException extends BaseException {
  constructor(message: string) {
    super(PollExceptionEnum.POLL_ITEM_NOT_FOUND, HttpStatus.CONFLICT, message);
  }
}

export class PollAuthorDifferentException extends BaseException {
  constructor(message: string) {
    super(
      PollExceptionEnum.AUTHOR_DIFFERENT_USER,
      HttpStatus.FORBIDDEN,
      message,
    );
  }
}

export class AlreadyVoteException extends BaseException {
  constructor(message: string) {
    super(PollExceptionEnum.ALREADY_VOTE, HttpStatus.CONFLICT, message);
  }
}

export class DuplicateVoteForbiddenException extends BaseException {
  constructor(message: string) {
    super(PollExceptionEnum.DUPLICATE_VOTE, HttpStatus.FORBIDDEN, message);
  }
}
