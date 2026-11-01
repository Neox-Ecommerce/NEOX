import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid3X3, List, Package, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { ProductAdminCard } from '@/components/ProductAdminCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductService } from '@/services/ProductService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/lib/utils';

export function ProductsPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    return (localStorage.getItem('products-view-mode') as 'grid' | 'table') || 'grid';
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', user?.lojaId],
    queryFn: () => ProductService.getMyProducts()
  });

  const { data: categoryCounts = {} } = useQuery({
    queryKey: ['category-counts', user?.lojaId],
    queryFn: () => ProductService.getCategoryCounts()
  });

  const deleteMutation = useMutation({
    mutationFn: ProductService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['category-counts'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      FeedbackService.success('Produto excluído com sucesso!');
      setDeleteId(null);
    },
    onError: () => {
      FeedbackService.error('Erro ao excluir produto');
    }
  });

  const deleteManyMutation = useMutation({
    mutationFn: ProductService.deleteMany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['category-counts'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      FeedbackService.success('Produtos excluídos com sucesso!');
      setSelectedProducts([]);
    },
    onError: () => {
      FeedbackService.error('Erro ao excluir produtos');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ProductService.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      FeedbackService.success('Status do produto atualizado!');
    },
    onError: () => {
      FeedbackService.error('Erro ao atualizar status do produto');
    }
  });

  const toggleManyStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: boolean }) =>
      ProductService.toggleManyStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      FeedbackService.success('Status dos produtos atualizado!');
      setSelectedProducts([]);
    },
    onError: () => {
      FeedbackService.error('Erro ao atualizar status dos produtos');
    }
  });

  const handleEdit = (id: string) => {
    navigate(`/painel/produtos/editar/${id}`);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleToggleStatus = (id: string) => {
    toggleStatusMutation.mutate(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('products-view-mode', mode);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    localStorage.setItem('products-sort-by', sort);
  };

  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleBulkDelete = () => {
    deleteManyMutation.mutate(selectedProducts);
  };

  const handleBulkActivate = () => {
    toggleManyStatusMutation.mutate({ ids: selectedProducts, status: true });
  };

  const handleBulkDeactivate = () => {
    toggleManyStatusMutation.mutate({ ids: selectedProducts, status: false });
  };

  // Filtrar e ordenar produtos
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = debouncedSearch === '' || 
        product.nome.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.descricao.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.marca?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.sku?.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.nome.localeCompare(b.nome);
        case 'price':
          return a.preco - b.preco;
        case 'date':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const categories = ProductService.getCategories();

  if (isLoading) {
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
        <TooltipProvider>
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Meus Produtos
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gerencie seu catálogo de produtos ({filteredProducts.length} produtos)
                </p>
              </div>
              <Button
                onClick={() => navigate('/painel/produtos/novo')}
                className="bg-primary hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todas as categorias ({products.length})
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category} ({categoryCounts[category] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data de criação</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="price">Preço</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handleViewModeChange('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Visualizar em grade</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handleViewModeChange('table')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Visualizar em lista</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedProducts.length} produto(s) selecionado(s)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleBulkActivate}>
                      Ativar Selecionados
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
                      Desativar Selecionados
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                      Excluir Selecionados
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Nenhum produto encontrado' 
                    : 'Nenhum produto cadastrado'
                  }
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando seu primeiro produto'
                  }
                </p>
                {!searchQuery && selectedCategory === 'all' && (
                  <Button
                    onClick={() => navigate('/painel/produtos/novo')}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Produto
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="space-y-4">
                    {viewMode === 'grid' && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedProducts.length === filteredProducts.length}
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm text-gray-600">Selecionar todos</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="relative">
                          <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={(checked) => 
                                handleProductSelect(product.id, checked as boolean)
                              }
                            />
                          </div>
                          <ProductAdminCard
                            product={product}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedProducts.length === filteredProducts.length}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Estoque</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => {
                          const precoComDesconto = product.desconto 
                            ? product.preco * (1 - product.desconto / 100)
                            : product.preco;

                          return (
                            <TableRow key={product.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedProducts.includes(product.id)}
                                  onCheckedChange={(checked) => 
                                    handleProductSelect(product.id, checked as boolean)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {product.imagem ? (
                                      <img 
                                        src={product.imagem} 
                                        alt={product.nome}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Package className="h-5 w-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {product.nome}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {product.marca && `${product.marca} • `}
                                      {product.sku}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                  {product.categoria}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-primary">
                                    {formatCurrency(precoComDesconto)}
                                  </span>
                                  {product.desconto && product.desconto > 0 && (
                                    <>
                                      <span className="text-xs text-gray-500 line-through">
                                        {formatCurrency(product.preco)}
                                      </span>
                                      <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                        -{product.desconto}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                    product.estoque > 10 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                      : product.estoque > 0
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {product.estoque} unidades
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  product.ativo 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                }`}>
                                  {product.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleStatus(product.id)}
                                    aria-label={product.ativo ? "Desativar produto" : "Ativar produto"}
                                    className="h-8 w-8"
                                  >
                                    {product.ativo ? (
                                      <Eye className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <EyeOff className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(product.id)}
                                    aria-label="Editar produto"
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(product.id)}
                                    aria-label="Excluir produto"
                                    className="h-8 w-8 text-red-600 hover:text-red-700"
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
                  </div>
                )}
              </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita e o produto será removido permanentemente do seu catálogo.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteId(null)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Excluindo...' : 'Excluir Produto'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TooltipProvider>
      </AppShell>
    </RoleGuard>
  );
}