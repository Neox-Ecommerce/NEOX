import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, MapPin, Clock, Phone, Globe, Instagram, Truck, Search, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CatalogService } from '@/services/CatalogService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { StoreService } from '@/services/StoreService';
import { ProductCard } from './ProductCard';
import { useAddToCart } from './useAddToCart';

export function StorePage() {
  const { id = '' } = useParams();
  const [search, setSearch] = useState('');
  const { add, isPending } = useAddToCart();

  const { data: store, isLoading, isError } = useQuery({
    queryKey: ['catalog-store', id],
    queryFn: () => CatalogService.getStore(id),
    enabled: !!id,
  });
  const { data: products = [] } = useQuery({
    queryKey: ['catalog-store-products', id],
    queryFn: () => CatalogService.getStoreProducts(id),
    enabled: !!store,
  });

  useEffect(() => {
    if (store) AnalyticsService.track('store_view', store.id);
  }, [store]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Package className="h-12 w-12 text-gray-400" />
        <p className="text-gray-600">Loja não encontrada.</p>
        <Link to="/"><Button>Voltar</Button></Link>
      </div>
    );
  }

  const term = search.trim().toLowerCase();
  const visible = term ? products.filter((p) => p.nome.toLowerCase().includes(term)) : products;
  const hours = StoreService.getDiasSemana().filter((d) => store.horarioFuncionamento?.[d.key]?.ativo);
  const social = store.redesSociais ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/cliente" className="inline-flex items-center text-sm text-gray-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-24 w-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
              {store.logo ? (
                <img src={store.logo} alt={store.nomeFantasia} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{store.nomeFantasia}</h1>
              {store.descricaoLoja && <p className="text-gray-600 mt-2">{store.descricaoLoja}</p>}
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline">{store.segmento}</Badge>
                {store.cnpjVerificado && <Badge variant="success">Verificada</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações da Loja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {store.endereco && (
                  <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-gray-400" />{store.endereco}</div>
                )}
                {store.telefone && (
                  <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-gray-400" />{store.telefone}</div>
                )}
                {social.website && (
                  <div className="flex items-center gap-3"><Globe className="h-4 w-4 text-gray-400" />{social.website}</div>
                )}
                {social.instagram && (
                  <div className="flex items-center gap-3"><Instagram className="h-4 w-4 text-gray-400" />@{social.instagram}</div>
                )}
                {store.tiposEntrega?.length > 0 && (
                  <div className="flex items-center gap-3"><Truck className="h-4 w-4 text-gray-400" />{store.tiposEntrega.join(', ')}</div>
                )}
                {hours.length > 0 && (
                  <div className="flex gap-3">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      {hours.map((d) => (
                        <div key={d.key}>
                          {d.label}: {store.horarioFuncionamento[d.key].abertura}–{store.horarioFuncionamento[d.key].fechamento}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Produtos ({products.length})</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-9" placeholder="Buscar nesta loja" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={(prod) => add(prod)} adding={isPending} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
