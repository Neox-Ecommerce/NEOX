export interface DashboardOverview {
  produtos: number;
  visitas: number;
  vendasMes: number;
  pedidosPendentes: number;
  ticketMedio: number;
  taxaConversao: number;
  estoqueBaixo: number;
  deltaVendas: number;
  deltaVisitas: number;
  deltaTicket: number;
  hasAlerts: boolean;
  alertMessage?: string;
}

export interface ChartData {
  date: string;
  receita: number;
  visitas: number;
}

export interface RecentOrder {
  id: string;
  time: string;
  value: number;
}

export interface FeaturedProduct {
  name: string;
  sales: number;
  variation: number;
}

import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

export class DashboardService {
  static async fetchOverview(lojaId?: string): Promise<DashboardOverview> {
    try {
      const params = lojaId ? { lojaId } : {};
      return await apiClient.get<DashboardOverview>(`${API_CONFIG.ENDPOINTS.DASHBOARD}/overview`, params);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar dados do dashboard.');
    }
  }

  static async fetchChartData(period: number = 30, lojaId?: string): Promise<ChartData[]> {
    try {
      const params: any = { period };
      if (lojaId) params.lojaId = lojaId;
      
      const data = await apiClient.get<ChartData[]>(`${API_CONFIG.ENDPOINTS.DASHBOARD}/chart`, params);
      return data.map(item => ({
        ...item,
        date: item.date
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar dados do gráfico.');
    }
  }

  static async fetchRecentOrders(lojaId?: string): Promise<RecentOrder[]> {
    try {
      const params = lojaId ? { lojaId } : {};
      return await apiClient.get<RecentOrder[]>(`${API_CONFIG.ENDPOINTS.DASHBOARD}/recent-orders`, params);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar pedidos recentes.');
    }
  }

  static async fetchFeaturedProducts(lojaId?: string): Promise<FeaturedProduct[]> {
    try {
      const params = lojaId ? { lojaId } : {};
      return await apiClient.get<FeaturedProduct[]>(`${API_CONFIG.ENDPOINTS.DASHBOARD}/featured-products`, params);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar produtos em destaque.');
    }
  }
}