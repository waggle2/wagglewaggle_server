import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BaseException } from '@/lib/exceptions/base.exception';
import { UncatchedException } from '@/lib/exceptions/uncatch.exception';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let res: BaseException;

    if (exception instanceof BaseException) {
      res = exception;
    } else if (exception instanceof QueryFailedError) {
      res = new UncatchedException(500, 'Query failed: ' + exception.message);
    } else {
      res = new UncatchedException(
        exception.status || 500,
        exception.response?.message || '현재 이용이 원활하지 않습니다',
      );
    }

    res.timestamp = this.formatDate(new Date());
    res.path = request.url;

    if (res instanceof UncatchedException && res.statusCode === 500) {
      res.message = '현재 이용이 원활하지 않습니다.';
    }

    response.status(res.statusCode).json({
      errorCode: res.errorCode,
      statusCode: res.statusCode,
      message: res.message,
      timestamp: res.timestamp,
      path: res.path,
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
