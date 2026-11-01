import { api, withDates } from '@/lib/api';

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
  imagem?: string; // URL ou data URL base64 (a API grava o arquivo)
  categoria: string;
  ativo: boolean;
  peso?: number;
  dimensoes?: string;
  marca?: string;
  sku?: string;
  desconto?: number;
}

// Lista de referência de categorias (não é dado de loja).
const CATEGORIES = [
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
  'Outros',
];

const BASE = '/clients/products';
const parse = (p: Product): Product => withDates(p, ['createdAt', 'updatedAt']);

// Todas as rotas usam a loja do usuário logado (definida pelo token na API).
export const ProductService = {
  async getMyProducts(): Promise<Product[]> {
    return (await api<Product[]>(BASE, { query: { limit: 500 } })).map(parse);
  },

  async getById(id: string): Promise<Product | null> {
    try {
      return parse(await api<Product>(`${BASE}/${id}`));
    } catch {
      return null;
    }
  },

  async create(data: CreateProductData): Promise<Product> {
    return parse(await api<Product>(BASE, { method: 'POST', body: data }));
  },

  async update(id: string, data: Partial<CreateProductData>): Promise<Product> {
    return parse(await api<Product>(`${BASE}/${id}`, { method: 'PUT', body: data }));
  },

  async delete(id: string): Promise<void> {
    await api(`${BASE}/${id}`, { method: 'DELETE' });
  },

  async deleteMany(ids: string[]): Promise<void> {
    await api(`${BASE}/bulk-delete`, { method: 'POST', body: { ids } });
  },

  async toggleStatus(id: string): Promise<Product> {
    return parse(await api<Product>(`${BASE}/${id}/toggle-status`, { method: 'PATCH' }));
  },

  async toggleManyStatus(ids: string[], status: boolean): Promise<void> {
    await api(`${BASE}/bulk-status`, { method: 'POST', body: { ids, status } });
  },

  async search(query: string): Promise<Product[]> {
    return (await api<Product[]>(BASE, { query: { q: query, limit: 500 } })).map(parse);
  },

  async getByCategory(category: string): Promise<Product[]> {
    return (await api<Product[]>(BASE, { query: { category, limit: 500 } })).map(parse);
  },

  getCategories(): string[] {
    return CATEGORIES;
  },

  async getCategoryCounts(): Promise<Record<string, number>> {
    const products = await ProductService.getMyProducts();
    return Object.fromEntries(CATEGORIES.map((c) => [c, products.filter((p) => p.categoria === c).length]));
  },

  async getProductStats(): Promise<{ total: number; ativo: number; inativo: number; estoqueBaixo: number; esgotado: number }> {
    const products = await ProductService.getMyProducts();
    return {
      total: products.length,
      ativo: products.filter((p) => p.ativo).length,
      inativo: products.filter((p) => !p.ativo).length,
      estoqueBaixo: products.filter((p) => p.estoque > 0 && p.estoque <= 5).length,
      esgotado: products.filter((p) => p.estoque === 0).length,
    };
  },
};
