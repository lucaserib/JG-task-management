import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { LocalStorageService } from '../../infrastructure/storage/local-storage';
import { ThemeToggle } from '../components/features/ThemeToggle';

export const Route = createFileRoute('/_auth' as any)({
  beforeLoad: () => {
    if (LocalStorageService.isAuthenticated()) {
      throw redirect({ to: '/tasks' as any });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-jungle-glow">
              <span className="text-primary-foreground font-bold text-3xl">JG</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Task Management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Organize your work efficiently</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
