import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, PageHeader, QueryState } from '@/components/PageStates';
import { useDebounce } from '@/hooks/useDebounce';
import { CatalogService } from '@/services/CatalogService';
import { StoreTile } from './StoreTile';

const PAGE = 24;

export function StoresPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const term = useDebounce(q.trim(), 350);

  const query = useInfiniteQuery({
    queryKey: ['catalog-stores', term],
    queryFn: ({ pageParam }) => CatalogService.getStores({ q: term || undefined, skip: pageParam, limit: PAGE }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? loaded : undefined;
    },
  });

  const onChange = (value: string) => {
    setQ(value);
    setParams(value.trim() ? { q: value.trim() } : {}, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader title="Lojas" description="Conheça os lojistas que vendem na NEOX." breadcrumbs={[{ label: 'Início', to: '/' }, { label: 'Lojas' }]} />
      <div className="relative mb-4 w-full sm:max-w-sm">
        <label htmlFor="busca-lojas" className="sr-only">Buscar lojas</label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input id="busca-lojas" type="search" className="pl-9" placeholder="Buscar por nome ou segmento" value={q} onChange={(e) => onChange(e.target.value)} />
      </div>
      <QueryState
        query={{ ...query, data: query.data?.pages }}
        isEmpty={(pages) => pages[0].items.length === 0}
        empty={
          <EmptyState
            icon={Store}
            title={term ? 'Nenhuma loja encontrada' : 'Nenhuma loja aberta ainda'}
            description={term ? 'Tente outro nome ou segmento.' : undefined}
            action={term ? <Button variant="outline" onClick={() => onChange('')}>Limpar busca</Button> : undefined}
          />
        }
      >
        {(pages) => (
          <>
            <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
              {pages[0].total} {pages[0].total === 1 ? 'loja' : 'lojas'}
            </p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pages.flatMap((p) => p.items).map((s) => (
                <li key={s.id}><StoreTile store={s} /></li>
              ))}
            </ul>
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
    </div>
  );
}
