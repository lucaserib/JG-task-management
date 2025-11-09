import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RegisterForm } from '../components/forms';
import type { RegisterFormData } from '@/shared/validations';

export const Route = createFileRoute('/_auth/register' as any)({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const handleRegister = async (data: Omit<RegisterFormData, 'confirmPassword'>) => {
    await register(data);
    navigate({ to: '/tasks' as any });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Get started with Jungle Gaming Task Manager</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
