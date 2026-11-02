import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { homeFor, safeNext } from '@/lib/navigation';
import type { User } from '@/services/AuthService';
import { FeedbackService } from '@/services/FeedbackService';
import { GuestCartService } from '@/services/GuestCartService';
import { Field } from '@/pages/client/AddressFields';
import type { FieldErrors } from '@/pages/client/br';
import { maskPhone } from '@/pages/client/br';
import { AuthShell, PasswordInput } from './AuthShell';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md border border-destructive/20 bg-destructive-muted p-3 text-sm text-destructive">
      {message}
    </p>
  );
}

/** Depois de entrar: leva o carrinho do visitante para a conta e volta para onde ele estava. */
function useAfterAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  return async (user: User) => {
    if (user.role === 'CLIENTE') {
      const failed = await GuestCartService.mergeIntoApi();
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (failed) FeedbackService.info(`${failed} item(ns) do carrinho não estão mais disponíveis e foram removidos.`);
    }
    navigate(safeNext(params.get('next'), homeFor(user.role)), { replace: true });
  };
}

function LoginTab() {
  const { login } = useAuth();
  const afterAuth = useAfterAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!EMAIL.test(email.trim())) errs.email = 'Informe um e-mail válido';
    if (!password) errs.password = 'Informe sua senha';
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await afterAuth(await login(email.trim(), password));
    } catch (err) {
      setFormError(err instanceof Error && err.message === 'Credenciais inválidas' ? 'E-mail ou senha incorretos.' : err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormError message={formError} />
      <Field id="login-email" label="E-mail" error={errors.email}>
        {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
      </Field>
      <Field id="login-senha" label="Senha" error={errors.password}>
        {(p) => <PasswordInput {...p} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
      </Field>
      <div className="text-right">
        <Link to="/recuperar-senha" className="text-sm font-medium text-primary hover:underline">Esqueci minha senha</Link>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        Entrar
      </Button>
    </form>
  );
}

function RegisterTab() {
  const { register } = useAuth();
  const afterAuth = useAfterAuth();
  const [data, setData] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData({ ...data, [k]: k === 'phone' ? maskPhone(e.target.value) : e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (data.name.trim().length < 2) errs.name = 'Informe seu nome';
    if (!EMAIL.test(data.email.trim())) errs.email = 'Informe um e-mail válido';
    if (data.password.length < 6) errs.password = 'A senha precisa ter pelo menos 6 caracteres';
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await afterAuth(await register({ name: data.name.trim(), email: data.email.trim(), password: data.password, phone: data.phone || undefined }));
    } catch (err) {
      setFormError(err instanceof Error && err.message === 'Email já cadastrado' ? 'Este e-mail já tem conta. Entre ou recupere sua senha.' : err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormError message={formError} />
      <Field id="cad-nome" label="Nome completo" error={errors.name}>
        {(p) => <Input {...p} autoComplete="name" value={data.name} onChange={set('name')} />}
      </Field>
      <Field id="cad-email" label="E-mail" error={errors.email}>
        {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" value={data.email} onChange={set('email')} />}
      </Field>
      <Field id="cad-telefone" label="Celular (opcional)">
        {(p) => <Input {...p} type="tel" autoComplete="tel-national" placeholder="(00) 00000-0000" value={data.phone} onChange={set('phone')} />}
      </Field>
      <Field id="cad-senha" label="Senha" error={errors.password} hint="Mínimo de 6 caracteres.">
        {(p) => <PasswordInput {...p} autoComplete="new-password" value={data.password} onChange={set('password')} />}
      </Field>
      <p className="text-xs text-muted-foreground">
        Ao criar a conta você concorda com os{' '}
        <Link to="/termos" className="text-primary hover:underline">Termos de uso</Link> e a{' '}
        <Link to="/privacidade" className="text-primary hover:underline">Política de privacidade</Link>.
      </p>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        Criar conta
      </Button>
    </form>
  );
}

export function AuthPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('aba') === 'cadastro' ? 'cadastro' : 'entrar';
  const onTab = (v: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (v === 'cadastro') next.set('aba', 'cadastro');
        else next.delete('aba');
        return next;
      },
      { replace: true },
    );

  return (
    <AuthShell
      title={tab === 'cadastro' ? 'Crie sua conta' : 'Entre para comprar'}
      description="Acompanhe seus pedidos e finalize compras mais rápido."
      footer={
        <>
          Tem uma loja? <Link to="/vender" className="font-medium text-primary hover:underline">Sou lojista</Link>
        </>
      }
    >
      <Tabs value={tab} onValueChange={onTab}>
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="entrar" className="min-h-10">Entrar</TabsTrigger>
          <TabsTrigger value="cadastro" className="min-h-10">Criar conta</TabsTrigger>
        </TabsList>
        <TabsContent value="entrar"><LoginTab /></TabsContent>
        <TabsContent value="cadastro"><RegisterTab /></TabsContent>
      </Tabs>
    </AuthShell>
  );
}
