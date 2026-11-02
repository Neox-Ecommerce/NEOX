import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, EyeOff, Package, Plus, Search, Trash2 } from 'lucide-react';
import { ProductAdminCard } from '@/components/ProductAdminCard';
import { EmptyState, IconButton, PageHeader, QueryState } from '@/components/PageStates';
import { StatusBadge, stockLevel } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductService, type Product } from '@/services/ProductService';
import { FeedbackService } from '@/services/FeedbackService';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/lib/utils';

const FILTERS = { categoria: 'all', status: 'all', estoque: 'all', ordem: 'date' } as const;
type FilterKey = keyof typeof FILTERS;

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const get = (k: FilterKey) => params.get(k) ?? FILTERS[k];
  const [search, setSearch] = useState(params.get('q') ?? '');
  const q = useDebounce(search, 300).trim().toLowerCase();
  const [selected, setSelected] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<string[] | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({ queryKey: ['products'], queryFn: () => ProductService.getMyProducts() });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== (FILTERS as Record<string, string>)[key]) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const invalidate = () => ['products', 'category-counts', 'product-stats', 'inventory'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => (ids.length === 1 ? ProductService.delete(ids[0]) : ProductService.deleteMany(ids)),
    onSuccess: (_, ids) => {
      invalidate();
      FeedbackService.success(ids.length === 1 ? 'Produto excluído.' : `${ids.length} produtos excluídos.`);
      setSelected((s) => s.filter((id) => !ids.includes(id)));
      setToDelete(null);
    },
    onError: (e: Error) => FeedbackService.error(e.message || 'Não foi possível excluir.'),
  });

  const toggleMutation = useMutation({
    mutationFn: ProductService.toggleStatus,
    onSuccess: (p) => { invalidate(); FeedbackService.success(p.ativo ? 'Produto ativado.' : 'Produto desativado.'); },
    onError: (e: Error) => FeedbackService.error(e.message || 'Não foi possível alterar o status.'),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: boolean }) => ProductService.toggleManyStatus(ids, status),
    onSuccess: () => { invalidate(); FeedbackService.success('Status dos produtos atualizado.'); setSelected([]); },
    onError: (e: Error) => FeedbackService.error(e.message || 'Não foi possível alterar o status.'),
  });

  const filter = (products: Product[]) => products
    .filter((p) =>
      (!q || [p.nome, p.descricao, p.marca, p.sku].some((v) => v?.toLowerCase().includes(q))) &&
      (get('categoria') === 'all' || p.categoria === get('categoria')) &&
      (get('status') === 'all' || p.ativo === (get('status') === 'ativo')) &&
      (get('estoque') === 'all' ||
        (get('estoque') === 'baixo' ? stockLevel(p.estoque, p.minStock) === 'low' : stockLevel(p.estoque, p.minStock) === 'out')))
    .sort((a, b) => {
      if (get('ordem') === 'name') return a.nome.localeCompare(b.nome);
      if (get('ordem') === 'price') return a.preco - b.preco;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const edit = (id: string) => navigate(`/painel/produtos/editar/${id}`);
  const hasFilters = !!q || (['categoria', 'status', 'estoque'] as FilterKey[]).some((k) => get(k) !== FILTERS[k]);
  const deleteNames = toDelete?.length === 1 ? productsQuery.data?.find((p) => p.id === toDelete[0])?.nome : undefined;

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Cadastre, edite e organize o catálogo da sua loja."
        actions={<Button asChild><Link to="/painel/produtos/novo"><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Novo produto</Link></Button>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Label htmlFor="busca-produtos" className="sr-only">Buscar produtos</Label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="busca-produtos"
            placeholder="Nome, marca ou SKU"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setParam('q', e.target.value); }}
            className="pl-10"
          />
        </div>
        <Select value={get('categoria')} onValueChange={(v) => setParam('categoria', v)}>
          <SelectTrigger aria-label="Categoria"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {ProductService.getCategories().map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={get('status')} onValueChange={(v) => setParam('status', v)}>
          <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Ativos e inativos</SelectItem>
            <SelectItem value="ativo">Só ativos</SelectItem>
            <SelectItem value="inativo">Só inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={get('estoque')} onValueChange={(v) => setParam('estoque', v)}>
          <SelectTrigger aria-label="Estoque"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o estoque</SelectItem>
            <SelectItem value="baixo">Estoque baixo</SelectItem>
            <SelectItem value="esgotado">Esgotados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={get('ordem')} onValueChange={(v) => setParam('ordem', v)}>
          <SelectTrigger aria-label="Ordenar por"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Atualizados recentemente</SelectItem>
            <SelectItem value="name">Nome (A–Z)</SelectItem>
            <SelectItem value="price">Menor preço</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <QueryState
        query={productsQuery}
        isEmpty={(d) => d.length === 0}
        empty={
          <Card>
            <EmptyState
              icon={Package}
              title="Nenhum produto cadastrado"
              description="Cadastre o primeiro produto para começar a vender."
              action={<Button asChild><Link to="/painel/produtos/novo">Cadastrar produto</Link></Button>}
            />
          </Card>
        }
      >
        {(products) => {
          const list = filter(products);
          const allSelected = list.length > 0 && list.every((p) => selected.includes(p.id));
          const toggle = (id: string, checked: boolean) => setSelected((s) => (checked ? [...s, id] : s.filter((x) => x !== id)));
          if (list.length === 0) {
            return (
              <Card>
                <EmptyState
                  icon={Search}
                  title="Nenhum produto com esses filtros"
                  action={hasFilters && <Button variant="outline" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>Limpar filtros</Button>}
                />
              </Card>
            );
          }
          return (
            <>
              {selected.length > 0 && (
                <div role="region" aria-label="Ações em lote" className="sticky top-16 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 shadow-sm">
                  <span className="mr-auto text-sm font-medium">{selected.length} selecionado(s)</span>
                  <Button variant="outline" size="sm" onClick={() => bulkStatusMutation.mutate({ ids: selected, status: true })} disabled={bulkStatusMutation.isPending}>Ativar</Button>
                  <Button variant="outline" size="sm" onClick={() => bulkStatusMutation.mutate({ ids: selected, status: false })} disabled={bulkStatusMutation.isPending}>Desativar</Button>
                  <Button variant="destructive" size="sm" onClick={() => setToDelete(selected)}>Excluir</Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Limpar seleção</Button>
                </div>
              )}

              <Card className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={(c) => setSelected(c === true ? list.map((p) => p.id) : [])}
                          aria-label="Selecionar todos os produtos da lista"
                        />
                      </TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((p) => (
                      <TableRow key={p.id} data-state={selected.includes(p.id) ? 'selected' : undefined}>
                        <TableCell>
                          <Checkbox checked={selected.includes(p.id)} onCheckedChange={(c) => toggle(p.id, c === true)} aria-label={`Selecionar ${p.nome}`} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                              {p.imagem ? <img src={p.imagem} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
                            </div>
                            <div className="min-w-0">
                              <Link to={`/painel/produtos/editar/${p.id}`} className="font-medium hover:text-primary hover:underline">{p.nome}</Link>
                              {p.sku && <p className="text-xs text-muted-foreground">SKU {p.sku}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.categoria}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(p.desconto ? p.preco * (1 - p.desconto / 100) : p.preco)}
                          {!!p.desconto && <span className="block text-xs text-muted-foreground line-through">{formatCurrency(p.preco)}</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{p.estoque}</span>
                            {stockLevel(p.estoque, p.minStock) !== 'ok' && <StatusBadge kind="stock" value={stockLevel(p.estoque, p.minStock)} />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={p.ativo ? 'text-sm text-success' : 'text-sm text-muted-foreground'}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <IconButton label={p.ativo ? `Desativar ${p.nome}` : `Ativar ${p.nome}`} icon={p.ativo ? EyeOff : Eye} onClick={() => toggleMutation.mutate(p.id)} />
                            <IconButton label={`Editar ${p.nome}`} icon={Edit} onClick={() => edit(p.id)} />
                            <IconButton label={`Excluir ${p.nome}`} icon={Trash2} className="text-destructive hover:text-destructive" onClick={() => setToDelete([p.id])} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <div className="space-y-3 md:hidden">
                <div className="flex items-center gap-2 px-1">
                  <Checkbox
                    id="selecionar-todos-mobile"
                    checked={allSelected}
                    onCheckedChange={(c) => setSelected(c === true ? list.map((p) => p.id) : [])}
                  />
                  <Label htmlFor="selecionar-todos-mobile" className="text-sm">Selecionar todos ({list.length})</Label>
                </div>
                {list.map((p) => (
                  <ProductAdminCard
                    key={p.id}
                    product={p}
                    onEdit={edit}
                    onDelete={(id) => setToDelete([id])}
                    onToggleStatus={(id) => toggleMutation.mutate(id)}
                    selected={selected.includes(p.id)}
                    onSelect={(c) => toggle(p.id, c)}
                  />
                ))}
              </div>
            </>
          );
        }}
      </QueryState>

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{toDelete?.length === 1 ? 'Excluir produto?' : `Excluir ${toDelete?.length} produtos?`}</DialogTitle>
            <DialogDescription>
              {deleteNames ? `"${deleteNames}" será removido` : 'Os produtos selecionados serão removidos'} do catálogo. Esta ação não pode ser desfeita.
              Pedidos já feitos continuam com o nome do produto.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => toDelete && deleteMutation.mutate(toDelete)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Excluindo…' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
