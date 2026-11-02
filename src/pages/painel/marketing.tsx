import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Megaphone,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Mail,
  MessageSquare,
  Gift,
  UserCheck,
  Copy,
  Bell,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { ErrorState, IconButton, PageLoader, PageHeader } from '@/components/PageStates';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { MarketingService, Campaign, Coupon, Affiliate } from '@/services/MarketingService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

// Transições aceitas pela API (draft -> scheduled exige data de agendamento)
const NEXT_STATUS: Record<Campaign['status'], Campaign['status'][]> = {
  draft: ['active'],
  scheduled: ['draft', 'active', 'paused'],
  active: ['paused', 'completed'],
  paused: ['active', 'completed'],
  completed: [],
};

const STATUS_LABEL: Record<Campaign['status'], string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  active: 'Ativa',
  paused: 'Pausada',
  completed: 'Concluída',
};

const toDateInput = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const matches = (query: string, ...fields: (string | undefined)[]) =>
  !query || fields.some((f) => f?.toLowerCase().includes(query.toLowerCase()));

const EMPTY_COUPON = {
  name: '',
  code: '',
  type: 'percentage' as 'percentage' | 'fixed' | 'shipping',
  value: '',
  minOrderValue: '',
  maxDiscount: '',
  usageLimit: '',
  validFrom: '',
  validUntil: ''
};

const EMPTY_AFFILIATE = { name: '', email: '', phone: '', commissionRate: '', referralCode: '' };

