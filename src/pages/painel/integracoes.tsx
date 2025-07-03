import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Zap, 
  Plus, 
  Search, 
  CreditCard,
  Truck,
  BarChart3,
  Megaphone,
  Database,
  Users,
  Check,
  X,
  AlertTriangle,
  Settings,
  ExternalLink,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  RefreshCw,
  Globe,
  Key,
  Lock,
  Copy
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { IntegrationsService } from '@/services/IntegrationsService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';

export function IntegracoesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [carrierModalOpen, setCarrierModalOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const [webhookData, setWebhookData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    isActive: true,
    secret: ''
  });
  const [showSecret, setShowSecret] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: gateways = [], isLoading: gatewaysLoading } = useQuery({
    queryKey: ['payment-gateways', user?.lojaId],
    queryFn: () => IntegrationsService.getPaymentGateways(user?.lojaId || '1')
  });

  const { data: carriers = [], isLoading: carriersLoading } = useQuery({
    queryKey: ['shipping-carriers', user?.lojaId],
    queryFn: () => IntegrationsService.getShippingCarriers(user?.lojaId || '1')
  });

  const { data: integrations = [], isLoading: integrationsLoading } = useQuery({
    queryKey: ['integrations', user?.lojaId],
    queryFn: () => IntegrationsService.getIntegrations(user?.lojaId || '1')
  });

  const { data: webhooks = [], isLoading: webhooksLoading } = useQuery({
    queryKey: ['webhooks', user?.lojaId],
    queryFn: () => IntegrationsService.getWebhooks(user?.lojaId || '1')
  });

  const updateGatewayMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      IntegrationsService.updateGateway(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
      FeedbackService.success('Gateway atualizado com sucesso!');
    },
    onError: () => {
      FeedbackService.error('Erro ao atualizar gateway');
    }
  });

  const updateCarrierMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      IntegrationsService.updateCarrier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-carriers'] });
      FeedbackService.success('Transportadora atualizada com sucesso!');
    },
    onError: () => {
      FeedbackService.error('Erro ao atualizar transportadora');
    }
  });

  const createWebhookMutation = useMutation({
    mutationFn: IntegrationsService.createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      FeedbackService.success('Webhook criado com sucesso!');
      setWebhookModalOpen(false);
      setWebhookData({
        name: '',
        url: '',
        events: [],
        isActive: true,
        secret: ''
      });
    },
    onError: () => {
      FeedbackService.error('Erro ao criar webhook');
    }
  });

  const testWebhookMutation = useMutation({
    mutationFn: IntegrationsService.testWebhook,
    onSuccess: (data) => {
      if (data.success) {
        FeedbackService.success(data.message);
      } else {
        FeedbackService.error(data.message);
      }
      setTestingWebhook(false);
    },
    onError: () => {
      FeedbackService.error('Erro ao testar webhook');
      setTestingWebhook(false);
    }
  });

  const handleToggleGateway = (id: string, isActive: boolean) => {
    updateGatewayMutation.mutate({
      id,
      data: { isActive: !isActive }
    });
  };

  const handleToggleCarrier = (id: string, isActive: boolean) => {
    updateCarrierMutation.mutate({
      id,
      data: { isActive: !isActive }
    });
  };

  const handleCreateWebhook = () => {
    if (!webhookData.name || !webhookData.url || webhookData.events.length === 0) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }

    createWebhookMutation.mutate(webhookData);
  };

  const handleTestWebhook = (id: string) => {
    setTestingWebhook(true);
    testWebhookMutation.mutate(id);
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setWebhookData(prev => ({ ...prev, secret: result }));
  };

  const availableGateways = IntegrationsService.getAvailableGateways();
  const availableCarriers = IntegrationsService.getAvailableCarriers();

  const webhookEvents = [
    { value: 'order.created', label: 'Pedido Criado' },
    { value: 'order.updated', label: 'Pedido Atualizado' },
    { value: 'order.cancelled', label: 'Pedido Cancelado' },
    { value: 'payment.received', label: 'Pagamento Recebido' },
    { value: 'payment.failed', label: 'Pagamento Falhou' },
    { value: 'product.created', label: 'Produto Criado' },
    { value: 'product.updated', label: 'Produto Atualizado' },
    { value: 'product.deleted', label: 'Produto Excluído' },
    { value: 'customer.created', label: 'Cliente Criado' },
    { value: 'customer.updated', label: 'Cliente Atualizado' }
  ];

  if (gatewaysLoading || carriersLoading || integrationsLoading || webhooksLoading) {
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
                Integrações
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie gateways de pagamento, transportadoras e outras integrações
              </p>
            </div>
          </div>

          <Tabs defaultValue="gateways" className="space-y-6">
            <TabsList>
              <TabsTrigger value="gateways" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Gateways
              </TabsTrigger>
              <TabsTrigger value="carriers" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Transportadoras
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Integrações
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Webhooks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gateways" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar gateways..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Button onClick={() => setGatewayModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Gateway
                </Button>
              </div>

              {/* Payment Gateways */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {gateways.map((gateway) => (
                  <Card key={gateway.id} className={gateway.isActive ? '' : 'opacity-70'}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{gateway.name}</CardTitle>
                        <Badge variant={gateway.isActive ? 'success' : 'secondary'}>
                          {gateway.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {gateway.provider} - {gateway.type === 'credit_card' ? 'Cartão de Crédito' : 
                                            gateway.type === 'pix' ? 'PIX' : 
                                            gateway.type === 'boleto' ? 'Boleto' : 
                                            gateway.type === 'wallet' ? 'Carteira Digital' : 
                                            gateway.type === 'crypto' ? 'Criptomoeda' : 'Múltiplos'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Taxa Cartão de Crédito</p>
                            <p className="font-medium">{gateway.fees.creditCard}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Taxa Cartão de Débito</p>
                            <p className="font-medium">{gateway.fees.debitCard}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Taxa PIX</p>
                            <p className="font-medium">{gateway.fees.pix}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Taxa Boleto</p>
                            <p className="font-medium">{gateway.fees.boleto}%</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            Ambiente: <span className="font-medium capitalize">{gateway.config.environment}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button 
                              variant={gateway.isActive ? 'destructive' : 'outline'} 
                              size="sm"
                              onClick={() => handleToggleGateway(gateway.id, gateway.isActive)}
                            >
                              {gateway.isActive ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ativar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="carriers" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar transportadoras..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Button onClick={() => setCarrierModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transportadora
                </Button>
              </div>

              {/* Shipping Carriers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {carriers.map((carrier) => (
                  <Card key={carrier.id} className={carrier.isActive ? '' : 'opacity-70'}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{carrier.name}</CardTitle>
                        <Badge variant={carrier.isActive ? 'success' : 'secondary'}>
                          {carrier.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {carrier.type === 'correios' ? 'Correios' : 
                         carrier.type === 'transportadora' ? 'Transportadora' : 
                         carrier.type === 'motoboy' ? 'Motoboy' : 
                         carrier.type === 'retirada' ? 'Retirada na Loja' : 'Outro'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Serviços</p>
                          <div className="flex flex-wrap gap-2">
                            {carrier.config.services.map((service, index) => (
                              <Badge key={index} variant="outline">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Cobertura</p>
                          <div className="flex flex-wrap gap-2">
                            {carrier.coverage.regions.map((region, index) => (
                              <Badge key={index} variant="secondary">
                                {region}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Peso Máximo</p>
                            <p className="font-medium">{carrier.coverage.maxWeight} kg</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Dimensões Máximas</p>
                            <p className="font-medium">
                              {carrier.coverage.maxDimensions.length} x {carrier.coverage.maxDimensions.width} x {carrier.coverage.maxDimensions.height} cm
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            Código: <span className="font-medium">{carrier.code}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button 
                              variant={carrier.isActive ? 'destructive' : 'outline'} 
                              size="sm"
                              onClick={() => handleToggleCarrier(carrier.id, carrier.isActive)}
                            >
                              {carrier.isActive ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ativar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Integrações Disponíveis
                </h3>
              </div>

              {/* Integrations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration) => {
                  let Icon;
                  switch (integration.category) {
                    case 'analytics': Icon = BarChart3; break;
                    case 'marketing': Icon = Megaphone; break;
                    case 'payment': Icon = CreditCard; break;
                    case 'shipping': Icon = Truck; break;
                    case 'erp': Icon = Database; break;
                    case 'crm': Icon = Users; break;
                    default: Icon = Zap;
                  }
                  
                  return (
                    <Card key={integration.id} className={integration.isActive ? '' : 'opacity-70'}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                          </div>
                          <Badge variant={integration.isActive ? 'success' : 'secondary'}>
                            {integration.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <CardDescription>
                          {integration.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-sm text-gray-500">
                            Provedor: <span className="font-medium">{integration.provider}</span>
                          </div>
                          
                          {integration.lastSync && (
                            <div className="text-sm text-gray-500">
                              Última sincronização: <span className="font-medium">
                                {new Date(integration.lastSync).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          )}
                          
                          <div className="pt-4 border-t flex justify-between items-center">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Configurar
                            </Button>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visitar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar webhooks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Button onClick={() => setWebhookModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Webhook
                </Button>
              </div>

              {/* Webhooks Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Eventos</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Estatísticas</TableHead>
                        <TableHead>Última Execução</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhooks.map((webhook) => (
                        <TableRow key={webhook.id}>
                          <TableCell className="font-medium">
                            {webhook.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono truncate max-w-[200px]">
                                {webhook.url}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => navigator.clipboard.writeText(webhook.url)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {webhook.events.slice(0, 2).map((event, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {event}
                                </Badge>
                              ))}
                              {webhook.events.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{webhook.events.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={webhook.isActive ? 'success' : 'secondary'}>
                              {webhook.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-green-600" />
                                <span>{webhook.successCount} sucessos</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <X className="h-3 w-3 text-red-600" />
                                <span>{webhook.errorCount} erros</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {webhook.lastTriggered ? (
                              <div className="text-sm">
                                {new Date(webhook.lastTriggered).toLocaleString('pt-BR')}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Nunca executado</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTestWebhook(webhook.id)}
                                disabled={testingWebhook}
                              >
                                {testingWebhook ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Testar
                                  </>
                                )}
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
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
          </Tabs>

          {/* Gateway Modal */}
          <Dialog open={gatewayModalOpen} onOpenChange={setGatewayModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Gateway de Pagamento</DialogTitle>
                <DialogDescription>
                  Escolha e configure um gateway de pagamento para sua loja
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gateway">Gateway de Pagamento *</Label>
                  <Select 
                    value={selectedGateway} 
                    onValueChange={setSelectedGateway}
                  >
                    <SelectTrigger id="gateway">
                      <SelectValue placeholder="Selecione um gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGateways.map((gateway) => (
                        <SelectItem key={gateway.id} value={gateway.id}>
                          <div>
                            <div className="font-medium">{gateway.name}</div>
                            <div className="text-xs text-gray-500">{gateway.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGateway && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key *</Label>
                      <Input
                        id="api-key"
                        placeholder="Chave de API"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secret-key">Secret Key *</Label>
                      <div className="relative">
                        <Input
                          id="secret-key"
                          type={showSecret ? 'text' : 'password'}
                          placeholder="Chave secreta"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="environment">Ambiente</Label>
                      <Select defaultValue="sandbox">
                        <SelectTrigger id="environment">
                          <SelectValue placeholder="Selecione o ambiente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                          <SelectItem value="production">Produção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Métodos de Pagamento</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="credit-card"
                            defaultChecked
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="credit-card" className="text-sm">
                            Cartão de Crédito
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="debit-card"
                            defaultChecked
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="debit-card" className="text-sm">
                            Cartão de Débito
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="pix"
                            defaultChecked
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="pix" className="text-sm">
                            PIX
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="boleto"
                            defaultChecked
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="boleto" className="text-sm">
                            Boleto
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setGatewayModalOpen(false)}>
                  Cancelar
                </Button>
                <Button disabled={!selectedGateway}>
                  Adicionar Gateway
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Carrier Modal */}
          <Dialog open={carrierModalOpen} onOpenChange={setCarrierModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Transportadora</DialogTitle>
                <DialogDescription>
                  Escolha e configure uma transportadora para sua loja
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="carrier">Transportadora *</Label>
                  <Select 
                    value={selectedCarrier} 
                    onValueChange={setSelectedCarrier}
                  >
                    <SelectTrigger id="carrier">
                      <SelectValue placeholder="Selecione uma transportadora" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCarriers.map((carrier) => (
                        <SelectItem key={carrier.id} value={carrier.id}>
                          <div>
                            <div className="font-medium">{carrier.name}</div>
                            <div className="text-xs text-gray-500">{carrier.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCarrier && (
                  <div className="space-y-4 border-t pt-4">
                    {selectedCarrier === 'correios' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="contract-code">Código Administrativo</Label>
                          <Input
                            id="contract-code"
                            placeholder="Código do contrato com os Correios"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">Senha</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showSecret ? 'text' : 'password'}
                              placeholder="Senha do contrato"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-10 w-10"
                              onClick={() => setShowSecret(!showSecret)}
                            >
                              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Serviços</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="pac"
                                defaultChecked
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                              <Label htmlFor="pac" className="text-sm">
                                PAC
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="sedex"
                                defaultChecked
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                              <Label htmlFor="sedex" className="text-sm">
                                SEDEX
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="sedex10"
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                              <Label htmlFor="sedex10" className="text-sm">
                                SEDEX 10
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="sedex12"
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                              <Label htmlFor="sedex12" className="text-sm">
                                SEDEX 12
                              </Label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedCarrier !== 'correios' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="api-key">API Key</Label>
                          <Input
                            id="api-key"
                            placeholder="Chave de API"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="services">Serviços</Label>
                          <Input
                            id="services"
                            placeholder="Ex: Expressa, Econômica (separados por vírgula)"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Cobertura</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="nacional"
                            defaultChecked
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="nacional" className="text-sm">
                            Nacional
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="sudeste"
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="sudeste" className="text-sm">
                            Sudeste
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="sul"
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="sul" className="text-sm">
                            Sul
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="nordeste"
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <Label htmlFor="nordeste" className="text-sm">
                            Nordeste
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCarrierModalOpen(false)}>
                  Cancelar
                </Button>
                <Button disabled={!selectedCarrier}>
                  Adicionar Transportadora
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Webhook Modal */}
          <Dialog open={webhookModalOpen} onOpenChange={setWebhookModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Webhook</DialogTitle>
                <DialogDescription>
                  Configure um webhook para receber notificações de eventos da sua loja
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Nome do Webhook *</Label>
                  <Input
                    id="webhook-name"
                    value={webhookData.name}
                    onChange={(e) => setWebhookData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Integração com ERP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL do Webhook *</Label>
                  <Input
                    id="webhook-url"
                    value={webhookData.url}
                    onChange={(e) => setWebhookData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://api.seusite.com/webhooks/neoxstore"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="webhook-secret">Secret Key</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={generateSecret}
                      type="button"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Gerar Secret
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="webhook-secret"
                      type={showSecret ? 'text' : 'password'}
                      value={webhookData.secret}
                      onChange={(e) => setWebhookData(prev => ({ ...prev, secret: e.target.value }))}
                      placeholder="Chave secreta para validar webhooks"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    A secret key é usada para verificar a autenticidade dos webhooks recebidos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Eventos *</Label>
                  <div className="grid grid-cols-2 gap-2 border rounded-lg p-4 max-h-60 overflow-y-auto">
                    {webhookEvents.map((event) => (
                      <div key={event.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={event.value}
                          checked={webhookData.events.includes(event.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWebhookData(prev => ({ 
                                ...prev, 
                                events: [...prev.events, event.value] 
                              }));
                            } else {
                              setWebhookData(prev => ({ 
                                ...prev, 
                                events: prev.events.filter(e => e !== event.value) 
                              }));
                            }
                          }}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label htmlFor={event.value} className="text-sm">
                          {event.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-active"
                    checked={webhookData.isActive}
                    onChange={(e) => setWebhookData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <Label htmlFor="is-active" className="text-sm">
                    Ativar webhook imediatamente
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setWebhookModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateWebhook}
                  disabled={createWebhookMutation.isPending}
                >
                  {createWebhookMutation.isPending ? 'Criando...' : 'Criar Webhook'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppShell>
    </RoleGuard>
  );
}