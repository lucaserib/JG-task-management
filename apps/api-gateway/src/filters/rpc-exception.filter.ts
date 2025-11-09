import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const error: any = exception.getError();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (typeof error === 'object' && error !== null) {
      status = error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      message = error.message || message;

      this.logger.error(`RPC Exception: ${JSON.stringify(error)}`);

      response.status(status).json({
        statusCode: status,
        message: message,
        error: error.error || 'Microservice Error',
      });
    } else if (typeof error === 'string') {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
      });
    }
  }
}
