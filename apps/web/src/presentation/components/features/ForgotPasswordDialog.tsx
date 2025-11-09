import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from '@/shared/validations';
import { authService } from '@/application/services';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Loader2 } from 'lucide-react';

export function ForgotPasswordDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [resetToken, setResetToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
    },
  });

  const handleEmailSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(data);
      setResetToken(response.resetToken || '');
      resetForm.setValue('token', response.resetToken || '');
      setStep('reset');
      toast.success('Reset token generated!', {
        description: 'Enter your new password below',
      });
    } catch (error) {
      toast.error('Failed to generate reset token', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      });
      toast.success('Password reset successful!', {
        description: 'You can now login with your new password',
      });
      setIsOpen(false);
      resetDialog();
    } catch (error) {
      toast.error('Failed to reset password', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('email');
    setResetToken('');
    emailForm.reset();
    resetForm.reset();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetDialog();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" className="px-0 text-sm">
          Forgot password?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {step === 'email'
              ? 'Enter your email to receive a password reset token'
              : 'Enter your new password'}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                disabled={isLoading}
                {...emailForm.register('email')}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating token...
                </>
              ) : (
                'Request Reset Token'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Reset Token</Label>
              <Input
                id="token"
                type="text"
                value={resetToken}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Token generated successfully. Save it if needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                disabled={isLoading}
                {...resetForm.register('newPassword')}
              />
              {resetForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {resetForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                disabled={isLoading}
                {...resetForm.register('confirmPassword')}
              />
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {resetForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
