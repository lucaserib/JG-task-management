import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from '../entities/task.entity';
import { Comment } from '../entities/comment.entity';
import { TaskHistory } from '../entities/task-history.entity';
import { TaskAssignee } from '../entities/task-assignee.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Comment, TaskHistory, TaskAssignee]),
    EventsModule,
    ClientsModule.register([
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
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
