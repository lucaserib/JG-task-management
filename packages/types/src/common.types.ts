export interface RabbitMQMessage<T = any> {
  pattern: string;
  data: T;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  info?: Record<string, any>;
  error?: Record<string, any>;
  details?: Record<string, any>;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}
