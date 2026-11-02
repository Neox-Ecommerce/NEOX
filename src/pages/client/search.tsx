import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { PackageSearch, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, QueryState } from '@/components/PageStates';
import { MobileDrawer } from '@/components/layouts/shared';
import { useDebounce } from '@/hooks/useDebounce';
import { CatalogService, type CatalogSort } from '@/services/CatalogService';
import { ProductService } from '@/services/ProductService';
import { ProductCard, ProductGrid } from './ProductCard';
import { useAddToCart } from './useAddToCart';

const PAGE = 20;
const ALL = 'todas';
const SORTS: { value: CatalogSort; label: string }[] = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
];

const toNumber = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);

/** Filtros (categoria, loja, preço, ordem). Ficam na URL: ?q=&categoria=&loja=&min=&max=&ordem= */
function Filters({ params, set }: { params: URLSearchParams; set: (key: string, value: string | null) => void }) {
  const stores = useQuery({ queryKey: ['catalog-stores', 'filter'], queryFn: () => CatalogService.getStores({ limit: 200 }) });
  const [min, setMin] = useState(params.get('min') ?? '');
  const [max, setMax] = useState(params.get('max') ?? '');
  const applyPrice = () => {
    set('min', min.trim() || null);
    set('max', max.trim() || null);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="filtro-ordem">Ordenar por</Label>
        <Select value={params.get('ordem') ?? 'relevance'} onValueChange={(v) => set('ordem', v === 'relevance' ? null : v)}>
          <SelectTrigger id="filtro-ordem"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="filtro-categoria">Categoria</Label>
        <Select value={params.get('categoria') ?? ALL} onValueChange={(v) => set('categoria', v === ALL ? null : v)}>
          <SelectTrigger id="filtro-categoria"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as categorias</SelectItem>
            {ProductService.getCategories().map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="filtro-loja">Loja</Label>
        <Select value={params.get('loja') ?? ALL} onValueChange={(v) => set('loja', v === ALL ? null : v)} disabled={!stores.data}>
          <SelectTrigger id="filtro-loja"><SelectValue placeholder={stores.isError ? 'Lojas indisponíveis' : 'Carregando…'} /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as lojas</SelectItem>
            {stores.data?.items.map((s) => <SelectItem key={s.id} value={s.id}>{s.nomeFantasia}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <form
        className="space-y-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          applyPrice();
        }}
      >
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Preço (R$)</legend>
          <div className="flex items-center gap-2">
            <Label htmlFor="filtro-min" className="sr-only">Preço mínimo</Label>
            <Input id="filtro-min" inputMode="decimal" type="number" min={0} placeholder="Mín." value={min} onChange={(e) => setMin(e.target.value)} onBlur={applyPrice} />
            <span aria-hidden="true">–</span>
            <Label htmlFor="filtro-max" className="sr-only">Preço máximo</Label>
            <Input id="filtro-max" inputMode="decimal" type="number" min={0} placeholder="Máx." value={max} onChange={(e) => setMax(e.target.value)} onBlur={applyPrice} />
          </div>
        </fieldset>
        <Button type="submit" variant="outline" className="w-full">Aplicar preço</Button>
      </form>
    </div>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState(params.get('q') ?? '');
  const [drawer, setDrawer] = useState(false);
  const debounced = useDebounce(text.trim(), 400);
  const { add, isAdding } = useAddToCart();

  const set = (key: string, value: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  // texto digitado → URL (com atraso); URL externa (busca do cabeçalho) → campo
  useEffect(() => {
    if ((params.get('q') ?? '') !== debounced) set('q', debounced || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  const urlQ = params.get('q') ?? '';
  useEffect(() => {
    setText((t) => (t.trim() === urlQ ? t : urlQ));
  }, [urlQ]);

  const filters = {
    q: urlQ || undefined,
    category: params.get('categoria') || undefined,
    storeId: params.get('loja') || undefined,
    minPrice: toNumber(params.get('min')),
    maxPrice: toNumber(params.get('max')),
    sort: (params.get('ordem') as CatalogSort) || 'relevance',
  };
  const query = useInfiniteQuery({
    queryKey: ['catalog-search', filters],
    queryFn: ({ pageParam }) => CatalogService.getProducts({ ...filters, skip: pageParam, limit: PAGE }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? loaded : undefined;
    },
  });
  const active = ['categoria', 'loja', 'min', 'max'].filter((k) => params.get(k)).length;
  const title = filters.q ? `Resultados para “${filters.q}”` : filters.category ?? 'Todos os produtos';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="busca-pagina" className="sr-only">Buscar produtos</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="busca-pagina" type="search" className="pl-9" placeholder="Buscar produtos e lojas" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <Button variant="outline" className="lg:hidden" onClick={() => setDrawer(true)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
          Filtros{active ? ` (${active})` : ''}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem,1fr]">
        <aside aria-label="Filtros" className="hidden lg:block">
          <Filters params={params} set={set} />
        </aside>
        <MobileDrawer open={drawer} onOpenChange={setDrawer} title="Filtros">
          <div className="space-y-4 p-4">
            <Filters params={params} set={set} />
            <Button className="w-full" onClick={() => setDrawer(false)}>Ver resultados</Button>
          </div>
        </MobileDrawer>

        <section aria-label="Resultados" className="min-w-0">
          <QueryState
            query={{ ...query, data: query.data?.pages }}
            isEmpty={(pages) => pages[0].items.length === 0}
            empty={
              <EmptyState
                icon={PackageSearch}
                title="Nenhum produto encontrado"
                description="Tente outras palavras ou remova alguns filtros."
                action={<Button variant="outline" onClick={() => { setText(''); setParams({}, { replace: true }); }}>Limpar busca e filtros</Button>}
              />
            }
          >
            {(pages) => (
              <>
                <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
                  {pages[0].total} {pages[0].total === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </p>
                <ProductGrid>
                  {pages.flatMap((p) => p.items).map((p) => (
                    <ProductCard key={p.id} product={p} onAdd={(prod) => add(prod)} adding={isAdding(p.id)} />
                  ))}
                </ProductGrid>
                {query.hasNextPage && (
                  <div className="mt-6 flex justify-center">
                    <Button variant="outline" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
                      {query.isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </QueryState>
        </section>
      </div>
    </div>
  );
}
