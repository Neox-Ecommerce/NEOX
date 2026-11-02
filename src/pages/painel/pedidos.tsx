import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Clock, DollarSign, Download, Eye, ListChecks, Package, Printer, RefreshCw, Search, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState, IconButton, PageHeader, QueryState } from '@/components/PageStates';
import { MetricCard } from '@/components/MetricCard';
import { ORDER_NEXT_STEP, ORDER_STATUS, ORDER_TRANSITIONS, StatusBadge } from '@/components/StatusBadge';
import { OrdersService, PAYMENT_METHOD_LABELS, type Order } from '@/services/OrdersService';
import { FeedbackService } from '@/services/FeedbackService';
import { formatCurrency } from '@/lib/utils';

const PERIODS: Record<string, number> = { today: 1, week: 7, month: 30 };

// Só a janela do pedido é impressa (o app fica oculto e o diálogo vira fluxo normal da página).
const PRINT_CSS = `@media print {
  #root, body > div > [data-state]:not([role=dialog]) { display: none !important; }
  [role=dialog] { position: static !important; transform: none !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; border: 0 !important; max-width: none !important; }
  [role=dialog] .print-hide, [role=dialog] > button { display: none !important; }
}`;

export function PedidosPage() {
  const [params, setParams] = useSearchParams();
  const statusFilter = params.get('status') ?? 'all';
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all');
  const [detail, setDetail] = useState<Order | null>(null);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [form, setForm] = useState({ status: '', trackingCode: '', notes: '' });
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({ queryKey: ['orders'], queryFn: () => OrdersService.getOrders() });
  const { data: stats } = useQuery({ queryKey: ['order-stats'], queryFn: OrdersService.getOrderStats });

  // ?pedido=<id> (vindo do dashboard) abre o detalhe daquele pedido.
  const linkedId = params.get('pedido');
  useEffect(() => {
    if (!linkedId || !ordersQuery.data) return;
    const found = ordersQuery.data.find((o) => o.id === linkedId);
    if (found) setDetail(found);
  }, [linkedId, ordersQuery.data]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'all') next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const closeDetail = () => {
    setDetail(null);
    if (linkedId) setParam('pedido', null);
  };

  const mutation = useMutation({
    mutationFn: OrdersService.updateOrderStatus,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      FeedbackService.success(`Pedido ${updated.code}: ${ORDER_STATUS[updated.status]?.label ?? updated.status}.`);
      setStatusOrder(null);
      setDetail((d) => (d && d.id === updated.id ? updated : d));
    },
    onError: (error: Error) => FeedbackService.error(error.message || 'Não foi possível atualizar o pedido.'),
  });

  const openStatus = (order: Order, status = '') => {
    setStatusOrder(order);
    setForm({ status, trackingCode: order.trackingCode ?? '', notes: '' });
  };

  // Envio pede o código de rastreio; os demais passos seguem direto.
  const advance = (order: Order) => {
    const next = ORDER_NEXT_STEP[order.status];
    if (!next) return;
    if (next.status === 'shipped') openStatus(order, 'shipped');
    else mutation.mutate({ orderId: order.id, status: next.status });
  };

  const submitStatus = () => {
    if (!statusOrder || !form.status) return FeedbackService.error('Escolha o novo status.');
    mutation.mutate({
      orderId: statusOrder.id,
      status: form.status,
      trackingCode: form.status === 'shipped' ? form.trackingCode.trim() : undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  const filter = (orders: Order[]) => {
    const q = search.trim().toLowerCase();
    const days = PERIODS[period];
    return orders.filter((o) =>
      (!q || [o.code, o.customer.name, o.customer.email].some((v) => v?.toLowerCase().includes(q))) &&
      (statusFilter === 'all' || o.status === statusFilter) &&
      (!days || Date.now() - o.createdAt.getTime() <= days * 86_400_000),
    );
  };

  const exportOrders = () => {
    const url = URL.createObjectURL(OrdersService.exportOrders(filter(ordersQuery.data ?? [])));
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowActions = (order: Order) => {
    const next = ORDER_NEXT_STEP[order.status];
    return (
      <div className="flex items-center justify-end gap-1">
        {next && (
          <Button size="sm" onClick={() => advance(order)} disabled={mutation.isPending}>
            {next.label}
          </Button>
        )}
        <IconButton label={`Ver detalhes do pedido ${order.code}`} icon={Eye} onClick={() => setDetail(order)} />
        {ORDER_TRANSITIONS[order.status]?.length > 0 && (
          <IconButton label={`Alterar status do pedido ${order.code}`} icon={ListChecks} onClick={() => openStatus(order)} />
        )}
      </div>
    );
  };

  const targets = statusOrder ? ORDER_TRANSITIONS[statusOrder.status] ?? [] : [];
  const destructive = form.status === 'cancelled' || form.status === 'returned';

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description="Acompanhe e avance os pedidos da sua loja."
        actions={
          <>
            <Button variant="outline" onClick={exportOrders} disabled={!ordersQuery.data?.length}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Exportar CSV
            </Button>
            <Button variant="outline" onClick={() => { ordersQuery.refetch(); queryClient.invalidateQueries({ queryKey: ['order-stats'] }); }}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Atualizar
            </Button>
          </>
        }
      />

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard title="Pedidos" value={stats.totalOrders} icon={ShoppingCart} tone="info" />
          <MetricCard title="Receita (pagos)" value={stats.totalRevenue} format="currency" icon={DollarSign} tone="success" />
          <MetricCard title="Pendentes" value={stats.pendingOrders} icon={Clock} tone="warning" />
          <MetricCard title="Ticket médio" value={stats.averageTicket} format="currency" icon={Star} />
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-md">
          <Label htmlFor="busca-pedidos" className="sr-only">Buscar pedidos</Label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="busca-pedidos" placeholder="Código, nome ou e-mail do cliente" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setParam('status', v)}>
          <SelectTrigger className="sm:w-48" aria-label="Filtrar por status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(ORDER_STATUS).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="sm:w-48" aria-label="Filtrar por período">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o período</SelectItem>
            <SelectItem value="today">Últimas 24 horas</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <QueryState
        query={ordersQuery}
        isEmpty={(orders) => orders.length === 0}
        empty={
          <Card><EmptyState icon={ShoppingCart} title="Nenhum pedido ainda" description="Quando um cliente comprar na sua loja, o pedido aparece aqui." /></Card>
        }
      >
        {(orders) => {
          const list = filter(orders);
          if (list.length === 0) {
            return (
              <Card>
                <EmptyState
                  icon={Search}
                  title="Nenhum pedido com esses filtros"
                  action={<Button variant="outline" onClick={() => { setSearch(''); setPeriod('all'); setParam('status', null); }}>Limpar filtros</Button>}
                />
              </Card>
            );
          }
          return (
            <>
              <Card className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.code}</div>
                          <div className="text-xs text-muted-foreground">{order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.createdAt.toLocaleDateString('pt-BR')}
                          <div className="text-xs text-muted-foreground">{order.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </TableCell>
                        <TableCell><StatusBadge kind="order" value={order.status} /></TableCell>
                        <TableCell><StatusBadge kind="payment" value={order.paymentStatus} /></TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(order.total)}</TableCell>
                        <TableCell>{rowActions(order)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <ul className="space-y-3 md:hidden">
                {list.map((order) => (
                  <li key={order.id}>
                    <Card>
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{order.code}</p>
                            <p className="text-sm text-muted-foreground">{order.customer.name} · {order.createdAt.toLocaleDateString('pt-BR')}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(order.total)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge kind="order" value={order.status} />
                          <StatusBadge kind="payment" value={order.paymentStatus} />
                        </div>
                        {rowActions(order)}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </>
          );
        }}
      </QueryState>

      {/* Detalhe do pedido (também é o que vai para a impressão) */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <style>{PRINT_CSS}</style>
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>Pedido {detail.code}</DialogTitle>
                <DialogDescription>Feito em {detail.createdAt.toLocaleString('pt-BR')}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <StatusBadge kind="order" value={detail.status} />
                      {detail.trackingCode && <p><span className="text-muted-foreground">Rastreio:</span> {detail.trackingCode}</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Pagamento</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <StatusBadge kind="payment" value={detail.paymentStatus} />
                      <p className="text-muted-foreground">{PAYMENT_METHOD_LABELS[detail.paymentMethod] ?? detail.paymentMethod}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Entrega</CardTitle></CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p>{detail.shippingMethod}</p>
                      <p className="text-muted-foreground">Prazo: {detail.estimatedDelivery || 'a combinar'}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="grid gap-4 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <h3 className="mb-1 font-semibold">Cliente</h3>
                      <p>{detail.customer.name}</p>
                      <p className="text-muted-foreground">{detail.customer.email}</p>
                      {detail.customer.phone && <p className="text-muted-foreground">{detail.customer.phone}</p>}
                      {detail.customer.document && <p className="text-muted-foreground">CPF: {detail.customer.document}</p>}
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Endereço de entrega</h3>
                      <p>{detail.shippingAddress.street}, {detail.shippingAddress.number}</p>
                      {detail.shippingAddress.complement && <p>{detail.shippingAddress.complement}</p>}
                      <p>{detail.shippingAddress.neighborhood}</p>
                      <p>{detail.shippingAddress.city} - {detail.shippingAddress.state}</p>
                      <p>CEP {detail.shippingAddress.zipCode}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-3 text-sm font-semibold">Itens</h3>
                    <ul className="divide-y">
                      {detail.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-3 py-3">
                          {item.image ? (
                            <img src={item.image} alt="" className="h-14 w-14 shrink-0 rounded-md border object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted">
                              <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 text-sm">
                            <p className="font-medium">{item.productName}</p>
                            {item.sku && <p className="text-muted-foreground">SKU {item.sku}</p>}
                            <p className="text-muted-foreground">{item.quantity} × {formatCurrency(item.price)}</p>
                          </div>
                          <p className="text-sm font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                        </li>
                      ))}
                    </ul>
                    <dl className="mt-3 space-y-1 border-t pt-3 text-sm">
                      <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(detail.subtotal)}</dd></div>
                      <div className="flex justify-between"><dt>Frete</dt><dd>{formatCurrency(detail.shippingCost)}</dd></div>
                      {detail.discount > 0 && (
                        <div className="flex justify-between text-success">
                          <dt>Desconto{detail.couponCode ? ` (${detail.couponCode})` : ''}</dt><dd>-{formatCurrency(detail.discount)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatCurrency(detail.total)}</dd></div>
                    </dl>
                  </CardContent>
                </Card>
                {detail.notes && <p className="text-sm"><span className="font-medium">Observações:</span> {detail.notes}</p>}
              </div>

              <DialogFooter className="print-hide gap-2">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" aria-hidden="true" /> Imprimir
                </Button>
                {ORDER_TRANSITIONS[detail.status]?.length > 0 && (
                  <Button variant="outline" onClick={() => openStatus(detail)}>Alterar status</Button>
                )}
                {ORDER_NEXT_STEP[detail.status] && (
                  <Button onClick={() => advance(detail)} disabled={mutation.isPending}>{ORDER_NEXT_STEP[detail.status]?.label}</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Alterar status: só as transições válidas a partir do status atual */}
      <Dialog open={!!statusOrder} onOpenChange={(open) => !open && setStatusOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar status do pedido</DialogTitle>
            <DialogDescription>
              {statusOrder?.code} · hoje está <span className="font-medium">{statusOrder && ORDER_STATUS[statusOrder.status]?.label}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="novo-status">Novo status</Label>
              <Select value={form.status} onValueChange={(status) => setForm((f) => ({ ...f, status }))}>
                <SelectTrigger id="novo-status"><SelectValue placeholder="Escolha o novo status" /></SelectTrigger>
                <SelectContent>
                  {targets.map((s) => <SelectItem key={s} value={s}>{ORDER_STATUS[s]?.label ?? s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {form.status === 'shipped' && (
              <div className="space-y-2 rounded-lg border border-info/30 bg-info-muted p-3">
                <Label htmlFor="rastreio">Código de rastreio (recomendado)</Label>
                <Input
                  id="rastreio"
                  value={form.trackingCode}
                  onChange={(e) => setForm((f) => ({ ...f, trackingCode: e.target.value }))}
                  placeholder="Ex.: AB123456789BR"
                  aria-describedby="rastreio-ajuda"
                  autoFocus
                />
                <p id="rastreio-ajuda" className="text-xs text-muted-foreground">O cliente usa este código para acompanhar a entrega.</p>
              </div>
            )}

            {form.status === 'delivered' && statusOrder?.paymentStatus === 'pending' && (
              <p className="text-sm text-muted-foreground">O pagamento pendente será registrado como recebido ao marcar como entregue.</p>
            )}

            {destructive && statusOrder && (
              <div role="alert" className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive-muted p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>
                  {form.status === 'cancelled'
                    ? `Os itens voltam para o estoque.${statusOrder.paymentStatus === 'paid' ? ' O pagamento será marcado como reembolsado: confira o estorno no meio de pagamento.' : ''} Esta ação não pode ser desfeita.`
                    : 'O pedido será marcado como devolvido. O estoque não volta automaticamente: se o produto retornou em condições de venda, ajuste a quantidade em Estoque. Esta ação não pode ser desfeita.'}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="obs-status">Observações (opcional)</Label>
              <Textarea id="obs-status" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setStatusOrder(null)}>Voltar</Button>
            <Button variant={destructive ? 'destructive' : 'default'} onClick={submitStatus} disabled={!form.status || mutation.isPending}>
              {mutation.isPending ? 'Salvando…' : form.status === 'cancelled' ? 'Cancelar pedido' : form.status === 'returned' ? 'Confirmar devolução' : 'Salvar status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
