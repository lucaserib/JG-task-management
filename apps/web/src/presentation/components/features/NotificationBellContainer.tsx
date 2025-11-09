import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { NotificationBell } from './NotificationBell';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '../../hooks';
import { toast } from 'sonner';
import type { NotificationResponse } from '@/domain/entities';

export function NotificationBellContainer() {
  const navigate = useNavigate();
  const { data: notificationsData } = useNotifications(1, 20);
  const { data: unreadCountData } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const allNotifications = notificationsData?.data || [];
  const safeAllNotifications = Array.isArray(allNotifications) ? allNotifications : [];
  const notifications = safeAllNotifications.slice(0, 15);
  const unreadCount = unreadCountData?.count || 0;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    try {
      const notifArray = Array.isArray(notifications) ? notifications : [];
      await Promise.all(
        notifArray.map((notification) => deleteNotificationMutation.mutateAsync(notification.id)),
      );
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    try {
      if (!notification.read) {
        await markAsReadMutation.mutateAsync(notification.id);
      }

      if (notification.taskId) {
        navigate({ to: '/tasks/$taskId', params: { taskId: notification.taskId } });
      }
    } catch (error) {
      toast.error('Failed to process notification');
    }
  };

  return (
    <NotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDelete={handleDelete}
      onClearAll={handleClearAll}
      onNotificationClick={handleNotificationClick}
    />
  );
}
