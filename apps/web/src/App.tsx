import { useEffect } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { router } from './router';
import { useAuth, useWebSocket } from './presentation/hooks';
import { ThemeProvider } from './presentation/contexts/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const { initialize, isAuthenticated, user } = useAuth();
  const { connect, disconnect, register } = useWebSocket();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const timeoutId = setTimeout(() => {
        register(user.id);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, user, register]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
