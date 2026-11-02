import { Link } from 'react-router-dom';
import { Loader2, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { stockLevel } from '@/components/StatusBadge';
import { formatCurrency } from '@/lib/utils';
import type { CatalogProduct } from '@/services/CatalogService';

interface Props {
  product: CatalogProduct;
  onAdd: (product: CatalogProduct) => void;
  adding?: boolean;
}

/**
 * Card de produto. O card inteiro é clicável por um link "esticado" (after:inset-0) no nome,
 * e o botão de adicionar fica acima dele — assim não há botão dentro de link.
 */
export function ProductCard({ product, onAdd, adding }: Props) {
  const hasDiscount = !!product.desconto && product.desconto > 0;
  const out = stockLevel(product.estoque, product.minStock) === 'out';
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md">
      <div className="relative aspect-square bg-muted">
        {product.imagem ? (
          <img src={product.imagem} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
            -{product.desconto}%<span className="sr-only"> de desconto</span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="truncate text-xs text-muted-foreground">{product.lojaNome}</p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-foreground">
          <Link to={`/produto/${product.id}`} className="outline-none after:absolute after:inset-0 after:content-['']">
            {product.nome}
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold text-primary">{formatCurrency(product.precoFinal)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              <span className="sr-only">Preço anterior: </span>
              {formatCurrency(product.preco)}
            </span>
          )}
        </div>
        <Button
          variant={out ? 'outline' : 'default'}
          className="relative z-10 mt-2 w-full"
          onClick={() => onAdd(product)}
          disabled={adding || out}
          aria-label={out ? `${product.nome}: esgotado` : `Adicionar ${product.nome} ao carrinho`}
        >
          {adding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {out ? 'Esgotado' : 'Adicionar'}
        </Button>
      </div>
    </article>
  );
}

/** Grade padrão de produtos (2 colunas no celular). */
export function ProductGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">{children}</div>;
}
