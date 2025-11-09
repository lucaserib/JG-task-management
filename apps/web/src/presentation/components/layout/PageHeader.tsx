import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}
