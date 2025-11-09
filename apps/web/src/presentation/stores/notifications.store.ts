import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { NotificationResponse } from '../../domain/entities';

interface NotificationsState {
  notifications: NotificationResponse[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  setNotifications: (notifications: NotificationResponse[]) => void;
  addNotification: (notification: NotificationResponse) => void;
  updateNotification: (notification: NotificationResponse) => void;
  removeNotification: (notificationId: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateUnreadCount: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter((n) => !n.read).length;
        set({ notifications, unreadCount });
      },

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
        })),

      updateNotification: (updatedNotification) =>
        set((state) => {
          const notifications = state.notifications.map((notification) =>
            notification.id === updatedNotification.id ? updatedNotification : notification,
          );
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        }),

      removeNotification: (notificationId) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === notificationId);
          const notifications = state.notifications.filter((n) => n.id !== notificationId);
          const unreadCount =
            notification && !notification.read ? state.unreadCount - 1 : state.unreadCount;
          return { notifications, unreadCount };
        }),

      markAsRead: (notificationId) =>
        set((state) => {
          const notifications = state.notifications.map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification,
          );
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
          unreadCount: 0,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      updateUnreadCount: () =>
        set((state) => ({
          unreadCount: state.notifications.filter((n) => !n.read).length,
        })),
    }),
    { name: 'notifications-store' },
  ),
);
