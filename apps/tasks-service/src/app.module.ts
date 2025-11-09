import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { DatabaseModule } from './database/database.module';
import { TasksModule } from './tasks/tasks.module';
import { EventsModule } from './events/events.module';
import { winstonConfig } from './config/winston.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonConfig),
    DatabaseModule,
    TasksModule,
    EventsModule,
  ],
})
export class AppModule {}
