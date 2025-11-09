import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check for API Gateway' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  check() {
    return this.health.check([
      () =>
        this.microservice.pingCheck('rabbitmq', {
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
            queue: 'health_check_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
    ]);
  }

  @Get('rabbitmq')
  @HealthCheck()
  @ApiOperation({ summary: 'RabbitMQ health check' })
  @ApiResponse({ status: 200, description: 'RabbitMQ is healthy' })
  @ApiResponse({ status: 503, description: 'RabbitMQ is unhealthy' })
  checkRabbitMQ() {
    return this.health.check([
      () =>
        this.microservice.pingCheck('rabbitmq', {
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'],
            queue: 'health_check_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
    ]);
  }
}
