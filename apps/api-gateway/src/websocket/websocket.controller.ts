import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationResponse } from '@repo/types';
import { NotificationsGateway } from './notifications.gateway';

@Controller()
export class WebsocketController {
  private readonly logger = new Logger(WebsocketController.name);

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @EventPattern('notification.send')
  async handleNotificationSend(@Payload() notification: NotificationResponse) {
    this.logger.log(`Received notification for user ${notification.userId}`);

    let event = 'notification';

    switch (notification.type) {
      case 'TASK_ASSIGNED':
      case 'TASK_STATUS_CHANGED':
        event = 'task:updated';
        break;
      case 'NEW_COMMENT':
        event = 'comment:new';
        break;
      default:
        event = 'notification';
    }

    this.notificationsGateway.sendNotificationToUser(notification.userId, event, notification);
  }
}
