import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema, type RegisterFormData } from '@/shared/validations';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Loader2 } from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (data: Omit<RegisterFormData, 'confirmPassword'>) => Promise<void>;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleFormSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await onSubmit(registerData);
      toast.success('Registration successful!', {
        description: 'Welcome to Jungle Gaming Task Manager',
      });
    } catch (error) {
      toast.error('Registration failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Your username"
          disabled={isLoading}
          aria-invalid={errors.username ? 'true' : 'false'}
          aria-describedby={errors.username ? 'username-error' : undefined}
          {...register('username')}
        />
        {errors.username && (
          <p id="username-error" className="text-sm text-destructive" role="alert">
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          disabled={isLoading}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Min. 8 chars, 1 uppercase, 1 lowercase, 1 number"
          disabled={isLoading}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          disabled={isLoading}
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className="text-sm text-destructive" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
}
