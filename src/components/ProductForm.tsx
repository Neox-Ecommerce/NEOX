import { useEffect, useRef, useState } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ImageIcon, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type CreateProductData, type Product, ProductService } from '@/services/ProductService';
import { cn, formatCurrency } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Campo numérico vazio vira undefined (antes virava NaN e a mensagem era "Expected number, received nan").
const num = (schema: z.ZodTypeAny) =>
  z.preprocess((v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? undefined : Number(v)), schema);
const numberMsg = { invalid_type_error: 'Informe um número válido' };

const productSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do produto').max(100, 'Use no máximo 100 caracteres'),
  descricao: z.string().trim().min(10, 'Descreva o produto com pelo menos 10 caracteres').max(1000, 'Use no máximo 1000 caracteres'),
  preco: num(z.number({ required_error: 'Informe o preço', ...numberMsg }).min(0.01, 'O preço deve ser maior que zero')),
  estoque: num(z.number({ required_error: 'Informe a quantidade em estoque', ...numberMsg }).int('Use um número inteiro').min(0, 'O estoque não pode ser negativo')),
  imagem: z.string().optional(),
  categoria: z.string({ required_error: 'Escolha uma categoria' }).min(1, 'Escolha uma categoria'),
  ativo: z.boolean(),
  peso: num(z.number(numberMsg).min(0, 'O peso não pode ser negativo').optional()),
  dimensoes: z.string().optional(),
  marca: z.string().optional(),
  sku: z.string().optional(),
  desconto: num(z.number(numberMsg).min(0, 'O desconto vai de 0 a 100%').max(100, 'O desconto vai de 0 a 100%').optional()),
});

type FormInput = z.input<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  /** Deve rejeitar em caso de erro (ex.: mutateAsync) para o formulário continuar com as alterações. */
  onSubmit: (data: CreateProductData) => Promise<unknown>;
  loading?: boolean;
}

const categorias = ProductService.getCategories();

const toDefaults = (p?: Product): FormInput => (p ? {
  nome: p.nome, descricao: p.descricao, preco: p.preco, estoque: p.estoque, imagem: p.imagem ?? '', categoria: p.categoria,
  ativo: p.ativo, peso: p.peso ?? '', dimensoes: p.dimensoes ?? '', marca: p.marca ?? '', sku: p.sku ?? '', desconto: p.desconto ?? '',
} : { nome: '', descricao: '', preco: undefined, estoque: '', imagem: '', categoria: '', ativo: true, peso: '', dimensoes: '', marca: '', sku: '', desconto: '' });

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-center gap-1 text-sm text-destructive">
      <AlertCircle className="h-3 w-3" aria-hidden="true" /> {message}
    </p>
  );
}

function LeaveDialog({ open, onStay, onLeave }: { open: boolean; onStay: () => void; onLeave: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onStay()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sair sem salvar?</DialogTitle>
          <DialogDescription>As alterações feitas neste produto serão perdidas.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onStay}>Continuar editando</Button>
          <Button variant="destructive" onClick={onLeave}>Sair sem salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Avisa antes de sair com alterações não salvas: navegação interna (useBlocker) e fechar/recarregar a aba. */
function UnsavedChangesGuard({ shouldBlock }: { shouldBlock: () => boolean }) {
  const blocker = useBlocker(() => shouldBlock());
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlock()) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [shouldBlock]);
  return <LeaveDialog open={blocker.state === 'blocked'} onStay={() => blocker.reset?.()} onLeave={() => blocker.proceed?.()} />;
}

