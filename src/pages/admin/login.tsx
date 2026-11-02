import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { safeNext } from '@/lib/navigation';

const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const { login, logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'), '/admin');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated && user?.role === 'ADMIN') return <Navigate to={next} replace />;

  const onSubmit = async (data: LoginFormData) => {
    setFormError('');
    try {
      const logged = await login(data.email, data.password);
      if (logged.role !== 'ADMIN') {
        logout();
        setFormError('Esta conta não tem acesso à área administrativa.');
        return;
      }
      navigate(next, { replace: true });
    } catch (e) {
      setFormError(e instanceof Error && e.message ? e.message : 'E-mail ou senha incorretos.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="" width={56} height={56} className="mx-auto mb-4 h-16 w-16" />
          <p className="text-2xl font-bold text-foreground">NEOX</p>
          <p className="mt-1 text-sm text-muted-foreground">Área administrativa</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <h1 className="text-xl font-semibold leading-none tracking-tight">Entrar como administrador</h1>
            <CardDescription>Acesso restrito à equipe da plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {formError && (
                <p role="alert" className="rounded-md border border-destructive/20 bg-destructive-muted p-3 text-sm text-destructive">
                  {formError}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" autoComplete="username" autoFocus
                  aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-erro' : undefined}
                  {...register('email')} />
                {errors.email && <p id="email-erro" className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="pr-12"
                    aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-erro' : undefined}
                    {...register('password')} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                </div>
                {errors.password && <p id="password-erro" className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {isSubmitting ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Não é administrador? <Link to="/entrar" className="text-primary hover:underline">Entrar na loja</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
