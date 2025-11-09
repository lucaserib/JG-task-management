import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      visibleToasts={1}
      toastOptions={{
        classNames: {
          toast:
            'group toast group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border border-border bg-background p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
          description: 'text-sm opacity-90',
          title: 'text-sm font-semibold',
          closeButton: 'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
          error:
            'group border-destructive bg-destructive text-destructive-foreground',
          success:
            'group border-primary bg-primary text-primary-foreground',
          warning: 'group border-yellow-500 bg-yellow-50 text-yellow-900',
          loading: 'group border-border bg-background text-foreground',
        },
      }}
      position="bottom-right"
    />
  );
}
