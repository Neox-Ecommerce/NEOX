import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-square bg-gray-100 relative">
        {product.imagem ? (
          <img 
            src={product.imagem} 
            alt={product.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {!product.ativo && (
          <div className="absolute top-2 right-2">
            <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
              Inativo
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.nome}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.categoria}</p>
        <p className="text-lg font-bold text-gray-900 mb-2">
          {formatCurrency(product.preco)}
        </p>
        <p className="text-sm text-gray-500">
          {product.estoque} em estoque
        </p>
      </CardContent>
    </Card>
  );
}

