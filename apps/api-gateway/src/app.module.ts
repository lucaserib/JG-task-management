import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from './auth/auth.module';
import { WebsocketModule } from './websocket/websocket.module';
import { HealthModule } from './health/health.module';
import { winstonConfig } from './config/winston.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonConfig),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '1000'),
        limit: parseInt(process.env.THROTTLE_LIMIT || '10'),
      },
    ]),
    AuthModule,
    WebsocketModule,
    HealthModule,
  ],
})
export class AppModule {}
