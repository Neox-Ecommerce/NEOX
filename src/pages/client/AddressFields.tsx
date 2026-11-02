import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { digits, lookupCep, maskCep, UFS, type AddressValue, type FieldErrors } from './br';

/** Campo com rótulo e erro ligado por aria-describedby. */
export function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => React.ReactNode;
}) {
  const describedBy = [error && `${id}-erro`, hint && `${id}-dica`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': describedBy })}
      {hint && !error && <p id={`${id}-dica`} className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-erro`} className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Endereço com CEP primeiro: ao completar 8 dígitos consulta o ViaCEP e preenche rua, bairro, cidade e UF.
 * CEP inexistente ou falha de rede → mensagem e preenchimento manual.
 */
export function AddressFields({
  value,
  onChange,
  errors = {},
  idPrefix = 'end',
}: {
  value: AddressValue;
  onChange: (v: AddressValue) => void;
  errors?: FieldErrors;
  idPrefix?: string;
}) {
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'notfound' | 'failed'>('idle');
  const set = (k: keyof AddressValue, v: string) => onChange({ ...value, [k]: v });
  const id = (k: string) => `${idPrefix}-${k}`;

  const onCep = async (raw: string) => {
    const zipCode = maskCep(raw);
    onChange({ ...value, zipCode });
    if (digits(zipCode).length !== 8) return setCepStatus('idle');
    setCepStatus('loading');
    try {
      const found = await lookupCep(zipCode);
      if (!found) return setCepStatus('notfound');
      setCepStatus('idle');
      onChange({
        ...value,
        zipCode,
        street: found.street || value.street,
        neighborhood: found.neighborhood || value.neighborhood,
        city: found.city || value.city,
        state: found.state || value.state,
      });
    } catch {
      setCepStatus('failed');
    }
  };

  const cepHint =
    cepStatus === 'loading' ? undefined
      : cepStatus === 'notfound' ? 'CEP não encontrado. Confira o número ou preencha o endereço abaixo.'
        : cepStatus === 'failed' ? 'Não foi possível buscar o CEP agora. Preencha o endereço abaixo.'
          : 'Preenchemos o endereço a partir do CEP.';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <Field id={id('cep')} label="CEP" error={errors.zipCode} hint={cepHint} className="sm:col-span-2">
        {(p) => (
          <div className="relative">
            <Input {...p} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={value.zipCode} onChange={(e) => onCep(e.target.value)} />
            {cepStatus === 'loading' && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-label="Buscando CEP" />
            )}
          </div>
        )}
      </Field>
      <Field id={id('rua')} label="Rua" error={errors.street} className="sm:col-span-4">
        {(p) => <Input {...p} autoComplete="address-line1" value={value.street} onChange={(e) => set('street', e.target.value)} />}
      </Field>
      <Field id={id('numero')} label="Número" error={errors.number} className="sm:col-span-2">
        {(p) => <Input {...p} inputMode="numeric" value={value.number} onChange={(e) => set('number', e.target.value)} />}
      </Field>
      <Field id={id('complemento')} label="Complemento (opcional)" className="sm:col-span-4">
        {(p) => <Input {...p} autoComplete="address-line2" value={value.complement} onChange={(e) => set('complement', e.target.value)} />}
      </Field>
      <Field id={id('bairro')} label="Bairro" error={errors.neighborhood} className="sm:col-span-2">
        {(p) => <Input {...p} autoComplete="address-level3" value={value.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} />}
      </Field>
      <Field id={id('cidade')} label="Cidade" error={errors.city} className="sm:col-span-3">
        {(p) => <Input {...p} autoComplete="address-level2" value={value.city} onChange={(e) => set('city', e.target.value)} />}
      </Field>
      <Field id={id('uf')} label="UF" error={errors.state} className="sm:col-span-1">
        {(p) => (
          <Select value={value.state} onValueChange={(v) => set('state', v)}>
            <SelectTrigger {...p}><SelectValue placeholder="UF" /></SelectTrigger>
            <SelectContent>
              {UFS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </Field>
    </div>
  );
}
