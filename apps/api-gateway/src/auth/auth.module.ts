import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { TasksController } from './tasks.controller';
import { NotificationsController } from './notifications.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { getRabbitMQConfig } from '../config/rabbitmq.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      },
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        ...getRabbitMQConfig(process.env.AUTH_SERVICE_QUEUE || 'auth_queue'),
      },
      {
        name: 'TASKS_SERVICE',
        ...getRabbitMQConfig(process.env.TASKS_SERVICE_QUEUE || 'tasks_queue'),
      },
      {
        name: 'NOTIFICATIONS_SERVICE',
        ...getRabbitMQConfig(process.env.NOTIFICATIONS_SERVICE_QUEUE || 'notifications_queue'),
      },
    ]),
  ],
  controllers: [AuthController, TasksController, NotificationsController],
  providers: [JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
