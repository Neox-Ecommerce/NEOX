import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  User,
  Search,
  Filter,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Menu,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { CatalogService } from '@/services/CatalogService';
import { CartService, type CartItem } from '@/services/CartService';
import { OrdersService, ORDER_STATUS_LABELS, type Order } from '@/services/OrdersService';
import { ProductService } from '@/services/ProductService';
import { FeedbackService } from '@/services/FeedbackService';
import { ProductCard } from './ProductCard';
import { useAddToCart } from './useAddToCart';

const STATUS_STYLE: Record<Order['status'], { variant: 'success' | 'default' | 'warning' | 'destructive' | 'secondary'; icon: typeof Clock }> = {
  pending: { variant: 'warning', icon: Clock },
  confirmed: { variant: 'default', icon: CheckCircle },
  processing: { variant: 'warning', icon: Clock },
  shipped: { variant: 'default', icon: Truck },
  delivered: { variant: 'success', icon: CheckCircle },
  cancelled: { variant: 'destructive', icon: XCircle },
  returned: { variant: 'secondary', icon: Package },
};

const PAYMENT_LABELS: Record<Order['paymentStatus'], string> = {
  pending: 'Pagamento pendente',
  paid: 'Pago',
  failed: 'Pagamento recusado',
  refunded: 'Reembolsado',
};

export function ClientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { add, isPending: adding } = useAddToCart();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const category = selectedCategory === 'all' ? undefined : selectedCategory;
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['catalog-products', searchQuery.trim(), category],
    queryFn: () => CatalogService.getProducts({ q: searchQuery.trim() || undefined, category, limit: 60 }),
  });
  const { data: orders = [] } = useQuery({ queryKey: ['my-orders'], queryFn: OrdersService.getMyOrders });
  const { data: cartItems = [] } = useQuery({ queryKey: ['cart'], queryFn: CartService.getCart });

  const updateCart = useMutation({
    mutationFn: (item: { productId: string; quantity: number }) =>
      item.quantity < 1 ? CartService.removeItem(item.productId) : CartService.updateQuantity(item),
    onSuccess: (items: CartItem[]) => queryClient.setQueryData(['cart'], items),
    onError: (error: Error) => FeedbackService.error(error.message),
  });

  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalSpent = orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">NeoxStore</span>
              </Link>
            </div>

            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos ou lojas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/carrinho">
                <Button variant="ghost" size="icon" className="relative" aria-label="Carrinho">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">Cliente</div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <span className="text-lg font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2" onClick={() => setSidebarOpen(false)}>
              <a href="#produtos" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Produtos</a>
              <a href="#pedidos" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Meus Pedidos</a>
              <Link to="/carrinho" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Carrinho</Link>
            </nav>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Olá, {user?.name}!</h1>
          <p className="text-gray-600">Descubra produtos e acompanhe seus pedidos</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Carrinho</p>
                  <p className="text-2xl font-bold text-gray-900">{cartCount}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Gasto</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {ProductService.getCategories().map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            <div id="produtos">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Produtos</h2>
              {loadingProducts ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600">Nenhum produto encontrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} onAdd={(p) => add(p)} adding={adding} />
                  ))}
                </div>
              )}
            </div>

            {/* Orders */}
            <div id="pedidos">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const style = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;
                    const Icon = style.icon;
                    const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
                    return (
                      <Card key={order.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Icon className="h-4 w-4" />
                                <div>
                                  <p className="font-semibold text-gray-900">{order.code}</p>
                                  <p className="text-sm text-gray-500">
                                    {order.createdAt.toLocaleDateString('pt-BR')}
                                    {order.lojaNome && (
                                      <> · <Link to={`/lojas/${order.lojaId}`} className="hover:underline">{order.lojaNome}</Link></>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Badge variant={style.variant}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                                <span className="text-xs text-gray-500">{PAYMENT_LABELS[order.paymentStatus]}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                              <p className="text-sm text-gray-500">
                                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                              </p>
                            </div>
                          </div>

                          {order.trackingCode && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>Código de rastreamento: {order.trackingCode}</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho ({cartCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Seu carrinho está vazio</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="outline" size="icon" className="h-6 w-6" disabled={updateCart.isPending}
                            onClick={() => updateCart.mutate({ productId: item.productId, quantity: item.quantity - 1 })}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6"
                            disabled={updateCart.isPending || item.quantity >= item.stock}
                            onClick={() => updateCart.mutate({ productId: item.productId, quantity: item.quantity + 1 })}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-green-600">{formatCurrency(cartTotal)}</span>
                      </div>
                      <Link to="/carrinho">
                        <Button className="w-full">Finalizar Compra</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="#pedidos" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Meus Pedidos
                  </Button>
                </a>
                <Link to="/carrinho" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Ver Carrinho
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <User className="h-4 w-4 mr-2" />
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Nossa equipe está pronta para ajudar você</p>
                <Link to="/#contato">
                  <Button variant="outline" className="w-full">Falar com Suporte</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
