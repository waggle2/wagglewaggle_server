export class HttpResponse {
  static success(message: string, data?: any, meta?: Record<string, any>) {
    return { code: 200, message, data, meta };
  }

  static created(message: string, data?: any, meta?: Record<string, any>) {
    return { code: 201, message, data, meta };
  }
}
