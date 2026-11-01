import { useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { CartService, type CartItem } from '@/services/CartService';
import { CheckoutService } from '@/services/CheckoutService';
import { FeedbackService } from '@/services/FeedbackService';

const EMPTY_ADDRESS = { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' };

export function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [cpf, setCpf] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const { data: cartItems = [], isLoading } = useQuery({ queryKey: ['cart'], queryFn: CartService.getCart });

  const onCartChange = {
    onSuccess: (items: CartItem[]) => queryClient.setQueryData(['cart'], items),
    onError: (error: Error) => FeedbackService.error(error.message),
  };
  const updateMutation = useMutation({ mutationFn: CartService.updateQuantity, ...onCartChange });
  const removeMutation = useMutation({ mutationFn: CartService.removeItem, ...onCartChange });

  const checkoutMutation = useMutation({
    mutationFn: CheckoutService.checkout,
    onSuccess: (result) => {
      queryClient.setQueryData(['cart'], []);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      FeedbackService.success(
        `Pedido${result.orders.length > 1 ? 's' : ''} ${result.orders.map((o) => o.code).join(', ')} criado${result.orders.length > 1 ? 's' : ''}!`,
        'A loja vai combinar o pagamento com você.'
      );
      navigate('/cliente#pedidos');
    },
    onError: (error: Error) => FeedbackService.error(error.message),
  });

  const setQty = (item: CartItem, quantity: number) => {
    if (quantity < 1) return removeMutation.mutate(item.productId);
    if (quantity > item.stock) return FeedbackService.error(`Apenas ${item.stock} unidade(s) disponível(is)`);
    updateMutation.mutate({ productId: item.productId, quantity });
  };

  const handleCheckout = (e: FormEvent) => {
    e.preventDefault();
    const required = [address.street, address.number, address.neighborhood, address.city, address.state, address.zipCode, phone, cpf];
    if (required.some((v) => !v.trim())) {
      FeedbackService.error('Preencha endereço, telefone e CPF');
      return;
    }
    checkoutMutation.mutate({
      shippingAddress: { ...address, state: address.state.toUpperCase(), complement: address.complement || undefined, country: 'Brasil' },
      customer: { phone, document: cpf.replace(/\D/g, '') },
      couponCode: couponCode.trim() || undefined,
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const field = (key: keyof typeof EMPTY_ADDRESS, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="space-y-1">
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} value={address[key]} onChange={(e) => setAddress({ ...address, [key]: e.target.value })} {...props} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/cliente" className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-gray-900">Carrinho</span>
            </Link>
            <Link to="/cliente">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Seu carrinho está vazio</h3>
            <p className="mt-2 text-gray-600">Adicione produtos ao carrinho para continuar</p>
            <Link to="/cliente">
              <Button className="mt-4">Explorar Produtos</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Itens no Carrinho ({cartItems.length})</h2>

              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Link to={`/produto/${item.productId}`} className="font-medium text-gray-900 hover:underline">{item.name}</Link>
                        <p className="text-sm text-gray-500">{item.storeName}</p>
                        <p className="text-lg font-bold text-primary mt-1">
                          {formatCurrency(item.price)}
                          {item.price < item.originalPrice && (
                            <span className="ml-2 text-sm text-gray-500 line-through font-normal">{formatCurrency(item.originalPrice)}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button type="button" variant="outline" size="icon" onClick={() => setQty(item, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          className="w-16 text-center"
                          min={1}
                          max={item.stock}
                          onChange={(e) => {
                            const q = parseInt(e.target.value, 10);
                            if (q > 0) setQty(item, q);
                          }}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => setQty(item, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-red-600" aria-label="Remover"
                        onClick={() => removeMutation.mutate(item.productId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Endereço de entrega</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">{field('street', 'Rua *')}</div>
                    {field('number', 'Número *')}
                    {field('complement', 'Complemento')}
                    {field('neighborhood', 'Bairro *')}
                    {field('zipCode', 'CEP *', { placeholder: '00000-000', maxLength: 9 })}
                    <div className="sm:col-span-2">{field('city', 'Cidade *')}</div>
                    {field('state', 'UF *', { maxLength: 2, placeholder: 'SP' })}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 pt-2">Seus dados</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="document">CPF *</Label>
                      <Input id="document" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" maxLength={14} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="coupon">Cupom de desconto</Label>
                      <Input id="coupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                    </div>
                    <p className="text-xs text-gray-500">Frete e desconto do cupom são calculados por loja ao finalizar.</p>
                  </div>

                  <Button type="submit" className="w-full mt-6" size="lg" disabled={checkoutMutation.isPending}>
                    {checkoutMutation.isPending ? 'Finalizando...' : 'Finalizar Compra'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
