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
  defaultShippingCost?: number | null; // frete padrão da loja
  freeShippingThreshold?: number | null; // frete grátis a partir deste subtotal
}

/** Loja na listagem pública. */
export interface StoreCard {
  id: string;
  nomeFantasia: string;
  logo?: string | null;
  segmento: string;
  descricaoLoja?: string | null;
  cnpjVerificado: boolean;
  productCount: number;
}

export type CatalogSort = 'relevance' | 'newest' | 'price_asc' | 'price_desc';

export interface CatalogFilters {
  q?: string;
  category?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: CatalogSort;
  skip?: number;
  limit?: number;
}

export interface Page<T> {
  items: T[];
  total: number;
}

const parse = (p: CatalogProduct): CatalogProduct => withDates(p, ['createdAt', 'updatedAt']);

// Catálogo público: só produtos ativos de lojas aprovadas.
export const CatalogService = {
  async getProducts(filters: CatalogFilters = {}): Promise<Page<CatalogProduct>> {
    const page = await api<Page<CatalogProduct>>('/catalog/products', { query: { ...filters } });
    return { ...page, items: page.items.map(parse) };
  },

  async getProduct(id: string): Promise<CatalogProduct> {
    return parse(await api<CatalogProduct>(`/catalog/products/${id}`));
  },

  getStores(params: { q?: string; skip?: number; limit?: number } = {}): Promise<Page<StoreCard>> {
    return api<Page<StoreCard>>('/catalog/stores', { query: params });
  },

  async getStore(id: string): Promise<PublicStore> {
    return api<PublicStore>(`/catalog/stores/${id}`);
  },

  async getStoreProducts(id: string, params: { q?: string } = {}): Promise<CatalogProduct[]> {
    return (await api<CatalogProduct[]>(`/catalog/stores/${id}/products`, { query: { ...params, limit: 200 } })).map(parse);
  },
};
