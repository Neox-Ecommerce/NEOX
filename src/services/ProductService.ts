import { ProductApiService, Product as ApiProduct, ProductCreate, ProductUpdate } from './ProductApiService';
import { Product, CreateProductData, ProductStats } from '@/types';
import { getDefaultCategories } from '@/constants/categories';
import { extractApiArray } from '@/utils/api-helpers';

// Re-exportar tipos para compatibilidade
export type { Product, CreateProductData, ProductStats };

function mapApiProductToProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    nome: apiProduct.name,
    descricao: apiProduct.description,
    preco: apiProduct.price,
    estoque: apiProduct.stock,
    imagem: apiProduct.image_url ?? null,
    categoria: apiProduct.category,
    ativo: apiProduct.is_active,
    peso: null,
    dimensoes: null,
    marca: null,
    sku: null,
    desconto: null,
    lojaId: apiProduct.store_id,
    createdAt: new Date(apiProduct.created_at),
    updatedAt: apiProduct.updated_at ? new Date(apiProduct.updated_at) : null,
  };
}

function mapCreateDataToApi(data: CreateProductData): ProductCreate {
  return {
    name: data.nome,
    description: data.descricao,
    price: data.preco,
    stock: data.estoque,
    category: data.categoria,
    image_url: data.imagem,
    is_active: data.ativo ?? true,
  };
}

function mapUpdateDataToApi(data: Partial<CreateProductData>): ProductUpdate {
  const apiData: ProductUpdate = {};

  if (data.nome !== undefined) apiData.name = data.nome;
  if (data.descricao !== undefined) apiData.description = data.descricao;
  if (data.preco !== undefined) apiData.price = data.preco;
  if (data.estoque !== undefined) apiData.stock = data.estoque;
  if (data.categoria !== undefined) apiData.category = data.categoria;
  if (data.imagem !== undefined) apiData.image_url = data.imagem;
  if (data.ativo !== undefined) apiData.is_active = data.ativo;

  return apiData;
}

// ProductStats já está importado de @/types

export class ProductService {
  static async getProducts(lojaId?: number | string | null): Promise<Product[]> {
    if (lojaId === undefined || lojaId === null) {
      return [];
    }

    try {
      const response = await ProductApiService.getProductsByStore(Number(lojaId));
      
      // Extrair e normalizar array de produtos
      const productsArray = extractApiArray<ApiProduct>(response);
      
      // Mapear produtos com validação
      return productsArray
        .filter(item => item && typeof item === 'object') // Filtrar itens inválidos
        .map(mapApiProductToProduct);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  static async getProduct(id: string | number): Promise<Product | null> {
    try {
      const response = await ProductApiService.getProduct(Number(id));
      if (!response || !response.data) {
        console.warn('Resposta da API inválida para getProduct');
        return null;
      }
      return mapApiProductToProduct(response.data);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  }

  static async createProduct(data: CreateProductData): Promise<Product> {
    try {
      const payload = mapCreateDataToApi(data);
      const response = await ProductApiService.createProduct(payload);
      if (!response || !response.data) {
        throw new Error('Resposta da API inválida ao criar produto');
      }
      return mapApiProductToProduct(response.data);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  static async updateProduct(id: string | number, data: Partial<CreateProductData>): Promise<Product> {
    try {
      const payload = mapUpdateDataToApi(data);
      const response = await ProductApiService.updateProduct(Number(id), payload);
      if (!response || !response.data) {
        throw new Error('Resposta da API inválida ao atualizar produto');
      }
      return mapApiProductToProduct(response.data);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string | number): Promise<void> {
    await ProductApiService.deleteProduct(Number(id));
  }

  static async getCategories(lojaId?: number | string | null): Promise<string[]> {
    // Esta função SEMPRE retorna um array válido, nunca lança erro
    try {
      // Sempre retornar pelo menos as categorias padrão
      if (lojaId === undefined || lojaId === null) {
        return getDefaultCategories();
      }
      
      let products: Product[] = [];
      
      try {
        // Tentar buscar produtos, mas se falhar, continuar com array vazio
        products = await this.getProducts(lojaId);
        // getProducts sempre retorna array válido
      } catch (productsError) {
        // Se getProducts falhar, apenas logar e continuar com array vazio
        console.warn('getProducts falhou, usando categorias padrão. Erro:', productsError);
        products = [];
      }
      
      // Se não houver produtos, retornar categorias padrão
      if (!products || products.length === 0) {
        return getDefaultCategories();
      }
      
      // Extrair categorias dos produtos de forma segura
      try {
        const categories = Array.from(
          new Set(
            products
              .map(product => {
                // Garantir que product existe e tem categoria válida
                if (!product || typeof product !== 'object') return null;
                const categoria = product.categoria;
                // Garantir que categoria seja string válida
                if (typeof categoria === 'string' && categoria.trim()) {
                  return categoria.trim();
                }
                return null;
              })
              .filter((cat): cat is string => cat !== null && typeof cat === 'string' && cat.length > 0)
          )
        );
        
        // Sempre retornar pelo menos as categorias padrão se não houver categorias dos produtos
        return categories.length > 0 ? categories : getDefaultCategories();
      } catch (extractionError) {
        console.warn('Erro ao extrair categorias dos produtos:', extractionError);
        return getDefaultCategories();
      }
    } catch (error) {
      // Última camada de proteção - NUNCA lançar erro, sempre retornar categorias padrão
      console.error('Erro inesperado ao buscar categorias:', error);
      return getDefaultCategories();
    }
  }

  static calculateStats(products: Product[]): ProductStats {
    const total = products.length;
    const ativo = products.filter(product => product.ativo).length;
    const inativo = total - ativo;
    const estoqueBaixo = products.filter(product => product.estoque > 0 && product.estoque <= 5).length;
    const esgotado = products.filter(product => product.estoque === 0).length;
    const valorTotal = products.reduce((sum, product) => sum + product.preco * product.estoque, 0);

    return {
      total,
      ativo,
      inativo,
      estoqueBaixo,
      esgotado,
      valorTotal,
    };
  }

  static calculateCategoryCounts(products: Product[]): Record<string, number> {
    return products.reduce<Record<string, number>>((acc, product) => {
      const categoria = product.categoria || 'Outros';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});
  }

  static search(products: Product[], query: string): Product[] {
    const term = query.toLowerCase();
    return products.filter(product =>
      product.nome.toLowerCase().includes(term) ||
      product.descricao.toLowerCase().includes(term) ||
      product.categoria.toLowerCase().includes(term)
    );
  }
}