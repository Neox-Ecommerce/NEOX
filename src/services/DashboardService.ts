import { api } from '@/lib/api';

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
  code: string; // número exibido (#000123)
  time: string;
  value: number;
}

export interface FeaturedProduct {
  name: string;
  sales: number;
  variation: number;
}

// A loja vem do token do lojista logado.
export const DashboardService = {
  fetchOverview(): Promise<DashboardOverview> {
    return api<DashboardOverview>('/reports/dashboard/overview');
  },

  fetchChartData(period: number = 30): Promise<ChartData[]> {
    return api<ChartData[]>('/reports/dashboard/chart', { query: { period } });
  },

  fetchRecentOrders(): Promise<RecentOrder[]> {
    return api<RecentOrder[]>('/reports/dashboard/recent-orders');
  },

  fetchFeaturedProducts(): Promise<FeaturedProduct[]> {
    return api<FeaturedProduct[]>('/reports/dashboard/featured-products');
  },
};
