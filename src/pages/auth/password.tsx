import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthService } from '@/services/AuthService';
import { Field } from '@/pages/client/AddressFields';
import type { FieldErrors } from '@/pages/client/br';
import { AuthShell, PasswordInput } from './AuthShell';

const backToLogin = <Link to="/entrar" className="font-medium text-primary hover:underline">Voltar para entrar</Link>;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError('Informe um e-mail válido');
    setError(null);
    setBusy(true);
    try {
      await AuthService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar agora. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Recuperar senha" description="Enviaremos um link para você criar uma nova senha." footer={backToLogin}>
      {sent ? (
        <div role="status" className="space-y-2 text-sm">
          <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
          <p>Se houver uma conta com <strong>{email.trim()}</strong>, você vai receber um e-mail com o link em alguns minutos.</p>
          <p className="text-muted-foreground">O link vale por 1 hora. Confira também a caixa de spam.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field id="recuperar-email" label="E-mail da conta" error={error ?? undefined}>
            {(p) => <Input {...p} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
          </Field>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Enviar link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [pwd, setPwd] = useState({ next: '', confirm: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <AuthShell title="Link inválido" description="Este link de redefinição está incompleto." footer={backToLogin}>
        <Button asChild className="w-full"><Link to="/recuperar-senha">Pedir um novo link</Link></Button>
      </AuthShell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (pwd.next.length < 6) errs.next = 'A senha precisa ter pelo menos 6 caracteres';
    if (pwd.confirm !== pwd.next) errs.confirm = 'As senhas não conferem';
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await AuthService.resetPassword(token, pwd.next);
      setDone(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Criar nova senha" footer={backToLogin}>
      {done ? (
        <div role="status" className="space-y-4 text-sm">
          <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
          <p>Senha alterada. Agora é só entrar com a nova senha.</p>
          <Button asChild className="w-full"><Link to="/entrar">Entrar</Link></Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          {formError && (
            <div role="alert" className="space-y-1 rounded-md border border-destructive/20 bg-destructive-muted p-3 text-sm text-destructive">
              <p>{formError}</p>
              <Link to="/recuperar-senha" className="font-medium underline">Pedir um novo link</Link>
            </div>
          )}
          <Field id="nova-senha" label="Nova senha" error={errors.next} hint="Mínimo de 6 caracteres.">
            {(p) => <PasswordInput {...p} autoComplete="new-password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />}
          </Field>
          <Field id="confirma-senha" label="Confirme a nova senha" error={errors.confirm}>
            {(p) => <PasswordInput {...p} autoComplete="new-password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />}
          </Field>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Salvar nova senha
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
