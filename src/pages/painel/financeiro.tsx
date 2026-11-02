import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Landmark as Bank,
  Plus,
  AlertTriangle,
  FileText,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { ErrorState, PageLoader, PageHeader } from '@/components/PageStates';
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
import { FinancialService, type Payment } from '@/services/FinancialService';
import { ApiError } from '@/lib/api';
import { FeedbackService } from '@/services/FeedbackService';
import { formatCurrency } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

export function FinanceiroPage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [bankAccountModalOpen, setBankAccountModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const emptyPayment = {
    orderId: '',
    amount: '',
    method: 'pix' as Payment['method'],
    status: 'approved' as 'pending' | 'approved'
  };
  const [paymentData, setPaymentData] = useState(emptyPayment);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  const [bankAccountData, setBankAccountData] = useState({
    bank: '',
    agency: '',
    account: '',
    accountType: 'checking' as 'checking' | 'savings',
    holderName: '',
    holderDocument: '',
    isDefault: true,
    isActive: true
  });
  const [activeTab, setActiveTab] = useState<string>('payments');

  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // Set default active tab based on URL
  useEffect(() => {
    if (location.pathname.includes('/pagamentos')) {
      setActiveTab('payments');
    } else if (location.pathname.includes('/repasses')) {
      setActiveTab('payouts');
    } else if (location.pathname.includes('/contas-bancarias')) {
      setActiveTab('bank-accounts');
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'payments') {
      navigate('/painel/financeiro/pagamentos');
    } else if (value === 'payouts') {
      navigate('/painel/financeiro/repasses');
    } else if (value === 'bank-accounts') {
      navigate('/painel/financeiro');
    }
  };

  const { data: payments = [], isLoading: paymentsLoading, error: loadError0, refetch: reload0 } = useQuery({
    queryKey: ['payments'],
    queryFn: FinancialService.getPayments
  });

  const { data: payouts = [], isLoading: payoutsLoading, error: loadError1, refetch: reload1 } = useQuery({
    queryKey: ['payouts'],
    queryFn: FinancialService.getPayouts
  });

  const { data: bankAccounts = [], isLoading: bankAccountsLoading, error: loadError2, refetch: reload2 } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: FinancialService.getBankAccounts
  });

  const { data: financialStats, error: loadError3, refetch: reload3 } = useQuery({
    queryKey: ['financial-stats'],
    queryFn: FinancialService.getFinancialStats
  });

  const { data: payableOrders = [] } = useQuery({
    queryKey: ['payable-orders'],
    queryFn: FinancialService.getPayableOrders,
    enabled: paymentModalOpen
  });

  const errorText = (error: unknown, fallback: string) => (error instanceof ApiError ? error.message : fallback);

  const createPaymentMutation = useMutation({
    mutationFn: FinancialService.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
      queryClient.invalidateQueries({ queryKey: ['payable-orders'] });
      FeedbackService.success('Pagamento registrado com sucesso!');
      setPaymentModalOpen(false);
      setPaymentData(emptyPayment);
    },
    onError: (error) => {
      FeedbackService.error(errorText(error, 'Erro ao registrar pagamento'));
    }
  });

  const createPayoutMutation = useMutation({
    mutationFn: ({ amount, bankAccountId }: { amount: number; bankAccountId: string }) =>
      FinancialService.createPayout(amount, bankAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] });
      FeedbackService.success('Solicitação de repasse criada com sucesso!');
      setPayoutModalOpen(false);
      setPayoutAmount('');
      setSelectedBankAccount('');
    },
    onError: (error) => {
      FeedbackService.error(errorText(error, 'Erro ao solicitar repasse'));
    }
  });

  const addBankAccountMutation = useMutation({
    mutationFn: FinancialService.addBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      FeedbackService.success('Conta bancária adicionada com sucesso!');
      setBankAccountModalOpen(false);
      setBankAccountData({
        bank: '',
        agency: '',
        account: '',
        accountType: 'checking',
        holderName: '',
        holderDocument: '',
        isDefault: true,
        isActive: true
      });
    },
    onError: (error) => {
      FeedbackService.error(errorText(error, 'Erro ao adicionar conta bancária'));
    }
  });

  const handleCreatePayment = () => {
    if (!paymentData.orderId || !paymentData.amount) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }

    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      FeedbackService.error('Valor inválido');
      return;
    }

    createPaymentMutation.mutate({
      orderId: paymentData.orderId,
      amount,
      method: paymentData.method,
      status: paymentData.status
    });
  };

  const handleCreatePayout = () => {
    if (!payoutAmount || !selectedBankAccount) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      FeedbackService.error('Valor inválido');
      return;
    }

    if (amount > (financialStats?.availableForPayout || 0)) {
      FeedbackService.error('Valor maior que o saldo disponível');
      return;
    }

    createPayoutMutation.mutate({
      amount,
      bankAccountId: selectedBankAccount
    });
  };

  const handleAddBankAccount = () => {
    if (!bankAccountData.bank || !bankAccountData.agency || !bankAccountData.account || !bankAccountData.holderName || !bankAccountData.holderDocument) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }

    addBankAccountMutation.mutate(bankAccountData);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchQuery === '' ||
      (payment.orderCode ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    const matchesDate = dateFilter === 'all' || (() => {
      const paymentDate = new Date(payment.createdAt);
      const today = new Date();
      const diffTime = today.getTime() - paymentDate.getTime();
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
      'pending': { variant: 'warning' as const, label: 'Pendente' },
      'processing': { variant: 'default' as const, label: 'Processando' },
      'approved': { variant: 'success' as const, label: 'Aprovado' },
      'rejected': { variant: 'destructive' as const, label: 'Rejeitado' },
      'refunded': { variant: 'secondary' as const, label: 'Reembolsado' },
      'completed': { variant: 'success' as const, label: 'Concluído' },
      'failed': { variant: 'destructive' as const, label: 'Falhou' }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return CreditCard;
      case 'debit_card': return CreditCard;
      case 'pix': return Send;
      case 'boleto': return FileText;
      case 'transfer': return Bank;
      default: return CreditCard;
    }
  };

  const banks = FinancialService.getBanks();

  if (paymentsLoading || payoutsLoading || bankAccountsLoading) {
    return <PageLoader />;
  }

  const loadError = loadError0 || loadError1 || loadError2 || loadError3;
  if (loadError) return <ErrorState error={loadError} onRetry={() => { reload0(); reload1(); reload2(); reload3(); }} />;

  return (
    <div className="space-y-6">
          <PageHeader
            title="Financeiro"
            description="Gerencie pagamentos, repasses e finanças da sua loja"
            actions={<>
              <Button variant="outline" onClick={() => setPaymentModalOpen(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Registrar Pagamento
              </Button>
              <Button onClick={() => setPayoutModalOpen(true)}>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Solicitar Repasse
              </Button>
            </>}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard title="Receita Total" value={formatCurrency(financialStats?.totalRevenue || 0)} icon={DollarSign} />

            <MetricCard title="Taxas" value={formatCurrency(financialStats?.totalFees || 0)} icon={ArrowDownRight} />

            <MetricCard title="Receita Líquida" value={formatCurrency(financialStats?.netRevenue || 0)} icon={Wallet} />

            <MetricCard title="Disponível para Repasse" value={formatCurrency(financialStats?.availableForPayout || 0)} icon={Bank} />
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="payouts">Repasses</TabsTrigger>
              <TabsTrigger value="bank-accounts">Contas Bancárias</TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar pagamentos..."
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
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
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

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">
                  Lista de Pagamentos
                </h3>
                <Button onClick={() => setPaymentModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pagamento
                </Button>
              </div>

              {/* Payments Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Taxa</TableHead>
                        <TableHead>Valor Líquido</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            {payments.length === 0 ? 'Nenhum pagamento recebido ainda.' : 'Nenhum pagamento encontrado com esses filtros.'}
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredPayments.map((payment) => {
                        const PaymentIcon = getPaymentMethodIcon(payment.method);
                        return (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div className="font-medium text-foreground">
                                {payment.orderCode ? `Pedido #${payment.orderCode.replace(/^#/, '')}` : '-'}
                              </div>
                              {payment.transactionId && (
                                <div className="text-xs text-muted-foreground">
                                  ID: {payment.transactionId}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="capitalize">
                                  {payment.method === 'credit_card' && 'Cartão de Crédito'}
                                  {payment.method === 'debit_card' && 'Cartão de Débito'}
                                  {payment.method === 'pix' && 'PIX'}
                                  {payment.method === 'boleto' && 'Boleto'}
                                  {payment.method === 'transfer' && 'Transferência'}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {payment.gateway === 'manual' ? 'Registro manual' : payment.gateway}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell className="text-destructive">
                              -{formatCurrency(payment.fees)}
                            </TableCell>
                            <TableCell className="font-semibold text-success">
                              {formatCurrency(payment.netAmount)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(payment.status)}
                            </TableCell>
                            <TableCell>
                              {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Histórico de Repasses
                </h3>
                <Button onClick={() => setPayoutModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Solicitar Repasse
                </Button>
              </div>

              {/* Payouts Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Taxa</TableHead>
                        <TableHead>Valor Líquido</TableHead>
                        <TableHead>Conta Bancária</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Agendada</TableHead>
                        <TableHead>Data Processada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            Nenhum repasse solicitado ainda.
                          </TableCell>
                        </TableRow>
                      )}
                      {payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell className="font-mono text-xs">
                            {payout.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payout.amount)}
                          </TableCell>
                          <TableCell className="text-destructive">
                            -{formatCurrency(payout.fees)}
                          </TableCell>
                          <TableCell className="font-semibold text-success">
                            {formatCurrency(payout.netAmount)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{payout.bankAccount.bank}</div>
                              <div className="text-muted-foreground">
                                Ag: {payout.bankAccount.agency} / Conta: {payout.bankAccount.account}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payout.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(payout.scheduledDate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {payout.processedDate
                              ? new Date(payout.processedDate).toLocaleDateString('pt-BR')
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank-accounts" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Contas Bancárias
                </h3>
                <Button onClick={() => setBankAccountModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conta Bancária
                </Button>
              </div>

              {/* Bank Accounts */}
              {bankAccounts.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Nenhuma conta bancária cadastrada. Cadastre uma conta para solicitar repasses.
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bankAccounts.map((account) => (
                  <Card key={account.id} className={account.isDefault ? 'border-primary' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Bank className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-foreground">
                              {account.bank}
                            </span>
                            {account.isDefault && (
                              <Badge variant="outline" className="text-xs">
                                Padrão
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="text-muted-foreground">Agência:</span>{' '}
                              <span className="font-medium">{account.agency}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Conta:</span>{' '}
                              <span className="font-medium">{account.account}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tipo:</span>{' '}
                              <span className="font-medium">
                                {account.accountType === 'checking' ? 'Corrente' : 'Poupança'}
                              </span>
                            </div>
                          </div>

                          <div className="text-sm">
                            <div className="font-medium">{account.holderName}</div>
                            <div className="text-muted-foreground">{account.holderDocument}</div>
                          </div>
                        </div>

                        <Badge variant={account.isActive ? 'success' : 'secondary'}>
                          {account.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Payment Modal */}
          <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Pagamento</DialogTitle>
                <DialogDescription>
                  Registre um pagamento recebido fora da plataforma (ex.: dinheiro na entrega). Sem taxas.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order-id">Pedido *</Label>
                  <Select
                    value={paymentData.orderId}
                    onValueChange={(value) => {
                      const order = payableOrders.find((o) => o.id === value);
                      setPaymentData(prev => ({ ...prev, orderId: value, amount: order ? String(order.total) : prev.amount }));
                    }}
                  >
                    <SelectTrigger id="order-id">
                      <SelectValue placeholder={payableOrders.length ? 'Selecione o pedido' : 'Nenhum pedido aguardando pagamento'} />
                    </SelectTrigger>
                    <SelectContent>
                      {payableOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          Pedido #{order.code.replace(/^#/, '')} — {formatCurrency(order.total)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Valor do Pagamento *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="payment-amount"
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Método de Pagamento *</Label>
                  <Select
                    value={paymentData.method}
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, method: value as typeof prev.method }))}
                  >
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-status">Status do Pagamento *</Label>
                  <Select
                    value={paymentData.status}
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, status: value as 'pending' | 'approved' }))}
                  >
                    <SelectTrigger id="payment-status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Recebido (marca o pedido como pago)</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreatePayment}
                  disabled={createPaymentMutation.isPending}
                >
                  {createPaymentMutation.isPending ? 'Registrando...' : 'Registrar Pagamento'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Payout Modal */}
          <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Repasse</DialogTitle>
                <DialogDescription>
                  Solicite um repasse para sua conta bancária
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payout-amount">Valor do Repasse *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="payout-amount"
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Saldo disponível: {formatCurrency(financialStats?.availableForPayout || 0)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-account">Conta Bancária *</Label>
                  {bankAccounts.length === 0 && (
                    <p className="text-sm text-muted-foreground">Cadastre uma conta na aba Contas Bancárias.</p>
                  )}
                  <Select
                    value={selectedBankAccount}
                    onValueChange={setSelectedBankAccount}
                  >
                    <SelectTrigger id="bank-account">
                      <SelectValue placeholder="Selecione uma conta bancária" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.filter((account) => account.isActive).map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <Bank className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{account.bank}</div>
                              <div className="text-xs text-muted-foreground">
                                Ag: {account.agency} / Conta: {account.account}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-warning-muted border border-warning/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning">
                        Informações importantes
                      </p>
                      <ul className="text-sm text-warning mt-1 space-y-1 list-disc list-inside">
                        <li>A transferência é feita pela equipe NEOX após a solicitação (previsão: 1 dia útil)</li>
                        <li>Não há taxa de repasse</li>
                        <li>O valor não pode passar do saldo disponível</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPayoutModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreatePayout}
                  disabled={createPayoutMutation.isPending}
                >
                  {createPayoutMutation.isPending ? 'Processando...' : 'Solicitar Repasse'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bank Account Modal */}
          <Dialog open={bankAccountModalOpen} onOpenChange={setBankAccountModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conta Bancária</DialogTitle>
                <DialogDescription>
                  Adicione uma nova conta bancária para receber seus repasses
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Banco *</Label>
                  <Select
                    value={bankAccountData.bank}
                    onValueChange={(value) => setBankAccountData(prev => ({ ...prev, bank: value }))}
                  >
                    <SelectTrigger id="bank">
                      <SelectValue placeholder="Selecione o banco" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.code} value={bank.name}>
                          {bank.code} - {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agency">Agência *</Label>
                    <Input
                      id="agency"
                      value={bankAccountData.agency}
                      onChange={(e) => setBankAccountData(prev => ({ ...prev, agency: e.target.value }))}
                      placeholder="Ex: 1234 ou 1234-5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account">Conta *</Label>
                    <Input
                      id="account"
                      value={bankAccountData.account}
                      onChange={(e) => setBankAccountData(prev => ({ ...prev, account: e.target.value }))}
                      placeholder="Ex: 12345-6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-type">Tipo de Conta *</Label>
                  <Select
                    value={bankAccountData.accountType}
                    onValueChange={(value) => setBankAccountData(prev => ({ ...prev, accountType: value as 'checking' | 'savings' }))}
                  >
                    <SelectTrigger id="account-type">
                      <SelectValue placeholder="Selecione o tipo de conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Conta Corrente</SelectItem>
                      <SelectItem value="savings">Conta Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holder-name">Nome do Titular *</Label>
                  <Input
                    id="holder-name"
                    value={bankAccountData.holderName}
                    onChange={(e) => setBankAccountData(prev => ({ ...prev, holderName: e.target.value }))}
                    placeholder="Nome completo do titular"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holder-document">CPF/CNPJ do Titular *</Label>
                  <Input
                    id="holder-document"
                    value={bankAccountData.holderDocument}
                    onChange={(e) => setBankAccountData(prev => ({ ...prev, holderDocument: e.target.value }))}
                    placeholder="CPF ou CNPJ do titular"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-default"
                    checked={bankAccountData.isDefault}
                    onChange={(e) => setBankAccountData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <Label htmlFor="is-default" className="text-sm">
                    Definir como conta padrão para repasses
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBankAccountModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddBankAccount}
                  disabled={addBankAccountMutation.isPending}
                >
                  {addBankAccountMutation.isPending ? 'Adicionando...' : 'Adicionar Conta'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
  );
}