import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Package, X, ImageIcon, AlertCircle } from 'lucide-react';
import { Product, ProductService } from '@/services/ProductService';
import { formatCurrency } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const productSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  preco: z.number().min(0.01, 'Preço deve ser maior que zero'),
  estoque: z.number().int().min(0, 'Estoque deve ser um número inteiro positivo'),
  imagem: z.string().optional(),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  ativo: z.boolean().default(true),
  peso: z.number().min(0, 'Peso deve ser positivo').optional(),
  dimensoes: z.string().optional(),
  marca: z.string().optional(),
  sku: z.string().optional(),
  desconto: z.number().min(0).max(100, 'Desconto deve estar entre 0 e 100%').optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  loading?: boolean;
}

export function ProductForm({ product, onSubmit, loading = false }: ProductFormProps) {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [precoDisplay, setPrecoDisplay] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState<string>('');

  // Carregar categorias ao montar o componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await ProductService.getCategories();
        setCategorias(cats);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Fallback para categorias padrão em caso de erro
        setCategorias([
          'Eletrônicos',
          'Informática',
          'Moda e Acessórios',
          'Casa e Jardim',
          'Esportes e Lazer',
          'Livros e Papelaria',
          'Alimentação',
          'Saúde e Beleza',
          'Automotivo',
          'Brinquedos',
          'Móveis',
          'Outros'
        ]);
      }
    };
    loadCategories();
  }, []);


  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
    clearErrors
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      nome: product.nome,
      descricao: product.descricao,
      preco: product.preco,
      estoque: product.estoque,
      imagem: product.imagem,
      categoria: product.categoria,
      ativo: product.ativo,
      peso: product.peso,
      dimensoes: product.dimensoes,
      marca: product.marca,
      sku: product.sku,
      desconto: product.desconto
    } : {
      ativo: true,
      desconto: 0
    }
  });

  useEffect(() => {
    if (product) {
      setImagePreview(product.imagem || '');
      setPrecoDisplay(formatCurrency(product.preco));
      reset({
        nome: product.nome,
        descricao: product.descricao,
        preco: product.preco,
        estoque: product.estoque,
        imagem: product.imagem,
        categoria: product.categoria,
        ativo: product.ativo,
        peso: product.peso,
        dimensoes: product.dimensoes,
        marca: product.marca,
        sku: product.sku,
        desconto: product.desconto
      });
    }
  }, [product, reset]);

  const validateImage = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Formato de imagem não suportado. Use JPG, PNG ou WebP.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'Imagem muito grande. Máximo 5MB.';
    }

    return null;
  };

  const handleImageUpload = (file: File) => {
    setImageError('');
    clearErrors('imagem');

    const error = validateImage(file);
    if (error) {
      setImageError(error);
      setError('imagem', { message: error });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setValue('imagem', result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setValue('imagem', '');
    setImageError('');
    clearErrors('imagem');
  };

  const handlePrecoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    const formattedValue = formatCurrency(parseFloat(numericValue) / 100 || 0);

    setPrecoDisplay(formattedValue);
    setValue('preco', parseFloat(numericValue) / 100 || 0);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    // Converter strings para números onde necessário
    const processedData = {
      ...data,
      preco: Number(data.preco),
      estoque: Number(data.estoque),
      peso: data.peso ? Number(data.peso) : undefined,
      desconto: data.desconto ? Number(data.desconto) : undefined
    };

    await onSubmit(processedData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            {product ? 'Editar Produto' : 'Novo Produto'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Upload de Imagem */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Imagem do Produto</Label>

              {imagePreview ? (
                <div className="relative">
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={imagePreview}
                      alt="Preview do produto"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
                    } ${imageError ? 'border-red-500 bg-red-50' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="image-upload"
                  />
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Arraste uma imagem aqui
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ou clique para selecionar um arquivo
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Escolher Arquivo
                    </Button>
                  </div>
                </div>
              )}

              {(imageError || errors.imagem) && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {imageError || errors.imagem?.message}
                </p>
              )}

              <p className="text-xs text-gray-500">
                Formatos aceitos: JPG, PNG, WebP. Tamanho máximo: 5MB
              </p>
            </div>

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-medium">
                    Nome do Produto *
                  </Label>
                  <Input
                    id="nome"
                    {...register('nome')}
                    placeholder="Ex: iPhone 15 Pro Max"
                    className="h-11"
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.nome.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm font-medium">
                    Categoria *
                  </Label>
                  <Select
                    value={watch('categoria')}
                    onValueChange={(value) => setValue('categoria', value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoria && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.categoria.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marca" className="text-sm font-medium">
                    Marca
                  </Label>
                  <Input
                    id="marca"
                    {...register('marca')}
                    placeholder="Ex: Apple, Samsung, Nike"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm font-medium">
                    SKU (Código do Produto)
                  </Label>
                  <Input
                    id="sku"
                    {...register('sku')}
                    placeholder="Ex: IPH15PM-256-BLK"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco" className="text-sm font-medium">
                      Preço *
                    </Label>
                    <Input
                      id="preco"
                      value={precoDisplay}
                      onChange={handlePrecoChange}
                      placeholder="R$ 0,00"
                      className="h-11"
                    />
                    {errors.preco && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.preco.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desconto" className="text-sm font-medium">
                      Desconto (%)
                    </Label>
                    <Input
                      id="desconto"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      {...register('desconto', { valueAsNumber: true })}
                      placeholder="0"
                      className="h-11"
                    />
                    {errors.desconto && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.desconto.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estoque" className="text-sm font-medium">
                      Estoque *
                    </Label>
                    <Input
                      id="estoque"
                      type="number"
                      min="0"
                      {...register('estoque', { valueAsNumber: true })}
                      placeholder="0"
                      className="h-11"
                    />
                    {errors.estoque && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.estoque.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="peso" className="text-sm font-medium">
                      Peso (kg)
                    </Label>
                    <Input
                      id="peso"
                      type="number"
                      min="0"
                      step="0.001"
                      {...register('peso', { valueAsNumber: true })}
                      placeholder="0.000"
                      className="h-11"
                    />
                    {errors.peso && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.peso.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensoes" className="text-sm font-medium">
                    Dimensões (C x L x A)
                  </Label>
                  <Input
                    id="dimensoes"
                    {...register('dimensoes')}
                    placeholder="Ex: 15 x 7 x 0.8 cm"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium">
                Descrição do Produto *
              </Label>
              <Textarea
                id="descricao"
                {...register('descricao')}
                placeholder="Descreva detalhadamente o produto, suas características, benefícios e especificações técnicas..."
                rows={6}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                {errors.descricao && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.descricao.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {watch('descricao')?.length || 0}/1000 caracteres
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                {...register('ativo')}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <Label htmlFor="ativo" className="text-sm font-medium">
                Produto ativo (visível na loja)
              </Label>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 bg-primary hover:bg-primary-hover"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  product ? 'Atualizar Produto' : 'Criar Produto'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}