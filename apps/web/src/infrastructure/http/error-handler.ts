import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: string[];
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data;

    if (response?.message) {
      if (Array.isArray(response.message)) {
        const messages = response.message.filter((msg: any) => typeof msg === 'string');
        if (messages.length > 0) {
          return messages.join('. ');
        }
      }

      if (typeof response.message === 'string') {
        return response.message;
      }
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Connection error. Please check your internet and try again.';
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }

    switch (error.response?.status) {
      case 400:
        return 'Invalid data. Please check the fields and try again.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access denied. You do not have permission for this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return response?.message || 'Conflict. This record already exists.';
      case 422:
        return 'Unprocessable data. Please check the fields.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

export function parseApiError(error: unknown): ApiError {
  if (error instanceof AxiosError && error.response) {
    const response = error.response.data;

    return {
      message: extractErrorMessage(error),
      statusCode: error.response.status,
      errors: Array.isArray(response?.message) ? response.message : undefined,
    };
  }

  return {
    message: extractErrorMessage(error),
    statusCode: 500,
  };
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 400 || error.response?.status === 422;
  }
  return false;
}
