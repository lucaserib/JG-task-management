import { ClientOptions, Transport } from '@nestjs/microservices';

export const getRabbitMQConfig = (queue: string): ClientOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
    queue,
    queueOptions: {
      durable: true,
    },
  },
});
