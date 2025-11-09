import type { INotificationRepository } from '../../domain/repositories';
import type { NotificationResponse, PaginatedResponse } from '../../domain/entities';
import { apiClient } from './api-client';
import { API_ENDPOINTS } from '../../shared/config/api.config';

export class NotificationsApi implements INotificationRepository {
  async getNotifications(page = 1, size = 10): Promise<PaginatedResponse<NotificationResponse>> {
    const response = await apiClient.get<PaginatedResponse<NotificationResponse>>(
      API_ENDPOINTS.NOTIFICATIONS.BASE,
      { params: { page, size } },
    );
    return response.data;
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/unread-count`,
    );
    return response.data;
  }

  async markAsRead(id: string): Promise<NotificationResponse> {
    const response = await apiClient.patch<NotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
    );
    return response.data;
  }

  async markAllAsRead(): Promise<{ affected: number }> {
    const response = await apiClient.patch<{ affected: number }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
    );
    return response.data;
  }

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
  }
}

export const notificationsApi = new NotificationsApi();
