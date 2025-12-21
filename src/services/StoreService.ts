import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

interface Store {
  id: string;
  name: string;
  cnpj: string;
  description?: string;
  is_verified: boolean;
  owner_id: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interface estendida para compatibilidade com UI antiga
interface StoreExtended extends Store {
  nomeFantasia: string;
  razaoSocial: string;
  cnpjVerificado: boolean;
  segmento: string;
  categoriaTributaria: string;
  logo?: string;
  endereco?: string;
  telefone?: string;
  descricaoLoja?: string;
  horarioFuncionamento?: {
    [key: string]: {
      ativo: boolean;
      abertura: string;
      fechamento: string;
    };
  };
  redesSociais?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    website?: string;
  };
  tiposEntrega?: string[];
}

export class StoreService {
  private static convertToExtended(store: Store): StoreExtended {
    // Converte formato da API para formato esperado pela UI
    return {
      ...store,
      nomeFantasia: store.name,
      razaoSocial: store.description || store.name,
      cnpjVerificado: store.is_verified,
      segmento: 'Eletrônicos',
      categoriaTributaria: 'Simples Nacional',
      descricaoLoja: store.description,
      horarioFuncionamento: {
        segunda: { ativo: true, abertura: '08:00', fechamento: '18:00' },
        terca: { ativo: true, abertura: '08:00', fechamento: '18:00' },
        quarta: { ativo: true, abertura: '08:00', fechamento: '18:00' },
        quinta: { ativo: true, abertura: '08:00', fechamento: '18:00' },
        sexta: { ativo: true, abertura: '08:00', fechamento: '18:00' },
        sabado: { ativo: true, abertura: '09:00', fechamento: '17:00' },
        domingo: { ativo: false, abertura: '09:00', fechamento: '17:00' }
      },
      redesSociais: {},
      tiposEntrega: ['Delivery próprio', 'Retirada no local']
    };
  }

  static async getStore(): Promise<StoreExtended> {
    try {
      // Busca loja do usuário atual na API
      const store = await apiClient.get<Store>(`${API_CONFIG.ENDPOINTS.STORE}/my-store`);
      return this.convertToExtended(store);
    } catch (error: any) {
      // Se não encontrar loja (404), retornar null ou objeto vazio
      if (error.status === 404) {
        throw new Error('Loja não encontrada. Por favor, cadastre sua loja.');
      }
      console.error('Erro ao buscar loja:', error);
      throw new Error(error.message || 'Erro ao buscar dados da loja.');
    }
  }

  static async createStore(data: { name: string; cnpj: string; description?: string }): Promise<StoreExtended> {
    try {
      const store = await apiClient.post<Store>(API_CONFIG.ENDPOINTS.STORE, data);
      return this.convertToExtended(store);
    } catch (error: any) {
      console.error('Erro ao criar loja:', error);
      throw new Error(error.message || 'Erro ao criar loja.');
    }
  }

  static async updateStore(data: Partial<{ name: string; cnpj: string; description: string }>): Promise<StoreExtended> {
    try {
      // Primeiro busca a loja para pegar o ID
      const currentStore = await apiClient.get<Store>(`${API_CONFIG.ENDPOINTS.STORE}/my-store`);

      // Atualiza a loja
      const updatedStore = await apiClient.put<Store>(
        `${API_CONFIG.ENDPOINTS.STORE}/${currentStore.id}`,
        data
      );

      return this.convertToExtended(updatedStore);
    } catch (error: any) {
      console.error('Erro ao atualizar loja:', error);
      throw new Error(error.message || 'Erro ao atualizar loja.');
    }
  }

  static async uploadDocument(file: File, description: string): Promise<void> {
    try {
      // TODO: Implementar upload de documentos quando backend tiver endpoint
      console.warn('Upload de documentos ainda não implementado no backend');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error('Erro ao fazer upload do documento:', error);
      throw new Error(error.message || 'Erro ao fazer upload do documento.');
    }
  }

  static getSegmentos(): string[] {
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
  }

  static getCategoriasTributarias(): Array<{value: string, label: string, description: string}> {
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
  }

  static getTiposEntrega(): string[] {
    return [
      'Delivery próprio',
      'Retirada no local',
      'Entrega por apps parceiros',
      'Correios',
      'Transportadora'
    ];
  }

  static getDiasSemana(): Array<{key: string, label: string}> {
    return [
      { key: 'segunda', label: 'Segunda-feira' },
      { key: 'terca', label: 'Terça-feira' },
      { key: 'quarta', label: 'Quarta-feira' },
      { key: 'quinta', label: 'Quinta-feira' },
      { key: 'sexta', label: 'Sexta-feira' },
      { key: 'sabado', label: 'Sábado' },
      { key: 'domingo', label: 'Domingo' }
    ];
  }
}