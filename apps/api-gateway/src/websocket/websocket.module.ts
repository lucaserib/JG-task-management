import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { WebsocketController } from './websocket.controller';

@Module({
  controllers: [WebsocketController],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class WebsocketModule {}
