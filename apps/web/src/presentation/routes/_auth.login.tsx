import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LoginForm } from '../components/forms';
import type { LoginFormData } from '@/shared/validations';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/login' as any)({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleLogin = async (data: LoginFormData) => {
    await login(data);
    navigate({ to: '/tasks' as any });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to your Jungle Gaming Task Manager account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
