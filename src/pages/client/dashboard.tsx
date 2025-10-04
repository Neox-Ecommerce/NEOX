import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Filter, 
  Star, 
  Package, 
  Truck, 
  CreditCard,
  MapPin,
  Bell,
  Menu,
  X,
  ShoppingCart,
  Eye,
  Plus,
  Minus,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

export function ClientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 8999.99,
      quantity: 1,
      image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=150',
      store: 'TechStore Premium'
    }
  ]);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Mock data para produtos
  const products = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 8999.99,
      originalPrice: 9499.99,
      discount: 5,
      rating: 4.8,
      reviews: 124,
      image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400',
      store: 'TechStore Premium',
      category: 'Eletrônicos',
      inStock: true,
      freeShipping: true
    },
    {
      id: '2',
      name: 'MacBook Pro 14" M3',
      price: 12999.90,
      originalPrice: 13999.90,
      discount: 7,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
      store: 'TechStore Premium',
      category: 'Informática',
      inStock: true,
      freeShipping: true
    },
    {
      id: '3',
      name: 'AirPods Pro (3ª geração)',
      price: 1899.99,
      originalPrice: 2199.99,
      discount: 14,
      rating: 4.7,
      reviews: 256,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
      store: 'TechStore Premium',
      category: 'Eletrônicos',
      inStock: true,
      freeShipping: false
    },
    {
      id: '4',
      name: 'Samsung Galaxy S24 Ultra',
      price: 7499.99,
      originalPrice: 8299.99,
      discount: 10,
      rating: 4.6,
      reviews: 178,
      image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
      store: 'Galaxy Store',
      category: 'Eletrônicos',
      inStock: true,
      freeShipping: true
    },
    {
      id: '5',
      name: 'Tênis Nike Air Max',
      price: 599.99,
      originalPrice: 699.99,
      discount: 14,
      rating: 4.5,
      reviews: 342,
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
      store: 'SportStyle',
      category: 'Moda',
      inStock: true,
      freeShipping: false
    },
    {
      id: '6',
      name: 'Cafeteira Expresso',
      price: 1299.99,
      originalPrice: 1499.99,
      discount: 13,
      rating: 4.4,
      reviews: 67,
      image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400',
      store: 'Casa & Café',
      category: 'Casa',
      inStock: true,
      freeShipping: true
    }
  ];

  // Mock data para pedidos
  const orders = [
    {
      id: '#001234',
      date: '2024-01-20',
      status: 'Entregue',
      total: 2899.99,
      items: 2,
      tracking: 'BR123456789'
    },
    {
      id: '#001235',
      date: '2024-01-18',
      status: 'Em trânsito',
      total: 599.99,
      items: 1,
      tracking: 'BR987654321'
    },
    {
      id: '#001236',
      date: '2024-01-15',
      status: 'Processando',
      total: 1299.99,
      items: 1,
      tracking: null
    }
  ];

  const categories = ['Eletrônicos', 'Informática', 'Moda', 'Casa', 'Esportes', 'Livros'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.store.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        store: product.store
      }];
    });
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregue': return 'success';
      case 'Em trânsito': return 'default';
      case 'Processando': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Entregue': return <CheckCircle className="h-4 w-4" />;
      case 'Em trânsito': return <Truck className="h-4 w-4" />;
      case 'Processando': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Menu Mobile */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">NEOX</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </Button>
              
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  5
                </span>
              </Button>
              
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">Cliente</div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <User className="h-5 w-5" />
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
            <nav className="flex-1 px-4 py-6 space-y-2">
              <a href="#produtos" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Produtos
              </a>
              <a href="#pedidos" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Meus Pedidos
              </a>
              <a href="#favoritos" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Favoritos
              </a>
              <a href="#perfil" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Meu Perfil
              </a>
            </nav>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Descubra produtos incríveis e acompanhe seus pedidos
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm text-gray-600">Favoritos</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Carrinho</p>
                  <p className="text-2xl font-bold text-gray-900">{cartItems.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">R$ 4,8k</p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div id="produtos">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Produtos em Destaque</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {product.discount > 0 && (
                          <Badge className="absolute top-2 left-2 bg-red-500">
                            -{product.discount}%
                          </Badge>
                        )}
                        {product.freeShipping && (
                          <Badge className="absolute top-2 right-2 bg-green-500">
                            Frete Grátis
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{product.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">({product.reviews})</span>
                          <Badge variant="outline" className="text-xs">
                            {product.store}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(product.price)}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => addToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div id="pedidos">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            <div>
                              <p className="font-semibold text-gray-900">{order.id}</p>
                              <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                          </div>
                          <div>
                            <Badge variant={getStatusColor(order.status) as any}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(order.total)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items} {order.items === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                      </div>
                      
                      {order.tracking && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>Código de rastreamento: {order.tracking}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Seu carrinho está vazio
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(cartTotal)}
                        </span>
                      </div>
                      <Button className="w-full">
                        Finalizar Compra
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Meus Favoritos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Rastrear Pedido
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Meu Perfil
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Meus Endereços
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Nossa equipe está pronta para ajudar você
                </p>
                <Button variant="outline" className="w-full">
                  Falar com Suporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}