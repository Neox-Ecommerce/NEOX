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

export class DashboardService {
  static async fetchOverview(lojaId: string = '1'): Promise<DashboardOverview> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      produtos: 45,
      visitas: 2847,
      vendasMes: 28450.75,
      pedidosPendentes: 12,
      ticketMedio: 156.80,
      taxaConversao: 3.2,
      estoqueBaixo: 8,
      deltaVendas: 12.5,
      deltaVisitas: -2.1,
      deltaTicket: 8.3,
      hasAlerts: true,
      alertMessage: "Você possui 8 produtos com estoque baixo e 3 pedidos pendentes há mais de 48h."
    };
  }

  static async fetchChartData(period: number = 30, lojaId: string = '1'): Promise<ChartData[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const data: ChartData[] = [];
    const today = new Date();
    
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        receita: Math.floor(Math.random() * 2000) + 500,
        visitas: Math.floor(Math.random() * 150) + 50
      });
    }
    
    return data;
  }

  static async fetchRecentOrders(lojaId: string = '1'): Promise<RecentOrder[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      { id: '#001', time: 'há 2 horas', value: 299.90 },
      { id: '#002', time: 'há 4 horas', value: 156.50 },
      { id: '#003', time: 'há 6 horas', value: 89.99 },
      { id: '#004', time: 'há 8 horas', value: 445.20 },
      { id: '#005', time: 'há 12 horas', value: 78.90 }
    ];
  }

  static async fetchFeaturedProducts(lojaId: string = '1'): Promise<FeaturedProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      { name: 'iPhone 15 Pro Max', sales: 28, variation: 15.2 },
      { name: 'MacBook Pro M3', sales: 12, variation: -3.1 },
      { name: 'AirPods Pro', sales: 45, variation: 22.8 },
      { name: 'Galaxy S24 Ultra', sales: 18, variation: 8.5 }
    ];
  }
}