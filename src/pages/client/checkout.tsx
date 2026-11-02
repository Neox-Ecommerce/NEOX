import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MapPin, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState, ErrorState, PageHeader, PageLoader } from '@/components/PageStates';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatCurrency } from '@/lib/utils';
import { AddressService, type Address } from '@/services/AddressService';
import { CheckoutService, type Quote } from '@/services/CheckoutService';
import { FeedbackService } from '@/services/FeedbackService';
import type { ShippingAddress } from '@/services/OrdersService';
import { AddressFields, Field } from './AddressFields';
import { digits, EMPTY_ADDRESS, maskCpf, maskPhone, validateAddress, validCpf, type AddressValue, type FieldErrors } from './br';

const NEW = 'novo';

const toShipping = (a: AddressValue | Address): ShippingAddress => ({
  street: a.street.trim(),
  number: a.number.trim(),
  complement: a.complement?.trim() || undefined,
  neighborhood: a.neighborhood.trim(),
  city: a.city.trim(),
  state: a.state,
  zipCode: a.zipCode,
  country: 'Brasil',
});

function formatAddress(a: ShippingAddress | Address) {
  return `${a.street}, ${a.number}${a.complement ? ` – ${a.complement}` : ''} · ${a.neighborhood}, ${a.city}/${a.state} · CEP ${a.zipCode}`;
}

