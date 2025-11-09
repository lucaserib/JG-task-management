import type { NotificationResponse, PaginatedResponse } from '../entities';

export interface INotificationRepository {
  getNotifications(page?: number, size?: number): Promise<PaginatedResponse<NotificationResponse>>;

  getUnreadCount(): Promise<{ count: number }>;

  markAsRead(id: string): Promise<NotificationResponse>;

  markAllAsRead(): Promise<{ affected: number }>;

  deleteNotification(id: string): Promise<void>;
}
