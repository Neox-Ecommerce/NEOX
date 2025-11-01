import { StoreApiService, Store as ApiStore, StoreCreate, StoreUpdate } from './StoreApiService';

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

// Função para converter loja da API para o formato do frontend
function convertApiStoreToStore(apiStore: ApiStore): Store {
  return {
    id: apiStore.id.toString(),
    nome: apiStore.name,
    descricao: apiStore.description || '',
    endereco: apiStore.address || '',
    telefone: apiStore.phone || '',
    email: apiStore.email || '',
    website: apiStore.website,
    logo: apiStore.logo_url,
    ativo: apiStore.is_active,
    proprietarioId: apiStore.owner_id.toString(),
    createdAt: new Date(apiStore.created_at),
    updatedAt: apiStore.updated_at ? new Date(apiStore.updated_at) : new Date(apiStore.created_at)
  };
}

// Função para converter dados do frontend para o formato da API
function convertCreateDataToApi(createData: CreateStoreData): StoreCreate {
  return {
    name: createData.nome,
    description: createData.descricao,
    address: createData.endereco,
    phone: createData.telefone,
    email: createData.email,
    website: createData.website,
    logo_url: createData.logo,
    is_active: true
  };
}

// Função para converter dados de atualização
function convertUpdateDataToApi(updateData: Partial<CreateStoreData>): StoreUpdate {
  const apiData: StoreUpdate = {};
  
  if (updateData.nome !== undefined) apiData.name = updateData.nome;
  if (updateData.descricao !== undefined) apiData.description = updateData.descricao;
  if (updateData.endereco !== undefined) apiData.address = updateData.endereco;
  if (updateData.telefone !== undefined) apiData.phone = updateData.telefone;
  if (updateData.email !== undefined) apiData.email = updateData.email;
  if (updateData.website !== undefined) apiData.website = updateData.website;
  if (updateData.logo !== undefined) apiData.logo_url = updateData.logo;
  
  return apiData;
}

export class StoreService {
  // Buscar todas as lojas
  static async getStores(): Promise<Store[]> {
    try {
      const response = await StoreApiService.getStores();
      if (response.success && response.data) {
        return response.data.map(convertApiStoreToStore);
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
      return [];
    }
  }

  // Buscar loja por ID
  static async getStore(id: string): Promise<Store | null> {
    try {
      const response = await StoreApiService.getStore(parseInt(id));
      if (response.success && response.data) {
        return convertApiStoreToStore(response.data);
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar loja:', error);
      return null;
    }
  }

  // Buscar minha loja
  static async getMyStore(): Promise<Store | null> {
    try {
      const response = await StoreApiService.getMyStore();
      if (response.success && response.data) {
        return convertApiStoreToStore(response.data);
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar minha loja:', error);
      return null;
    }
  }

  // Criar loja
  static async createStore(storeData: CreateStoreData): Promise<Store | null> {
    try {
      const apiData = convertCreateDataToApi(storeData);
      const response = await StoreApiService.createStore(apiData);
      if (response.success && response.data) {
        return convertApiStoreToStore(response.data);
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar loja:', error);
      return null;
    }
  }

  // Atualizar loja
  static async updateStore(id: string, storeData: Partial<CreateStoreData>): Promise<Store | null> {
    try {
      const apiData = convertUpdateDataToApi(storeData);
      const response = await StoreApiService.updateStore(parseInt(id), apiData);
      if (response.success && response.data) {
        return convertApiStoreToStore(response.data);
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar loja:', error);
      return null;
    }
  }

  // Deletar loja
  static async deleteStore(id: string): Promise<boolean> {
    try {
      const response = await StoreApiService.deleteStore(parseInt(id));
      return response.success;
    } catch (error) {
      console.error('Erro ao deletar loja:', error);
      return false;
    }
  }

  // Buscar lojas por nome
  static async searchStores(query: string): Promise<Store[]> {
    try {
      const allStores = await this.getStores();
      return allStores.filter(store => 
        store.nome.toLowerCase().includes(query.toLowerCase()) ||
        store.descricao.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
      return [];
    }
  }

  // Toggle status da loja
  static async toggleStoreStatus(id: string): Promise<Store | null> {
    try {
      const store = await this.getStore(id);
      if (!store) return null;

      const response = await StoreApiService.updateStore(parseInt(id), { is_active: !store.ativo });
      if (response.success && response.data) {
        return convertApiStoreToStore(response.data);
      }
      return null;
    } catch (error) {
      console.error('Erro ao alterar status da loja:', error);
      return null;
    }
  }
}