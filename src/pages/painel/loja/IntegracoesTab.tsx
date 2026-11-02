import { useState } from 'react';
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
  Settings,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  RefreshCw,
  Globe,
  Key,
  Copy,
  Info
} from 'lucide-react';
import { PageLoader } from '@/components/PageStates';
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
import {
  IntegrationsService,
  type Integration,
  type PaymentGateway,
  type ShippingCarrier,
  type Webhook,
} from '@/services/IntegrationsService';
import { FeedbackService } from '@/services/FeedbackService';

const GATEWAY_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  pix: 'PIX',
  boleto: 'Boleto',
  wallet: 'Carteira Digital',
  crypto: 'Criptomoeda',
};

const CARRIER_TYPE_LABELS: Record<string, string> = {
  correios: 'Correios',
  transportadora: 'Transportadora',
  motoboy: 'Motoboy',
  retirada: 'Retirada na Loja',
};

const CORREIOS_SERVICES = ['PAC', 'SEDEX', 'SEDEX 10', 'SEDEX 12'];
const REGIONS = ['Nacional', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

const WEBHOOK_EVENTS = [
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

const emptyGateway = {
  editingId: null as string | null,
  provider: '',
  type: '' as PaymentGateway['type'] | '',
  apiKey: '',
  secretKey: '',
  merchantId: '',
  environment: 'sandbox' as 'sandbox' | 'production',
  fees: { creditCard: 0, debitCard: 0, pix: 0, boleto: 0 },
};

const emptyCarrier = {
  editingId: null as string | null,
  code: '',
  contractCode: '',
  password: '',
  apiKey: '',
  services: [] as string[],
  servicesText: '',
  regions: ['Nacional'] as string[],
  maxWeight: 0,
  length: 0,
  width: 0,
  height: 0,
};

const emptyWebhook = { editingId: null as string | null, name: '', url: '', events: [] as string[], isActive: true, secret: '' };

const toggleIn = (list: string[], value: string, checked: boolean) =>
  checked ? [...list, value] : list.filter((v) => v !== value);

const num = (value: string) => Number(value) || 0;

function SecretInput({ id, value, onChange, placeholder }: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete="new-password" />
      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10"
        onClick={() => setShow(!show)} aria-label={show ? 'Ocultar' : 'Mostrar'}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export function IntegracoesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [carrierModalOpen, setCarrierModalOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [gatewayForm, setGatewayForm] = useState(emptyGateway);
  const [carrierForm, setCarrierForm] = useState(emptyCarrier);
  const [webhookData, setWebhookData] = useState(emptyWebhook);
  const [appEditing, setAppEditing] = useState<Integration | null>(null);
  const [appValues, setAppValues] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();
  const onError = (fallback: string) => (error: Error) => FeedbackService.error(error.message || fallback);

  const { data: gateways = [], isLoading: gatewaysLoading } = useQuery({
    queryKey: ['payment-gateways'],
    queryFn: IntegrationsService.getPaymentGateways
  });

  const { data: carriers = [], isLoading: carriersLoading } = useQuery({
    queryKey: ['shipping-carriers'],
    queryFn: IntegrationsService.getShippingCarriers
  });

  const { data: integrations = [], isLoading: integrationsLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: IntegrationsService.getIntegrations
  });

  const { data: webhooks = [], isLoading: webhooksLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: IntegrationsService.getWebhooks
  });

  // ---------- Gateways ----------
  const saveGatewayMutation = useMutation({
    mutationFn: (form: typeof emptyGateway) => {
      const config = { apiKey: form.apiKey, secretKey: form.secretKey, merchantId: form.merchantId, environment: form.environment };
      const type = form.type as PaymentGateway['type'];
      return form.editingId
        ? IntegrationsService.updateGateway(form.editingId, { type, config, fees: form.fees })
        : IntegrationsService.createGateway({ provider: form.provider, type, config, fees: form.fees });
    },
    onSuccess: (_, form) => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
      FeedbackService.success(form.editingId ? 'Gateway atualizado com sucesso!' : 'Gateway adicionado com sucesso!');
      setGatewayModalOpen(false);
    },
    onError: onError('Erro ao salvar gateway')
  });

  const updateGatewayMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => IntegrationsService.updateGateway(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
      FeedbackService.success('Gateway atualizado com sucesso!');
    },
    onError: onError('Erro ao atualizar gateway')
  });

  const deleteGatewayMutation = useMutation({
    mutationFn: IntegrationsService.deleteGateway,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
      FeedbackService.success('Gateway removido');
    },
    onError: onError('Erro ao remover gateway')
  });

  // ---------- Transportadoras ----------
  const saveCarrierMutation = useMutation({
    mutationFn: (form: typeof emptyCarrier) => {
      const isCorreios = form.code === 'correios';
      const services = isCorreios
        ? form.services
        : form.servicesText.split(',').map((s) => s.trim()).filter(Boolean);
      const config = isCorreios
        ? { contractCode: form.contractCode, password: form.password, services }
        : { apiKey: form.apiKey, services };
      const coverage = {
        regions: form.regions,
        maxWeight: form.maxWeight,
        maxDimensions: { length: form.length, width: form.width, height: form.height },
      };
      return form.editingId
        ? IntegrationsService.updateCarrier(form.editingId, { config, coverage })
        : IntegrationsService.createCarrier({ code: form.code, config, coverage });
    },
    onSuccess: (_, form) => {
      queryClient.invalidateQueries({ queryKey: ['shipping-carriers'] });
      FeedbackService.success(form.editingId ? 'Transportadora atualizada com sucesso!' : 'Transportadora adicionada com sucesso!');
      setCarrierModalOpen(false);
    },
    onError: onError('Erro ao salvar transportadora')
  });

  const updateCarrierMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => IntegrationsService.updateCarrier(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-carriers'] });
      FeedbackService.success('Transportadora atualizada com sucesso!');
    },
    onError: onError('Erro ao atualizar transportadora')
  });

  const deleteCarrierMutation = useMutation({
    mutationFn: IntegrationsService.deleteCarrier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-carriers'] });
      FeedbackService.success('Transportadora removida');
    },
    onError: onError('Erro ao remover transportadora')
  });

  // ---------- Integrações ----------
  const saveAppMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: Record<string, string> }) =>
      IntegrationsService.updateIntegration(id, { config }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      FeedbackService.success('Integração configurada com sucesso!');
      setAppEditing(null);
    },
    onError: onError('Erro ao configurar integração')
  });

  const toggleAppMutation = useMutation({
    mutationFn: IntegrationsService.toggleIntegration,
    onSuccess: (app) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      FeedbackService.success(app.isActive ? `${app.name} ativado` : `${app.name} desativado`);
    },
    onError: onError('Erro ao atualizar integração')
  });

  // ---------- Webhooks ----------
  const saveWebhookMutation = useMutation({
    mutationFn: ({ editingId, ...data }: typeof emptyWebhook) =>
      editingId ? IntegrationsService.updateWebhook(editingId, data) : IntegrationsService.createWebhook(data),
    onSuccess: (_, form) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      FeedbackService.success(form.editingId ? 'Webhook atualizado com sucesso!' : 'Webhook criado com sucesso!');
      setWebhookModalOpen(false);
    },
    onError: onError('Erro ao salvar webhook')
  });

  const toggleWebhookMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => IntegrationsService.updateWebhook(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
    onError: onError('Erro ao atualizar webhook')
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: IntegrationsService.deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      FeedbackService.success('Webhook removido');
    },
    onError: onError('Erro ao remover webhook')
  });

  const testWebhookMutation = useMutation({
    mutationFn: IntegrationsService.testWebhook,
    onSuccess: (data) => {
      if (data.success) {
        FeedbackService.success(data.message);
      } else {
        FeedbackService.error(data.message);
      }
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
    onError: onError('Erro ao testar webhook')
  });

  const confirmDelete = (message: string, run: () => void) => {
    if (window.confirm(message)) run();
  };

  const openNewGateway = () => {
    setGatewayForm(emptyGateway);
    setGatewayModalOpen(true);
  };

  const openEditGateway = (g: PaymentGateway) => {
    const providerId = availableGateways.find((a) => a.name === g.provider)?.id ?? '';
    setGatewayForm({
      editingId: g.id,
      provider: providerId,
      type: g.type,
      apiKey: g.config.apiKey ?? '',
      secretKey: g.config.secretKey ?? '',
      merchantId: g.config.merchantId ?? '',
      environment: g.config.environment ?? 'sandbox',
      fees: { ...emptyGateway.fees, ...g.fees },
    });
    setGatewayModalOpen(true);
  };

  const handleSaveGateway = () => {
    if (!gatewayForm.provider || !gatewayForm.type) {
      FeedbackService.error('Selecione o gateway e o tipo de pagamento');
      return;
    }
    saveGatewayMutation.mutate(gatewayForm);
  };

  const openNewCarrier = () => {
    setCarrierForm(emptyCarrier);
    setCarrierModalOpen(true);
  };

  const openEditCarrier = (c: ShippingCarrier) => {
    setCarrierForm({
      editingId: c.id,
      code: c.code,
      contractCode: c.config.contractCode ?? '',
      password: c.config.password ?? '',
      apiKey: c.config.apiKey ?? '',
      services: c.config.services ?? [],
      servicesText: (c.config.services ?? []).join(', '),
      regions: c.coverage.regions ?? [],
      maxWeight: c.coverage.maxWeight ?? 0,
      length: c.coverage.maxDimensions?.length ?? 0,
      width: c.coverage.maxDimensions?.width ?? 0,
      height: c.coverage.maxDimensions?.height ?? 0,
    });
    setCarrierModalOpen(true);
  };

  const openConfigureApp = (app: Integration) => {
    setAppEditing(app);
    setAppValues(Object.fromEntries(app.fields.map((f) => [f.key, String(app.config[f.key] ?? '')])));
  };

  const openNewWebhook = () => {
    setWebhookData(emptyWebhook);
    setWebhookModalOpen(true);
  };

  const openEditWebhook = (w: Webhook) => {
    setWebhookData({ editingId: w.id, name: w.name, url: w.url, events: w.events, isActive: w.isActive, secret: w.secret ?? '' });
    setWebhookModalOpen(true);
  };

  const handleSaveWebhook = () => {
    if (!webhookData.name || !webhookData.url || webhookData.events.length === 0) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (!/^https?:\/\/\S+$/.test(webhookData.url)) {
      FeedbackService.error('A URL deve começar com http:// ou https://');
      return;
    }
    saveWebhookMutation.mutate(webhookData);
  };

  const generateSecret = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    const secret = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    setWebhookData(prev => ({ ...prev, secret }));
    navigator.clipboard?.writeText(secret).catch(() => undefined);
    FeedbackService.success('Secret gerado e copiado. Guarde-o: depois de salvo ele não é exibido novamente.');
  };

  const availableGateways = IntegrationsService.getAvailableGateways();
  const availableCarriers = IntegrationsService.getAvailableCarriers();
  const selectedGatewayCatalog = availableGateways.find((g) => g.id === gatewayForm.provider);

  const q = searchQuery.trim().toLowerCase();
  const matches = (...fields: string[]) => !q || fields.some((f) => f.toLowerCase().includes(q));
  const filteredGateways = gateways.filter((g) => matches(g.name, g.provider));
  const filteredCarriers = carriers.filter((c) => matches(c.name, c.code));
  const filteredWebhooks = webhooks.filter((w) => matches(w.name, w.url));

  if (gatewaysLoading || carriersLoading || integrationsLoading || webhooksLoading) {
    return <PageLoader />;
  }

  const emptyState = (text: string) => (
    <Card className="lg:col-span-2">
      <CardContent className="p-6 text-center text-muted-foreground">{text}</CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
          <Tabs defaultValue="gateways" className="space-y-6">
            <TabsList className="h-auto flex-wrap">
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
              <div className="flex items-start gap-3 rounded-lg border border-info/30 bg-info-muted p-4 text-sm text-info">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <p>
                  Os pagamentos dos pedidos na NEOX são processados pelo Mercado Pago da plataforma. Os gateways abaixo
                  apenas guardam as credenciais da sua loja (criptografadas) para uso em integrações próprias.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar gateways..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button onClick={openNewGateway}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Gateway
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredGateways.length === 0 && emptyState('Nenhum gateway configurado.')}
                {filteredGateways.map((gateway) => (
                  <Card key={gateway.id} className={gateway.isActive ? '' : 'opacity-70'}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{gateway.name}</CardTitle>
                        <Badge variant={gateway.isActive ? 'success' : 'secondary'}>
                          {gateway.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {gateway.provider} - {GATEWAY_TYPE_LABELS[gateway.type] ?? 'Múltiplos'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Taxa Cartão de Crédito</p>
                            <p className="font-medium">{gateway.fees.creditCard}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Taxa Cartão de Débito</p>
                            <p className="font-medium">{gateway.fees.debitCard}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Taxa PIX</p>
                            <p className="font-medium">{gateway.fees.pix}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Taxa Boleto</p>
                            <p className="font-medium">{gateway.fees.boleto}%</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Ambiente: <span className="font-medium">{gateway.config.environment === 'production' ? 'Produção' : 'Sandbox'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditGateway(gateway)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant={gateway.isActive ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => updateGatewayMutation.mutate({ id: gateway.id, isActive: !gateway.isActive })}
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
                            <Button variant="ghost" size="icon" aria-label="Remover gateway"
                              onClick={() => confirmDelete(`Remover o gateway ${gateway.name}?`, () => deleteGatewayMutation.mutate(gateway.id))}>
                              <Trash2 className="h-4 w-4" />
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar transportadoras..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button onClick={openNewCarrier}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transportadora
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCarriers.length === 0 && emptyState('Nenhuma transportadora configurada. O frete do checkout segue as regras de Configurações > Envio.')}
                {filteredCarriers.map((carrier) => (
                  <Card key={carrier.id} className={carrier.isActive ? '' : 'opacity-70'}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{carrier.name}</CardTitle>
                        <Badge variant={carrier.isActive ? 'success' : 'secondary'}>
                          {carrier.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {CARRIER_TYPE_LABELS[carrier.type] ?? 'Outro'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Serviços</p>
                          <div className="flex flex-wrap gap-2">
                            {carrier.config.services.length === 0 && <span className="text-sm text-muted-foreground">Nenhum</span>}
                            {carrier.config.services.map((service, index) => (
                              <Badge key={index} variant="outline">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Cobertura</p>
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
                            <p className="text-sm text-muted-foreground">Peso Máximo</p>
                            <p className="font-medium">{carrier.coverage.maxWeight} kg</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Dimensões Máximas</p>
                            <p className="font-medium">
                              {carrier.coverage.maxDimensions.length} x {carrier.coverage.maxDimensions.width} x {carrier.coverage.maxDimensions.height} cm
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Código: <span className="font-medium">{carrier.code}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditCarrier(carrier)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant={carrier.isActive ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => updateCarrierMutation.mutate({ id: carrier.id, isActive: !carrier.isActive })}
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
                            <Button variant="ghost" size="icon" aria-label="Remover transportadora"
                              onClick={() => confirmDelete(`Remover a transportadora ${carrier.name}?`, () => deleteCarrierMutation.mutate(carrier.id))}>
                              <Trash2 className="h-4 w-4" />
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
                <h3 className="text-lg font-semibold text-foreground">
                  Integrações Disponíveis
                </h3>
              </div>

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
                  const configured = integration.fields.some((f) => integration.config[f.key]);

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
                          <div className="text-sm text-muted-foreground">
                            {configured ? 'Credenciais configuradas' : 'Ainda não configurado'}
                          </div>

                          {integration.lastSync && (
                            <div className="text-sm text-muted-foreground">
                              Última sincronização: <span className="font-medium">
                                {integration.lastSync.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          )}

                          <div className="pt-4 border-t flex justify-between items-center">
                            <Button variant="outline" size="sm" onClick={() => openConfigureApp(integration)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Configurar
                            </Button>
                            <Button
                              variant={integration.isActive ? 'destructive' : 'outline'}
                              size="sm"
                              disabled={!integration.isActive && !configured}
                              title={!integration.isActive && !configured ? 'Configure antes de ativar' : undefined}
                              onClick={() => toggleAppMutation.mutate(integration.id)}
                            >
                              {integration.isActive ? 'Desativar' : 'Ativar'}
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar webhooks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button onClick={openNewWebhook}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Webhook
                </Button>
              </div>

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
                      {filteredWebhooks.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            Nenhum webhook cadastrado.
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredWebhooks.map((webhook) => {
                        const testing = testWebhookMutation.isPending && testWebhookMutation.variables === webhook.id;
                        return (
                          <TableRow key={webhook.id}>
                            <TableCell className="font-medium">
                              {webhook.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="bg-muted px-2 py-1 rounded text-xs font-mono truncate max-w-[200px]">
                                  {webhook.url}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  aria-label="Copiar URL"
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
                              <button
                                type="button"
                                onClick={() => toggleWebhookMutation.mutate({ id: webhook.id, isActive: !webhook.isActive })}
                                title={webhook.isActive ? 'Clique para desativar' : 'Clique para ativar'}
                              >
                                <Badge variant={webhook.isActive ? 'success' : 'secondary'}>
                                  {webhook.isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </button>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-1">
                                  <Check className="h-3 w-3 text-success" />
                                  <span>{webhook.successCount} sucessos</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <X className="h-3 w-3 text-destructive" />
                                  <span>{webhook.errorCount} erros</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {webhook.lastTriggered ? (
                                <div className="text-sm">
                                  {webhook.lastTriggered.toLocaleString('pt-BR')}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">Nunca executado</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testWebhookMutation.mutate(webhook.id)}
                                  disabled={testing}
                                >
                                  {testing ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Testar
                                    </>
                                  )}
                                </Button>
                                <Button variant="ghost" size="icon" aria-label="Editar webhook" onClick={() => openEditWebhook(webhook)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" aria-label="Remover webhook"
                                  onClick={() => confirmDelete(`Remover o webhook ${webhook.name}?`, () => deleteWebhookMutation.mutate(webhook.id))}>
                                  <Trash2 className="h-4 w-4" />
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
              <p className="text-xs text-muted-foreground">
                O teste envia um POST com o evento <code>webhook.test</code>. Quando há secret, o corpo é assinado no
                cabeçalho <code>X-Neox-Signature: sha256=&lt;HMAC-SHA256 do corpo&gt;</code>.
              </p>
            </TabsContent>
          </Tabs>

          {/* Gateway Modal */}
          <Dialog open={gatewayModalOpen} onOpenChange={setGatewayModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{gatewayForm.editingId ? 'Editar Gateway de Pagamento' : 'Adicionar Gateway de Pagamento'}</DialogTitle>
                <DialogDescription>
                  As credenciais são guardadas criptografadas e nunca são exibidas novamente
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gateway">Gateway de Pagamento *</Label>
                  <Select
                    value={gatewayForm.provider}
                    onValueChange={(value) => setGatewayForm((prev) => ({ ...prev, provider: value, type: '' }))}
                    disabled={!!gatewayForm.editingId}
                  >
                    <SelectTrigger id="gateway">
                      <SelectValue placeholder="Selecione um gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGateways.map((gateway) => (
                        <SelectItem key={gateway.id} value={gateway.id}>
                          <div>
                            <div className="font-medium">{gateway.name}</div>
                            <div className="text-xs text-muted-foreground">{gateway.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGatewayCatalog && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="gateway-type">Tipo de Pagamento *</Label>
                      <Select
                        value={gatewayForm.type}
                        onValueChange={(value) => setGatewayForm((prev) => ({ ...prev, type: value as PaymentGateway['type'] }))}
                      >
                        <SelectTrigger id="gateway-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedGatewayCatalog.types.map((t) => (
                            <SelectItem key={t} value={t}>{GATEWAY_TYPE_LABELS[t] ?? t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <SecretInput id="api-key" value={gatewayForm.apiKey} placeholder="Chave de API"
                        onChange={(v) => setGatewayForm((prev) => ({ ...prev, apiKey: v }))} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secret-key">Secret Key</Label>
                      <SecretInput id="secret-key" value={gatewayForm.secretKey} placeholder="Chave secreta"
                        onChange={(v) => setGatewayForm((prev) => ({ ...prev, secretKey: v }))} />
                      {gatewayForm.editingId && (
                        <p className="text-xs text-muted-foreground">Deixe como está para manter a chave atual.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="merchant-id">ID do Lojista (opcional)</Label>
                      <Input id="merchant-id" value={gatewayForm.merchantId}
                        onChange={(e) => setGatewayForm((prev) => ({ ...prev, merchantId: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="environment">Ambiente</Label>
                      <Select
                        value={gatewayForm.environment}
                        onValueChange={(value) => setGatewayForm((prev) => ({ ...prev, environment: value as 'sandbox' | 'production' }))}
                      >
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
                      <Label>Taxas do seu contrato (%)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          ['creditCard', 'Cartão de Crédito'],
                          ['debitCard', 'Cartão de Débito'],
                          ['pix', 'PIX'],
                          ['boleto', 'Boleto'],
                        ] as const).map(([key, label]) => (
                          <div key={key} className="space-y-1">
                            <Label htmlFor={`fee-${key}`} className="text-xs text-muted-foreground">{label}</Label>
                            <Input id={`fee-${key}`} type="number" min="0" max="100" step="0.01"
                              value={gatewayForm.fees[key]}
                              onChange={(e) => setGatewayForm((prev) => ({ ...prev, fees: { ...prev.fees, [key]: num(e.target.value) } }))} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setGatewayModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveGateway} disabled={!gatewayForm.provider || saveGatewayMutation.isPending}>
                  {saveGatewayMutation.isPending ? 'Salvando...' : gatewayForm.editingId ? 'Salvar Gateway' : 'Adicionar Gateway'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Carrier Modal */}
          <Dialog open={carrierModalOpen} onOpenChange={setCarrierModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{carrierForm.editingId ? 'Editar Transportadora' : 'Adicionar Transportadora'}</DialogTitle>
                <DialogDescription>
                  Escolha e configure uma transportadora para sua loja
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="carrier">Transportadora *</Label>
                  <Select
                    value={carrierForm.code}
                    onValueChange={(value) => setCarrierForm((prev) => ({ ...prev, code: value }))}
                    disabled={!!carrierForm.editingId}
                  >
                    <SelectTrigger id="carrier">
                      <SelectValue placeholder="Selecione uma transportadora" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCarriers.map((carrier) => (
                        <SelectItem key={carrier.id} value={carrier.id}>
                          <div>
                            <div className="font-medium">{carrier.name}</div>
                            <div className="text-xs text-muted-foreground">{carrier.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {carrierForm.code && (
                  <div className="space-y-4 border-t pt-4">
                    {carrierForm.code === 'correios' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="contract-code">Código Administrativo</Label>
                          <Input
                            id="contract-code"
                            value={carrierForm.contractCode}
                            onChange={(e) => setCarrierForm((prev) => ({ ...prev, contractCode: e.target.value }))}
                            placeholder="Código do contrato com os Correios"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="carrier-password">Senha</Label>
                          <SecretInput id="carrier-password" value={carrierForm.password} placeholder="Senha do contrato"
                            onChange={(v) => setCarrierForm((prev) => ({ ...prev, password: v }))} />
                        </div>

                        <div className="space-y-2">
                          <Label>Serviços</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {CORREIOS_SERVICES.map((service) => (
                              <div key={service} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`svc-${service}`}
                                  checked={carrierForm.services.includes(service)}
                                  onChange={(e) => setCarrierForm((prev) => ({ ...prev, services: toggleIn(prev.services, service, e.target.checked) }))}
                                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                                />
                                <Label htmlFor={`svc-${service}`} className="text-sm">{service}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="carrier-api-key">API Key</Label>
                          <SecretInput id="carrier-api-key" value={carrierForm.apiKey} placeholder="Chave de API"
                            onChange={(v) => setCarrierForm((prev) => ({ ...prev, apiKey: v }))} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="services">Serviços</Label>
                          <Input
                            id="services"
                            value={carrierForm.servicesText}
                            onChange={(e) => setCarrierForm((prev) => ({ ...prev, servicesText: e.target.value }))}
                            placeholder="Ex: Expressa, Econômica (separados por vírgula)"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Cobertura</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {REGIONS.map((region) => (
                          <div key={region} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`region-${region}`}
                              checked={carrierForm.regions.includes(region)}
                              onChange={(e) => setCarrierForm((prev) => ({ ...prev, regions: toggleIn(prev.regions, region, e.target.checked) }))}
                              className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                            />
                            <Label htmlFor={`region-${region}`} className="text-sm">{region}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {([
                        ['maxWeight', 'Peso máx. (kg)'],
                        ['length', 'Comprimento (cm)'],
                        ['width', 'Largura (cm)'],
                        ['height', 'Altura (cm)'],
                      ] as const).map(([key, label]) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={`dim-${key}`} className="text-xs text-muted-foreground">{label}</Label>
                          <Input id={`dim-${key}`} type="number" min="0" step="0.1" value={carrierForm[key]}
                            onChange={(e) => setCarrierForm((prev) => ({ ...prev, [key]: num(e.target.value) }))} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCarrierModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => saveCarrierMutation.mutate(carrierForm)} disabled={!carrierForm.code || saveCarrierMutation.isPending}>
                  {saveCarrierMutation.isPending ? 'Salvando...' : carrierForm.editingId ? 'Salvar Transportadora' : 'Adicionar Transportadora'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Integration config Modal */}
          <Dialog open={!!appEditing} onOpenChange={(open) => !open && setAppEditing(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Configurar {appEditing?.name}</DialogTitle>
                <DialogDescription>
                  Campos sensíveis são guardados criptografados. Deixe-os como estão para manter o valor atual.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {appEditing?.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`app-${field.key}`}>{field.label}</Label>
                    {field.secret ? (
                      <SecretInput id={`app-${field.key}`} value={appValues[field.key] ?? ''}
                        onChange={(v) => setAppValues((prev) => ({ ...prev, [field.key]: v }))} />
                    ) : (
                      <Input id={`app-${field.key}`} value={appValues[field.key] ?? ''}
                        onChange={(e) => setAppValues((prev) => ({ ...prev, [field.key]: e.target.value }))} />
                    )}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAppEditing(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => appEditing && saveAppMutation.mutate({ id: appEditing.id, config: appValues })}
                  disabled={saveAppMutation.isPending}
                >
                  {saveAppMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Webhook Modal */}
          <Dialog open={webhookModalOpen} onOpenChange={setWebhookModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{webhookData.editingId ? 'Editar Webhook' : 'Novo Webhook'}</DialogTitle>
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
                    placeholder="https://api.seusite.com/webhooks/neox"
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
                  <SecretInput id="webhook-secret" value={webhookData.secret} placeholder="Chave secreta para validar webhooks"
                    onChange={(v) => setWebhookData(prev => ({ ...prev, secret: v }))} />
                  <p className="text-xs text-muted-foreground">
                    A secret key assina os eventos enviados (HMAC-SHA256). Ela não é exibida novamente depois de salva.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Eventos *</Label>
                  <div className="grid grid-cols-2 gap-2 border rounded-lg p-4 max-h-60 overflow-y-auto">
                    {WEBHOOK_EVENTS.map((event) => (
                      <div key={event.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={event.value}
                          checked={webhookData.events.includes(event.value)}
                          onChange={(e) => setWebhookData(prev => ({ ...prev, events: toggleIn(prev.events, event.value, e.target.checked) }))}
                          className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
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
                    className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <Label htmlFor="is-active" className="text-sm">
                    Webhook ativo
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setWebhookModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveWebhook}
                  disabled={saveWebhookMutation.isPending}
                >
                  {saveWebhookMutation.isPending ? 'Salvando...' : webhookData.editingId ? 'Salvar Webhook' : 'Criar Webhook'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
  );
}
