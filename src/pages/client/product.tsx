import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Package, PackageX, ShoppingCart, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, PageLoader } from '@/components/PageStates';
import { StatusBadge, stockLevel } from '@/components/StatusBadge';
import { ApiError } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { AnalyticsService } from '@/services/AnalyticsService';
import { CatalogService } from '@/services/CatalogService';
import { QuantityStepper } from './QuantityStepper';
import { useAddToCart } from './useAddToCart';

export function ProductPage() {
  const { id = '' } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { add, isAdding } = useAddToCart();

  const query = useQuery({ queryKey: ['catalog-product', id], queryFn: () => CatalogService.getProduct(id), enabled: !!id });
  const product = query.data;
  const { data: store } = useQuery({
    queryKey: ['catalog-store', product?.lojaId],
    queryFn: () => CatalogService.getStore(product!.lojaId),
    enabled: !!product,
  });

  useEffect(() => {
    if (product) AnalyticsService.track('product_view', product.lojaId, product.id);
  }, [product]);

  if (query.isLoading) return <PageLoader />;
  if (query.error instanceof ApiError && query.error.status === 404) {
    return (
      <EmptyState
        icon={PackageX}
        title="Produto não encontrado"
        description="Ele pode ter sido removido ou estar indisponível."
        action={<Button asChild><Link to="/buscar">Buscar outros produtos</Link></Button>}
        className="py-24"
      />
    );
  }
  if (query.error || !product) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const hasDiscount = !!product.desconto && product.desconto > 0;
  const level = stockLevel(product.estoque, product.minStock);
  const out = level === 'out';
  const adding = isAdding(product.id);
  const qty = Math.min(quantity, Math.max(product.estoque, 1));

  const cta = (
    <Button
      size="lg"
      className="w-full"
      disabled={out || adding}
      onClick={() => add(product, qty)}
      aria-label={out ? 'Esgotado' : undefined}
    >
      {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />}
      {out ? 'Esgotado' : 'Adicionar ao carrinho'}
    </Button>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:pb-6">
      <nav aria-label="Trilha de navegação" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link to="/" className="hover:text-foreground hover:underline">Início</Link></li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to={`/buscar?categoria=${encodeURIComponent(product.categoria)}`} className="hover:text-foreground hover:underline">
              {product.categoria}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="line-clamp-1 text-foreground">{product.nome}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-muted">
          {product.imagem ? (
            <img src={product.imagem} alt={product.nome} className="h-full w-full object-cover" />
          ) : (
            <Package className="h-24 w-24 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{product.nome}</h1>
            {product.marca && <p className="mt-1 text-sm text-muted-foreground">Marca: {product.marca}</p>}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-semibold text-primary">{formatCurrency(product.precoFinal)}</span>
            {hasDiscount && (
              <>
                <span className="text-muted-foreground line-through">
                  <span className="sr-only">Preço anterior: </span>{formatCurrency(product.preco)}
                </span>
                <span className="rounded-full bg-destructive-muted px-2 py-0.5 text-xs font-semibold text-destructive">
                  -{product.desconto}% de desconto
                </span>
              </>
            )}
          </div>

          <div>
            {level === 'low' ? (
              <span className="inline-flex items-center rounded-full border border-warning/20 bg-warning-muted px-2.5 py-0.5 text-xs font-medium text-warning">
                {product.estoque === 1 ? 'Última unidade' : `Últimas ${product.estoque} unidades`}
              </span>
            ) : (
              <StatusBadge kind="stock" value={level} />
            )}
          </div>

          {!out && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" id="qtd-label">Quantidade</span>
              <QuantityStepper value={qty} max={product.estoque} onChange={setQuantity} name={product.nome} />
            </div>
          )}

          <div className="hidden lg:block">{cta}</div>

          <Link
            to={`/lojas/${product.lojaId}`}
            className="flex min-h-11 items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
              {store?.logo ? (
                <img src={store.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <Store className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">Vendido por</span>
              <span className="block truncate font-medium">{product.lojaNome}</span>
            </span>
            <span className="text-sm font-medium text-primary">Ver loja</span>
          </Link>

          {product.descricao && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">Descrição</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">{product.descricao}</p>
            </section>
          )}

          {(product.peso || product.dimensoes || product.sku) && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">Especificações</h2>
              <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
                {product.peso ? <><dt className="text-muted-foreground">Peso</dt><dd>{product.peso} kg</dd></> : null}
                {product.dimensoes && <><dt className="text-muted-foreground">Dimensões</dt><dd>{product.dimensoes}</dd></>}
                {product.sku && <><dt className="text-muted-foreground">Código (SKU)</dt><dd>{product.sku}</dd></>}
              </dl>
            </section>
          )}
        </div>
      </div>

      {/* CTA fixo no celular, acima da barra de navegação inferior */}
      <div className="fixed inset-x-0 bottom-14 z-20 border-t bg-card/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <span className="font-semibold text-primary">{formatCurrency(product.precoFinal * qty)}</span>
          <div className="flex-1">{cta}</div>
        </div>
      </div>
    </div>
  );
}
