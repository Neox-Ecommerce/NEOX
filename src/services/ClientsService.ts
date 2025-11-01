import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'Other';
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  totalOrders: number;
  totalSpent: number;
  averageTicket: number;
  lastOrderDate?: string;
  status: 'active' | 'inactive' | 'blocked';
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  averageTicket: number;
  totalRevenue: number;
  retentionRate: number;
}

export class ClientsService {
  /**
   * Lista todos os clientes da loja
   */
  static async getClients(lojaId: string): Promise<Client[]> {
    try {
      const response = await apiClient.get<Client[]>(
        API_CONFIG.ENDPOINTS.CLIENTS,
        { lojaId }
      );

      return response.map(client => ({
        ...client,
        createdAt: new Date(client.createdAt),
        updatedAt: new Date(client.updatedAt)
      }));
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error);
      throw new Error(error.message || 'Erro ao buscar clientes');
    }
  }

  /**
   * Busca um cliente por ID
   */
  static async getClientById(clientId: string): Promise<Client | null> {
    try {
      const response = await apiClient.get<Client>(
        `${API_CONFIG.ENDPOINTS.CLIENTS}/${clientId}`
      );

      if (!response) return null;

      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error: any) {
      if (error.status === 404) return null;
      console.error('Erro ao buscar cliente:', error);
      throw new Error(error.message || 'Erro ao buscar cliente');
    }
  }

  /**
   * Obtém estatísticas dos clientes
   */
  static async getClientStats(lojaId: string): Promise<ClientStats> {
    try {
      const response = await apiClient.get<ClientStats>(
        `${API_CONFIG.ENDPOINTS.CLIENTS}/stats`,
        { lojaId }
      );

      return response;
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error(error.message || 'Erro ao buscar estatísticas');
    }
  }

  /**
   * Cria um novo cliente
   */
  static async createClient(data: Partial<Client>): Promise<Client> {
    try {
      const response = await apiClient.post<Client>(
        API_CONFIG.ENDPOINTS.CLIENTS,
        data
      );

      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      throw new Error(error.message || 'Erro ao criar cliente');
    }
  }

  /**
   * Atualiza um cliente existente
   */
  static async updateClient(clientId: string, data: Partial<Client>): Promise<Client> {
    try {
      const response = await apiClient.put<Client>(
        `${API_CONFIG.ENDPOINTS.CLIENTS}/${clientId}`,
        data
      );

      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error);
      throw new Error(error.message || 'Erro ao atualizar cliente');
    }
  }

  /**
   * Busca clientes por termo de pesquisa
   */
  static async searchClients(query: string, lojaId?: string): Promise<Client[]> {
    try {
      const params: Record<string, string> = { search: query };
      if (lojaId) params.lojaId = lojaId;

      const response = await apiClient.get<Client[]>(
        `${API_CONFIG.ENDPOINTS.CLIENTS}/search`,
        params
      );

      return response.map(client => ({
        ...client,
        createdAt: new Date(client.createdAt),
        updatedAt: new Date(client.updatedAt)
      }));
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error);
      throw new Error(error.message || 'Erro ao buscar clientes');
    }
  }

  /**
   * Exporta clientes para CSV
   */
  static async exportClients(lojaId: string): Promise<Blob> {
    try {
      const clients = await this.getClients(lojaId);

      const csvContent = [
        'Nome,Email,Telefone,CPF,Total Pedidos,Total Gasto,Ticket Médio,Status,Data Cadastro',
        ...clients.map(client =>
          `"${client.name}","${client.email}","${client.phone}","${client.document}",${client.totalOrders},${client.totalSpent.toFixed(2)},${client.averageTicket.toFixed(2)},"${client.status}","${client.createdAt.toLocaleDateString('pt-BR')}"`
        )
      ].join('\n');

      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error: any) {
      console.error('Erro ao exportar clientes:', error);
      throw new Error(error.message || 'Erro ao exportar clientes');
    }
  }

  /**
   * Deleta um cliente
   */
  static async deleteClient(clientId: string): Promise<void> {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.CLIENTS}/${clientId}`);
    } catch (error: any) {
      console.error('Erro ao deletar cliente:', error);
      throw new Error(error.message || 'Erro ao deletar cliente');
    }
  }
}
