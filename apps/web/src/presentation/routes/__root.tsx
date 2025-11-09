import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Toaster } from '../components/ui/toaster';

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-800 mb-2">Oops! Something went wrong</h1>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
