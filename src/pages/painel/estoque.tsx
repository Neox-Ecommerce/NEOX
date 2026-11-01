import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Search, 
  Filter,
  Download,
  Plus,
  Minus,
  Edit,
  BarChart3,
  Eye,
  RefreshCw,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InventoryService, InventoryItem } from '@/services/InventoryService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

export function EstoquePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'add' as 'add' | 'remove',
    quantity: '',
    reason: '',
    cost: ''
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory', user?.lojaId],
    queryFn: () => InventoryService.getInventory()
  });

  const { data: movements = [] } = useQuery({
    queryKey: ['inventory-movements', user?.lojaId],
    queryFn: () => InventoryService.getMovements()
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['inventory-alerts', user?.lojaId],
    queryFn: () => InventoryService.getAlerts()
  });

  const adjustInventoryMutation = useMutation({
    mutationFn: InventoryService.adjustInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      FeedbackService.success('Estoque ajustado com sucesso!');
      setAdjustmentModalOpen(false);
      setSelectedProduct(null);
      setAdjustmentData({ type: 'add', quantity: '', reason: '', cost: '' });
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao ajustar estoque');
    }
  });

  const handleAdjustment = (product: InventoryItem) => {
    setSelectedProduct(product);
    setAdjustmentModalOpen(true);
  };

  const handleSubmitAdjustment = () => {
    if (!selectedProduct || !adjustmentData.quantity || !adjustmentData.reason) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }

    adjustInventoryMutation.mutate({
      productId: selectedProduct.id,
      type: adjustmentData.type,
      quantity: parseInt(adjustmentData.quantity),
      reason: adjustmentData.reason,
      cost: adjustmentData.cost ? parseFloat(adjustmentData.cost) : undefined
    });
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'low' && item.currentStock <= item.minStock) ||
      (statusFilter === 'out' && item.currentStock === 0) ||
      (statusFilter === 'normal' && item.currentStock > item.minStock);
    
    return matchesSearch && matchesStatus;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { label: 'Esgotado', variant: 'destructive' as const };
    if (item.currentStock <= item.minStock) return { label: 'Estoque Baixo', variant: 'warning' as const };
    return { label: 'Normal', variant: 'success' as const };
  };

  const getTotalValue = () => {
    return inventory.reduce((total, item) => total + (item.currentStock * item.averageCost), 0);
  };

  const getLowStockCount = () => {
    return inventory.filter(item => item.currentStock <= item.minStock && item.currentStock > 0).length;
  };

  const getOutOfStockCount = () => {
    return inventory.filter(item => item.currentStock === 0).length;
  };

  if (isLoading) {
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
                Controle de Estoque
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie o estoque dos seus produtos
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => {
                const url = URL.createObjectURL(InventoryService.exportInventory(filteredInventory));
                const a = document.createElement('a');
                a.href = url;
                a.download = `estoque-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['inventory'] });
                queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
                queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Produtos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {inventory.length}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(getTotalValue())}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estoque Baixo</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {getLowStockCount()}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Esgotados</p>
                    <p className="text-2xl font-bold text-red-600">
                      {getOutOfStockCount()}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{alert.productName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                      </div>
                      <Badge variant={alert.type === 'critical' ? 'destructive' : 'warning'}>
                        {alert.type === 'critical' ? 'Crítico' : 'Atenção'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="inventory" className="space-y-6">
            <TabsList>
              <TabsTrigger value="inventory">Estoque Atual</TabsTrigger>
              <TabsTrigger value="movements">Movimentações</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="normal">Estoque Normal</SelectItem>
                    <SelectItem value="low">Estoque Baixo</SelectItem>
                    <SelectItem value="out">Esgotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Estoque Atual</TableHead>
                        <TableHead>Estoque Mínimo</TableHead>
                        <TableHead>Custo Médio</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.map((item) => {
                        const status = getStockStatus(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {item.productName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {item.category}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {item.sku || '-'}
                            </TableCell>
                            <TableCell>
                              <span className={`font-semibold ${
                                item.currentStock === 0 ? 'text-red-600' :
                                item.currentStock <= item.minStock ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {item.currentStock}
                              </span>
                            </TableCell>
                            <TableCell>{item.minStock}</TableCell>
                            <TableCell>{formatCurrency(item.averageCost)}</TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(item.currentStock * item.averageCost)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleAdjustment(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Movimentações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {movements.map((movement) => (
                      <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            movement.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {movement.type === 'in' ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {movement.productName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {movement.reason}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {movement.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Relatório de Estoque
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Gere relatórios detalhados do seu estoque
                    </p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Histórico de Movimentações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Visualize o histórico completo de movimentações
                    </p>
                    <Button className="w-full" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Histórico
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Adjustment Modal */}
          <Dialog open={adjustmentModalOpen} onOpenChange={setAdjustmentModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajustar Estoque</DialogTitle>
                <DialogDescription>
                  Produto: {selectedProduct?.productName}
                  <br />
                  Estoque atual: {selectedProduct?.currentStock} unidades
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Tipo de Ajuste</Label>
                  <Select 
                    value={adjustmentData.type} 
                    onValueChange={(value) => setAdjustmentData(prev => ({ ...prev, type: value as 'add' | 'remove' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-green-600" />
                          Adicionar ao Estoque
                        </div>
                      </SelectItem>
                      <SelectItem value="remove">
                        <div className="flex items-center gap-2">
                          <Minus className="h-4 w-4 text-red-600" />
                          Remover do Estoque
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Digite a quantidade"
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Motivo *</Label>
                  <Textarea
                    id="reason"
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Descreva o motivo do ajuste..."
                    rows={3}
                  />
                </div>

                {adjustmentData.type === 'add' && (
                  <div>
                    <Label htmlFor="cost">Custo Unitário (opcional)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={adjustmentData.cost}
                      onChange={(e) => setAdjustmentData(prev => ({ ...prev, cost: e.target.value }))}
                      placeholder="R$ 0,00"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAdjustmentModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmitAdjustment}
                  disabled={adjustInventoryMutation.isPending}
                >
                  {adjustInventoryMutation.isPending ? 'Processando...' : 'Confirmar Ajuste'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppShell>
    </RoleGuard>
  );
}