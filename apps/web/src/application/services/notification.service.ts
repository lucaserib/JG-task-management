import type { INotificationRepository } from '../../domain/repositories';
import type { NotificationResponse, PaginatedResponse } from '../../domain/entities';
import { notificationsApi } from '../../infrastructure/http';

export class NotificationService {
  private notificationRepository: INotificationRepository;

  constructor(notificationRepository?: INotificationRepository) {
    this.notificationRepository = notificationRepository ?? notificationsApi;
  }

  async getNotifications(page = 1, size = 10): Promise<PaginatedResponse<NotificationResponse>> {
    return this.notificationRepository.getNotifications(page, size);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return this.notificationRepository.getUnreadCount();
  }

  async markAsRead(id: string): Promise<NotificationResponse> {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(): Promise<{ affected: number }> {
    return this.notificationRepository.markAllAsRead();
  }

  async deleteNotification(id: string): Promise<void> {
    return this.notificationRepository.deleteNotification(id);
  }
}

export const notificationService = new NotificationService();
