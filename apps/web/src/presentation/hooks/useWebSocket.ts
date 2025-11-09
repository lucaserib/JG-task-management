import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketClient } from '../../infrastructure/websocket/socket-client';
import { WEBSOCKET_EVENTS } from '../../shared/config/websocket.config';
import { useNotificationsStore } from '../stores';
import { useTasksStore } from '../stores';
import type { NotificationResponse, TaskResponse } from '../../domain/entities';
import { TASK_QUERY_KEYS } from './useTasks';
import { NOTIFICATION_QUERY_KEYS } from './useNotifications';

export const useWebSocket = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationsStore();
  const { updateTask, addTask, removeTask } = useTasksStore();

  const connect = useCallback(() => {
    socketClient.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketClient.disconnect();
  }, []);

  const isConnected = useCallback(() => {
    return socketClient.isConnected();
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketClient.emit(event, data);
  }, []);

  const register = useCallback((userId: string) => {
    socketClient.register(userId);
  }, []);

  useEffect(() => {
    const handleNotification = (notification: NotificationResponse) => {
      console.log('Received notification:', notification);
      addNotification(notification);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATION_QUERY_KEYS.all, 'count'] });
    };

    const handleTaskUpdated = (task: TaskResponse) => {
      console.log('Task updated:', task);
      updateTask(task);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(task.id) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.history(task.id) });
    };

    const handleTaskCreated = (task: TaskResponse) => {
      console.log('Task created:', task);
      addTask(task);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    };

    const handleTaskDeleted = (data: { taskId: string }) => {
      console.log('Task deleted:', data.taskId);
      removeTask(data.taskId);
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    };

    const handleCommentNew = (notification: NotificationResponse) => {
      console.log('New comment notification:', notification);
      addNotification(notification);
      if (notification.taskId) {
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.comments(notification.taskId) });
      }
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.list() });
    };

    socketClient.on(WEBSOCKET_EVENTS.NOTIFICATION, handleNotification);
    socketClient.on(WEBSOCKET_EVENTS.TASK_UPDATED, handleTaskUpdated);
    socketClient.on(WEBSOCKET_EVENTS.TASK_CREATED, handleTaskCreated);
    socketClient.on(WEBSOCKET_EVENTS.TASK_DELETED, handleTaskDeleted);
    socketClient.on('comment:new', handleCommentNew);

    return () => {
      socketClient.off(WEBSOCKET_EVENTS.NOTIFICATION, handleNotification);
      socketClient.off(WEBSOCKET_EVENTS.TASK_UPDATED, handleTaskUpdated);
      socketClient.off(WEBSOCKET_EVENTS.TASK_CREATED, handleTaskCreated);
      socketClient.off(WEBSOCKET_EVENTS.TASK_DELETED, handleTaskDeleted);
      socketClient.off('comment:new', handleCommentNew);
    };
  }, [addNotification, updateTask, addTask, removeTask, queryClient]);

  return {
    connect,
    disconnect,
    isConnected,
    emit,
    register,
  };
};
