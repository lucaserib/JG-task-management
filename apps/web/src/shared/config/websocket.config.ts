export const WEBSOCKET_CONFIG = {
  URL: import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3001',

  OPTIONS: {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000,
    transports: ['websocket', 'polling'] as string[],
  },
};

export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_ERROR: 'reconnect_error',
  RECONNECT_FAILED: 'reconnect_failed',

  NOTIFICATION: 'notification',
  TASK_UPDATED: 'task:updated',
  TASK_CREATED: 'task:created',
  TASK_DELETED: 'task:deleted',
  COMMENT_CREATED: 'comment:created',
  USER_ASSIGNED: 'task:user-assigned',
  USER_UNASSIGNED: 'task:user-unassigned',
} as const;
