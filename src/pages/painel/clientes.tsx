import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  Filter,
  Download,
  Eye,
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
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { ErrorState, IconButton, PageLoader, PageHeader } from '@/components/PageStates';
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
import { ClientsService, Client } from '@/services/ClientsService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

export function ClientesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);

  const { user } = useAuth();

  const { data: clients = [], isLoading, error: loadError0, refetch: reload0 } = useQuery({
    queryKey: ['clients', user?.lojaId],
    queryFn: () => ClientsService.getClients()
  });

  const { data: clientStats, error: loadError1, refetch: reload1 } = useQuery({
    queryKey: ['client-stats', user?.lojaId],
    queryFn: () => ClientsService.getClientStats()
  });

  const exportClientsMutation = useMutation({
    mutationFn: async () => ClientsService.exportClients(filteredClients),
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

  const handleViewClient = (client: Client) => {
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

  const getClientSegment = (client: Client) => {
    if (client.totalSpent > 10000) return { label: 'VIP', color: 'bg-info-muted text-info' };
    if (client.totalSpent > 5000) return { label: 'Premium', color: 'bg-info-muted text-info' };
    if (client.totalOrders > 5) return { label: 'Fidelizado', color: 'bg-success-muted text-success' };
    if (client.totalOrders === 1) return { label: 'Novo', color: 'bg-warning-muted text-warning' };
    return { label: 'Regular', color: 'bg-muted text-foreground' };
  };

  if (isLoading) {
    return <PageLoader />;
  }

  const loadError = loadError0 || loadError1;
  if (loadError) return <ErrorState error={loadError} onRetry={() => { reload0(); reload1(); }} />;

  return (
    <div className="space-y-6">
          <PageHeader
            title="Clientes"
            description="Gerencie sua base de clientes e relacionamento"
            actions={<>
              <Button variant="outline" onClick={handleExportClients} disabled={exportClientsMutation.isPending}>
                <Download className="h-4 w-4 mr-2" />
                {exportClientsMutation.isPending ? 'Exportando...' : 'Exportar'}
              </Button>
            </>}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard title="Total de Clientes" value={clientStats?.totalClients || 0} icon={Users} />

            <MetricCard title="Clientes Ativos" value={clientStats?.activeClients || 0} icon={Star} />

            <MetricCard title="Novos (Este Mês)" value={clientStats?.newClientsThisMonth || 0} icon={UserPlus} />

            <MetricCard title="Ticket Médio" value={formatCurrency(clientStats?.averageTicket || 0)} icon={DollarSign} />
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                                  <div className="font-medium text-foreground">
                                    {client.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {client.document}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  {client.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  {client.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{client.totalOrders}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-success">
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
                                  <IconButton label={`Ações para ${client.name}`} icon={MoreHorizontal} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewClient(client)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalhes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <a href={`mailto:${client.email}`}>
                                      <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                                      Enviar e-mail
                                    </a>
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
                  <p className="text-muted-foreground">Clientes ativos...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vip">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Clientes VIP...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Novos clientes...</p>
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
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
                              <p className="text-sm text-muted-foreground">{selectedClient.document}</p>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {selectedClient.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {selectedClient.phone}
                            </div>
                            {selectedClient.birthDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
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
                            <span className="text-sm text-muted-foreground">Total de Pedidos:</span>
                            <span className="font-medium">{selectedClient.totalOrders}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Gasto:</span>
                            <span className="font-medium text-success">
                              {formatCurrency(selectedClient.totalSpent)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Ticket Médio:</span>
                            <span className="font-medium">
                              {formatCurrency(selectedClient.averageTicket)}
                            </span>
                          </div>
                          {selectedClient.lastOrderDate && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Último Pedido:</span>
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
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
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
                              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
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
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
  );
}