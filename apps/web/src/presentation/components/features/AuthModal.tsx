import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { LoginForm } from '@/presentation/components/forms/LoginForm';
import { RegisterForm } from '@/presentation/components/forms/RegisterForm';
import type { LoginFormData, RegisterFormData } from '@/shared/validations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLogin: (data: LoginFormData) => Promise<void>;
  onRegister: (data: Omit<RegisterFormData, 'confirmPassword'>) => Promise<void>;
  isLoading?: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onLogin,
  onRegister,
  isLoading = false,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const handleModeSwitch = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login'
              ? 'Sign in to your Jungle Gaming Task Manager account'
              : 'Get started with Jungle Gaming Task Manager'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {mode === 'login' ? (
            <LoginForm onSubmit={onLogin} isLoading={isLoading} />
          ) : (
            <RegisterForm onSubmit={onRegister} isLoading={isLoading} />
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <Button
              variant="link"
              onClick={handleModeSwitch}
              className="px-2 font-semibold text-primary"
              disabled={isLoading}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
