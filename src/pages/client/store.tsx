import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, Clock, Globe, Instagram, MapPin, PackageSearch, Phone, Search, Store, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorState, PageLoader, QueryState } from '@/components/PageStates';
import { ApiError } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { AnalyticsService } from '@/services/AnalyticsService';
import { CatalogService, type PublicStore } from '@/services/CatalogService';
import { StoreService } from '@/services/StoreService';
import { ProductCard, ProductGrid } from './ProductCard';
import { useAddToCart } from './useAddToCart';

const httpsUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);
const instagramUrl = (handle: string) =>
  /^https?:\/\//i.test(handle) ? handle : `https://instagram.com/${handle.replace(/^@/, '')}`;

function deliveryText(store: PublicStore): string | null {
  const parts: string[] = [];
  if (store.defaultShippingCost != null) {
    parts.push(store.defaultShippingCost > 0 ? `Frete ${formatCurrency(store.defaultShippingCost)}` : 'Frete grátis');
  }
  if (store.freeShippingThreshold) parts.push(`grátis acima de ${formatCurrency(store.freeShippingThreshold)}`);
  return parts.length ? parts.join(', ') : null;
}

export function StorePage() {
  const { id = '' } = useParams();
  const [search, setSearch] = useState('');
  const term = useDebounce(search.trim(), 350);
  const { add, isAdding } = useAddToCart();

  const storeQuery = useQuery({ queryKey: ['catalog-store', id], queryFn: () => CatalogService.getStore(id), enabled: !!id });
  const store = storeQuery.data;
  const products = useQuery({
    queryKey: ['catalog-store-products', id, term],
    queryFn: () => CatalogService.getStoreProducts(id, { q: term || undefined }),
    enabled: !!store,
  });

  useEffect(() => {
    if (store) AnalyticsService.track('store_view', store.id);
  }, [store]);

  if (storeQuery.isLoading) return <PageLoader />;
  if (storeQuery.error instanceof ApiError && storeQuery.error.status === 404) {
    return (
      <EmptyState
        icon={Store}
        title="Loja não encontrada"
        description="Ela pode estar fora do ar no momento."
        action={<Button asChild><Link to="/lojas">Ver todas as lojas</Link></Button>}
        className="py-24"
      />
    );
  }
  if (storeQuery.error || !store) return <ErrorState error={storeQuery.error} onRetry={() => storeQuery.refetch()} />;

  const hours = StoreService.getDiasSemana().filter((d) => store.horarioFuncionamento?.[d.key]?.ativo);
  const social = store.redesSociais ?? {};
  const delivery = deliveryText(store);
  const link = 'inline-flex min-h-11 items-center gap-3 text-primary hover:underline sm:min-h-0';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link to="/lojas" className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Todas as lojas
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
          {store.logo ? (
            <img src={store.logo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Store className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{store.nomeFantasia}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{store.segmento}</span>
            {store.cnpjVerificado && (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success-muted px-2 py-0.5 text-xs font-medium text-success">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Loja verificada
              </span>
            )}
          </p>
          {store.descricaoLoja && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{store.descricaoLoja}</p>}
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="rounded-lg border bg-card p-4 text-sm lg:col-span-1 lg:self-start">
          <h2 className="mb-3 font-semibold">Informações</h2>
          <ul className="space-y-2">
            {delivery && (
              <li className="flex gap-3"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />{delivery}</li>
            )}
            {store.tiposEntrega?.length > 0 && (
              <li className="flex gap-3"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />{store.tiposEntrega.join(', ')}</li>
            )}
            {store.endereco && (
              <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />{store.endereco}</li>
            )}
            {store.telefone && (
              <li>
                <a href={`tel:${store.telefone.replace(/[^\d+]/g, '')}`} className={link}>
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />{store.telefone}
                </a>
              </li>
            )}
            {social.website && (
              <li>
                <a href={httpsUrl(social.website)} target="_blank" rel="noopener noreferrer" className={`${link} break-all`}>
                  <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />{social.website}
                </a>
              </li>
            )}
            {social.instagram && (
              <li>
                <a href={instagramUrl(social.instagram)} target="_blank" rel="noopener noreferrer" className={link}>
                  <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />@{social.instagram.replace(/^@/, '')}
                </a>
              </li>
            )}
            {hours.length > 0 && (
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="space-y-0.5">
                  {hours.map((d) => (
                    <span key={d.key} className="block">
                      {d.label}: {store.horarioFuncionamento[d.key].abertura}–{store.horarioFuncionamento[d.key].fechamento}
                    </span>
                  ))}
                </span>
              </li>
            )}
          </ul>
        </aside>

        <section className="lg:col-span-3" aria-labelledby="produtos-loja">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="produtos-loja" className="text-lg font-semibold">
              Produtos{products.data ? ` (${products.data.length})` : ''}
            </h2>
            <div className="relative w-full sm:w-64">
              <label htmlFor="busca-loja" className="sr-only">Buscar nesta loja</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="busca-loja" type="search" className="pl-9" placeholder="Buscar nesta loja" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <QueryState
            query={products}
            isEmpty={(d) => d.length === 0}
            empty={
              <EmptyState
                icon={PackageSearch}
                title={term ? 'Nenhum produto encontrado' : 'Esta loja ainda não tem produtos'}
                action={
                  term ? (
                    <Button variant="outline" onClick={() => setSearch('')}>Limpar busca</Button>
                  ) : (
                    <Button asChild variant="outline"><Link to="/lojas">Ver outras lojas</Link></Button>
                  )
                }
              />
            }
          >
            {(items) => (
              <ProductGrid>
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={(prod) => add(prod)} adding={isAdding(p.id)} />
                ))}
              </ProductGrid>
            )}
          </QueryState>
        </section>
      </div>
    </div>
  );
}
