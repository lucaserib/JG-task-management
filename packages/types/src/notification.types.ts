export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  NEW_COMMENT = 'NEW_COMMENT',
}

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  commentId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  commentId?: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface WebSocketEvent {
  event: string;
  data: any;
}
