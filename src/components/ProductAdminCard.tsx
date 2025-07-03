import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Package, Eye, EyeOff, Star } from 'lucide-react';
import { Product } from '@/services/ProductService';
import { formatCurrency } from '@/lib/utils';

interface ProductAdminCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export function ProductAdminCard({ product, onEdit, onDelete, onToggleStatus }: ProductAdminCardProps) {
  const precoComDesconto = product.desconto 
    ? product.preco * (1 - product.desconto / 100)
    : product.preco;

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${!product.ativo ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col h-full">
          <div className="flex items-start space-x-4">
            <div className="relative h-24 w-24 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {product.imagem ? (
                <img 
                  src={product.imagem} 
                  alt={product.nome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-gray-400" />
              )}
              {product.desconto && product.desconto > 0 && (
                <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-br font-medium">
                  -{product.desconto}%
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">
                    {product.nome}
                  </h3>
                  <div className="flex flex-wrap gap-1 ml-auto">
                    {!product.ativo && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        Inativo
                      </span>
                    )}
                    {product.estoque <= 5 && product.estoque > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        Estoque Baixo
                      </span>
                    )}
                    {product.estoque === 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        Esgotado
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {product.descricao}
                </p>
                
                <div className="flex items-center gap-4 text-sm mt-auto">
                  <div className="flex items-center gap-1">
                    {product.desconto && product.desconto > 0 ? (
                      <>
                        <span className="font-bold text-primary">
                          {formatCurrency(precoComDesconto)}
                        </span>
                        <span className="text-gray-500 line-through text-xs">
                          {formatCurrency(product.preco)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-primary">
                        {formatCurrency(product.preco)}
                      </span>
                    )}
                  </div>
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.estoque > 10 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : product.estoque > 0
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {product.estoque} un.
                  </span>
                </div>

                {(product.marca || product.categoria) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    {product.marca && (
                      <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {product.marca}
                      </span>
                    )}
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {product.categoria}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 pt-3 border-t">
            {onToggleStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStatus(product.id)}
                aria-label={product.ativo ? "Desativar produto" : "Ativar produto"}
                className="mr-1"
              >
                {product.ativo ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product.id)}
              aria-label="Editar produto"
              className="mr-1"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product.id)}
              aria-label="Excluir produto"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}