/** Checkout em 2 etapas (?etapa=revisao): 1. Entrega · 2. Revisão e pagamento. */
export function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();

  const addresses = useQuery({ queryKey: ['my-addresses'], queryFn: AddressService.list });
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<AddressValue>(EMPTY_ADDRESS);
  const [save, setSave] = useState(true);
  const [phone, setPhone] = useState(maskPhone(user?.phone ?? ''));
  const [cpf, setCpf] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [delivery, setDelivery] = useState<{ address: ShippingAddress; phone: string; document: string } | null>(null);

  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<string | undefined>();
  const [couponError, setCouponError] = useState<string | null>(null);

  // endereço padrão pré-selecionado; sem endereços salvos, abre o formulário
  useEffect(() => {
    if (selected === null && addresses.data) setSelected(addresses.data.find((a) => a.isDefault)?.id ?? addresses.data[0]?.id ?? NEW);
  }, [addresses.data, selected]);

  const step = params.get('etapa') === 'revisao' && delivery ? 'revisao' : 'entrega';
  const quote = useQuery({ queryKey: ['checkout-quote', 'checkout', coupon ?? ''], queryFn: () => CheckoutService.quote(coupon) });

  const applyCoupon = useMutation({
    mutationFn: (code: string) => CheckoutService.quote(code),
    onSuccess: (data: Quote, code) => {
      queryClient.setQueryData(['checkout-quote', 'checkout', code], data);
      setCoupon(code);
      setCouponError(null);
    },
    onError: (e: Error) => setCouponError(e.message),
  });

  const pay = useMutation({
    mutationFn: CheckoutService.checkout,
    onSuccess: (result) => {
      queryClient.setQueryData(['cart'], []);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      navigate(`/checkout/retorno?external_reference=${encodeURIComponent(result.checkoutId)}&origem=pedido`, { replace: true });
    },
    onError: (e: Error) => FeedbackService.error('Não foi possível finalizar', e.message),
  });

  const submitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: FieldErrors = selected === NEW ? validateAddress(form) : {};
    if (digits(phone).length < 10) errs.phone = 'Informe o telefone com DDD';
    if (!validCpf(cpf)) errs.cpf = 'CPF inválido. Confira os números';
    if (!selected) errs.selected = 'Escolha um endereço';
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    let address: ShippingAddress;
    if (selected === NEW) {
      address = toShipping(form);
      if (save) {
        try {
          await AddressService.create({ ...form, label: 'Casa', complement: form.complement || null, isDefault: !addresses.data?.length });
          queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
        } catch {
          FeedbackService.info('Não salvamos o endereço', 'Ele será usado neste pedido normalmente.');
        }
      }
    } else {
      address = toShipping(addresses.data!.find((a) => a.id === selected)!);
    }
    setDelivery({ address, phone: digits(phone), document: digits(cpf) });
    setParams({ etapa: 'revisao' });
    window.scrollTo(0, 0);
  };

  const steps = (
    <ol className="mb-6 flex gap-2 text-sm" aria-label="Etapas">
      {['Entrega', 'Revisão e pagamento'].map((label, i) => {
        const current = (i === 0 && step === 'entrega') || (i === 1 && step === 'revisao');
        return (
          <li key={label} aria-current={current ? 'step' : undefined} className={cn('flex items-center gap-2', current ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
            <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs', current ? 'bg-primary text-primary-foreground' : 'bg-muted')}>{i + 1}</span>
            {label}
            {i === 0 && <span aria-hidden="true" className="mx-1 text-muted-foreground">›</span>}
          </li>
        );
      })}
    </ol>
  );

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-32 sm:px-6 lg:pb-6">
      <PageHeader title="Finalizar compra" breadcrumbs={[{ label: 'Carrinho', to: '/carrinho' }, { label: 'Finalizar compra' }]} />
      {children}
    </div>
  );

  if (quote.isLoading && !quote.data) return shell(<PageLoader />);
  if (quote.error && !quote.data && !coupon) {
    const empty = quote.error instanceof Error && quote.error.message === 'Carrinho vazio';
    return shell(
      empty ? (
        <EmptyState icon={ShoppingCart} title="Seu carrinho está vazio" action={<Button asChild><Link to="/buscar">Explorar produtos</Link></Button>} />
      ) : (
        <ErrorState error={quote.error} onRetry={() => quote.refetch()} />
      ),
    );
  }
  const q = quote.data;

  const stickyBar = (cta: React.ReactNode) => (
    <div className="fixed inset-x-0 bottom-14 z-20 border-t bg-card/95 p-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-semibold text-primary">{q ? formatCurrency(q.total) : '—'}</p>
        </div>
        <div className="flex-1">{cta}</div>
      </div>
    </div>
  );

  if (step === 'entrega') {
    return shell(
      <>
        {steps}
        <form id="form-entrega" onSubmit={submitDelivery} noValidate className="space-y-6">
          <section className="space-y-3 rounded-lg border bg-card p-4" aria-labelledby="titulo-endereco">
            <h2 id="titulo-endereco" className="text-lg font-semibold">Endereço de entrega</h2>
            {addresses.isLoading ? (
              <PageLoader label="Carregando endereços…" />
            ) : (
              <fieldset>
                <legend className="sr-only">Escolha o endereço</legend>
                <div className="space-y-2">
                  {(addresses.data ?? []).map((a) => (
                    <label key={a.id} className={cn('flex min-h-11 cursor-pointer gap-3 rounded-lg border p-3', selected === a.id && 'border-primary bg-primary-muted')}>
                      <input type="radio" name="endereco" className="mt-1 h-4 w-4 accent-primary" checked={selected === a.id} onChange={() => setSelected(a.id)} />
                      <span className="text-sm">
                        <span className="font-medium">{a.label}{a.isDefault && <span className="ml-2 text-xs text-muted-foreground">(padrão)</span>}</span>
                        <span className="block text-muted-foreground">{formatAddress(a)}</span>
                      </span>
                    </label>
                  ))}
                  {!!addresses.data?.length && (
                    <label className={cn('flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border p-3', selected === NEW && 'border-primary bg-primary-muted')}>
                      <input type="radio" name="endereco" className="h-4 w-4 accent-primary" checked={selected === NEW} onChange={() => setSelected(NEW)} />
                      <span className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4" aria-hidden="true" /> Usar outro endereço</span>
                    </label>
                  )}
                </div>
              </fieldset>
            )}
            {addresses.isError && <p className="text-sm text-muted-foreground">Não foi possível carregar seus endereços salvos. Informe o endereço abaixo.</p>}
            {selected === NEW && (
              <div className="space-y-4 pt-2">
                <AddressFields value={form} onChange={setForm} errors={errors} />
                <div className="flex items-center gap-2">
                  <Checkbox id="salvar-endereco" checked={save} onCheckedChange={(v) => setSave(v === true)} />
                  <Label htmlFor="salvar-endereco" className="font-normal">Salvar este endereço na minha conta</Label>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-lg border bg-card p-4" aria-labelledby="titulo-dados">
            <h2 id="titulo-dados" className="text-lg font-semibold">Seus dados</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="telefone" label="Telefone (WhatsApp)" error={errors.phone}>
                {(p) => <Input {...p} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} />}
              </Field>
              <Field id="cpf" label="CPF" error={errors.cpf} hint="Exigido para emissão da nota e do pagamento.">
                {(p) => <Input {...p} inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} />}
              </Field>
            </div>
          </section>

          <div className="hidden justify-end gap-2 lg:flex">
            <Button asChild variant="outline"><Link to="/carrinho">Voltar ao carrinho</Link></Button>
            <Button type="submit">Continuar para revisão</Button>
          </div>
        </form>
        {stickyBar(<Button type="submit" form="form-entrega" className="w-full">Continuar</Button>)}
      </>,
    );
  }

  // Etapa 2: revisão
  const busy = pay.isPending;
  const payLabel = q?.onlinePayment ? 'Pagar com Mercado Pago' : 'Finalizar pedido';
  const finish = () =>
    delivery &&
    pay.mutate({ shippingAddress: delivery.address, customer: { phone: delivery.phone, document: delivery.document }, couponCode: coupon });

  return shell(
    <>
      {steps}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">Entrega</h2>
              <Button variant="link" className="h-auto p-0" onClick={() => setParams({})}>Alterar</Button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{delivery && formatAddress(delivery.address)}</p>
          </section>

          {q && q.groups.length > 1 && (
            <p className="rounded-lg border border-info/20 bg-info-muted p-3 text-sm text-info">
              Serão criados {q.groups.length} pedidos, um por loja. Cada loja envia e cobra o seu frete.
            </p>
          )}
          {q?.groups.map((g) => (
            <section key={g.storeId} className="rounded-lg border bg-card" aria-labelledby={`rev-${g.storeId}`}>
              <h2 id={`rev-${g.storeId}`} className="border-b px-4 py-3 font-semibold">{g.storeName}</h2>
              <ul className="divide-y text-sm">
                {g.items.map((i) => (
                  <li key={i.productId} className="flex justify-between gap-3 px-4 py-2">
                    <span className="min-w-0">{i.quantity}× {i.name}</span>
                    <span className="shrink-0">{formatCurrency(i.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <dl className="space-y-1 border-t px-4 py-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Frete</dt><dd>{g.shippingCost === 0 ? 'Grátis' : formatCurrency(g.shippingCost)}</dd></div>
                {g.discount > 0 && (
                  <div className="flex justify-between text-success"><dt>Cupom {g.couponApplied}</dt><dd>−{formatCurrency(g.discount)}</dd></div>
                )}
                <div className="flex justify-between font-medium"><dt>Total da loja</dt><dd>{formatCurrency(g.total)}</dd></div>
              </dl>
            </section>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <form
            className="space-y-2 rounded-lg border bg-card p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const code = couponInput.trim().toUpperCase();
              if (code) applyCoupon.mutate(code);
            }}
          >
            <Label htmlFor="cupom">Cupom de desconto</Label>
            <div className="flex gap-2">
              <Input
                id="cupom"
                value={couponInput}
                autoComplete="off"
                aria-invalid={!!couponError}
                aria-describedby="cupom-resultado"
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              />
              <Button type="submit" variant="outline" disabled={applyCoupon.isPending || !couponInput.trim()}>
                {applyCoupon.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Aplicando" /> : 'Aplicar'}
              </Button>
            </div>
            <p id="cupom-resultado" aria-live="polite" className={cn('text-sm', couponError ? 'text-destructive' : 'text-success')}>
              {couponError ?? (coupon ? `Cupom ${coupon} aplicado.` : '')}
            </p>
            {coupon && (
              <Button type="button" variant="link" className="h-auto p-0" onClick={() => { setCoupon(undefined); setCouponInput(''); }}>
                Remover cupom
              </Button>
            )}
          </form>

          <div className="space-y-3 rounded-lg border bg-card p-4">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Produtos</dt><dd>{q && formatCurrency(q.groups.reduce((n, g) => n + g.subtotal, 0))}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Frete</dt><dd>{q && formatCurrency(q.groups.reduce((n, g) => n + g.shippingCost, 0))}</dd></div>
              {q && q.groups.some((g) => g.discount > 0) && (
                <div className="flex justify-between text-success"><dt>Descontos</dt><dd>−{formatCurrency(q.groups.reduce((n, g) => n + g.discount, 0))}</dd></div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-semibold"><dt>Total</dt><dd className="text-primary">{q && formatCurrency(q.total)}</dd></div>
            </dl>
            <Button className="hidden w-full lg:inline-flex" onClick={finish} disabled={busy || !q}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {payLabel}
            </Button>
            <p className="text-xs text-muted-foreground">
              {q?.onlinePayment
                ? 'Você será levado ao Mercado Pago para pagar com segurança (Pix, cartão ou boleto).'
                : 'O pagamento online não está ativo: cada loja combina o pagamento com você depois do pedido.'}
            </p>
          </div>
        </aside>
      </div>
      {stickyBar(
        <Button className="w-full" onClick={finish} disabled={busy || !q}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {payLabel}
        </Button>,
      )}
    </>,
  );
}
