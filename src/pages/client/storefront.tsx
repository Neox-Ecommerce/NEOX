import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, PackageSearch, Search, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, QueryState } from '@/components/PageStates';
import { CatalogService } from '@/services/CatalogService';
import { ProductService } from '@/services/ProductService';
import { ProductCard, ProductGrid } from './ProductCard';
import { StoreTile } from './StoreTile';
import { useAddToCart } from './useAddToCart';

export function StorefrontHomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const { add, isAdding } = useAddToCart();
  const products = useQuery({ queryKey: ['catalog', 'home'], queryFn: () => CatalogService.getProducts({ sort: 'newest', limit: 10 }) });
  const stores = useQuery({ queryKey: ['catalog-stores', 'home'], queryFn: () => CatalogService.getStores({ limit: 8 }) });

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:px-6">
      <section className="rounded-xl border border-primary/20 bg-primary-muted px-4 py-8 sm:px-8 sm:py-12">
        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Compre direto de <span className="dark:text-brand-gradient">lojas independentes</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          Produtos de vários lojistas em um só carrinho. Cada loja envia o seu pedido.
        </p>
        <form
          role="search"
          className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(q.trim() ? `/buscar?q=${encodeURIComponent(q.trim())}` : '/buscar');
          }}
        >
          <label htmlFor="busca-vitrine" className="sr-only">O que você procura?</label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="busca-vitrine"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="O que você procura?"
              autoComplete="off"
              className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" className="rounded-full">Buscar</Button>
        </form>
      </section>

      <section aria-labelledby="categorias">
        <h2 id="categorias" className="mb-3 text-lg font-semibold">Categorias</h2>
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {ProductService.getCategories().map((c) => (
            <li key={c} className="shrink-0">
              <Link
                to={`/buscar?categoria=${encodeURIComponent(c)}`}
                className="flex min-h-11 items-center rounded-full border bg-card px-4 text-sm font-medium hover:bg-accent sm:min-h-10"
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="novidades">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="novidades" className="text-lg font-semibold">Novidades</h2>
          <Link to="/buscar?ordem=newest" className="flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline">
            Ver tudo <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <QueryState
          query={products}
          isEmpty={(d) => d.items.length === 0}
          empty={
            <EmptyState
              icon={PackageSearch}
              title="Ainda não há produtos à venda"
              description="As lojas estão montando suas vitrines. Volte em breve ou conheça as lojas."
              action={<Button asChild variant="outline"><Link to="/lojas">Ver lojas</Link></Button>}
            />
          }
        >
          {(d) => (
            <ProductGrid>
              {d.items.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={(prod) => add(prod)} adding={isAdding(p.id)} />
              ))}
            </ProductGrid>
          )}
        </QueryState>
      </section>

      <section aria-labelledby="lojas">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="lojas" className="text-lg font-semibold">Lojas</h2>
          <Link to="/lojas" className="flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline">
            Ver todas <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <QueryState
          query={stores}
          isEmpty={(d) => d.items.length === 0}
          empty={<EmptyState icon={Store} title="Nenhuma loja aberta ainda" />}
        >
          {(d) => (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {d.items.map((s) => (
                <li key={s.id}><StoreTile store={s} /></li>
              ))}
            </ul>
          )}
        </QueryState>
      </section>

      <section className="flex flex-col items-start gap-3 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tem uma loja?</h2>
          <p className="text-sm text-muted-foreground">Venda na NEOX e receba pedidos de novos clientes.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/vender">Venda na NEOX</Link>
        </Button>
      </section>
    </div>
  );
}
