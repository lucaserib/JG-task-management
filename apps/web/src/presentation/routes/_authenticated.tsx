import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router';
import { LocalStorageService } from '../../infrastructure/storage/local-storage';
import { useAuth } from '../hooks';
import { Button } from '../components/ui/button';
import { NotificationBellContainer } from '../components/features';
import { ThemeToggle } from '../components/features/ThemeToggle';

export const Route = createFileRoute('/_authenticated' as any)({
  beforeLoad: () => {
    if (!LocalStorageService.isAuthenticated()) {
      throw redirect({ to: '/login' as any });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/login' as any });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">JG</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Task Management
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBellContainer />
              <ThemeToggle />
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.username || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
