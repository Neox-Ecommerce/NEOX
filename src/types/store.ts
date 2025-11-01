// ============================================
// TIPOS RELACIONADOS A LOJA
// ============================================

export interface Store {
  id: string;
  nome: string;
  descricao: string;
  endereco: string;
  telefone: string;
  email: string;
  website?: string;
  logo?: string;
  ativo: boolean;
  proprietarioId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoreData {
  nome: string;
  descricao: string;
  endereco: string;
  telefone: string;
  email: string;
  website?: string;
  logo?: string;
}

