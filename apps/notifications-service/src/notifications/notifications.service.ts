import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { NotificationPayload, NotificationResponse } from '@repo/types';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @Inject('WEBSOCKET_SERVICE')
    private readonly websocketClient: ClientProxy,
  ) {}

  async createNotification(payload: NotificationPayload): Promise<NotificationResponse> {
    this.logger.log(`Creating notification for user ${payload.userId}`);

    const notification = this.notificationRepository.create(payload);
    const savedNotification = await this.notificationRepository.save(notification);

    const notificationResponse = this.mapNotificationToResponse(savedNotification);
    this.websocketClient.emit('notification.send', notificationResponse);
    this.logger.log(`Published WebSocket event for user ${payload.userId}`);

    return notificationResponse;
  }

  async getUserNotifications(
    userId: string,
    page = 1,
    size = 20,
  ): Promise<{
    data: NotificationResponse[];
    meta: { page: number; size: number; total: number; totalPages: number };
  }> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      data: notifications.map((n) => this.mapNotificationToResponse(n)),
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    const updatedNotification = await this.notificationRepository.save(notification);

    return this.mapNotificationToResponse(updatedNotification);
  }

  async markAllAsRead(userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepository.update(
      { userId, read: false },
      { read: true },
    );

    return { affected: result.affected || 0 };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { userId, read: false },
    });

    return { count };
  }

  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationRepository.remove(notification);

    return { message: 'Notification deleted successfully' };
  }

  private mapNotificationToResponse(notification: Notification): NotificationResponse {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      taskId: notification.taskId,
      commentId: notification.commentId,
      metadata: notification.metadata,
      read: notification.read,
      createdAt: notification.createdAt,
    };
  }
}
