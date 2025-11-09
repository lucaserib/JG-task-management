import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ title = 'Erro', message, onDismiss, className }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        )}
      </AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
