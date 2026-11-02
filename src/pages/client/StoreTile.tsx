import { Link } from 'react-router-dom';
import { BadgeCheck, Store } from 'lucide-react';
import type { StoreCard } from '@/services/CatalogService';

/** Card de loja (o card inteiro é o link). */
export function StoreTile({ store }: { store: StoreCard }) {
  return (
    <Link
      to={`/lojas/${store.id}`}
      className="flex h-full min-h-11 items-center gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-md"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {store.logo ? (
          <img src={store.logo} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Store className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 font-medium text-foreground">
          <span className="truncate">{store.nomeFantasia}</span>
          {store.cnpjVerificado && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Loja verificada" />
          )}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {store.segmento} · {store.productCount} {store.productCount === 1 ? 'produto' : 'produtos'}
        </span>
      </span>
    </Link>
  );
}
