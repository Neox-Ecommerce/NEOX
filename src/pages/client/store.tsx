import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, MapPin, Clock, Phone, Globe, Star, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StoreService } from '@/services/StoreService';
import { ProductService } from '@/services/ProductService';
import { formatCurrency } from '@/lib/utils';

export function StorePage() {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Buscar dados da loja
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['store', id],
    queryFn: () => id ? StoreService.getStoreById(id) : Promise.resolve(null),
    enabled: !!id,
  });

  // Buscar produtos da loja
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['store-products', id, searchQuery],
    queryFn: () => {
      if (!id) return Promise.resolve([]);
      if (searchQuery) {
        return ProductService.search(searchQuery, id);
      }
      return ProductService.getMyProducts(id);
    },
    enabled: !!id,
  });

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Loja não encontrada</h3>
          <Link to="/">
            <Button className="mt-4">Voltar para Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-3xl font-bold">
              {store.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{store.nome}</h1>
              <p className="text-gray-600 mt-2">
                {store.descricao || 'Loja especializada em produtos de qualidade'}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-gray-500">(124 avaliações)</span>
                </div>
                {store.verificada && <Badge variant="default">Verificada</Badge>}
                {store.ativa && <Badge variant="outline">Ativa</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info & Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Store Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações da Loja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {store.cidade && store.estado && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{store.cidade}, {store.estado}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Seg-Sex: 8h-18h</span>
                </div>
                {store.telefone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{store.telefone}</span>
                  </div>
                )}
                {store.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {store.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
              <div className="flex gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Link key={product.id} to={`/produto/${product.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                        {product.imagem ? (
                          <img
                            src={product.imagem}
                            alt={product.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                          {product.nome}
                        </h3>
                        <div className="flex items-center gap-2">
                          {product.precoDesconto ? (
                            <>
                              <span className="text-lg font-bold text-primary">
                                {formatCurrency(product.precoDesconto)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(product.preco)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(product.preco)}
                            </span>
                          )}
                        </div>
                        {product.estoque > 0 ? (
                          <Badge variant="outline" className="mt-2">Em estoque</Badge>
                        ) : (
                          <Badge variant="destructive" className="mt-2">Esgotado</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchQuery ? 'Nenhum produto encontrado' : 'Produtos em breve'}
                </h3>
                <p className="mt-2 text-gray-600">
                  {searchQuery
                    ? 'Tente buscar por outro termo'
                    : 'Esta loja está preparando seu catálogo de produtos.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
