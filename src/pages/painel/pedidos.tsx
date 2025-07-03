import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Download,
  RefreshCw,
  MapPin,
  User,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  FileText,
  Printer,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Star
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
import { OrdersService } from '@/services/OrdersService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

export function PedidosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    trackingCode: '',
    notes: ''
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.lojaId],
    queryFn: () => OrdersService.getOrders(user?.lojaId || '1')
  });

  const { data: orderStats } = useQuery({
    queryKey: ['order-stats', user?.lojaId],
    queryFn: () => OrdersService.getOrderStats(user?.lojaId || '1')
  });

  const updateOrderMutation = useMutation({
    mutationFn: OrdersService.updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      FeedbackService.success('Status do pedido atualizado com sucesso!');
      setUpdateStatusOpen(false);
      setSelectedOrder(null);
      setStatusUpdate({ status: '', trackingCode: '', notes: '' });
    },
    onError: () => {
      FeedbackService.error('Erro ao atualizar status do pedido');
    }
  });

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setStatusUpdate({
      status: order.status,
      trackingCode: order.trackingCode || '',
      notes: ''
    });
    setUpdateStatusOpen(true);
  };

  const handleSubmitStatusUpdate = () => {
    if (!selectedOrder || !statusUpdate.status) {
      FeedbackService.error('Selecione um status válido');
      return;
    }

    updateOrderMutation.mutate({
      orderId: selectedOrder.id,
      status: statusUpdate.status,
      trackingCode: statusUpdate.trackingCode,
      notes: statusUpdate.notes
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      const diffTime = today.getTime() - orderDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today': return diffDays <= 1;
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': { variant: 'warning' as const, label: 'Pendente', icon: Clock },
      'confirmed': { variant: 'default' as const, label: 'Confirmado', icon: CheckCircle },
      'processing': { variant: 'default' as const, label: 'Processando', icon: Package },
      'shipped': { variant: 'default' as const, label: 'Enviado', icon: Truck },
      'delivered': { variant: 'success' as const, label: 'Entregue', icon: CheckCircle },
      'cancelled': { variant: 'destructive' as const, label: 'Cancelado', icon: X },
      'returned': { variant: 'secondary' as const, label: 'Devolvido', icon: ArrowDownRight }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      'pending': { variant: 'warning' as const, label: 'Pendente' },
      'paid': { variant: 'success' as const, label: 'Pago' },
      'failed': { variant: 'destructive' as const, label: 'Falhou' },
      'refunded': { variant: 'secondary' as const, label: 'Reembolsado' }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const exportOrders = () => {
    // Implementar exportação
    FeedbackService.success('Exportação iniciada!');
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
                Pedidos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie todos os pedidos da sua loja
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportOrders}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {orderStats?.totalOrders || 0}
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receita Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(orderStats?.totalRevenue || 0)}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {orderStats?.pendingOrders || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(orderStats?.averageTicket || 0)}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all-orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all-orders">Todos os Pedidos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="processing">Em Processamento</TabsTrigger>
              <TabsTrigger value="shipped">Enviados</TabsTrigger>
              <TabsTrigger value="completed">Concluídos</TabsTrigger>
            </TabsList>

            <TabsContent value="all-orders" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar pedidos..."
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
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-48">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orders Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {order.id}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {order.customer.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {order.customer.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{order.createdAt}</div>
                              <div className="text-gray-500">{order.createdTime}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(order.total)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateStatus(order)}
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs would filter orders by status */}
            <TabsContent value="pending">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">Pedidos pendentes de confirmação...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="processing">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">Pedidos em processamento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipped">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">Pedidos enviados...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">Pedidos concluídos...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Order Details Modal */}
          <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes do Pedido {selectedOrder?.id}</DialogTitle>
                <DialogDescription>
                  Informações completas do pedido
                </DialogDescription>
              </DialogHeader>

              {selectedOrder && (
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Status do Pedido</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {getStatusBadge(selectedOrder.status)}
                          <p className="text-sm text-gray-600">
                            Criado em {selectedOrder.createdAt}
                          </p>
                          {selectedOrder.trackingCode && (
                            <p className="text-sm">
                              <strong>Rastreamento:</strong> {selectedOrder.trackingCode}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Pagamento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                          <p className="text-sm text-gray-600">
                            {selectedOrder.paymentMethod}
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(selectedOrder.total)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Entrega</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Método:</strong> {selectedOrder.shippingMethod}
                          </p>
                          <p className="text-sm">
                            <strong>Prazo:</strong> {selectedOrder.estimatedDelivery}
                          </p>
                          <p className="text-sm font-semibold">
                            Frete: {formatCurrency(selectedOrder.shippingCost)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Customer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informações do Cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Dados Pessoais</h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Nome:</strong> {selectedOrder.customer.name}</p>
                            <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                            <p><strong>Telefone:</strong> {selectedOrder.customer.phone}</p>
                            <p><strong>CPF:</strong> {selectedOrder.customer.document}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Endereço de Entrega</h4>
                          <div className="text-sm">
                            <p>{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.number}</p>
                            {selectedOrder.shippingAddress.complement && (
                              <p>{selectedOrder.shippingAddress.complement}</p>
                            )}
                            <p>{selectedOrder.shippingAddress.neighborhood}</p>
                            <p>{selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.state}</p>
                            <p>CEP: {selectedOrder.shippingAddress.zipCode}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Itens do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                            <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.productName}</h4>
                              <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                              <p className="text-sm text-gray-600">
                                Quantidade: {item.quantity} x {formatCurrency(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatCurrency(item.quantity * item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div className="border-t pt-4 mt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(selectedOrder.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Frete:</span>
                            <span>{formatCurrency(selectedOrder.shippingCost)}</span>
                          </div>
                          {selectedOrder.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Desconto:</span>
                              <span>-{formatCurrency(selectedOrder.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(selectedOrder.total)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setOrderDetailsOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  setOrderDetailsOpen(false);
                  handleUpdateStatus(selectedOrder);
                }}>
                  Atualizar Status
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Update Status Modal */}
          <Dialog open={updateStatusOpen} onOpenChange={setUpdateStatusOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atualizar Status do Pedido</DialogTitle>
                <DialogDescription>
                  Pedido: {selectedOrder?.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Novo Status</Label>
                  <Select 
                    value={statusUpdate.status} 
                    onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="returned">Devolvido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(statusUpdate.status === 'shipped' || statusUpdate.status === 'delivered') && (
                  <div>
                    <Label htmlFor="trackingCode">Código de Rastreamento</Label>
                    <Input
                      id="trackingCode"
                      value={statusUpdate.trackingCode}
                      onChange={(e) => setStatusUpdate(prev => ({ ...prev, trackingCode: e.target.value }))}
                      placeholder="Digite o código de rastreamento"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Adicione observações sobre a atualização..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setUpdateStatusOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmitStatusUpdate}
                  disabled={updateOrderMutation.isPending}
                >
                  {updateOrderMutation.isPending ? 'Atualizando...' : 'Atualizar Status'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppShell>
    </RoleGuard>
  );
}