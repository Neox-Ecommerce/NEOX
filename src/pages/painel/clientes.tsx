import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  Star,
  UserPlus,
  Tag,
  MoreHorizontal
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClientsService } from '@/services/ClientsService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

export function ClientesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', user?.lojaId],
    queryFn: () => ClientsService.getClients(user?.lojaId || '1')
  });

  const { data: clientStats } = useQuery({
    queryKey: ['client-stats', user?.lojaId],
    queryFn: () => ClientsService.getClientStats(user?.lojaId || '1')
  });

  const exportClientsMutation = useMutation({
    mutationFn: ClientsService.exportClients,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      FeedbackService.success('Relatório de clientes exportado com sucesso!');
    },
    onError: () => {
      FeedbackService.error('Erro ao exportar relatório de clientes');
    }
  });

  const handleViewClient = (client: any) => {
    setSelectedClient(client);
    setClientDetailsOpen(true);
  };

  const handleExportClients = () => {
    exportClientsMutation.mutate();
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchQuery === '' || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.document.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': { variant: 'success' as const, label: 'Ativo' },
      'inactive': { variant: 'warning' as const, label: 'Inativo' },
      'blocked': { variant: 'destructive' as const, label: 'Bloqueado' }
    };

    const config = variants[status as keyof typeof variants] || variants.active;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getClientSegment = (client: any) => {
    if (client.totalSpent > 10000) return { label: 'VIP', color: 'bg-purple-100 text-purple-800' };
    if (client.totalSpent > 5000) return { label: 'Premium', color: 'bg-blue-100 text-blue-800' };
    if (client.totalOrders > 5) return { label: 'Fidelizado', color: 'bg-green-100 text-green-800' };
    if (client.totalOrders === 1) return { label: 'Novo', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Regular', color: 'bg-gray-100 text-gray-800' };
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
                Clientes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie sua base de clientes e relacionamento
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleExportClients} disabled={exportClientsMutation.isPending}>
                <Download className="h-4 w-4 mr-2" />
                {exportClientsMutation.isPending ? 'Exportando...' : 'Exportar'}
              </Button>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Clientes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {clientStats?.totalClients || 0}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Clientes Ativos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {clientStats?.activeClients || 0}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Novos (Este Mês)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {clientStats?.newClientsThisMonth || 0}
                    </p>
                  </div>
                  <UserPlus className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(clientStats?.averageTicket || 0)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all-clients" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all-clients">Todos os Clientes</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="vip">VIP</TabsTrigger>
              <TabsTrigger value="new">Novos</TabsTrigger>
            </TabsList>

            <TabsContent value="all-clients" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar clientes..."
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
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clients Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Pedidos</TableHead>
                        <TableHead>Total Gasto</TableHead>
                        <TableHead>Ticket Médio</TableHead>
                        <TableHead>Segmento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => {
                        const segment = getClientSegment(client);
                        return (
                          <TableRow key={client.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {client.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {client.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {client.document}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3 text-gray-400" />
                                  {client.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  {client.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <ShoppingBag className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{client.totalOrders}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              {formatCurrency(client.totalSpent)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(client.averageTicket)}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${segment.color}`}>
                                {segment.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(client.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewClient(client)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalhes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Enviar Email
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs would filter clients by segment */}
            <TabsContent value="active">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">Clientes ativos...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vip">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">Clientes VIP...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-600">Novos clientes...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Client Details Modal */}
          <Dialog open={clientDetailsOpen} onOpenChange={setClientDetailsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes do Cliente</DialogTitle>
                <DialogDescription>
                  Informações completas do cliente
                </DialogDescription>
              </DialogHeader>

              {selectedClient && (
                <div className="space-y-6">
                  {/* Client Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Informações Pessoais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-lg font-medium text-primary">
                                {selectedClient.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{selectedClient.name}</p>
                              <p className="text-sm text-gray-500">{selectedClient.document}</p>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {selectedClient.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {selectedClient.phone}
                            </div>
                            {selectedClient.birthDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(selectedClient.birthDate).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Estatísticas de Compra</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total de Pedidos:</span>
                            <span className="font-medium">{selectedClient.totalOrders}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Gasto:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(selectedClient.totalSpent)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Ticket Médio:</span>
                            <span className="font-medium">
                              {formatCurrency(selectedClient.averageTicket)}
                            </span>
                          </div>
                          {selectedClient.lastOrderDate && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Último Pedido:</span>
                              <span className="font-medium">
                                {new Date(selectedClient.lastOrderDate).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Endereço</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p>{selectedClient.address.street}, {selectedClient.address.number}</p>
                              {selectedClient.address.complement && (
                                <p>{selectedClient.address.complement}</p>
                              )}
                              <p>{selectedClient.address.neighborhood}</p>
                              <p>{selectedClient.address.city} - {selectedClient.address.state}</p>
                              <p>CEP: {selectedClient.address.zipCode}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tags and Notes */}
                  {(selectedClient.tags?.length > 0 || selectedClient.notes) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Tags e Observações</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedClient.tags?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Tags:</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedClient.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedClient.notes && (
                            <div>
                              <p className="text-sm font-medium mb-2">Observações:</p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {selectedClient.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setClientDetailsOpen(false)}>
                  Fechar
                </Button>
                <Button>
                  Editar Cliente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppShell>
    </RoleGuard>
  );
}