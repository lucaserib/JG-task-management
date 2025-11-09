import { createFileRoute, redirect } from '@tanstack/react-router';
import { LocalStorageService } from '../../infrastructure/storage/local-storage';

export const Route = createFileRoute('/' as any)({
  beforeLoad: () => {
    if (LocalStorageService.isAuthenticated()) {
      throw redirect({ to: '/tasks' as any });
    } else {
      throw redirect({ to: '/login' as any });
    }
  },
});
