import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CartService } from '@/services/CartService';
import { formatCurrency } from '@/lib/utils';

export function CartPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState('');

  // Buscar carrinho
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => CartService.getCart(user?.id),
  });

  // Mutation para atualizar quantidade
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      CartService.updateItemQuantity(itemId, quantity, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a quantidade',
        variant: 'destructive',
      });
    },
  });

  // Mutation para remover item
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => CartService.removeItem(itemId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Item removido',
        description: 'O produto foi removido do carrinho',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível remover o item',
        variant: 'destructive',
      });
    },
  });

  // Mutation para aplicar cupom
  const applyCouponMutation = useMutation({
    mutationFn: () => CartService.applyCoupon(couponCode, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Cupom aplicado!',
        description: 'Desconto aplicado com sucesso',
      });
      setCouponCode('');
    },
    onError: (error: any) => {
      toast({
        title: 'Cupom inválido',
        description: error.message || 'Este cupom não é válido',
        variant: 'destructive',
      });
    },
  });

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Faça login para continuar com a compra',
      });
      navigate('/auth');
      return;
    }

    // Navegar para página de checkout (pode ser implementada posteriormente)
    toast({
      title: 'Checkout',
      description: 'Redirecionando para o checkout...',
    });

    // Aqui você pode navegar para uma página de checkout dedicada
    // navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-gray-900">
                Carrinho {hasItems && `(${cart.items.length})`}
              </span>
            </div>
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasItems ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Seu carrinho está vazio
            </h3>
            <p className="mt-2 text-gray-600">
              Adicione produtos ao carrinho para continuar
            </p>
            <Link to="/">
              <Button className="mt-4">Explorar Produtos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Itens no Carrinho ({cart.items.length})
              </h2>

              {cart.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-gray-500">{item.lojaNome}</p>
                        <p className="text-lg font-bold text-primary mt-1">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              itemId: item.id,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          disabled={
                            item.quantity <= 1 || updateQuantityMutation.isPending
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            if (val !== item.quantity) {
                              updateQuantityMutation.mutate({
                                itemId: item.id,
                                quantity: Math.max(1, val),
                              });
                            }
                          }}
                          className="w-16 text-center"
                          min="1"
                        />

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              itemId: item.id,
                              quantity: item.quantity + 1,
                            })
                          }
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeItemMutation.mutate(item.id)}
                        disabled={removeItemMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Resumo do Pedido
                  </h3>

                  {/* Coupon */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Cupom de desconto
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Digite o cupom"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="pl-10"
                          disabled={applyCouponMutation.isPending}
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => applyCouponMutation.mutate()}
                        disabled={!couponCode || applyCouponMutation.isPending}
                      >
                        Aplicar
                      </Button>
                    </div>
                    {cart.couponCode && (
                      <p className="text-xs text-green-600 mt-1">
                        Cupom "{cart.couponCode}" aplicado!
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(cart.subtotal)}
                      </span>
                    </div>

                    {cart.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto</span>
                        <span className="font-medium">
                          -{formatCurrency(cart.discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Frete</span>
                      {cart.shipping === 0 ? (
                        <span className="font-medium text-green-600">Grátis</span>
                      ) : (
                        <span className="font-medium">
                          {formatCurrency(cart.shipping)}
                        </span>
                      )}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(cart.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-6" size="lg" onClick={handleCheckout}>
                    Finalizar Compra
                  </Button>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      Compra 100% segura e protegida
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Frete grátis acima de R$ 200
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
