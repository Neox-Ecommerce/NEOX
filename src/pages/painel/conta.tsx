import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageStates';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/AuthService';
import { FeedbackService } from '@/services/FeedbackService';
import { formatPhone } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome'),
  email: z.string().trim().email('E-mail inválido'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: z.string().min(6, 'A nova senha precisa de pelo menos 6 caracteres'),
  confirm: z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: 'As senhas não conferem', path: ['confirm'] });

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? <p id={id} className="text-sm text-destructive">{msg}</p> : null;
}

/** Dados pessoais do lojista (a loja fica em "Minha loja"). */
export function MyAccountPage() {
  const { user, updateProfile } = useAuth();

  const profile = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' },
  });
  useEffect(() => {
    if (user) profile.reset({ name: user.name, email: user.email, phone: user.phone ?? '' });
  }, [user, profile]);

  const password = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const saveProfile = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => FeedbackService.success('Dados pessoais salvos.'),
    onError: (e: Error) => FeedbackService.error(e.message || 'Não foi possível salvar.'),
  });

  const savePassword = useMutation({
    mutationFn: (d: z.infer<typeof passwordSchema>) => AuthService.changePassword(d.currentPassword, d.newPassword),
    onSuccess: () => {
      FeedbackService.success('Senha alterada.');
      password.reset();
    },
    onError: (e: Error) => FeedbackService.error(e.message || 'Não foi possível alterar a senha.'),
  });

  const pe = profile.formState.errors;
  const we = password.formState.errors;
  const a11y = (invalid: boolean, id: string) => ({ 'aria-invalid': invalid, 'aria-describedby': invalid ? id : undefined });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Minha conta" description="Seus dados de acesso. Os dados da loja ficam em Minha loja." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={profile.handleSubmit((d) => saveProfile.mutate(d))} className="grid gap-4 sm:grid-cols-2" noValidate>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="conta-nome">Nome</Label>
                <Input id="conta-nome" autoComplete="name" {...profile.register('name')} {...a11y(!!pe.name, 'conta-nome-erro')} />
                <Err id="conta-nome-erro" msg={pe.name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conta-email">E-mail</Label>
                <Input id="conta-email" type="email" autoComplete="email" {...profile.register('email')} {...a11y(!!pe.email, 'conta-email-erro')} />
                <Err id="conta-email-erro" msg={pe.email?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conta-telefone">Telefone</Label>
                <Input id="conta-telefone" type="tel" autoComplete="tel"
                  {...profile.register('phone', { onChange: (e) => profile.setValue('phone', formatPhone(e.target.value)) })} />
              </div>
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit" disabled={saveProfile.isPending || !profile.formState.isDirty}>
                  {saveProfile.isPending ? 'Salvando…' : 'Salvar dados'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Senha</CardTitle>
            <CardDescription>Use pelo menos 6 caracteres.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={password.handleSubmit((d) => savePassword.mutate(d))} className="grid gap-4 sm:grid-cols-2" noValidate>
              <div className="space-y-2 sm:col-span-2 sm:max-w-sm">
                <Label htmlFor="senha-atual">Senha atual</Label>
                <Input id="senha-atual" type="password" autoComplete="current-password" {...password.register('currentPassword')} {...a11y(!!we.currentPassword, 'senha-atual-erro')} />
                <Err id="senha-atual-erro" msg={we.currentPassword?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha-nova">Nova senha</Label>
                <Input id="senha-nova" type="password" autoComplete="new-password" {...password.register('newPassword')} {...a11y(!!we.newPassword, 'senha-nova-erro')} />
                <Err id="senha-nova-erro" msg={we.newPassword?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha-confirma">Confirme a nova senha</Label>
                <Input id="senha-confirma" type="password" autoComplete="new-password" {...password.register('confirm')} {...a11y(!!we.confirm, 'senha-confirma-erro')} />
                <Err id="senha-confirma-erro" msg={we.confirm?.message} />
              </div>
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit" disabled={savePassword.isPending}>{savePassword.isPending ? 'Alterando…' : 'Alterar senha'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