export function ProductForm({ product, onSubmit, loading = false }: ProductFormProps) {
  const navigate = useNavigate();
  const [precoDisplay, setPrecoDisplay] = useState(product ? formatCurrency(product.preco) : '');
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const saving = useRef(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty }, setValue, watch, reset } = useForm<FormInput, unknown, CreateProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: toDefaults(product),
  });

  useEffect(() => {
    if (!product) return;
    reset(toDefaults(product));
    setPrecoDisplay(formatCurrency(product.preco));
  }, [product, reset]);

  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;
  const [shouldBlock] = useState(() => () => dirtyRef.current && !saving.current);

  const imagem = watch('imagem');
  const ativo = watch('ativo');

  const handleImage = (file: File) => {
    setImageError('');
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return setImageError('Formato não suportado. Use JPG, PNG ou WebP.');
    if (file.size > MAX_FILE_SIZE) return setImageError('Imagem muito grande. O máximo é 5 MB.');
    const reader = new FileReader();
    reader.onload = () => setValue('imagem', reader.result as string, { shouldDirty: true });
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handlePreco = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const value = digits ? Number(digits) / 100 : undefined;
    setPrecoDisplay(value === undefined ? '' : formatCurrency(value));
    setValue('preco', value, { shouldDirty: true, shouldValidate: !!errors.preco });
  };

  const submit = async (data: CreateProductData) => {
    saving.current = true;
    try {
      await onSubmit(data);
    } catch {
      // o erro já foi mostrado pelo chamador; mantém as alterações na tela
    } finally {
      saving.current = false;
    }
  };

  const cancel = () => (isDirty ? setLeaveOpen(true) : navigate('/painel/produtos'));

  const err = (name: keyof FormInput) => errors[name]?.message as string | undefined;
  const a11y = (name: keyof FormInput) => ({ 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `${name}-erro` : undefined });

  return (
    <form onSubmit={handleSubmit(submit)} className="mx-auto max-w-4xl space-y-6" noValidate>
      <UnsavedChangesGuard shouldBlock={shouldBlock} />
      <LeaveDialog open={leaveOpen} onStay={() => setLeaveOpen(false)} onLeave={() => { saving.current = true; navigate('/painel/produtos'); }} />

      <Card id="basico">
        <CardHeader><CardTitle className="text-lg">Informações básicas</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nome">Nome do produto *</Label>
            <Input id="nome" {...register('nome')} {...a11y('nome')} placeholder="Ex.: Camiseta básica algodão" />
            <FieldError id="nome-erro" message={err('nome')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={watch('categoria')} onValueChange={(v) => setValue('categoria', v, { shouldDirty: true, shouldValidate: true })}>
              <SelectTrigger id="categoria" {...a11y('categoria')}><SelectValue placeholder="Escolha uma categoria" /></SelectTrigger>
              <SelectContent>
                {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError id="categoria-erro" message={err('categoria')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" {...register('marca')} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea id="descricao" rows={6} {...register('descricao')} {...a11y('descricao')} placeholder="Características, materiais, medidas, cuidados…" />
            <div className="flex justify-between gap-2">
              <FieldError id="descricao-erro" message={err('descricao')} />
              <p className="ml-auto text-xs text-muted-foreground">{(watch('descricao') ?? '').length}/1000</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4 sm:col-span-2">
            <div>
              <Label htmlFor="ativo">Produto ativo</Label>
              <p className="text-sm text-muted-foreground">{ativo ? 'Visível para os clientes na loja.' : 'Escondido da loja.'}</p>
            </div>
            <Switch id="ativo" checked={ativo} onCheckedChange={(c) => setValue('ativo', c, { shouldDirty: true })} />
          </div>
        </CardContent>
      </Card>

      <Card id="preco-estoque">
        <CardHeader><CardTitle className="text-lg">Preço e estoque</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preco">Preço *</Label>
            <Input id="preco" inputMode="numeric" value={precoDisplay} onChange={handlePreco} placeholder="R$ 0,00" {...a11y('preco')} />
            <FieldError id="preco-erro" message={err('preco')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desconto">Desconto (%)</Label>
            <Input id="desconto" type="number" inputMode="decimal" min="0" max="100" step="0.01" {...register('desconto')} {...a11y('desconto')} placeholder="0" />
            <FieldError id="desconto-erro" message={err('desconto')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estoque">Quantidade em estoque *</Label>
            <Input id="estoque" type="number" inputMode="numeric" min="0" step="1" {...register('estoque')} {...a11y('estoque')} placeholder="0" />
            <FieldError id="estoque-erro" message={err('estoque')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU (código interno)</Label>
            <Input id="sku" {...register('sku')} />
          </div>
        </CardContent>
      </Card>

      <Card id="imagem">
        <CardHeader><CardTitle className="text-lg">Imagem</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileInput}
            id="imagem-arquivo"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ''; }}
            aria-describedby="imagem-ajuda"
          />
          {imagem ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <img src={imagem} alt="Pré-visualização do produto" className="h-48 w-48 rounded-lg border object-cover" />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" /> Trocar imagem
                </Button>
                <Button type="button" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setValue('imagem', '', { shouldDirty: true })}>
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Remover imagem
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn('rounded-lg border-2 border-dashed p-8 text-center transition-colors', dragActive ? 'border-primary bg-primary-muted' : 'border-border', imageError && 'border-destructive')}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => { handleDrag(e); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) handleImage(f); }}
            >
              <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Arraste uma imagem para cá ou</p>
              <Button type="button" variant="outline" className="mt-3" onClick={() => fileInput.current?.click()}>
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" /> Escolher arquivo
              </Button>
            </div>
          )}
          {imageError && <p role="alert" className="text-sm text-destructive">{imageError}</p>}
          <p id="imagem-ajuda" className="text-xs text-muted-foreground">JPG, PNG ou WebP, até 5 MB. Imagens quadradas ficam melhores na vitrine.</p>
        </CardContent>
      </Card>

      <Card id="envio">
        <CardHeader><CardTitle className="text-lg">Envio</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="peso">Peso (kg)</Label>
            <Input id="peso" type="number" inputMode="decimal" min="0" step="0.001" {...register('peso')} {...a11y('peso')} placeholder="0,000" />
            <FieldError id="peso-erro" message={err('peso')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dimensoes">Dimensões (C × L × A)</Label>
            <Input id="dimensoes" {...register('dimensoes')} placeholder="Ex.: 30 × 20 × 5 cm" />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-16 z-10 -mx-4 flex gap-3 border-t bg-card/95 p-4 backdrop-blur sm:mx-0 sm:rounded-lg sm:border lg:bottom-0">
        <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={cancel}>Cancelar</Button>
        <Button type="submit" className="flex-1 sm:ml-auto sm:flex-none" disabled={loading}>
          {loading ? 'Salvando…' : product ? 'Salvar alterações' : 'Cadastrar produto'}
        </Button>
      </div>
    </form>
  );
}
