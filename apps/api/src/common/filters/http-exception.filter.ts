import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    let errorMessage: string | string[];
    if (typeof message === 'string') {
      errorMessage = message;
    } else if (typeof message === 'object' && message !== null) {
      const msg = (message as { message?: string | string[] }).message;
      errorMessage = msg || JSON.stringify(message);
    } else {
      errorMessage = 'Unknown error';
    }

    const errorResponse = {
      code: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status} - ${JSON.stringify(errorResponse.message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