export function MarketingPage() {
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [affiliateModalOpen, setAffiliateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignData, setCampaignData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'push' | 'social',
    subject: '',
    content: '',
    targetAudience: [] as string[],
    scheduledDate: ''
  });
  const [couponData, setCouponData] = useState(EMPTY_COUPON);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [affiliateData, setAffiliateData] = useState(EMPTY_AFFILIATE);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading: campaignsLoading, error: loadError0, refetch: reload0 } = useQuery({
    queryKey: ['campaigns', user?.lojaId],
    queryFn: () => MarketingService.getCampaigns()
  });

  const { data: coupons = [], isLoading: couponsLoading, error: loadError1, refetch: reload1 } = useQuery({
    queryKey: ['coupons', user?.lojaId],
    queryFn: () => MarketingService.getCoupons()
  });

  const { data: affiliates = [], isLoading: affiliatesLoading, error: loadError2, refetch: reload2 } = useQuery({
    queryKey: ['affiliates', user?.lojaId],
    queryFn: () => MarketingService.getAffiliates()
  });

  const { data: marketingStats, error: loadError3, refetch: reload3 } = useQuery({
    queryKey: ['marketing-stats', user?.lojaId],
    queryFn: () => MarketingService.getMarketingStats()
  });

  const createCampaignMutation = useMutation({
    mutationFn: MarketingService.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
      FeedbackService.success('Campanha criada com sucesso!');
      setCampaignModalOpen(false);
      setCampaignData({ name: '', type: 'email', subject: '', content: '', targetAudience: [], scheduledDate: '' });
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao criar campanha');
    }
  });

  const invalidateCampaigns = () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
  };

  const updateCampaignMutation = useMutation({
    mutationFn: MarketingService.updateCampaign,
    onSuccess: () => {
      invalidateCampaigns();
      FeedbackService.success('Campanha atualizada!');
    },
    onError: (error: Error) => FeedbackService.error(error.message || 'Erro ao atualizar campanha')
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: MarketingService.deleteCampaign,
    onSuccess: () => {
      invalidateCampaigns();
      FeedbackService.success('Campanha excluída');
    },
    onError: (error: Error) => FeedbackService.error(error.message || 'Erro ao excluir campanha')
  });

  const invalidateCoupons = () => {
    queryClient.invalidateQueries({ queryKey: ['coupons'] });
    queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
  };

  const closeCouponModal = () => {
    setCouponModalOpen(false);
    setEditingCouponId(null);
    setCouponData(EMPTY_COUPON);
  };

  const saveCouponMutation = useMutation({
    mutationFn: (data: Parameters<typeof MarketingService.createCoupon>[0]) =>
      editingCouponId ? MarketingService.updateCoupon({ id: editingCouponId, ...data }) : MarketingService.createCoupon(data),
    onSuccess: () => {
      invalidateCoupons();
      FeedbackService.success(editingCouponId ? 'Cupom atualizado!' : 'Cupom criado com sucesso!');
      closeCouponModal();
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao salvar cupom');
    }
  });

  const toggleCouponMutation = useMutation({
    mutationFn: MarketingService.toggleCoupon,
    onSuccess: invalidateCoupons,
    onError: (error: Error) => FeedbackService.error(error.message || 'Erro ao alterar cupom')
  });

  const deleteCouponMutation = useMutation({
    mutationFn: MarketingService.deleteCoupon,
    onSuccess: () => {
      invalidateCoupons();
      FeedbackService.success('Cupom excluído');
    },
    onError: (error: Error) => FeedbackService.error(error.message || 'Erro ao excluir cupom')
  });

  const invalidateAffiliates = () => {
    queryClient.invalidateQueries({ queryKey: ['affiliates'] });
    queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
  };

  const createAffiliateMutation = useMutation({
    mutationFn: MarketingService.createAffiliate,
    onSuccess: () => {
      invalidateAffiliates();
      FeedbackService.success('Afiliado cadastrado!');
      setAffiliateModalOpen(false);
      setAffiliateData(EMPTY_AFFILIATE);
    },
    onError: (error: Error) => FeedbackService.error(error.message || 'Erro ao cadastrar afiliado')
  });

  const updateAffiliateMutation = useMutation({
    mutationFn: MarketingService.updateAffiliate,
    onSuccess: invalidateAffiliates,
    onError: (error: Error) => FeedbackService.error(error.message || 'Erro ao atualizar afiliado')
  });

  const handleCreateCampaign = () => {
    if (!campaignData.name || !campaignData.content) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }

    const scheduledDate = campaignData.scheduledDate ? new Date(campaignData.scheduledDate) : undefined;
    createCampaignMutation.mutate({
      name: campaignData.name,
      type: campaignData.type,
      subject: campaignData.subject || undefined,
      content: campaignData.content,
      targetAudience: campaignData.targetAudience,
      scheduledDate,
      status: scheduledDate ? 'scheduled' : 'draft'
    });
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    if (window.confirm(`Excluir a campanha "${campaign.name}"?`)) deleteCampaignMutation.mutate(campaign.id);
  };

  const handleCreateCoupon = () => {
    if (!couponData.name || !couponData.code || !couponData.value) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }

    saveCouponMutation.mutate({
      name: couponData.name,
      code: couponData.code.toUpperCase(),
      type: couponData.type,
      value: parseFloat(couponData.value),
      minOrderValue: couponData.minOrderValue ? parseFloat(couponData.minOrderValue) : undefined,
      maxDiscount: couponData.maxDiscount ? parseFloat(couponData.maxDiscount) : undefined,
      usageLimit: couponData.usageLimit ? parseInt(couponData.usageLimit) : undefined,
      // datas do formulário no fuso local: início do primeiro dia até o fim do último
      validFrom: couponData.validFrom ? new Date(`${couponData.validFrom}T00:00:00`) : new Date(),
      validUntil: couponData.validUntil
        ? new Date(`${couponData.validUntil}T23:59:59`)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      applicableProducts: []
    });
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setCouponData({
      name: coupon.name,
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderValue: coupon.minOrderValue != null ? String(coupon.minOrderValue) : '',
      maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      validFrom: toDateInput(coupon.validFrom),
      validUntil: toDateInput(coupon.validUntil)
    });
    setCouponModalOpen(true);
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    if (window.confirm(`Excluir o cupom ${coupon.code}?`)) deleteCouponMutation.mutate(coupon.id);
  };

  const handleCreateAffiliate = () => {
    const rate = parseFloat(affiliateData.commissionRate);
    if (!affiliateData.name || !affiliateData.email || !affiliateData.referralCode || Number.isNaN(rate)) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }
    createAffiliateMutation.mutate({
      name: affiliateData.name,
      email: affiliateData.email,
      phone: affiliateData.phone,
      commissionRate: rate,
      referralCode: affiliateData.referralCode.toUpperCase(),
      status: 'active'
    });
  };

  const toggleAffiliate = (affiliate: Affiliate) =>
    updateAffiliateMutation.mutate({ id: affiliate.id, status: affiliate.status === 'active' ? 'inactive' : 'active' });

  const filteredCampaigns = campaigns.filter((c) => matches(searchQuery, c.name, c.subject));
  const filteredCoupons = coupons.filter((c) => matches(searchQuery, c.name, c.code));
  const filteredAffiliates = affiliates.filter((a) => matches(searchQuery, a.name, a.email, a.referralCode));

  const generateCouponCode = () => {
    const code = MarketingService.generateCouponCode();
    setCouponData(prev => ({ ...prev, code }));
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    FeedbackService.success('Código copiado para a área de transferência!');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'draft': { variant: 'secondary' as const, label: 'Rascunho' },
      'scheduled': { variant: 'warning' as const, label: 'Agendada' },
      'active': { variant: 'success' as const, label: 'Ativa' },
      'paused': { variant: 'warning' as const, label: 'Pausada' },
      'completed': { variant: 'default' as const, label: 'Concluída' }
    };

    const config = variants[status as keyof typeof variants] || variants.draft;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'push': return Bell;
      case 'social': return Users;
      default: return Mail;
    }
  };

  if (campaignsLoading || couponsLoading || affiliatesLoading) {
    return <PageLoader />;
  }

  const loadError = loadError0 || loadError1 || loadError2 || loadError3;
  if (loadError) return <ErrorState error={loadError} onRetry={() => { reload0(); reload1(); reload2(); reload3(); }} />;

  return (
    <div className="space-y-6">
          <PageHeader
            title="Cupons e campanhas"
            description="Gerencie campanhas, cupons e afiliados"
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard title="Campanhas Ativas" value={marketingStats?.activeCampaigns || 0} icon={Megaphone} />

            <MetricCard title="Taxa de Abertura" value={`${marketingStats?.emailOpenRate || 0}%`} icon={Mail} />

            <MetricCard title="Cupons Ativos" value={marketingStats?.activeCoupons || 0} icon={Gift} />

            <MetricCard title="Afiliados Ativos" value={marketingStats?.activeAffiliates || 0} icon={UserCheck} />
          </div>

          <Tabs defaultValue="campaigns" className="space-y-6">
            <TabsList>
              <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
              <TabsTrigger value="coupons">Cupons</TabsTrigger>
              <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar campanhas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button onClick={() => setCampaignModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info-muted p-3 text-sm text-info">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Envio automático não configurado: as campanhas ficam registradas e agendadas aqui,
                  mas nenhum email, SMS ou push é disparado. Por isso as métricas permanecem zeradas.
                </span>
              </div>

              {/* Campaigns Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Público-alvo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Métricas</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            Nenhuma campanha cadastrada
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredCampaigns.map((campaign) => {
                        const CampaignIcon = getCampaignIcon(campaign.type);
                        return (
                          <TableRow key={campaign.id}>
                            <TableCell>
                              <div className="font-medium text-foreground">
                                {campaign.name}
                              </div>
                              {campaign.subject && (
                                <div className="text-sm text-muted-foreground">
                                  {campaign.subject}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CampaignIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="capitalize">{campaign.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {campaign.targetAudience.map((audience, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {audience}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(campaign.status)}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Enviados:</span>
                                  <span className="font-medium">{campaign.stats.sent}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Abertos:</span>
                                  <span className="font-medium">
                                    {campaign.stats.opened} ({campaign.stats.sent ? Math.round(campaign.stats.opened / campaign.stats.sent * 100) : 0}%)
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Conversões:</span>
                                  <span className="font-medium text-success">
                                    {campaign.stats.converted}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {campaign.sentDate ? (
                                <div className="text-sm">
                                  <div>Enviada em:</div>
                                  <div className="text-muted-foreground">
                                    {new Date(campaign.sentDate).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              ) : campaign.scheduledDate ? (
                                <div className="text-sm">
                                  <div>Agendada para:</div>
                                  <div className="text-muted-foreground">
                                    {new Date(campaign.scheduledDate).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  Não agendada
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {NEXT_STATUS[campaign.status].length > 0 && (
                                  <Select
                                    value=""
                                    onValueChange={(value) =>
                                      updateCampaignMutation.mutate({ id: campaign.id, status: value as Campaign['status'] })
                                    }
                                  >
                                    <SelectTrigger className="w-36 h-8" aria-label="Alterar status">
                                      <SelectValue placeholder="Alterar status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {NEXT_STATUS[campaign.status].map((next) => (
                                        <SelectItem key={next} value={next}>{STATUS_LABEL[next]}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCampaign(campaign)}
                                  aria-label="Excluir campanha"
                                >
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
            </TabsContent>

            <TabsContent value="coupons" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar cupons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button onClick={() => setCouponModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cupom
                </Button>
              </div>

              {/* Coupons Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cupom</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Uso</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoupons.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            Nenhum cupom cadastrado
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredCoupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {coupon.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                {coupon.code}
                              </code>
                              <IconButton label="Copiar código" icon={Copy} onClick={() => copyCouponCode(coupon.code)} />
                            </div>
                          </TableCell>
                          <TableCell>
                            {coupon.type === 'percentage' && 'Percentual'}
                            {coupon.type === 'fixed' && 'Valor Fixo'}
                            {coupon.type === 'shipping' && 'Frete Grátis'}
                          </TableCell>
                          <TableCell>
                            {coupon.type === 'percentage' && `${coupon.value}%`}
                            {coupon.type === 'fixed' && formatCurrency(coupon.value)}
                            {coupon.type === 'shipping' && 'Frete Grátis'}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{coupon.usageCount} usos</div>
                              {coupon.usageLimit && (
                                <div className="text-muted-foreground">
                                  de {coupon.usageLimit} ({Math.round(coupon.usageCount / coupon.usageLimit * 100)}%)
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Até {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}</div>
                              {new Date(coupon.validUntil) < new Date() ? (
                                <div className="text-destructive">Expirado</div>
                              ) : (
                                <div className="text-muted-foreground">
                                  {Math.ceil((new Date(coupon.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias restantes
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => toggleCouponMutation.mutate(coupon.id)}
                              disabled={toggleCouponMutation.isPending}
                              title="Clique para ativar/desativar"
                            >
                              <Badge variant={coupon.isActive ? 'success' : 'secondary'}>
                                {coupon.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditCoupon(coupon)} aria-label="Editar cupom">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(coupon)} aria-label="Excluir cupom">
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

            <TabsContent value="affiliates" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar afiliados..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button onClick={() => setAffiliateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Afiliado
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Vendas e comissões por afiliado ainda não são rastreadas automaticamente; os totais permanecem zerados.
              </p>

              {/* Affiliates Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Afiliado</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead>Vendas</TableHead>
                        <TableHead>Comissão Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAffiliates.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            Nenhum afiliado cadastrado
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredAffiliates.map((affiliate) => (
                        <TableRow key={affiliate.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {affiliate.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {affiliate.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                {affiliate.referralCode}
                              </code>
                              <IconButton label="Copiar código" icon={Copy} onClick={() => copyCouponCode(affiliate.referralCode)} />
                            </div>
                          </TableCell>
                          <TableCell>
                            {affiliate.commissionRate}%
                          </TableCell>
                          <TableCell>
                            {formatCurrency(affiliate.totalSales)}
                          </TableCell>
                          <TableCell className="font-semibold text-success">
                            {formatCurrency(affiliate.totalCommission)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={affiliate.status === 'active' ? 'success' : affiliate.status === 'pending' ? 'warning' : 'secondary'}>
                              {affiliate.status === 'active' ? 'Ativo' : affiliate.status === 'pending' ? 'Pendente' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAffiliate(affiliate)}
                                disabled={updateAffiliateMutation.isPending}
                              >
                                {affiliate.status === 'active' ? 'Desativar' : 'Ativar'}
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

          {/* Create Campaign Modal */}
          <Dialog open={campaignModalOpen} onOpenChange={setCampaignModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Campanha</DialogTitle>
                <DialogDescription>
                  Crie uma nova campanha de marketing para promover seus produtos
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Nome da Campanha *</Label>
                  <Input
                    id="campaign-name"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Promoção de Verão 2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-type">Tipo de Campanha *</Label>
                  <Select
                    value={campaignData.type}
                    onValueChange={(value) => setCampaignData(prev => ({ ...prev, type: value as typeof prev.type }))}
                  >
                    <SelectTrigger id="campaign-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Notificação Push</SelectItem>
                      <SelectItem value="social">Redes Sociais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {campaignData.type === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="campaign-subject">Assunto do Email *</Label>
                    <Input
                      id="campaign-subject"
                      value={campaignData.subject}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Ex: Aproveite 50% OFF em produtos selecionados!"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="campaign-content">Conteúdo *</Label>
                  <Textarea
                    id="campaign-content"
                    value={campaignData.content}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Escreva o conteúdo da sua campanha..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-audience">Público-alvo</Label>
                  <Select
                    value={campaignData.targetAudience[0] || ''}
                    onValueChange={(value) => setCampaignData(prev => ({ ...prev, targetAudience: [value] }))}
                  >
                    <SelectTrigger id="campaign-audience">
                      <SelectValue placeholder="Selecione o público-alvo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos os clientes</SelectItem>
                      <SelectItem value="VIP">Clientes VIP</SelectItem>
                      <SelectItem value="Fidelizado">Clientes Fidelizados</SelectItem>
                      <SelectItem value="Inativo">Clientes Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-schedule">Agendar para (opcional)</Label>
                  <Input
                    id="campaign-schedule"
                    type="datetime-local"
                    value={campaignData.scheduledDate}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCampaignModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCampaign}
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? 'Criando...' : 'Criar Campanha'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Coupon Modal */}
          <Dialog open={couponModalOpen} onOpenChange={(open) => (open ? setCouponModalOpen(true) : closeCouponModal())}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCouponId ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
                <DialogDescription>
                  Crie um novo cupom de desconto para seus clientes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coupon-name">Nome do Cupom *</Label>
                  <Input
                    id="coupon-name"
                    value={couponData.name}
                    onChange={(e) => setCouponData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Desconto de Boas-vindas"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="coupon-code">Código do Cupom *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateCouponCode}
                      type="button"
                    >
                      Gerar Código
                    </Button>
                  </div>
                  <Input
                    id="coupon-code"
                    value={couponData.code}
                    onChange={(e) => setCouponData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="Ex: BEMVINDO10"
                    className="uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-type">Tipo de Desconto *</Label>
                    <Select
                      value={couponData.type}
                      onValueChange={(value) => setCouponData(prev => ({ ...prev, type: value as typeof prev.type }))}
                    >
                      <SelectTrigger id="coupon-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentual (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                        <SelectItem value="shipping">Frete Grátis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-value">
                      {couponData.type === 'percentage' ? 'Percentual de Desconto (%) *' :
                       couponData.type === 'fixed' ? 'Valor do Desconto (R$) *' :
                       'Valor Mínimo para Frete Grátis (R$)'}
                    </Label>
                    <Input
                      id="coupon-value"
                      type="number"
                      value={couponData.value}
                      onChange={(e) => setCouponData(prev => ({ ...prev, value: e.target.value }))}
                      placeholder={couponData.type === 'percentage' ? '10' : '50.00'}
                      min="0"
                      step={couponData.type === 'percentage' ? '1' : '0.01'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-min-order">Valor Mínimo do Pedido (R$)</Label>
                    <Input
                      id="coupon-min-order"
                      type="number"
                      value={couponData.minOrderValue}
                      onChange={(e) => setCouponData(prev => ({ ...prev, minOrderValue: e.target.value }))}
                      placeholder="100.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {couponData.type === 'percentage' && (
                    <div className="space-y-2">
                      <Label htmlFor="coupon-max-discount">Desconto Máximo (R$)</Label>
                      <Input
                        id="coupon-max-discount"
                        type="number"
                        value={couponData.maxDiscount}
                        onChange={(e) => setCouponData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                        placeholder="50.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-usage-limit">Limite de Uso</Label>
                    <Input
                      id="coupon-usage-limit"
                      type="number"
                      value={couponData.usageLimit}
                      onChange={(e) => setCouponData(prev => ({ ...prev, usageLimit: e.target.value }))}
                      placeholder="100"
                      min="1"
                      step="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-valid-from">Válido a partir de</Label>
                    <Input
                      id="coupon-valid-from"
                      type="date"
                      value={couponData.validFrom}
                      onChange={(e) => setCouponData(prev => ({ ...prev, validFrom: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-valid-until">Válido até</Label>
                    <Input
                      id="coupon-valid-until"
                      type="date"
                      value={couponData.validUntil}
                      onChange={(e) => setCouponData(prev => ({ ...prev, validUntil: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeCouponModal}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCoupon}
                  disabled={saveCouponMutation.isPending}
                >
                  {saveCouponMutation.isPending ? 'Salvando...' : editingCouponId ? 'Salvar Cupom' : 'Criar Cupom'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Affiliate Modal */}
          <Dialog open={affiliateModalOpen} onOpenChange={setAffiliateModalOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Afiliado</DialogTitle>
                <DialogDescription>
                  Cadastre um parceiro com código de indicação próprio
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="affiliate-name">Nome *</Label>
                  <Input
                    id="affiliate-name"
                    value={affiliateData.name}
                    onChange={(e) => setAffiliateData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="affiliate-email">Email *</Label>
                    <Input
                      id="affiliate-email"
                      type="email"
                      value={affiliateData.email}
                      onChange={(e) => setAffiliateData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliate-phone">Telefone</Label>
                    <Input
                      id="affiliate-phone"
                      value={affiliateData.phone}
                      onChange={(e) => setAffiliateData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="affiliate-rate">Comissão (%) *</Label>
                    <Input
                      id="affiliate-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={affiliateData.commissionRate}
                      onChange={(e) => setAffiliateData(prev => ({ ...prev, commissionRate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliate-code">Código de indicação *</Label>
                    <Input
                      id="affiliate-code"
                      className="uppercase"
                      value={affiliateData.referralCode}
                      onChange={(e) => setAffiliateData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAffiliateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAffiliate} disabled={createAffiliateMutation.isPending}>
                  {createAffiliateMutation.isPending ? 'Salvando...' : 'Cadastrar Afiliado'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
  );
}