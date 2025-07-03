import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Store, 
  Eye, 
  Check, 
  X, 
  Search, 
  Filter,
  Download,
  AlertTriangle,
  Ban,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  User,
  LogOut,
  ChevronDown,
  Shield,
  ShoppingBag,
  Flag,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleGuard } from '@/components/RoleGuard';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface Store {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'SUSPENSA';
  createdAt: Date;
  owner: string;
  documentos?: Array<{
    id: string;
    tipo: string;
    url: string;
    dataEnvio: Date;
    status: 'PENDENTE' | 'VERIFICADO' | 'REJEITADO';
  }>;
  advertencias?: Array<{
    id: string;
    motivo: string;
    data: Date;
    resolvido: boolean;
  }>;
}

export function AdminStoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'warn' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [storeDetailsOpen, setStoreDetailsOpen] = useState(false);
  const [userSwitcherOpen, setUserSwitcherOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Mock data - em produção viria de uma API
  const stores: Store[] = [
    {
      id: '1',
      nomeFantasia: 'TechStore Premium',
      razaoSocial: 'TechStore Premium Comércio de Eletrônicos LTDA',
      cnpj: '12.345.678/0001-90',
      email: 'lojista@neoxstore.com',
      status: 'APROVADA',
      createdAt: new Date('2024-01-15'),
      owner: 'João Silva',
      documentos: [
        {
          id: 'doc1',
          tipo: 'Cartão CNPJ',
          url: 'https://example.com/doc1.pdf',
          dataEnvio: new Date('2024-01-14'),
          status: 'VERIFICADO'
        },
        {
          id: 'doc2',
          tipo: 'Contrato Social',
          url: 'https://example.com/doc2.pdf',
          dataEnvio: new Date('2024-01-14'),
          status: 'VERIFICADO'
        }
      ]
    },
    {
      id: '2',
      nomeFantasia: 'Moda & Estilo',
      razaoSocial: 'Moda e Estilo Confecções LTDA',
      cnpj: '98.765.432/0001-10',
      email: 'contato@modaestilo.com',
      status: 'PENDENTE',
      createdAt: new Date('2024-01-20'),
      owner: 'Maria Santos',
      documentos: [
        {
          id: 'doc3',
          tipo: 'Cartão CNPJ',
          url: 'https://example.com/doc3.pdf',
          dataEnvio: new Date('2024-01-20'),
          status: 'PENDENTE'
        }
      ]
    },
    {
      id: '3',
      nomeFantasia: 'Casa & Decoração',
      razaoSocial: 'Casa e Decoração Móveis LTDA',
      cnpj: '11.222.333/0001-44',
      email: 'vendas@casadecor.com',
      status: 'PENDENTE',
      createdAt: new Date('2024-01-22'),
      owner: 'Pedro Costa',
      documentos: [
        {
          id: 'doc4',
          tipo: 'Cartão CNPJ',
          url: 'https://example.com/doc4.pdf',
          dataEnvio: new Date('2024-01-22'),
          status: 'PENDENTE'
        },
        {
          id: 'doc5',
          tipo: 'Contrato Social',
          url: 'https://example.com/doc5.pdf',
          dataEnvio: new Date('2024-01-22'),
          status: 'PENDENTE'
        }
      ]
    },
    {
      id: '4',
      nomeFantasia: 'Esporte Total',
      razaoSocial: 'Esporte Total Artigos Esportivos LTDA',
      cnpj: '44.333.222/0001-11',
      email: 'contato@esportetotal.com',
      status: 'SUSPENSA',
      createdAt: new Date('2023-12-10'),
      owner: 'Ana Oliveira',
      documentos: [
        {
          id: 'doc6',
          tipo: 'Cartão CNPJ',
          url: 'https://example.com/doc6.pdf',
          dataEnvio: new Date('2023-12-09'),
          status: 'VERIFICADO'
        }
      ],
      advertencias: [
        {
          id: 'adv1',
          motivo: 'Venda de produtos falsificados',
          data: new Date('2024-01-05'),
          resolvido: false
        },
        {
          id: 'adv2',
          motivo: 'Publicação de conteúdo inadequado',
          data: new Date('2023-12-20'),
          resolvido: true
        }
      ]
    }
  ];

  const updateStoreMutation = useMutation({
    mutationFn: async ({ storeId, status, reason }: { storeId: string; status: string; reason?: string }) => {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { storeId, status, reason };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      FeedbackService.success(`Loja ${data.status.toLowerCase()} com sucesso!`);
      setSelectedStore(null);
      setActionType(null);
      setActionModalOpen(false);
      setActionReason('');
    },
    onError: () => {
      FeedbackService.error('Erro ao atualizar status da loja');
    }
  });

  const addWarningMutation = useMutation({
    mutationFn: async ({ storeId, reason }: { storeId: string; reason: string }) => {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { storeId, reason };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      FeedbackService.success('Advertência enviada com sucesso!');
      setSelectedStore(null);
      setActionType(null);
      setActionModalOpen(false);
      setActionReason('');
    },
    onError: () => {
      FeedbackService.error('Erro ao enviar advertência');
    }
  });

  const handleAction = (store: Store, action: 'approve' | 'reject' | 'suspend' | 'warn') => {
    setSelectedStore(store);
    setActionType(action);
    setActionModalOpen(true);
  };

  const confirmAction = () => {
    if (!selectedStore || !actionType) return;

    if (actionType === 'warn') {
      if (!actionReason) {
        FeedbackService.error('Informe o motivo da advertência');
        return;
      }
      
      addWarningMutation.mutate({
        storeId: selectedStore.id,
        reason: actionReason
      });
      return;
    }

    const statusMap = {
      approve: 'APROVADA',
      reject: 'REJEITADA',
      suspend: 'SUSPENSA'
    };

    if ((actionType === 'reject' || actionType === 'suspend') && !actionReason) {
      FeedbackService.error('Informe o motivo da ação');
      return;
    }

    updateStoreMutation.mutate({
      storeId: selectedStore.id,
      status: statusMap[actionType],
      reason: actionReason
    });
  };

  const handleViewStore = (store: Store) => {
    setSelectedStore(store);
    setStoreDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'PENDENTE': { variant: 'warning' as const, label: 'Pendente' },
      'APROVADA': { variant: 'success' as const, label: 'Aprovada' },
      'REJEITADA': { variant: 'destructive' as const, label: 'Rejeitada' },
      'SUSPENSA': { variant: 'secondary' as const, label: 'Suspensa' }
    };

    const config = variants[status as keyof typeof variants] || variants.PENDENTE;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getDocumentStatusBadge = (status: string) => {
    const variants = {
      'PENDENTE': { variant: 'warning' as const, label: 'Pendente' },
      'VERIFICADO': { variant: 'success' as const, label: 'Verificado' },
      'REJEITADO': { variant: 'destructive' as const, label: 'Rejeitado' }
    };

    const config = variants[status as keyof typeof variants] || variants.PENDENTE;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = searchQuery === '' ||
      store.nomeFantasia.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.razaoSocial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.cnpj.includes(searchQuery) ||
      store.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getActionText = () => {
    switch (actionType) {
      case 'approve': return 'aprovar';
      case 'reject': return 'rejeitar';
      case 'suspend': return 'suspender';
      case 'warn': return 'advertir';
      default: return '';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleSwitchUser = (role: string) => {
    setUserSwitcherOpen(false);
    
    if (role === 'admin') {
      // Already in admin
      return;
    } else if (role === 'empreendedor') {
      navigate('/painel/dashboard');
    } else if (role === 'cliente') {
      navigate('/cliente');
    } else {
      navigate('/auth');
    }
  };

  return (
    <RoleGuard requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link to="/admin/lojas" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">NeoxStore Admin</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Tabs defaultValue="stores" className="w-[400px]">
                  <TabsList>
                    <TabsTrigger value="stores" asChild>
                      <Link to="/admin/lojas" className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span>Lojas</span>
                      </Link>
                    </TabsTrigger>
                    <TabsTrigger value="videos" asChild>
                      <Link to="/admin/videos" className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span>Vídeos</span>
                      </Link>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <DropdownMenu open={userSwitcherOpen} onOpenChange={setUserSwitcherOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">Administrador</span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="flex items-center gap-2" onSelect={() => handleSwitchUser('admin')}>
                      <Shield className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Administrador</span>
                        <span className="text-xs text-muted-foreground">Gerenciar plataforma</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2" onSelect={() => handleSwitchUser('empreendedor')}>
                      <Store className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Empreendedor</span>
                        <span className="text-xs text-muted-foreground">Gerenciar loja</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2" onSelect={() => handleSwitchUser('cliente')}>
                      <ShoppingBag className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Cliente</span>
                        <span className="text-xs text-muted-foreground">Comprar produtos</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 text-red-600" onSelect={() => setLogoutConfirmOpen(true)}>
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Supervisão de Lojas</h1>
            <p className="text-gray-600 mt-1">
              Supervisione e modere as lojas da plataforma para garantir qualidade aos clientes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Lojas</p>
                    <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
                  </div>
                  <Store className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stores.filter(s => s.status === 'PENDENTE').length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aprovadas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stores.filter(s => s.status === 'APROVADA').length}
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Suspensas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stores.filter(s => s.status === 'SUSPENSA').length}
                    </p>
                  </div>
                  <Ban className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar lojas..."
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
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="APROVADA">Aprovada</SelectItem>
                <SelectItem value="REJEITADA">Rejeitada</SelectItem>
                <SelectItem value="SUSPENSA">Suspensa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stores Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lojas ({filteredStores.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loja</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{store.nomeFantasia}</div>
                          <div className="text-sm text-gray-500">{store.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{store.owner}</TableCell>
                      <TableCell className="font-mono text-sm">{store.cnpj}</TableCell>
                      <TableCell>{getStatusBadge(store.status)}</TableCell>
                      <TableCell>{store.createdAt.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {store.status === 'PENDENTE' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(store, 'approve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(store, 'reject')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </>
                          )}
                          {store.status === 'APROVADA' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(store, 'warn')}
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Advertir
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(store, 'suspend')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Suspender
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewStore(store)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Store Details Modal */}
          <Dialog open={storeDetailsOpen} onOpenChange={setStoreDetailsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes da Loja</DialogTitle>
                <DialogDescription>
                  Informações completas da loja
                </DialogDescription>
              </DialogHeader>

              {selectedStore && (
                <div className="space-y-6">
                  {/* Store Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Informações Básicas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nome Fantasia</p>
                          <p className="font-medium">{selectedStore.nomeFantasia}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Razão Social</p>
                          <p className="font-medium">{selectedStore.razaoSocial}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">CNPJ</p>
                          <p className="font-medium">{selectedStore.cnpj}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <div className="mt-1">{getStatusBadge(selectedStore.status)}</div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                          <p className="font-medium">{selectedStore.createdAt.toLocaleDateString('pt-BR')}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Contato</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Proprietário</p>
                          <p className="font-medium">{selectedStore.owner}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{selectedStore.email}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Telefone</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">(11) 99999-9999</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="pt-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Enviar Mensagem
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Documents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Documentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedStore.documentos?.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium">{doc.tipo}</p>
                                <p className="text-sm text-gray-500">
                                  Enviado em {doc.dataEnvio.toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getDocumentStatusBadge(doc.status)}
                              <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Warnings */}
                  {selectedStore.advertencias && selectedStore.advertencias.length > 0 && (
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-yellow-800">
                          <AlertTriangle className="h-5 w-5" />
                          Advertências
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedStore.advertencias.map((adv) => (
                            <div key={adv.id} className="p-4 border border-yellow-200 rounded-lg bg-white">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="font-medium">{adv.motivo}</p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <p>Data: {adv.data.toLocaleDateString('pt-BR')}</p>
                                    <Badge variant={adv.resolvido ? 'success' : 'warning'}>
                                      {adv.resolvido ? 'Resolvido' : 'Pendente'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setStoreDetailsOpen(false)}>
                      Fechar
                    </Button>
                    {selectedStore.status === 'PENDENTE' && (
                      <>
                        <Button 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setStoreDetailsOpen(false);
                            handleAction(selectedStore, 'reject');
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                        <Button 
                          onClick={() => {
                            setStoreDetailsOpen(false);
                            handleAction(selectedStore, 'approve');
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                      </>
                    )}
                    {selectedStore.status === 'APROVADA' && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setStoreDetailsOpen(false);
                            handleAction(selectedStore, 'warn');
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Advertir
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            setStoreDetailsOpen(false);
                            handleAction(selectedStore, 'suspend');
                          }}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspender
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Action Confirmation Modal */}
          <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Ação</DialogTitle>
                <DialogDescription>
                  {selectedStore && (
                    <>
                      Tem certeza que deseja {getActionText()} a loja "{selectedStore.nomeFantasia}"?
                      {(actionType === 'reject' || actionType === 'suspend') && (
                        <> Esta ação pode afetar a capacidade da loja de operar na plataforma.</>
                      )}
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              {(actionType === 'reject' || actionType === 'suspend' || actionType === 'warn') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo (obrigatório)</Label>
                    <Textarea
                      id="reason"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder={`Informe o motivo para ${getActionText()} a loja...`}
                      rows={3}
                    />
                  </div>
                  
                  {actionType === 'warn' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Informações sobre advertências
                          </p>
                          <ul className="text-sm text-yellow-700 mt-1 space-y-1 list-disc list-inside">
                            <li>A loja receberá uma notificação por email</li>
                            <li>Múltiplas advertências podem resultar em suspensão</li>
                            <li>A loja terá 7 dias para resolver o problema</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setActionModalOpen(false);
                  setActionReason('');
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmAction}
                  disabled={(actionType === 'reject' || actionType === 'suspend' || actionType === 'warn') && !actionReason}
                  variant={actionType === 'approve' ? 'default' : 'destructive'}
                >
                  {updateStoreMutation.isPending || addWarningMutation.isPending
                    ? 'Processando...' 
                    : `Confirmar ${getActionText()}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Logout Confirmation Dialog */}
          <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Logout</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja sair do painel administrativo?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Confirmar Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </RoleGuard>
  );
}