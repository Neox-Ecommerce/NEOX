import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Package, Star, Heart, Share2, ShoppingCart, Truck, Shield, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProductService } from '@/services/ProductService';
import { CartService } from '@/services/CartService';
import { formatCurrency } from '@/lib/utils';

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  // Buscar produto
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? ProductService.getById(id) : Promise.resolve(null),
    enabled: !!id,
  });

  // Mutation para adicionar ao carrinho
  const addToCartMutation = useMutation({
    mutationFn: () => CartService.addItem(id!, quantity, user?.id),
    onSuccess: () => {
      toast({
        title: 'Produto adicionado!',
        description: 'O produto foi adicionado ao seu carrinho.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar',
        description: error.message || 'Não foi possível adicionar o produto ao carrinho.',
        variant: 'destructive',
      });
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    if (product.estoque < quantity) {
      toast({
        title: 'Estoque insuficiente',
        description: `Disponível apenas ${product.estoque} unidade(s)`,
        variant: 'destructive',
      });
      return;
    }
    addToCartMutation.mutate();
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (product.estoque < quantity) {
      toast({
        title: 'Estoque insuficiente',
        description: `Disponível apenas ${product.estoque} unidade(s)`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await CartService.addItem(id!, quantity, user?.id);
      navigate('/carrinho');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível processar sua solicitação.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Produto não encontrado</h3>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const discountPercent = product.precoDesconto
    ? Math.round(((product.preco - product.precoDesconto) / product.preco) * 100)
    : 0;

  const finalPrice = product.precoDesconto || product.preco;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl border flex items-center justify-center overflow-hidden">
              {product.imagem ? (
                <img
                  src={product.imagem}
                  alt={product.nome}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="h-24 w-24 text-gray-400" />
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.categoria && (
                  <Badge variant="outline">{product.categoria}</Badge>
                )}
                {product.estoque > 0 ? (
                  <Badge variant="default">Em estoque</Badge>
                ) : (
                  <Badge variant="destructive">Esgotado</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.nome}
              </h1>
              {product.marca && (
                <p className="text-gray-600">Marca: {product.marca}</p>
              )}
              <div className="flex items-center gap-2 mb-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
                <span className="text-sm text-gray-500">(24 avaliações)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(finalPrice)}
                </span>
                {product.precoDesconto && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrency(product.preco)}
                    </span>
                    <Badge variant="destructive">-{discountPercent}%</Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">
                ou 12x de {formatCurrency(finalPrice / 12)} sem juros
              </p>
            </div>

            {/* Quantity Selector */}
            {product.estoque > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Quantidade</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(product.estoque, val)));
                    }}
                    className="w-20 text-center"
                    min="1"
                    max={product.estoque}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.estoque, quantity + 1))}
                    disabled={quantity >= product.estoque}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    {product.estoque} disponível(is)
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            {product.descricao && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {product.descricao}
                </p>
              </div>
            )}

            {/* Specifications */}
            {(product.peso || product.dimensoes || product.sku) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Especificações</h3>
                <div className="space-y-1 text-sm">
                  {product.sku && (
                    <p className="text-gray-600">
                      <span className="font-medium">SKU:</span> {product.sku}
                    </p>
                  )}
                  {product.peso && (
                    <p className="text-gray-600">
                      <span className="font-medium">Peso:</span> {product.peso}kg
                    </p>
                  )}
                  {product.dimensoes && (
                    <p className="text-gray-600">
                      <span className="font-medium">Dimensões:</span> {product.dimensoes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {product.estoque > 0 ? (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {addToCartMutation.isPending ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                  </Button>
                  <Button variant="outline" size="lg">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleBuyNow}
                >
                  Comprar Agora
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg text-center">
                <p className="text-gray-700 font-medium">Produto esgotado</p>
                <p className="text-sm text-gray-600 mt-1">
                  Entre em contato para verificar disponibilidade
                </p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Frete Grátis</p>
                    <p className="text-xs text-gray-500">Acima de R$ 200</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Garantia</p>
                    <p className="text-xs text-gray-500">12 meses</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Store Info */}
            {product.lojaId && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold">
                      L
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Loja do Produto</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs">4.8 (124 avaliações)</span>
                      </div>
                    </div>
                    <Link to={`/lojas/${product.lojaId}`}>
                      <Button variant="outline" size="sm">
                        Ver Loja
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
