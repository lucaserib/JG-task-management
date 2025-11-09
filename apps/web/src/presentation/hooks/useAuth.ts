import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores';
import { authService } from '../../application/services';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    initialize,
    clearError,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,

    login,
    register,
    logout,
    initialize,
    clearError,
  };
};

export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
};

export const useUsers = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.lists(),
    queryFn: () => authService.getAllUsers(),
    staleTime: 5 * 60 * 1000,
  });
};
