import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../application/services';
import { useNotificationsStore } from '../stores';

export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  list: () => [...NOTIFICATION_QUERY_KEYS.all, 'list'] as const,
};

export const useNotifications = (page = 1, size = 20) => {
  const { setNotifications, setLoading, setError } = useNotificationsStore();

  return useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEYS.list(), page],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await notificationService.getNotifications(page, size);
        setNotifications(response.data);
        setError(null);
        return response;
      } catch (error: any) {
        setError(error.message || 'Failed to fetch notifications');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 3000,
    refetchInterval: 10000,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotificationsStore();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: (notification) => {
      markAsRead(notification.id);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list() });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { markAllAsRead } = useNotificationsStore();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      markAllAsRead();
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list() });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { removeNotification } = useNotificationsStore();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: (_, notificationId) => {
      removeNotification(notificationId);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list() });
    },
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEYS.all, 'count'],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 2000,
    refetchInterval: 5000,
  });
};
