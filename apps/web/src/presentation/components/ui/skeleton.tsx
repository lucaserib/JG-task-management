import * as React from 'react';
import { cn } from '@/shared/utils/cn';

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative overflow-hidden rounded-md bg-muted',
      className,
    )}
    {...props}
  >
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
  </div>
));
Skeleton.displayName = 'Skeleton';

export { Skeleton };
