import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof Error ? exception.message : 'Internal server error';

    // CORS 관련 예외 처리
    if (exception instanceof Error && exception.message.includes('CORS')) {
      status = HttpStatus.FORBIDDEN;
      message = 'CORS error: ' + exception.message;

      // CORS 헤더 설정
      response.header('Access-Control-Allow-Origin', '*'); // 실제 운영 환경에서는 구체적인 origin을 지정해야 합니다.
      response.header(
        'Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE,OPTIONS',
      );

      // CORS 헤더 설정
      response.header('Access-Control-Allow-Origin', '*'); // 실제 운영 환경에서는 구체적인 origin을 지정해야 합니다.
      response.header(
        'Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE,OPTIONS',
      );
      response.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    }

    // 로깅 추가
    console.error(`Exception occurred: Status ${status}, Message: ${message}`);

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
