export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem?: string;
  categoria: string;
  ativo: boolean;
  peso?: number;
  dimensoes?: string;
  marca?: string;
  sku?: string;
  desconto?: number;
  lojaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem?: string;
  categoria: string;
  ativo: boolean;
  peso?: number;
  dimensoes?: string;
  marca?: string;
  sku?: string;
  desconto?: number;
}

import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

export class ProductService {
  static async getMyProducts(lojaId?: string): Promise<Product[]> {
    try {
      const params = lojaId ? { lojaId } : {};
      const products = await apiClient.get<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS, params);
      // Garantir que seja um array
      if (!Array.isArray(products)) {
        console.error('Resposta inválida do servidor:', products);
        return [];
      }
      return products.map((p: any) => ({
        ...p,
        id: String(p.id || ''),
        lojaId: String(p.lojaId || p.store_id || ''),
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date()
      }));
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error(error.message || 'Erro ao buscar produtos.');
    }
  }

  static async getById(id: string): Promise<Product | null> {
    try {
      const product = await apiClient.get<Product>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
      if (!product) return null;
      return {
        ...product,
        id: String(product.id || id),
        lojaId: String(product.lojaId || (product as any).store_id || ''),
        createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
        updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date()
      };
    } catch (error: any) {
      if (error.status === 404) return null;
      console.error('Erro ao buscar produto:', error);
      throw new Error(error.message || 'Erro ao buscar produto.');
    }
  }

  static async create(data: CreateProductData, lojaId?: string): Promise<Product> {
    try {
      const payload = lojaId ? { ...data, lojaId } : data;
      const product = await apiClient.post<Product>(API_CONFIG.ENDPOINTS.PRODUCTS, payload);
      return {
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar produto.');
    }
  }

  static async update(id: string, data: Partial<CreateProductData>): Promise<Product> {
    try {
      const product = await apiClient.put<Product>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`, data);
      return {
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar produto.');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao excluir produto.');
    }
  }

  static async deleteMany(ids: string[]): Promise<void> {
    try {
      await apiClient.post(`${API_CONFIG.ENDPOINTS.PRODUCTS}/bulk-delete`, { ids });
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao excluir produtos.');
    }
  }

  static async toggleStatus(id: string): Promise<Product> {
    try {
      const product = await apiClient.patch<Product>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}/toggle-status`, {});
      return {
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao alterar status do produto.');
    }
  }

  static async toggleManyStatus(ids: string[], status: boolean): Promise<void> {
    try {
      await apiClient.post(`${API_CONFIG.ENDPOINTS.PRODUCTS}/bulk-status`, { ids, status });
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao alterar status dos produtos.');
    }
  }

  static async search(query: string, lojaId?: string): Promise<Product[]> {
    try {
      const params: any = { search: query };
      if (lojaId) params.lojaId = lojaId;
      
      const products = await apiClient.get<Product[]>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/search`, params);
      return products.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar produtos.');
    }
  }

  static async getByCategory(category: string, lojaId?: string): Promise<Product[]> {
    try {
      const params: any = { category };
      if (lojaId) params.lojaId = lojaId;
      
      const products = await apiClient.get<Product[]>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/category`, params);
      return products.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar produtos por categoria.');
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      return await apiClient.get<string[]>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/categories`);
    } catch (error: any) {
      // Retornar lista padrão em caso de erro
      return [
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
      ];
    }
  }

  static async getCategoryCounts(lojaId?: string): Promise<Record<string, number>> {
    try {
      const params = lojaId ? { lojaId } : {};
      return await apiClient.get<Record<string, number>>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/category-counts`, params);
    } catch (error: any) {
      return {};
    }
  }

  static async getProductStats(lojaId?: string): Promise<{
    total: number;
    ativo: number;
    inativo: number;
    estoqueBaixo: number;
    esgotado: number;
  }> {
    try {
      const params = lojaId ? { lojaId } : {};
      return await apiClient.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}/stats`, params);
    } catch (error: any) {
      return {
        total: 0,
        ativo: 0,
        inativo: 0,
        estoqueBaixo: 0,
        esgotado: 0
      };
    }
  }

  static async uploadImage(productId: string, file: File): Promise<string> {
    try {
      const result = await apiClient.upload<{ imageUrl: string }>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}/image`,
        file,
        'image'
      );
      return result.imageUrl;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer upload da imagem.');
    }
  }
}