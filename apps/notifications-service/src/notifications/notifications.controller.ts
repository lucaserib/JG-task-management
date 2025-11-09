import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationPayload, NotificationResponse } from '@repo/types';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('task.created')
  async handleTaskCreated(@Payload() payload: NotificationPayload) {
    this.logger.log('Received task.created event');
    await this.notificationsService.createNotification(payload);
  }

  @EventPattern('task.updated')
  async handleTaskUpdated(@Payload() payload: NotificationPayload) {
    this.logger.log('Received task.updated event');
    await this.notificationsService.createNotification(payload);
  }

  @EventPattern('comment.created')
  async handleCommentCreated(@Payload() payload: NotificationPayload) {
    this.logger.log('Received comment.created event');
    await this.notificationsService.createNotification(payload);
  }

  @MessagePattern({ cmd: 'get_user_notifications' })
  async getUserNotifications(
    @Payload() data: { userId: string; page?: number; size?: number },
  ) {
    return this.notificationsService.getUserNotifications(
      data.userId,
      data.page,
      data.size,
    );
  }

  @MessagePattern({ cmd: 'mark_as_read' })
  async markAsRead(
    @Payload() data: { notificationId: string },
  ): Promise<NotificationResponse> {
    return this.notificationsService.markAsRead(data.notificationId);
  }

  @MessagePattern({ cmd: 'mark_all_as_read' })
  async markAllAsRead(
    @Payload() data: { userId: string },
  ): Promise<{ affected: number }> {
    return this.notificationsService.markAllAsRead(data.userId);
  }

  @MessagePattern({ cmd: 'get_unread_count' })
  async getUnreadCount(
    @Payload() data: { userId: string },
  ): Promise<{ count: number }> {
    return this.notificationsService.getUnreadCount(data.userId);
  }

  @MessagePattern({ cmd: 'delete_notification' })
  async deleteNotification(
    @Payload() data: { notificationId: string },
  ): Promise<{ message: string }> {
    return this.notificationsService.deleteNotification(data.notificationId);
  }
}
