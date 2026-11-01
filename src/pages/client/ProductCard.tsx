import { Link } from 'react-router-dom';
import { Eye, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { CatalogProduct } from '@/services/CatalogService';

interface Props {
  product: CatalogProduct;
  onAdd: (product: CatalogProduct) => void;
  adding?: boolean;
}

export function ProductCard({ product, onAdd, adding }: Props) {
  const hasDiscount = !!product.desconto && product.desconto > 0;
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <Link to={`/produto/${product.id}`} className="relative block">
          {product.imagem ? (
            <img src={product.imagem} alt={product.nome} className="w-full h-48 object-cover rounded-t-lg" />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {hasDiscount && <Badge className="absolute top-2 left-2 bg-red-500">-{product.desconto}%</Badge>}
        </Link>

        <div className="p-4">
          <Link to={`/lojas/${product.lojaId}`}>
            <Badge variant="outline" className="text-xs mb-2">{product.lojaNome}</Badge>
          </Link>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.nome}</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-green-600">{formatCurrency(product.precoFinal)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">{formatCurrency(product.preco)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => onAdd(product)} disabled={adding || product.estoque === 0}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.estoque === 0 ? 'Esgotado' : 'Adicionar'}
            </Button>
            <Link to={`/produto/${product.id}`}>
              <Button variant="outline" size="icon" aria-label="Ver produto">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
