import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventsService } from './events.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: process.env.NOTIFICATIONS_SERVICE_QUEUE || 'notifications_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: process.env.AUTH_SERVICE_QUEUE || 'auth_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
