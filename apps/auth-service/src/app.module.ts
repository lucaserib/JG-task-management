import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { winstonConfig } from './config/winston.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonConfig),
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule {}
