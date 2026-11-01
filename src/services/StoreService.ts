import { api, withDates } from '@/lib/api';

export type StoreStatus = 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'SUSPENSA';

export interface Store {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  cnpjVerificado: boolean;
  segmento: string;
  categoriaTributaria: string;
  logo?: string;
  endereco?: string;
  telefone?: string;
  descricaoLoja?: string;
  horarioFuncionamento: {
    [key: string]: {
      ativo: boolean;
      abertura: string;
      fechamento: string;
    };
  };
  redesSociais: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    website?: string;
  };
  tiposEntrega: string[];
  status: StoreStatus;
  statusReason?: string;
}

export interface StoreDocument {
  id: string;
  tipo: string;
  description?: string;
  url: string;
  status: 'PENDENTE' | 'VERIFICADO' | 'REJEITADO';
  createdAt: Date;
}

export interface StoreWarning {
  id: string;
  motivo: string;
  resolvido: boolean;
  createdAt: Date;
}

export const StoreService = {
  getStore: (): Promise<Store> => api<Store>('/stores/me'),

  /** CNPJ e status não são editáveis aqui (CNPJ é validado pelo admin na aprovação). */
  updateStore: (data: Partial<Store>): Promise<Store> => {
    const { id: _id, cnpj: _cnpj, cnpjVerificado: _v, status: _s, statusReason: _r, ...body } = data;
    return api<Store>('/stores/me', { method: 'PUT', body });
  },

  /** Envia documento comprobatório; fica PENDENTE até a verificação pelo admin. */
  uploadDocument: async (file: File, description: string): Promise<StoreDocument> => {
    const form = new FormData();
    form.append('file', file);
    form.append('description', description);
    const doc = await api<StoreDocument>('/stores/me/documents', { method: 'POST', body: form });
    return withDates(doc, ['createdAt']);
  },

  getDocuments: async (): Promise<StoreDocument[]> =>
    (await api<StoreDocument[]>('/stores/me/documents')).map((d) => withDates(d, ['createdAt'])),

  getWarnings: async (): Promise<StoreWarning[]> =>
    (await api<StoreWarning[]>('/stores/me/warnings')).map((w) => withDates(w, ['createdAt'])),

  getSegmentos(): string[] {
    return [
      'Eletrônicos',
      'Moda e Acessórios',
      'Casa e Jardim',
      'Esportes e Lazer',
      'Livros e Papelaria',
      'Alimentação',
      'Saúde e Beleza',
      'Automotivo',
      'Brinquedos',
      'Informática',
      'Móveis',
      'Outros'
    ];
  },

  getCategoriasTributarias(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'MEI',
        label: 'MEI - Microempreendedor Individual',
        description: 'Para faturamento até R$ 81.000/ano'
      },
      {
        value: 'Simples Nacional',
        label: 'Simples Nacional',
        description: 'Para faturamento até R$ 4.800.000/ano'
      },
      {
        value: 'Lucro Presumido',
        label: 'Lucro Presumido',
        description: 'Para faturamento até R$ 78.000.000/ano'
      },
      {
        value: 'Lucro Real',
        label: 'Lucro Real',
        description: 'Para empresas de grande porte'
      }
    ];
  },

  getTiposEntrega(): string[] {
    return [
      'Delivery próprio',
      'Retirada no local',
      'Entrega por apps parceiros',
      'Correios',
      'Transportadora'
    ];
  },

  getDiasSemana(): Array<{key: string, label: string}> {
    return [
      { key: 'segunda', label: 'Segunda-feira' },
      { key: 'terca', label: 'Terça-feira' },
      { key: 'quarta', label: 'Quarta-feira' },
      { key: 'quinta', label: 'Quinta-feira' },
      { key: 'sexta', label: 'Sexta-feira' },
      { key: 'sabado', label: 'Sábado' },
      { key: 'domingo', label: 'Domingo' }
    ];
  },
};
