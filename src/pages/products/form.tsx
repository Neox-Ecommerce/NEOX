import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductForm } from '@/components/ProductForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, PageHeader, PageLoader } from '@/components/PageStates';
import { ProductService, type CreateProductData } from '@/services/ProductService';
import { FeedbackService } from '@/services/FeedbackService';

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id && id !== 'novo';

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductService.getById(id!),
    enabled: isEdit,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProductData) => (isEdit ? ProductService.update(id!, data) : ProductService.create(data)),
    onSuccess: () => {
      FeedbackService.success(isEdit ? 'Produto atualizado.' : 'Produto cadastrado.');
      ['products', 'product', 'category-counts', 'product-stats', 'inventory'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      navigate('/painel/produtos');
    },
    onError: (error: Error) => FeedbackService.error(isEdit ? 'Não foi possível salvar o produto' : 'Não foi possível cadastrar o produto', error.message),
  });

  const title = isEdit ? 'Editar produto' : 'Novo produto';
  const header = (
    <PageHeader
      title={title}
      description={isEdit ? product?.nome : 'Preencha os dados e publique no seu catálogo.'}
      breadcrumbs={[{ label: 'Produtos', to: '/painel/produtos' }, { label: title }]}
    />
  );

  if (isEdit && isLoading) return <div>{header}<PageLoader label="Carregando produto…" /></div>;

  if (isEdit && !product) {
    return (
      <div>
        {header}
        <Card>
          <EmptyState
            title="Produto não encontrado"
            description="Ele pode ter sido excluído."
            action={<Button asChild><Link to="/painel/produtos">Voltar para produtos</Link></Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      {header}
      <ProductForm product={product ?? undefined} onSubmit={(data) => mutation.mutateAsync(data)} loading={mutation.isPending} />
    </div>
  );
}
