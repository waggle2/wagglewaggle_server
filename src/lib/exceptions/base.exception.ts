import { HttpException } from '@nestjs/common';
import { IBaseException } from '@/lib/exceptions/base.exception.interface';
import { ApiProperty } from '@nestjs/swagger';

export class BaseException extends HttpException implements IBaseException {
  constructor(errorCode: string, statusCode: number, message: string) {
    super(errorCode, statusCode);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.message = message;
  }

  @ApiProperty()
  errorCode: string;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path: string;
}
