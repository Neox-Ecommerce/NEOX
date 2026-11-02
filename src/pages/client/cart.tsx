import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Info, Package, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { EmptyState, ErrorState, IconButton, PageHeader, PageLoader } from '@/components/PageStates';
import { toast } from '@/hooks/use-toast';
import { loginPath } from '@/lib/navigation';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '@/services/CartService';
import { CheckoutService, type QuoteGroup } from '@/services/CheckoutService';
import { QuantityStepper } from './QuantityStepper';
import { useCart } from './useCart';

function groupByStore(items: CartItem[]) {
  const groups = new Map<string, { storeId: string; storeName: string; items: CartItem[] }>();
  items.forEach((i) => {
    const g = groups.get(i.storeId) ?? { storeId: i.storeId, storeName: i.storeName, items: [] };
    g.items.push(i);
    groups.set(i.storeId, g);
  });
  return [...groups.values()];
}

export function CartPage() {
  const cart = useCart();
  const { items, mode } = cart;
  // Frete e total reais por loja vêm da API (mesma regra do checkout); a chave muda a cada alteração do carrinho.
  const signature = items.map((i) => `${i.productId}:${i.quantity}`).join(',');
  const quote = useQuery({
    queryKey: ['checkout-quote', signature],
    queryFn: () => CheckoutService.quote(),
    enabled: mode === 'client' && items.length > 0,
  });
  const quoteByStore = new Map<string, QuoteGroup>((quote.data?.groups ?? []).map((g) => [g.storeId, g]));

  const remove = async (item: CartItem) => {
    if (!(await cart.remove(item))) return;
    toast({
      title: 'Item removido',
      description: item.name,
      action: (
        <ToastAction altText="Desfazer remoção" onClick={() => cart.restore(item)}>
          Desfazer
        </ToastAction>
      ),
    });
  };

  const header = <PageHeader title="Carrinho" breadcrumbs={[{ label: 'Início', to: '/' }, { label: 'Carrinho' }]} />;
  const wrap = (children: React.ReactNode) => <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{header}{children}</div>;

  if (mode === 'other') {
    return wrap(
      <EmptyState
        icon={Info}
        title="Esta conta não faz compras"
        description="Contas de lojista e de administrador não compram na NEOX. Para comprar, saia e entre com uma conta de cliente."
      />,
    );
  }
  if (cart.isLoading) return wrap(<PageLoader />);
  if (cart.error) return wrap(<ErrorState error={cart.error} onRetry={() => cart.refetch()} />);
  if (items.length === 0) {
    return wrap(
      <EmptyState
        icon={ShoppingCart}
        title="Seu carrinho está vazio"
        description="Explore a vitrine e adicione produtos."
        action={<Button asChild><Link to="/buscar">Explorar produtos</Link></Button>}
      />,
    );
  }

  const groups = groupByStore(items);
  const subtotal = items.reduce((n, i) => n + i.subtotal, 0);
  const total = mode === 'client' && quote.data ? quote.data.total : null;
  const checkoutHref = mode === 'guest' ? loginPath('/checkout') : '/checkout';

  return wrap(
    <div className="grid grid-cols-1 gap-6 pb-32 lg:grid-cols-3 lg:pb-0">
      <div className="space-y-4 lg:col-span-2">
        {groups.length > 1 && (
          <p className="flex gap-2 rounded-lg border border-info/20 bg-info-muted p-3 text-sm text-info">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Seu carrinho tem produtos de {groups.length} lojas. Ao finalizar, serão criados {groups.length} pedidos, um por loja, cada um com seu frete.
          </p>
        )}
        {groups.map((g) => {
          const q = quoteByStore.get(g.storeId);
          return (
            <section key={g.storeId} aria-labelledby={`loja-${g.storeId}`} className="rounded-lg border bg-card">
              <h2 id={`loja-${g.storeId}`} className="border-b px-4 py-3 font-semibold">
                <Link to={`/lojas/${g.storeId}`} className="hover:underline">{g.storeName}</Link>
              </h2>
              <ul className="divide-y">
                {g.items.map((item) => (
                  <li key={item.productId} className="flex gap-3 p-4">
                    <Link to={`/produto/${item.productId}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted" tabIndex={-1} aria-hidden="true">
                      {item.image ? (
                        <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center"><Package className="h-6 w-6 text-muted-foreground" /></span>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/produto/${item.productId}`} className="line-clamp-2 text-sm font-medium hover:underline">{item.name}</Link>
                        <IconButton
                          label={`Remover ${item.name}`}
                          icon={Trash2}
                          className="-mr-2 -mt-2 h-11 w-11 shrink-0 text-destructive hover:text-destructive"
                          disabled={cart.isPending(item.productId)}
                          onClick={() => remove(item)}
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <QuantityStepper
                          value={item.quantity}
                          max={item.stock}
                          name={item.name}
                          disabled={cart.isPending(item.productId)}
                          onChange={(v) => cart.setQuantity(item, v)}
                        />
                        <div className="text-right">
                          <p className="font-semibold text-primary">{formatCurrency(item.subtotal)}</p>
                          {item.quantity > 1 && <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} cada</p>}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="space-y-1 border-t px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Frete</dt>
                  <dd>
                    {mode === 'guest' ? 'calculado no checkout' : q ? (q.shippingCost === 0 ? 'Grátis' : formatCurrency(q.shippingCost)) : quote.isError ? '—' : 'calculando…'}
                  </dd>
                </div>
                {q && (
                  <div className="flex justify-between font-medium">
                    <dt>Total da loja</dt>
                    <dd>{formatCurrency(q.total)}</dd>
                  </div>
                )}
              </dl>
            </section>
          );
        })}
      </div>

      <aside className="lg:col-span-1">
        <div className="space-y-3 rounded-lg border bg-card p-4 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Resumo</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frete</dt>
              <dd>
                {total != null
                  ? formatCurrency(quote.data!.groups.reduce((n, g) => n + g.shippingCost, 0))
                  : 'calculado no checkout'}
              </dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="text-primary">{formatCurrency(total ?? subtotal)}</dd>
            </div>
          </dl>
          {quote.isError && (
            <p role="alert" className="text-sm text-destructive">
              {quote.error instanceof Error ? quote.error.message : 'Não foi possível calcular o frete.'}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Cupom de desconto é aplicado na etapa de revisão.</p>
          <Button asChild className="hidden w-full lg:inline-flex">
            <Link to={checkoutHref}>Continuar para entrega</Link>
          </Button>
          {mode === 'guest' && (
            <p className="text-xs text-muted-foreground">Você vai entrar ou criar sua conta antes da entrega. Seu carrinho será mantido.</p>
          )}
        </div>
      </aside>

      {/* Barra fixa no celular, acima da navegação inferior */}
      <div className="fixed inset-x-0 bottom-14 z-20 border-t bg-card/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{total != null ? 'Total com frete' : 'Subtotal'}</p>
            <p className="font-semibold text-primary">{formatCurrency(total ?? subtotal)}</p>
          </div>
          <Button asChild className="flex-1">
            <Link to={checkoutHref}>Continuar para entrega</Link>
          </Button>
        </div>
      </div>
    </div>,
  );
}
