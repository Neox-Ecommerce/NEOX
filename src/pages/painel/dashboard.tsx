import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, ArrowRight, CheckCircle2, Circle, Clock, DollarSign, Download, Eye, Gift, Package, Plus, Target, TrendingUp, Video,
} from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { RevenueChart } from '@/components/RevenueChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorState, PageHeader, PageLoader, QueryState } from '@/components/PageStates';
import { STORE_STATUS } from '@/components/StatusBadge';
import { DashboardService } from '@/services/DashboardService';
import { ProductService } from '@/services/ProductService';
import { StoreService } from '@/services/StoreService';
import { SettingsService } from '@/services/SettingsService';
import { toCsvBlob } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';

/** Checklist da loja nova: some quando tudo estiver feito. Calculado só com dados reais da API. */
function OnboardingChecklist() {
  const store = useQuery({ queryKey: ['store'], queryFn: StoreService.getStore });
  const docs = useQuery({ queryKey: ['store-documents'], queryFn: StoreService.getDocuments });
  const settings = useQuery({ queryKey: ['store-settings'], queryFn: SettingsService.getStoreSettings });
  const products = useQuery({ queryKey: ['product-stats'], queryFn: () => ProductService.getProductStats() });
  if (!store.data || !docs.data || !settings.data || !products.data) return null;

  const ship = settings.data.shipping;
  const items = [
    {
      done: store.data.status === 'APROVADA',
      label: store.data.status === 'APROVADA' ? 'Loja aprovada' : `Aprovação da loja: ${STORE_STATUS[store.data.status]?.label ?? store.data.status}`,
      hint: 'A equipe NEOX revisa seus dados e documentos.',
      to: '/painel/loja/documentos',
    },
    { done: docs.data.length > 0, label: 'Enviar documento da empresa', hint: 'Necessário para a aprovação.', to: '/painel/loja/documentos' },
    { done: !!store.data.logo, label: 'Adicionar o logo da loja', hint: 'Aparece na vitrine e nos pedidos.', to: '/painel/loja' },
    {
      done: !!ship && (ship.defaultShippingCost > 0 || ship.freeShippingThreshold > 0 || ship.processingTime > 0 || ship.allowPickup),
      label: 'Definir regras de frete',
      hint: 'Valor do frete, frete grátis e prazo de preparo.',
      to: '/painel/loja/frete',
    },
    { done: products.data.total > 0, label: 'Cadastrar o primeiro produto', hint: 'Sua vitrine começa aqui.', to: '/painel/produtos/novo' },
  ];
  const done = items.filter((i) => i.done).length;
  if (done === items.length) return null;

  return (
    <Card className="mb-6 border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Configure sua loja</CardTitle>
        <p className="text-sm text-muted-foreground">{done} de {items.length} etapas concluídas</p>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} aria-label="Progresso da configuração">
          <div className="h-full bg-primary" style={{ width: `${(done / items.length) * 100}%` }} />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-3 py-3">
              {item.done
                ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />}
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-medium', item.done && 'text-muted-foreground line-through')}>
                  {item.label}<span className="sr-only">{item.done ? ' (concluído)' : ' (pendente)'}</span>
                </p>
                {!item.done && <p className="text-xs text-muted-foreground">{item.hint}</p>}
              </div>
              {!item.done && (
                <Button asChild variant="outline" size="sm">
                  <Link to={item.to}>Resolver</Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState(30);

  const overviewQuery = useQuery({ queryKey: ['dashboard-overview'], queryFn: DashboardService.fetchOverview });
  const chartQuery = useQuery({ queryKey: ['dashboard-chart', chartPeriod], queryFn: () => DashboardService.fetchChartData(chartPeriod) });
  const recentQuery = useQuery({ queryKey: ['recent-orders'], queryFn: DashboardService.fetchRecentOrders });
  const featuredQuery = useQuery({ queryKey: ['featured-products'], queryFn: DashboardService.fetchFeaturedProducts });

  const handleExportCSV = () => {
    const blob = toCsvBlob([
      ['Data', 'Receita (R$)', 'Visitas'],
      ...(chartQuery.data ?? []).map((d) => [d.date, d.receita.toFixed(2), d.visitas]),
    ]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${chartPeriod}-dias.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const overview = overviewQuery.data;

  return (
    <div>
      <PageHeader
        title="Início"
        description="O que precisa da sua atenção hoje."
        actions={
          <>
            <Button variant="outline" asChild><Link to="/painel/trends"><Video className="mr-2 h-4 w-4" aria-hidden="true" />Postar trend</Link></Button>
            <Button variant="outline" asChild><Link to="/painel/marketing"><Gift className="mr-2 h-4 w-4" aria-hidden="true" />Criar cupom</Link></Button>
            <Button asChild><Link to="/painel/produtos/novo"><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Adicionar produto</Link></Button>
          </>
        }
      />

      <OnboardingChecklist />

      {overviewQuery.isLoading ? <PageLoader /> : overviewQuery.error || !overview ? (
        <Card className="mb-6"><ErrorState error={overviewQuery.error} onRetry={() => overviewQuery.refetch()} /></Card>
      ) : (
        <>
          {(overview.pedidosPendentes > 0 || overview.estoqueBaixo > 0) && (
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {overview.pedidosPendentes > 0 && (
                <Link to="/painel/pedidos?status=pending" className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning-muted p-4 text-sm text-warning hover:shadow-sm">
                  <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="flex-1 font-medium">{overview.pedidosPendentes} pedido(s) aguardando confirmação</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              {overview.estoqueBaixo > 0 && (
                <Link to="/painel/estoque?filtro=baixo" className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning-muted p-4 text-sm text-warning hover:shadow-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="flex-1 font-medium">{overview.estoqueBaixo} produto(s) com estoque baixo</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard title="Vendas no mês" value={overview.vendasMes} format="currency" icon={TrendingUp} delta={overview.deltaVendas} tone="success" />
            <MetricCard title="Pedidos pendentes" value={overview.pedidosPendentes} icon={Clock} tone="warning" to="/painel/pedidos?status=pending" />
            <MetricCard title="Visitas" value={overview.visitas} icon={Eye} delta={overview.deltaVisitas} tone="info" />
            <MetricCard title="Ticket médio" value={overview.ticketMedio} format="currency" icon={DollarSign} delta={overview.deltaTicket} />
            <MetricCard title="Produtos" value={overview.produtos} icon={Package} to="/painel/produtos" />
            <MetricCard title="Taxa de conversão" value={overview.taxaConversao} format="percentage" icon={Target} />
            <MetricCard title="Estoque baixo" value={overview.estoqueBaixo} icon={AlertTriangle} tone={overview.estoqueBaixo ? 'warning' : 'success'} to="/painel/estoque?filtro=baixo" />
          </div>
        </>
      )}

      <div className="mb-6">
        {chartQuery.error ? (
          <Card><ErrorState error={chartQuery.error} onRetry={() => chartQuery.refetch()} /></Card>
        ) : (
          <RevenueChart data={chartQuery.data ?? []} isLoading={chartQuery.isLoading} period={chartPeriod} onPeriodChange={setChartPeriod} />
        )}
        <div className="mt-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleExportCSV} disabled={!chartQuery.data?.length}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Exportar dados do gráfico (CSV)
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Pedidos recentes</CardTitle>
            <Button variant="link" asChild className="h-auto p-0"><Link to="/painel/pedidos">Ver todos</Link></Button>
          </CardHeader>
          <CardContent>
            <QueryState
              query={recentQuery}
              isEmpty={(d) => d.length === 0}
              empty={<EmptyState title="Nenhum pedido ainda" description="Os pedidos novos aparecem aqui." className="py-6" />}
            >
              {(orders) => (
                <ul className="divide-y">
                  {orders.slice(0, 5).map((order) => (
                    <li key={order.id}>
                      <Link to={`/painel/pedidos?pedido=${order.id}`} className="flex min-h-11 items-center justify-between gap-3 py-2 hover:text-primary">
                        <div>
                          <p className="font-medium">Pedido {order.code}</p>
                          <p className="text-sm text-muted-foreground">{order.time}</p>
                        </div>
                        <span className="font-semibold">{formatCurrency(order.value)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </QueryState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mais vendidos (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <QueryState
              query={featuredQuery}
              isEmpty={(d) => d.length === 0}
              empty={<EmptyState title="Nenhuma venda paga nos últimos 30 dias" className="py-6" />}
            >
              {(products) => (
                <ul className="divide-y">
                  {products.map((product) => (
                    <li key={product.name} className="flex items-center justify-between gap-3 py-2">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} {product.sales === 1 ? 'unidade vendida' : 'unidades vendidas'}
                        </p>
                      </div>
                      {product.variation !== 0 && (
                        <span className={cn('text-sm font-medium', product.variation > 0 ? 'text-success' : 'text-destructive')}>
                          {product.variation > 0 ? '+' : ''}{product.variation.toFixed(1)}%
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </QueryState>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
