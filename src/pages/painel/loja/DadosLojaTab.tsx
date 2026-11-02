import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Store as StoreIcon, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoreService, type Store } from '@/services/StoreService';
import { FeedbackService } from '@/services/FeedbackService';
import { formatPhone, validateFacebook, validateInstagram, validateURL } from '@/lib/utils';

const schema = z.object({
  nomeFantasia: z.string().trim().min(2, 'Informe o nome da loja'),
  razaoSocial: z.string().trim().min(1, 'Informe a razão social'),
  segmento: z.string().min(1, 'Escolha o segmento'),
  categoriaTributaria: z.string().min(1, 'Escolha o regime tributário'),
  logo: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  descricaoLoja: z.string().max(300, 'Use no máximo 300 caracteres').optional(),
  horarioFuncionamento: z.record(z.object({ ativo: z.boolean(), abertura: z.string(), fechamento: z.string() })),
  redesSociais: z.object({
    instagram: z.string().optional().refine((v) => !v || validateInstagram(v), 'Usuário do Instagram inválido'),
    facebook: z.string().optional().refine((v) => !v || validateFacebook(v), 'Usuário do Facebook inválido'),
    whatsapp: z.string().optional(),
    website: z.string().optional().refine((v) => !v || validateURL(v), 'Use um endereço completo, com https://'),
  }),
  tiposEntrega: z.array(z.string()),
});
type FormData = z.infer<typeof schema>;

const toForm = (s: Store): FormData => ({
  nomeFantasia: s.nomeFantasia, razaoSocial: s.razaoSocial, segmento: s.segmento, categoriaTributaria: s.categoriaTributaria,
  logo: s.logo ?? '', endereco: s.endereco ?? '', telefone: s.telefone ?? '', descricaoLoja: s.descricaoLoja ?? '',
  horarioFuncionamento: s.horarioFuncionamento ?? {}, redesSociais: s.redesSociais ?? {}, tiposEntrega: s.tiposEntrega ?? [],
});

const DEFAULT_HOURS = { ativo: false, abertura: '08:00', fechamento: '18:00' };

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? <p id={id} className="text-sm text-destructive">{msg}</p> : null;
}

