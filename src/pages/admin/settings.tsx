import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, QueryState } from '@/components/PageStates';
import { FeedbackService } from '@/services/FeedbackService';
import { AdminService, type PlatformSettings } from '@/services/AdminService';

const schema = z.object({
  supportEmail: z.string().trim().max(255).refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'E-mail inválido'),
  supportPhone: z.string().trim().max(30, 'Máximo de 30 caracteres'),
  platformFeePercent: z.coerce.number({ invalid_type_error: 'Informe um número' })
    .min(0, 'Mínimo 0%').max(30, 'Máximo 30%'),
});

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p id={`${id}-dica`} className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-erro`} className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function SettingsForm({ initial }: { initial: PlatformSettings }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<PlatformSettings>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  useEffect(() => reset(initial), [initial, reset]);

  const mutation = useMutation({
    mutationFn: AdminService.saveSettings,
    onSuccess: (data) => {
      qc.setQueryData(['admin-settings'], data);
      FeedbackService.success('Configurações salvas');
    },
    onError: (e: Error) => FeedbackService.error(e.message),
  });

  const fee = Number(watch('platformFeePercent')) || 0;
  const describe = (id: string, hint: boolean, err: boolean) =>
    [hint && `${id}-dica`, err && `${id}-erro`].filter(Boolean).join(' ') || undefined;

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contato de suporte</CardTitle>
          <CardDescription>Exibido para clientes e lojistas nas páginas de ajuda.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field id="supportEmail" label="E-mail de suporte" error={errors.supportEmail?.message}>
            <Input id="supportEmail" type="email" autoComplete="email" placeholder="suporte@exemplo.com"
              aria-invalid={!!errors.supportEmail} aria-describedby={describe('supportEmail', false, !!errors.supportEmail)}
              {...register('supportEmail')} />
          </Field>
          <Field id="supportPhone" label="Telefone / WhatsApp" error={errors.supportPhone?.message}>
            <Input id="supportPhone" type="tel" autoComplete="tel" placeholder="(00) 00000-0000"
              aria-invalid={!!errors.supportPhone} aria-describedby={describe('supportPhone', false, !!errors.supportPhone)}
              {...register('supportPhone')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Taxa da plataforma</CardTitle>
          <CardDescription>Percentual que a NEOX retém sobre as vendas aprovadas de cada loja.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field id="platformFeePercent" label="Taxa (%)" error={errors.platformFeePercent?.message} hint="Entre 0 e 30. Use 0 para não cobrar taxa.">
            <Input id="platformFeePercent" type="number" inputMode="decimal" step="0.1" min={0} max={30} className="sm:w-40"
              aria-invalid={!!errors.platformFeePercent}
              aria-describedby={describe('platformFeePercent', true, !!errors.platformFeePercent)}
              {...register('platformFeePercent')} />
          </Field>
          <p role="note" className="flex items-start gap-2 rounded-md border border-info/20 bg-info-muted p-3 text-sm text-info">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              A taxa é descontada do <strong>saldo disponível para repasse</strong> de todos os lojistas, inclusive sobre vendas já aprovadas.
              Exemplo: com {fee.toLocaleString('pt-BR')}%, uma venda de R$ 100,00 deixa R$ {(100 - fee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (antes das taxas do meio de pagamento).
              Repasses já pedidos não mudam.
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={!isDirty || mutation.isPending} onClick={() => reset(initial)}>Descartar</Button>
        <Button type="submit" disabled={!isDirty || mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}Salvar
        </Button>
      </div>
    </form>
  );
}

export function AdminSettingsPage() {
  const query = useQuery({ queryKey: ['admin-settings'], queryFn: AdminService.getSettings });
  return (
    <div className="max-w-3xl">
      <PageHeader title="Configurações" description="Regras globais da plataforma." />
      <QueryState query={query}>{(s) => <SettingsForm initial={s} />}</QueryState>
    </div>
  );
}
