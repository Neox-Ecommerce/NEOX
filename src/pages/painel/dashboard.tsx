import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign,
  Eye,
  EyeOff,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ProductService } from '@/services/ProductService';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardProps {
  user: any;
}

export function Dashboard({ user }: DashboardProps) {
  const authContext = useAuth();

  // Verificar se o contexto está disponível
  if (!authContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600">Erro: Contexto de autenticação não disponível</p>
        </div>
      </div>
    );
  }

  if (!user?.lojaId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg p-8 bg-white shadow-lg rounded-xl text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Você ainda não possui uma loja cadastrada</h2>
          <p className="text-gray-600">
            Cadastre sua loja para começar a gerenciar produtos, pedidos e acompanhar métricas em tempo real.
          </p>
          <Button onClick={() => window.location.href = '/painel/configuracoes'}>
            Cadastrar minha loja
          </Button>
        </div>
      </div>
    );
  }
  // Usar hook customizado que garante array válido
  const { products, stats, categoryCounts, isLoading: productsLoading } = useProducts({
    lojaId: user?.lojaId,
    enabled: Boolean(user?.lojaId),
  });
  const recentProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    return [...products]
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0))
      .slice(0, 5);
  }, [products]);

  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados da loja...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Produtos',
      value: stats.total,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Produtos Ativos',
      value: stats.ativo,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Estoque Baixo',
      value: stats.estoqueBaixo,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '-3%',
      changeType: 'negative' as const,
    },
    {
      title: 'Valor Total',
      value: formatCurrency(stats.valorTotal),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Aqui está um resumo da sua loja hoje
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-2">vs mês anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos Recentes */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Produtos Recentes</CardTitle>
                  <CardDescription>
                    Seus produtos mais recentes
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.imagem ? (
                        <img 
                          src={product.imagem} 
                          alt={product.nome}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.nome}</h4>
                      <p className="text-sm text-gray-600">{product.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(product.preco)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.ativo ? 'default' : 'secondary'}>
                          {product.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <span className="text-sm text-gray-500">{product.estoque} em estoque</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categorias */}
        <div>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Produtos por Categoria</CardTitle>
              <CardDescription>
                Distribuição dos seus produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryCounts && typeof categoryCounts === 'object' 
                  ? Object.entries(categoryCounts).map(([category, count]) => {
                      const percentage = products.length > 0 ? (count as number / products.length) * 100 : 0;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category}</span>
                            <span className="text-gray-600">{count} produtos</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })
                  : <p className="text-sm text-gray-500">Nenhuma categoria encontrada</p>
                }
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card className="border-0 shadow-lg mt-6">
            <CardHeader>
              <CardTitle className="text-red-600">Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.esgotado > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <EyeOff className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">{stats.esgotado} produtos esgotados</p>
                      <p className="text-sm text-red-700">Recomendamos repor o estoque</p>
                    </div>
                  </div>
                )}
                {stats.estoqueBaixo > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900">{stats.estoqueBaixo} produtos com estoque baixo</p>
                      <p className="text-sm text-yellow-700">Considere fazer um pedido</p>
                    </div>
                  </div>
                )}
                {stats.esgotado === 0 && stats.estoqueBaixo === 0 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Package className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Tudo em ordem!</p>
                      <p className="text-sm text-green-700">Seus produtos estão bem abastecidos</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}