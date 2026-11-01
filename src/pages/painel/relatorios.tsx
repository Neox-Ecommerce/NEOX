import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  ArrowDownRight,
  Percent,
  Target,
  Filter,
  Printer
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportsService } from '@/services/ReportsService';
import { FeedbackService } from '@/services/FeedbackService';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function RelatoriosPage() {
  const [periodFilter, setPeriodFilter] = useState<string>('month');

  const { data: salesReport, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-report', periodFilter],
    queryFn: () => ReportsService.getSalesReport(periodFilter)
  });

  const { data: conversionReport, isLoading: conversionLoading } = useQuery({
    queryKey: ['conversion-report', periodFilter],
    queryFn: () => ReportsService.getConversionReport(periodFilter)
  });

  const { data: funnelReport, isLoading: funnelLoading } = useQuery({
    queryKey: ['funnel-report', periodFilter],
    queryFn: () => ReportsService.getFunnelReport(periodFilter)
  });

  // "YYYY-MM-DD" é dia local; new Date() leria como UTC e mostraria o dia anterior
  const formatDay = (value: string) => `${value.slice(8, 10)}/${value.slice(5, 7)}`;

  // Sugestões só aparecem quando a etapa tem perda real no período (índice da etapa no funil).
  const suggestions = [
    { index: 2, icon: TrendingUp, color: 'bg-yellow-100 text-yellow-800', title: 'Otimize a página de produto',
      text: (p: string) => `${p}% de quem viu um produto não adicionou ao carrinho. Melhore descrições, fotos e destaque avaliações.` },
    { index: 3, icon: DollarSign, color: 'bg-green-100 text-green-800', title: 'Recupere carrinhos abandonados',
      text: (p: string) => `${p}% de quem adicionou ao carrinho não iniciou o checkout. Considere cupons ou lembretes para recuperar essas vendas.` },
    { index: 4, icon: Target, color: 'bg-blue-100 text-blue-800', title: 'Simplifique o checkout',
      text: (p: string) => `${p}% de quem iniciou o checkout não concluiu a compra. Reduza campos obrigatórios e revise as opções de frete e pagamento.` },
  ].filter((sug) => (funnelReport?.steps[sug.index]?.dropoffRate ?? 0) > 0);

  const handleExportReport = (type: 'sales' | 'conversion' | 'funnel', data?: Parameters<typeof ReportsService.exportReport>[1]) => {
    if (!data) return;
    try {
      const blob = ReportsService.exportReport(type, data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      FeedbackService.success('Relatório exportado com sucesso!');
    } catch {
      FeedbackService.error('Erro ao exportar relatório');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (salesLoading || conversionLoading || funnelLoading) {
    return (
      <RoleGuard requiredRole="EMPREENDEDOR">
        <AppShell>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AppShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="EMPREENDEDOR">
      <AppShell>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Relatórios
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Análise detalhada do desempenho da sua loja
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>

          <Tabs defaultValue="sales" className="space-y-6">
            <TabsList>
              <TabsTrigger value="sales" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Vendas
              </TabsTrigger>
              <TabsTrigger value="conversion" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Conversão
              </TabsTrigger>
              <TabsTrigger value="funnel" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Funil
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-6">
              {/* Sales Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total de Vendas</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(salesReport?.totalSales || 0)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total de Pedidos</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {salesReport?.totalOrders || 0}
                        </p>
                      </div>
                      <ShoppingBag className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(salesReport?.averageTicket || 0)}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ações</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleExportReport('sales', salesReport)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Exportar
                          </Button>
                        </div>
                      </div>
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={salesReport?.salesByDay}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDay}
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          yAxisId="left"
                          orientation="left"
                          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          tickFormatter={(value) => value.toString()}
                          className="text-muted-foreground"
                        />
                        <Tooltip 
                          formatter={(value: number | string, name: string) => {
                            if (name === 'Vendas') return [formatCurrency(Number(value)), 'Vendas'];
                            return [value, 'Pedidos'];
                          }}
                          labelFormatter={(value) => `Data: ${formatDay(String(value))}`}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="sales" 
                          name="Vendas" 
                          stroke="#1DC37E" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="orders" 
                          name="Pedidos" 
                          stroke="#8884d8" 
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {!salesReport?.topProducts.length ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      Nenhuma venda paga neste período.
                    </p>
                  ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Quantidade</TableHead>
                            <TableHead>Receita</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesReport?.topProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.quantity}</TableCell>
                              <TableCell>{formatCurrency(product.revenue)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesReport?.topProducts}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {salesReport?.topProducts.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number | string) => formatCurrency(Number(value))}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversion" className="space-y-6">
              {/* Conversion Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total de Visitantes</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(conversionReport?.totalVisitors ?? 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Conversões</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(conversionReport?.totalConversions ?? 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <ShoppingBag className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(conversionReport?.conversionRate ?? 0).toFixed(1)}%
                        </p>
                      </div>
                      <Percent className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ações</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleExportReport('conversion', conversionReport)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Exportar
                          </Button>
                        </div>
                      </div>
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Funil de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  {!conversionReport?.totalVisitors ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      Nenhuma visita registrada neste período.
                    </p>
                  ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={conversionReport?.funnelSteps}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="step" 
                          type="category" 
                          width={150}
                        />
                        <Tooltip 
                          formatter={(value: number | string, name: string) => {
                            if (name === 'Visitantes') return [Number(value).toLocaleString('pt-BR'), 'Visitantes'];
                            return [`${value}%`, 'Taxa de Conversão'];
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="visitors" 
                          name="Visitantes" 
                          fill="#1DC37E"
                          radius={[0, 4, 4, 0]}
                        />
                        <Bar 
                          dataKey="conversionRate" 
                          name="Taxa de Conversão (%)" 
                          fill="#8884d8"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  )}
                </CardContent>
              </Card>

              {/* Conversion by Source */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversão por Origem</CardTitle>
                </CardHeader>
                <CardContent>
                  {!conversionReport?.totalVisitors ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      Nenhuma visita registrada neste período.
                    </p>
                  ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={conversionReport?.conversionBySource}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="source" />
                        <YAxis yAxisId="left" orientation="left" label={{ value: 'Visitantes', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Taxa (%)', angle: 90, position: 'insideRight' }} />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          yAxisId="left"
                          dataKey="visitors" 
                          name="Visitantes" 
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          yAxisId="right"
                          dataKey="rate" 
                          name="Taxa de Conversão (%)" 
                          fill="#1DC37E"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="funnel" className="space-y-6">
              {/* Funnel Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Visitantes Totais</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(funnelReport?.totalVisitors ?? 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Conversões Finais</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(funnelReport?.finalConversions ?? 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {(funnelReport?.overallConversionRate ?? 0).toFixed(1)}%
                        </p>
                      </div>
                      <Percent className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Funnel Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle>Visualização do Funil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {funnelReport?.steps.map((step, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium">{step.name}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{step.visitors.toLocaleString('pt-BR')}</span>
                            <span className="text-gray-500"> visitantes</span>
                          </div>
                        </div>
                        <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-primary rounded-lg"
                            style={{ width: `${step.conversionRate}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-between px-3">
                            <span className="text-xs font-medium text-gray-900 dark:text-white">
                              {step.conversionRate.toFixed(1)}%
                            </span>
                            {index > 0 && step.dropoffRate > 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-red-600 dark:text-red-400">
                                  -{step.dropoffRate.toFixed(1)}%
                                </span>
                                <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => handleExportReport('funnel', funnelReport)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Dados do Funil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Improvement Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Sugestões de Melhoria</CardTitle>
                </CardHeader>
                <CardContent>
                  {suggestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Ainda não há dados de navegação suficientes neste período para gerar sugestões.
                    </p>
                  ) : (
                  <div className="space-y-4">
                    {suggestions.map((sug) => (
                      <div key={sug.index} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${sug.color}`}>
                            <sug.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                              {sug.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {sug.text(funnelReport!.steps[sug.index].dropoffRate.toFixed(1))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </RoleGuard>
  );
}