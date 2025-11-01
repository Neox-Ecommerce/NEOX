// ============================================
// TIPOS RELACIONADOS A PRODUTOS
// ============================================

export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem?: string | null;
  categoria: string;
  ativo: boolean;
  peso?: number | null;
  dimensoes?: string | null;
  marca?: string | null;
  sku?: string | null;
  desconto?: number | null;
  lojaId: number;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface CreateProductData {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria: string;
  ativo?: boolean;
  imagem?: string | null;
  peso?: number | null;
  dimensoes?: string | null;
  marca?: string | null;
  sku?: string | null;
  desconto?: number | null;
}

export interface ProductStats {
  total: number;
  ativo: number;
  inativo: number;
  estoqueBaixo: number;
  esgotado: number;
  valorTotal: number;
}

export interface ProductFilters {
  categoria?: string;
  ativo?: boolean;
  estoqueBaixo?: boolean;
  esgotado?: boolean;
  search?: string;
}

