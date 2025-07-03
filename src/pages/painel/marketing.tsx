import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  Users,
  Mail,
  MessageSquare,
  Gift,
  UserCheck,
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
  Copy,
  ExternalLink,
  Bell
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
import { MarketingService } from '@/services/MarketingService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

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
    targetAudience: [] as string[]
  });
  const [couponData, setCouponData] = useState({
    name: '',
    code: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'shipping',
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: ''
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns', user?.lojaId],
    queryFn: () => MarketingService.getCampaigns(user?.lojaId || '1')
  });

  const { data: coupons = [], isLoading: couponsLoading } = useQuery({
    queryKey: ['coupons', user?.lojaId],
    queryFn: () => MarketingService.getCoupons(user?.lojaId || '1')
  });

  const { data: affiliates = [], isLoading: affiliatesLoading } = useQuery({
    queryKey: ['affiliates', user?.lojaId],
    queryFn: () => MarketingService.getAffiliates(user?.lojaId || '1')
  });

  const { data: marketingStats } = useQuery({
    queryKey: ['marketing-stats', user?.lojaId],
    queryFn: () => MarketingService.getMarketingStats(user?.lojaId || '1')
  });

  const createCampaignMutation = useMutation({
    mutationFn: MarketingService.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
      FeedbackService.success('Campanha criada com sucesso!');
      setCampaignModalOpen(false);
      setCampaignData({ name: '', type: 'email', subject: '', content: '', targetAudience: [] });
    },
    onError: () => {
      FeedbackService.error('Erro ao criar campanha');
    }
  });

  const createCouponMutation = useMutation({
    mutationFn: MarketingService.createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
      FeedbackService.success('Cupom criado com sucesso!');
      setCouponModalOpen(false);
      setCouponData({
        name: '', code: '', type: 'percentage', value: '', minOrderValue: '',
        maxDiscount: '', usageLimit: '', validFrom: '', validUntil: ''
      });
    },
    onError: () => {
      FeedbackService.error('Erro ao criar cupom');
    }
  });

  const handleCreateCampaign = () => {
    if (!campaignData.name || !campaignData.content) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }

    createCampaignMutation.mutate({
      name: campaignData.name,
      type: campaignData.type,
      subject: campaignData.subject,
      content: campaignData.content,
      targetAudience: campaignData.targetAudience,
      status: 'draft'
    });
  };

  const handleCreateCoupon = () => {
    if (!couponData.name || !couponData.code || !couponData.value) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }

    createCouponMutation.mutate({
      name: couponData.name,
      code: couponData.code.toUpperCase(),
      type: couponData.type,
      value: parseFloat(couponData.value),
      minOrderValue: couponData.minOrderValue ? parseFloat(couponData.minOrderValue) : undefined,
      maxDiscount: couponData.maxDiscount ? parseFloat(couponData.maxDiscount) : undefined,
      usageLimit: couponData.usageLimit ? parseInt(couponData.usageLimit) : undefined,
      validFrom: new Date(couponData.validFrom || Date.now()),
      validUntil: new Date(couponData.validUntil || Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      applicableProducts: []
    });
  };

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
                Marketing
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie campanhas, cupons e afiliados
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Campanhas Ativas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {marketingStats?.activeCampaigns || 0}
                    </p>
                  </div>
                  <Megaphone className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Abertura</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {marketingStats?.emailOpenRate || 0}%
                    </p>
                  </div>
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cupons Ativos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {marketingStats?.activeCoupons || 0}
                    </p>
                  </div>
                  <Gift className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Afiliados Ativos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {marketingStats?.activeAffiliates || 0}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                      {campaigns.map((campaign) => {
                        const CampaignIcon = getCampaignIcon(campaign.type);
                        return (
                          <TableRow key={campaign.id}>
                            <TableCell>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {campaign.name}
                              </div>
                              {campaign.subject && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {campaign.subject}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CampaignIcon className="h-4 w-4 text-gray-400" />
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
                                  <span className="text-gray-500">Enviados:</span>
                                  <span className="font-medium">{campaign.stats.sent}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500">Abertos:</span>
                                  <span className="font-medium">
                                    {campaign.stats.opened} ({Math.round(campaign.stats.opened / campaign.stats.sent * 100)}%)
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500">Conversões:</span>
                                  <span className="font-medium text-green-600">
                                    {campaign.stats.converted}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {campaign.sentDate ? (
                                <div className="text-sm">
                                  <div>Enviada em:</div>
                                  <div className="text-gray-500">
                                    {new Date(campaign.sentDate).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              ) : campaign.scheduledDate ? (
                                <div className="text-sm">
                                  <div>Agendada para:</div>
                                  <div className="text-gray-500">
                                    {new Date(campaign.scheduledDate).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">
                                  Não agendada
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <BarChart3 className="h-4 w-4" />
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                      {coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {coupon.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                                {coupon.code}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => copyCouponCode(coupon.code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
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
                                <div className="text-gray-500">
                                  de {coupon.usageLimit} ({Math.round(coupon.usageCount / coupon.usageLimit * 100)}%)
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>Até {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}</div>
                              {new Date(coupon.validUntil) < new Date() ? (
                                <div className="text-red-500">Expirado</div>
                              ) : (
                                <div className="text-gray-500">
                                  {Math.ceil((new Date(coupon.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias restantes
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={coupon.isActive ? 'success' : 'secondary'}>
                              {coupon.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
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

            <TabsContent value="affiliates" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                      {affiliates.map((affiliate) => (
                        <TableRow key={affiliate.id}>
                          <TableCell>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {affiliate.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {affiliate.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                                {affiliate.referralCode}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => copyCouponCode(affiliate.referralCode)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {affiliate.commissionRate}%
                          </TableCell>
                          <TableCell>
                            {formatCurrency(affiliate.totalSales)}
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(affiliate.totalCommission)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={affiliate.status === 'active' ? 'success' : 'secondary'}>
                              {affiliate.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
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
                    onValueChange={(value) => setCampaignData(prev => ({ ...prev, type: value as any }))}
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
          <Dialog open={couponModalOpen} onOpenChange={setCouponModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Cupom</DialogTitle>
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
                      onValueChange={(value) => setCouponData(prev => ({ ...prev, type: value as any }))}
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
                <Button variant="outline" onClick={() => setCouponModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateCoupon}
                  disabled={createCouponMutation.isPending}
                >
                  {createCouponMutation.isPending ? 'Criando...' : 'Criar Cupom'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppShell>
    </RoleGuard>
  );
}