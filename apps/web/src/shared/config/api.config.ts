export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    USERS: '/auth/users',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  TASKS: {
    BASE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    COMMENTS: (taskId: string) => `/tasks/${taskId}/comments`,
    COMMENT_BY_ID: (taskId: string, commentId: string) => `/tasks/${taskId}/comments/${commentId}`,
    HISTORY: (taskId: string) => `/tasks/${taskId}/history`,
  },

  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
} as const;
