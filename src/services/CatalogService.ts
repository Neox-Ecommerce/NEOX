import { api, withDates } from '@/lib/api';
import type { Product } from '@/services/ProductService';

export interface CatalogProduct extends Product {
  lojaNome: string;
  precoFinal: number; // preço com desconto aplicado
}

export interface PublicStore {
  id: string;
  nomeFantasia: string;
  logo?: string;
  descricaoLoja?: string;
  endereco?: string;
  telefone?: string;
  horarioFuncionamento: Record<string, { ativo: boolean; abertura: string; fechamento: string }>;
  redesSociais: Record<string, string>;
  tiposEntrega: string[];
  cnpjVerificado: boolean;
  segmento: string;
}

export interface CatalogFilters {
  q?: string;
  category?: string;
  storeId?: string;
  skip?: number;
  limit?: number;
}

const parse = (p: CatalogProduct): CatalogProduct => withDates(p, ['createdAt', 'updatedAt']);

// Catálogo público: só produtos ativos de lojas aprovadas.
export const CatalogService = {
  async getProducts(filters: CatalogFilters = {}): Promise<CatalogProduct[]> {
    return (await api<CatalogProduct[]>('/catalog/products', { query: { ...filters } })).map(parse);
  },

  async getProduct(id: string): Promise<CatalogProduct> {
    return parse(await api<CatalogProduct>(`/catalog/products/${id}`));
  },

  async getStore(id: string): Promise<PublicStore> {
    return api<PublicStore>(`/catalog/stores/${id}`);
  },

  async getStoreProducts(id: string): Promise<CatalogProduct[]> {
    return (await api<CatalogProduct[]>(`/catalog/stores/${id}/products`)).map(parse);
  },
};
