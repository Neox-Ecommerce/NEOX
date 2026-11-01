import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Eye, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Target,
  AlertTriangle,
  Plus,
  Download,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Video
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { MetricCard } from '@/components/MetricCard';
import { RevenueChart } from '@/components/RevenueChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DashboardService } from '@/services/DashboardService';
import { ProductService } from '@/services/ProductService';
import { toCsvBlob } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export function Dashboard() {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState(30);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: DashboardService.fetchOverview
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-chart', chartPeriod],
    queryFn: () => DashboardService.fetchChartData(chartPeriod)
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: DashboardService.fetchRecentOrders
  });

  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: DashboardService.fetchFeaturedProducts
  });

  const { data: productStats } = useQuery({
    queryKey: ['product-stats'],
    queryFn: () => ProductService.getProductStats()
  });

  const handleExportCSV = () => {
    const blob = toCsvBlob([
      ['Data', 'Receita (R$)', 'Visitas'],
      ...(chartData ?? []).map((d) => [d.date, d.receita.toFixed(2), d.visitas]),
    ]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${chartPeriod}-dias.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateCoupon = () => {
    navigate('/painel/marketing');
  };

  const handleCreateTrend = () => {
    navigate('/painel/trend/novo');
  };

  return (
    <RoleGuard requiredRole="EMPREENDEDOR">
      <AppShell>
        <TooltipProvider>
          <div className="p-6 space-y-6">
            {/* Header com Ações Rápidas */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Visão geral do seu negócio
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCreateTrend}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Postar Trend</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleGenerateCoupon}
                    >
                      <Gift className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gerar Cupom</p>
                  </TooltipContent>
                </Tooltip>
                
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="hidden sm:flex"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                
                <Button
                  onClick={() => navigate('/painel/produtos/novo')}
                  className="bg-primary hover:bg-primary-hover"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>
            </div>

            {/* Alertas */}
            {overview?.hasAlerts && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {overview.alertMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-lg" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <MetricCard
                    title="Produtos"
                    value={productStats?.total ?? overview?.produtos ?? 0}
                    icon={Package}
                  />
                  
                  <MetricCard
                    title="Visitas"
                    value={overview?.visitas || 0}
                    icon={Eye}
                    delta={overview?.deltaVisitas}
                  />
                  
                  <MetricCard
                    title="Vendas (Mês)"
                    value={overview?.vendasMes || 0}
                    icon={TrendingUp}
                    format="currency"
                    delta={overview?.deltaVendas}
                  />
                  
                  <MetricCard
                    title="Pedidos Pendentes"
                    value={overview?.pedidosPendentes || 0}
                    icon={Clock}
                  />
                </>
              )}
            </div>

            {/* Gráfico de Receita vs Visitas */}
            <div className="grid grid-cols-1">
              <RevenueChart 
                data={chartData || []} 
                isLoading={chartLoading}
                period={chartPeriod}
                onPeriodChange={setChartPeriod}
              />
            </div>

            {/* Indicadores Adicionais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {overviewLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-lg" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <MetricCard
                    title="Ticket Médio"
                    value={overview?.ticketMedio || 0}
                    icon={DollarSign}
                    format="currency"
                    delta={overview?.deltaTicket}
                  />
                  
                  <MetricCard
                    title="Taxa de Conversão"
                    value={overview?.taxaConversao || 0}
                    icon={Target}
                    format="percentage"
                  />
                  
                  <MetricCard
                    title="Estoque Baixo"
                    value={overview?.estoqueBaixo || 0}
                    icon={AlertTriangle}
                    className={overview?.estoqueBaixo ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950' : ''}
                  />
                </>
              )}
            </div>

            {/* Vendas Recentes + Produtos em Destaque */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vendas Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Vendas Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : !recentOrders?.length ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      Nenhum pedido recebido ainda.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Pedido {order.id}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {order.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(order.value)}
                            </span>
                            <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Produtos em Destaque */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Produtos em Destaque</CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : !featuredProducts?.length ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      Nenhuma venda paga nos últimos 30 dias.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {featuredProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {product.sales} {product.sales === 1 ? 'unidade vendida' : 'unidades vendidas'} (30 dias)
                            </p>
                          </div>
                          {product.variation === 0 ? (
                            <span className="text-sm text-muted-foreground">—</span>
                          ) : (
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-medium ${
                              product.variation > 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {product.variation > 0 ? '+' : ''}{product.variation.toFixed(1)}%
                            </span>
                            {product.variation > 0 ? (
                              <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TooltipProvider>
      </AppShell>
    </RoleGuard>
  );
}