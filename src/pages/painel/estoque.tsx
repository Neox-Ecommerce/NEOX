import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Download, Eye, Package, PackageX, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState, IconButton, PageHeader, QueryState } from '@/components/PageStates';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge, stockLevel } from '@/components/StatusBadge';
import { InventoryService, type InventoryItem, type InventoryMovement } from '@/services/InventoryService';
import { FeedbackService } from '@/services/FeedbackService';
import { cn, formatCurrency } from '@/lib/utils';

const level = (i: InventoryItem) => stockLevel(i.currentStock, i.minStock);

function downloadCsv(items: InventoryItem[]) {
  const url = URL.createObjectURL(InventoryService.exportInventory(items));
  const a = document.createElement('a');
  a.href = url;
  a.download = `estoque-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function MovementList({ movements }: { movements: InventoryMovement[] }) {
  return (
    <ul className="divide-y">
      {movements.map((m) => (
        <li key={m.id} className="flex items-center gap-3 py-3">
          <div className={cn('rounded-full p-2', m.type === 'in' ? 'bg-success-muted text-success' : 'bg-destructive-muted text-destructive')}>
            {m.type === 'in' ? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> : <ArrowDownRight className="h-4 w-4" aria-hidden="true" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{m.productName}</p>
            <p className="text-sm text-muted-foreground">{m.reason}</p>
          </div>
          <div className="text-right">
            <p className={cn('font-semibold', m.type === 'in' ? 'text-success' : 'text-destructive')}>
              <span className="sr-only">{m.type === 'in' ? 'Entrada de' : 'Saída de'} </span>{m.type === 'in' ? '+' : '−'}{m.quantity}
            </p>
            <p className="text-xs text-muted-foreground">{m.date}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function EstoquePage() {
  const [params, setParams] = useSearchParams();
  const filtro = params.get('filtro') ?? 'all';
  const tab = params.get('aba') === 'movimentacoes' ? 'movimentacoes' : 'estoque';
  const [search, setSearch] = useState('');
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);
  const [adjust, setAdjust] = useState({ type: 'add' as 'add' | 'remove', quantity: '', reason: '', cost: '' });
  const [viewing, setViewing] = useState<InventoryItem | null>(null);
  const [minStock, setMinStock] = useState('');
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery({ queryKey: ['inventory'], queryFn: InventoryService.getInventory });
  const movementsQuery = useQuery({ queryKey: ['inventory-movements'], queryFn: () => InventoryService.getMovements() });

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const refreshAll = () => ['inventory', 'inventory-movements', 'inventory-alerts', 'products', 'product-stats', 'dashboard-overview']
    .forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));

  const adjustMutation = useMutation({
    mutationFn: InventoryService.adjustInventory,
    onSuccess: () => {
      refreshAll();
      FeedbackService.success('Estoque ajustado.');
      setAdjusting(null);
    },
    onError: (e: Error) => FeedbackService.error(e.message || 'Não foi possível ajustar o estoque.'),
  });

  const minStockMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) => InventoryService.updateMinStock(id, value),
    onSuccess: (_, { value }) => {
      refreshAll();
      FeedbackService.success('Estoque mínimo atualizado.');
      setViewing((v) => (v ? { ...v, minStock: value } : v));
    },
    onError: (e: Error) => FeedbackService.error(e.message || 'Não foi possível salvar o estoque mínimo.'),
  });

  const openAdjust = (item: InventoryItem) => {
    setAdjusting(item);
    setAdjust({ type: 'add', quantity: '', reason: '', cost: '' });
  };

  const openDetail = (item: InventoryItem) => {
    setViewing(item);
    setMinStock(String(item.minStock));
  };

  const submitAdjust = () => {
    const quantity = parseInt(adjust.quantity, 10);
    if (!adjusting || !quantity || quantity < 1 || !adjust.reason.trim()) {
      return FeedbackService.error('Informe a quantidade (1 ou mais) e o motivo.');
    }
    adjustMutation.mutate({
      productId: adjusting.productId,
      type: adjust.type,
      quantity,
      reason: adjust.reason.trim(),
      cost: adjust.cost ? parseFloat(adjust.cost) : undefined,
    });
  };

  const filter = (items: InventoryItem[]) => {
    const q = search.trim().toLowerCase();
    return items.filter((i) =>
      (!q || i.productName.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q)) &&
      (filtro === 'all' ||
        (filtro === 'baixo' && level(i) !== 'ok') ||
        (filtro === 'esgotado' && level(i) === 'out') ||
        (filtro === 'normal' && level(i) === 'ok')));
  };

  const items = inventoryQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Quantidades, reposição e histórico de movimentações."
        actions={
          <>
            <Button variant="outline" onClick={() => downloadCsv(filter(items))} disabled={!items.length}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Exportar CSV
            </Button>
            <Button variant="outline" onClick={refreshAll}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" /> Atualizar
            </Button>
          </>
        }
      />

      {inventoryQuery.data && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard title="Produtos" value={items.length} icon={Package} />
          <MetricCard title="Valor em estoque (custo)" value={items.reduce((t, i) => t + i.currentStock * i.averageCost, 0)} format="currency" icon={BarChart3} tone="success" />
          <MetricCard title="Estoque baixo" value={items.filter((i) => level(i) === 'low').length} icon={AlertTriangle} tone="warning" />
          <MetricCard title="Esgotados" value={items.filter((i) => level(i) === 'out').length} icon={PackageX} tone="destructive" />
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => setParam('aba', v === 'movimentacoes' ? v : null)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="estoque">Estoque atual</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:max-w-md">
              <Label htmlFor="busca-estoque" className="sr-only">Buscar no estoque</Label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="busca-estoque" placeholder="Nome ou SKU" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={filtro} onValueChange={(v) => setParam('filtro', v === 'all' ? null : v)}>
              <SelectTrigger className="sm:w-56" aria-label="Filtrar por situação do estoque"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="baixo">Precisa repor (baixo ou esgotado)</SelectItem>
                <SelectItem value="esgotado">Esgotados</SelectItem>
                <SelectItem value="normal">Em estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <QueryState
            query={inventoryQuery}
            isEmpty={(d) => d.length === 0}
            empty={
              <Card>
                <EmptyState icon={Package} title="Nenhum produto no estoque" description="Cadastre produtos para controlar o estoque."
                  action={<Button asChild><Link to="/painel/produtos/novo">Cadastrar produto</Link></Button>} />
              </Card>
            }
          >
            {(all) => {
              const list = filter(all);
              if (!list.length) {
                return (
                  <Card>
                    <EmptyState icon={Search} title={filtro === 'baixo' ? 'Nenhum produto precisa de reposição' : 'Nenhum produto com esses filtros'}
                      action={<Button variant="outline" onClick={() => { setSearch(''); setParam('filtro', null); }}>Ver todo o estoque</Button>} />
                  </Card>
                );
              }
              return (
                <Card className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Atual</TableHead>
                        <TableHead className="hidden text-right sm:table-cell">Mínimo</TableHead>
                        <TableHead className="hidden text-right md:table-cell">Custo médio</TableHead>
                        <TableHead>Situação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">{item.sku ? `SKU ${item.sku} · ` : ''}{item.category}</p>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{item.currentStock}</TableCell>
                          <TableCell className="hidden text-right sm:table-cell">{item.minStock}</TableCell>
                          <TableCell className="hidden text-right md:table-cell">{formatCurrency(item.averageCost)}</TableCell>
                          <TableCell><StatusBadge kind="stock" value={level(item)} /></TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <IconButton label={`Ajustar estoque de ${item.productName}`} icon={SlidersHorizontal} onClick={() => openAdjust(item)} />
                              <IconButton label={`Ver detalhes de ${item.productName}`} icon={Eye} onClick={() => openDetail(item)} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              );
            }}
          </QueryState>
        </TabsContent>

        <TabsContent value="movimentacoes">
          <Card>
            <CardContent className="p-4">
              <QueryState
                query={movementsQuery}
                isEmpty={(d) => d.length === 0}
                empty={<EmptyState title="Nenhuma movimentação ainda" description="Vendas, cancelamentos e ajustes aparecem aqui." />}
              >
                {(movements) => <MovementList movements={movements} />}
              </QueryState>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detalhe do item: estoque mínimo e últimas movimentações */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>{viewing.productName}</DialogTitle>
                <DialogDescription>{viewing.sku ? `SKU ${viewing.sku} · ` : ''}{viewing.category}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">Estoque atual</dt><dd className="text-lg font-semibold">{viewing.currentStock}</dd></div>
                <div><dt className="text-muted-foreground">Situação</dt><dd><StatusBadge kind="stock" value={level(viewing)} /></dd></div>
                <div><dt className="text-muted-foreground">Custo médio</dt><dd>{formatCurrency(viewing.averageCost)}</dd></div>
                <div><dt className="text-muted-foreground">Valor em estoque</dt><dd>{formatCurrency(viewing.currentStock * viewing.averageCost)}</dd></div>
              </dl>
              <form
                className="flex items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = parseInt(minStock, 10);
                  if (Number.isNaN(value) || value < 0) return FeedbackService.error('Informe um número inteiro a partir de 0.');
                  minStockMutation.mutate({ id: viewing.productId, value });
                }}
              >
                <div className="flex-1 space-y-2">
                  <Label htmlFor="estoque-minimo">Estoque mínimo (alerta de reposição)</Label>
                  <Input id="estoque-minimo" type="number" min="0" step="1" inputMode="numeric" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
                </div>
                <Button type="submit" variant="outline" disabled={minStockMutation.isPending}>Salvar</Button>
              </form>
              <div>
                <h3 className="mb-1 text-sm font-semibold">Últimas movimentações</h3>
                {(() => {
                  const own = (movementsQuery.data ?? []).filter((m) => m.productId === viewing.productId);
                  return own.length ? <MovementList movements={own.slice(0, 10)} /> : <p className="py-3 text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>;
                })()}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" asChild><Link to={`/painel/produtos/editar/${viewing.productId}`}>Editar produto</Link></Button>
                <Button onClick={() => { const v = viewing; setViewing(null); openAdjust(v); }}>Ajustar estoque</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!adjusting} onOpenChange={(o) => !o && setAdjusting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar estoque</DialogTitle>
            <DialogDescription>{adjusting?.productName} · hoje: {adjusting?.currentStock} unidade(s)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo-ajuste">Tipo de ajuste</Label>
              <Select value={adjust.type} onValueChange={(v) => setAdjust((a) => ({ ...a, type: v as 'add' | 'remove' }))}>
                <SelectTrigger id="tipo-ajuste"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Entrada (adicionar)</SelectItem>
                  <SelectItem value="remove">Saída (remover)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtd-ajuste">Quantidade *</Label>
              <Input id="qtd-ajuste" type="number" min="1" step="1" inputMode="numeric" value={adjust.quantity} onChange={(e) => setAdjust((a) => ({ ...a, quantity: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo-ajuste">Motivo *</Label>
              <Textarea id="motivo-ajuste" rows={3} value={adjust.reason} onChange={(e) => setAdjust((a) => ({ ...a, reason: e.target.value }))} placeholder="Ex.: reposição do fornecedor, avaria, inventário" />
            </div>
            {adjust.type === 'add' && (
              <div className="space-y-2">
                <Label htmlFor="custo-ajuste">Custo unitário (opcional)</Label>
                <Input id="custo-ajuste" type="number" min="0" step="0.01" inputMode="decimal" value={adjust.cost} onChange={(e) => setAdjust((a) => ({ ...a, cost: e.target.value }))} placeholder="0,00" />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAdjusting(null)}>Cancelar</Button>
            <Button onClick={submitAdjust} disabled={adjustMutation.isPending}>{adjustMutation.isPending ? 'Salvando…' : 'Confirmar ajuste'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