/** Identidade da loja: tudo aqui é coluna da loja (/stores/me), fonte única desses dados. */
export function DadosLojaTab({ store }: { store: Store }) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: toForm(store),
  });

  useEffect(() => reset(toForm(store)), [store, reset]);

  const mutation = useMutation({
    mutationFn: StoreService.updateStore,
    onSuccess: (updated) => {
      queryClient.setQueryData(['store'], updated);
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      FeedbackService.success('Dados da loja salvos.');
    },
    onError: (e: Error) => FeedbackService.error(e.message || 'Não foi possível salvar os dados da loja.'),
  });

  const onLogo = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return FeedbackService.error('Use uma imagem JPG, PNG ou WebP.');
    const reader = new FileReader();
    reader.onload = () => setValue('logo', reader.result as string, { shouldDirty: true });
    reader.readAsDataURL(file);
  };

  const logo = watch('logo');
  const hours = watch('horarioFuncionamento');
  const tipos = watch('tiposEntrega');
  const setHour = (dia: string, patch: Partial<typeof DEFAULT_HOURS>) =>
    setValue(`horarioFuncionamento.${dia}`, { ...DEFAULT_HOURS, ...hours?.[dia], ...patch }, { shouldDirty: true });
  const a11y = (invalid: boolean, id: string) => ({ 'aria-invalid': invalid, 'aria-describedby': invalid ? id : undefined });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identidade</CardTitle>
          <CardDescription>Como os clientes veem sua loja na vitrine.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {logo ? <img src={logo} alt="Logo da loja" className="h-full w-full object-cover" /> : <StoreIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />}
            </div>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id="logo-arquivo" aria-label="Arquivo do logo"
              onChange={(e) => { onLogo(e.target.files?.[0]); e.target.value = ''; }} />
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" /> {logo ? 'Trocar logo' : 'Enviar logo'}
            </Button>
            {logo && (
              <Button type="button" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setValue('logo', '', { shouldDirty: true })}>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Remover logo
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomeFantasia">Nome da loja *</Label>
              <Input id="nomeFantasia" {...register('nomeFantasia')} {...a11y(!!errors.nomeFantasia, 'nomeFantasia-erro')} />
              <Err id="nomeFantasia-erro" msg={errors.nomeFantasia?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segmento">Segmento *</Label>
              <Controller name="segmento" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="segmento"><SelectValue placeholder="Escolha o segmento" /></SelectTrigger>
                  <SelectContent>{StoreService.getSegmentos().map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              <Err id="segmento-erro" msg={errors.segmento?.message} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descricaoLoja">Descrição</Label>
              <Textarea id="descricaoLoja" rows={3} maxLength={300} {...register('descricaoLoja')} placeholder="Conte em poucas palavras o que sua loja vende." />
              <p className="text-right text-xs text-muted-foreground">{(watch('descricaoLoja') ?? '').length}/300</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Empresa e contato</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="razaoSocial">Razão social *</Label>
            <Input id="razaoSocial" {...register('razaoSocial')} {...a11y(!!errors.razaoSocial, 'razaoSocial-erro')} />
            <Err id="razaoSocial-erro" msg={errors.razaoSocial?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" value={store.cnpj} readOnly disabled aria-describedby="cnpj-ajuda" />
            <p id="cnpj-ajuda" className="text-xs text-muted-foreground">Não pode ser alterado. Se estiver errado, abra um chamado em Ajuda.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoriaTributaria">Regime tributário *</Label>
            <Controller name="categoriaTributaria" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="categoriaTributaria"><SelectValue placeholder="Escolha o regime" /></SelectTrigger>
                <SelectContent>{StoreService.getCategoriasTributarias().map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            )} />
            <Err id="categoriaTributaria-erro" msg={errors.categoriaTributaria?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" type="tel" autoComplete="tel" {...register('telefone', { onChange: (e) => setValue('telefone', formatPhone(e.target.value)) })} placeholder="(11) 3333-4444" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" autoComplete="street-address" {...register('endereco')} placeholder="Rua, número, bairro, cidade - UF" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Horário de funcionamento</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {StoreService.getDiasSemana().map((dia) => {
            const h = { ...DEFAULT_HOURS, ...hours?.[dia.key] };
            return (
              <div key={dia.key} className="flex min-h-11 flex-wrap items-center gap-3 rounded-lg border p-3">
                <div className="flex min-w-[10rem] items-center gap-2">
                  <Checkbox id={`dia-${dia.key}`} checked={h.ativo} onCheckedChange={(c) => setHour(dia.key, { ativo: c === true })} />
                  <Label htmlFor={`dia-${dia.key}`}>{dia.label}</Label>
                </div>
                {h.ativo ? (
                  <div className="flex items-center gap-2">
                    <Input type="time" className="w-28" aria-label={`Abertura na ${dia.label}`} value={h.abertura} onChange={(e) => setHour(dia.key, { abertura: e.target.value })} />
                    <span className="text-sm text-muted-foreground">às</span>
                    <Input type="time" className="w-28" aria-label={`Fechamento na ${dia.label}`} value={h.fechamento} onChange={(e) => setHour(dia.key, { fechamento: e.target.value })} />
                  </div>
                ) : <span className="text-sm text-muted-foreground">Fechado</span>}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Redes sociais</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" {...register('redesSociais.instagram')} placeholder="@sualoja" {...a11y(!!errors.redesSociais?.instagram, 'instagram-erro')} />
            <Err id="instagram-erro" msg={errors.redesSociais?.instagram?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" {...register('redesSociais.facebook')} placeholder="sua.pagina" {...a11y(!!errors.redesSociais?.facebook, 'facebook-erro')} />
            <Err id="facebook-erro" msg={errors.redesSociais?.facebook?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" type="tel" inputMode="numeric" {...register('redesSociais.whatsapp', { onChange: (e) => setValue('redesSociais.whatsapp', e.target.value.replace(/\D/g, '')) })} placeholder="5511999999999" aria-describedby="whatsapp-ajuda" />
            <p id="whatsapp-ajuda" className="text-xs text-muted-foreground">Só números, com DDI e DDD.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Site</Label>
            <Input id="website" type="url" {...register('redesSociais.website')} placeholder="https://sualoja.com.br" {...a11y(!!errors.redesSociais?.website, 'website-erro')} />
            <Err id="website-erro" msg={errors.redesSociais?.website?.message} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Formas de entrega</CardTitle>
          <CardDescription>Valores de frete e prazo ficam na aba Frete.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {StoreService.getTiposEntrega().map((tipo, i) => (
            <div key={tipo} className="flex min-h-11 items-center gap-2">
              <Checkbox
                id={`entrega-${i}`}
                checked={tipos?.includes(tipo) ?? false}
                onCheckedChange={(c) => setValue('tiposEntrega', c === true ? [...(tipos ?? []), tipo] : (tipos ?? []).filter((t) => t !== tipo), { shouldDirty: true })}
              />
              <Label htmlFor={`entrega-${i}`}>{tipo}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="sticky bottom-16 z-10 -mx-4 flex justify-end gap-3 border-t bg-card/95 p-4 backdrop-blur sm:mx-0 sm:rounded-lg sm:border lg:bottom-0">
        <Button type="button" variant="outline" disabled={!isDirty} onClick={() => reset(toForm(store))}>Descartar</Button>
        <Button type="submit" disabled={mutation.isPending || !isDirty}>{mutation.isPending ? 'Salvando…' : 'Salvar dados da loja'}</Button>
      </div>
    </form>
  );
}
