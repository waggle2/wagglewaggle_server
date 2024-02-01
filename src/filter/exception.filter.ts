import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BaseException } from '@/exceptions/base.exception';
import { UncatchedException } from '@/exceptions/uncatch.exception';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const res =
      exception instanceof BaseException ? exception : new UncatchedException();

    res.timestamp = this.formatDate(new Date());
    res.path = request.url;

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
