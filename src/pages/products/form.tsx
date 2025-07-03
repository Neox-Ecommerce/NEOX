import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { ProductForm } from '@/components/ProductForm';
import { Button } from '@/components/ui/button';
import { ProductService } from '@/services/ProductService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEdit = id && id !== 'novo';

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductService.getById(id!),
    enabled: !!isEdit
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ProductService.create(data, user?.lojaId || '1'),
    onSuccess: () => {
      FeedbackService.success('Produto criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['category-counts'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      navigate('/painel/produtos');
    },
    onError: () => {
      FeedbackService.error('Erro ao criar produto');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      ProductService.update(id, data),
    onSuccess: () => {
      FeedbackService.success('Produto atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['category-counts'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      navigate('/painel/produtos');
    },
    onError: () => {
      FeedbackService.error('Erro ao atualizar produto');
    }
  });

  const handleSubmit = async (data: any) => {
    if (isEdit && id) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Loading state for edit mode
  if (isEdit && isLoading) {
    return (
      <RoleGuard requiredRole="EMPREENDEDOR">
        <AppShell>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando produto...</p>
            </div>
          </div>
        </AppShell>
      </RoleGuard>
    );
  }

  // Error state for edit mode when product not found
  if (isEdit && !isLoading && !product) {
    return (
      <RoleGuard requiredRole="EMPREENDEDOR">
        <AppShell>
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Produto não encontrado
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                O produto que você está tentando editar não existe ou foi removido.
              </p>
              <Button 
                onClick={() => navigate('/painel/produtos')} 
                className="mr-3"
              >
                Voltar aos Produtos
              </Button>
              <Button 
                onClick={() => navigate('/painel/produtos/novo')} 
                variant="outline"
              >
                Criar Novo Produto
              </Button>
            </div>
          </div>
        </AppShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="EMPREENDEDOR">
      <AppShell>
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/painel/produtos')}
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEdit ? 'Editar Produto' : 'Novo Produto'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isEdit 
                  ? 'Atualize as informações do produto' 
                  : 'Adicione um novo produto ao seu catálogo'
                }
              </p>
            </div>
          </div>

          <ProductForm
            product={product || undefined}
            onSubmit={handleSubmit}
            loading={isSubmitting}
          />
        </div>
      </AppShell>
    </RoleGuard>
  );
}