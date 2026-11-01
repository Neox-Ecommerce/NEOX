import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { CatalogService } from '@/services/CatalogService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { useAddToCart } from './useAddToCart';

export function ProductPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { add, isPending } = useAddToCart();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['catalog-product', id],
    queryFn: () => CatalogService.getProduct(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (product) AnalyticsService.track('product_view', product.lojaId, product.id);
  }, [product]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Package className="h-12 w-12 text-gray-400" />
        <p className="text-gray-600">Produto não encontrado ou indisponível.</p>
        <Link to="/"><Button>Voltar para a loja</Button></Link>
      </div>
    );
  }

  const hasDiscount = !!product.desconto && product.desconto > 0;
  const inStock = product.estoque > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-white rounded-xl border flex items-center justify-center overflow-hidden">
            {product.imagem ? (
              <img src={product.imagem} alt={product.nome} className="w-full h-full object-cover" />
            ) : (
              <Package className="h-24 w-24 text-gray-400" />
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.categoria}</Badge>
                {inStock ? (
                  <Badge variant="success">Em estoque ({product.estoque})</Badge>
                ) : (
                  <Badge variant="destructive">Esgotado</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nome}</h1>
              {product.marca && <p className="text-sm text-gray-500">Marca: {product.marca}</p>}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">{formatCurrency(product.precoFinal)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-500 line-through">{formatCurrency(product.preco)}</span>
                  <Badge variant="destructive">-{product.desconto}%</Badge>
                </>
              )}
            </div>

            {product.descricao && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-600 whitespace-pre-line">{product.descricao}</p>
              </div>
            )}

            {(product.peso || product.dimensoes || product.sku) && (
              <div className="text-sm text-gray-600 space-y-1">
                {product.peso ? <p>Peso: {product.peso} kg</p> : null}
                {product.dimensoes && <p>Dimensões: {product.dimensoes}</p>}
                {product.sku && <p>SKU: {product.sku}</p>}
              </div>
            )}

            {inStock && (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.min(product.estoque, q + 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button className="w-full" size="lg" disabled={!inStock || isPending} onClick={() => add(product, quantity)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar ao Carrinho
            </Button>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="flex-1 font-medium text-sm">{product.lojaNome}</p>
                  <Link to={`/lojas/${product.lojaId}`}>
                    <Button variant="outline" size="sm">Ver Loja</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
