export interface SalesReport {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export interface ConversionReport {
  period: string;
  totalVisitors: number;
  totalConversions: number;
  conversionRate: number;
  funnelSteps: Array<{
    step: string;
    visitors: number;
    conversionRate: number;
  }>;
  conversionBySource: Array<{
    source: string;
    visitors: number;
    conversions: number;
    rate: number;
  }>;
}

export interface FunnelReport {
  period: string;
  steps: Array<{
    name: string;
    visitors: number;
    dropoffRate: number;
    conversionRate: number;
  }>;
  totalVisitors: number;
  finalConversions: number;
  overallConversionRate: number;
}

export interface FinancialReport {
  period: string;
  revenue: {
    gross: number;
    net: number;
    taxes: number;
    fees: number;
  };
  expenses: {
    total: number;
    categories: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  cashFlow: Array<{
    date: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
}

export class ReportsService {
  static async getSalesReport(lojaId: string, period: string): Promise<SalesReport> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock data baseado no período
    const mockData: SalesReport = {
      period,
      totalSales: 125430.75,
      totalOrders: 89,
      averageTicket: 1409.22,
      topProducts: [
        { id: '1', name: 'iPhone 15 Pro Max', quantity: 15, revenue: 134999.85 },
        { id: '2', name: 'MacBook Pro 14" M3', quantity: 8, revenue: 103999.20 },
        { id: '3', name: 'AirPods Pro', quantity: 25, revenue: 47499.75 },
        { id: '4', name: 'Samsung Galaxy S24', quantity: 12, revenue: 89999.88 }
      ],
      salesByDay: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          sales: Math.floor(Math.random() * 5000) + 1000,
          orders: Math.floor(Math.random() * 10) + 1
        };
      })
    };
    
    return mockData;
  }

  static async getConversionReport(lojaId: string, period: string): Promise<ConversionReport> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: ConversionReport = {
      period,
      totalVisitors: 12450,
      totalConversions: 398,
      conversionRate: 3.2,
      funnelSteps: [
        { step: 'Visitantes', visitors: 12450, conversionRate: 100 },
        { step: 'Visualizaram Produto', visitors: 8920, conversionRate: 71.6 },
        { step: 'Adicionaram ao Carrinho', visitors: 2340, conversionRate: 18.8 },
        { step: 'Iniciaram Checkout', visitors: 890, conversionRate: 7.1 },
        { step: 'Finalizaram Compra', visitors: 398, conversionRate: 3.2 }
      ],
      conversionBySource: [
        { source: 'Busca Orgânica', visitors: 5680, conversions: 198, rate: 3.5 },
        { source: 'Redes Sociais', visitors: 3240, conversions: 89, rate: 2.7 },
        { source: 'Email Marketing', visitors: 1890, conversions: 67, rate: 3.5 },
        { source: 'Tráfego Direto', visitors: 1640, conversions: 44, rate: 2.7 }
      ]
    };
    
    return mockData;
  }

  static async getFunnelReport(lojaId: string, period: string): Promise<FunnelReport> {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    const mockData: FunnelReport = {
      period,
      steps: [
        { name: 'Página Inicial', visitors: 12450, dropoffRate: 0, conversionRate: 100 },
        { name: 'Categoria de Produtos', visitors: 8920, dropoffRate: 28.4, conversionRate: 71.6 },
        { name: 'Página do Produto', visitors: 6780, dropoffRate: 24.0, conversionRate: 54.5 },
        { name: 'Carrinho', visitors: 2340, dropoffRate: 65.5, conversionRate: 18.8 },
        { name: 'Checkout', visitors: 890, dropoffRate: 62.0, conversionRate: 7.1 },
        { name: 'Pagamento', visitors: 520, dropoffRate: 41.6, conversionRate: 4.2 },
        { name: 'Confirmação', visitors: 398, dropoffRate: 23.5, conversionRate: 3.2 }
      ],
      totalVisitors: 12450,
      finalConversions: 398,
      overallConversionRate: 3.2
    };
    
    return mockData;
  }

  static async getFinancialReport(lojaId: string, period: string): Promise<FinancialReport> {
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const mockData: FinancialReport = {
      period,
      revenue: {
        gross: 125430.75,
        net: 118908.21,
        taxes: 4521.11,
        fees: 2001.43
      },
      expenses: {
        total: 45230.80,
        categories: [
          { name: 'Custo dos Produtos', amount: 28500.00, percentage: 63.0 },
          { name: 'Marketing', amount: 8750.50, percentage: 19.4 },
          { name: 'Operacional', amount: 4980.30, percentage: 11.0 },
          { name: 'Outros', amount: 3000.00, percentage: 6.6 }
        ]
      },
      profit: {
        gross: 96930.75,
        net: 73677.41,
        margin: 58.7
      },
      cashFlow: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const income = Math.floor(Math.random() * 8000) + 2000;
        const expenses = Math.floor(Math.random() * 3000) + 1000;
        return {
          date: date.toISOString().split('T')[0],
          income,
          expenses,
          balance: income - expenses
        };
      })
    };
    
    return mockData;
  }

  static async exportReport(type: string, data: any): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let csvContent = '';
    
    switch (type) {
      case 'sales':
        csvContent = [
          'Data,Vendas,Pedidos',
          ...data.salesByDay.map((day: any) => 
            `${day.date},${day.sales.toFixed(2)},${day.orders}`
          )
        ].join('\n');
        break;
      
      case 'conversion':
        csvContent = [
          'Etapa,Visitantes,Taxa de Conversão',
          ...data.funnelSteps.map((step: any) => 
            `"${step.step}",${step.visitors},${step.conversionRate.toFixed(2)}%`
          )
        ].join('\n');
        break;
      
      case 'financial':
        csvContent = [
          'Data,Receita,Despesas,Saldo',
          ...data.cashFlow.map((flow: any) => 
            `${flow.date},${flow.income.toFixed(2)},${flow.expenses.toFixed(2)},${flow.balance.toFixed(2)}`
          )
        ].join('\n');
        break;
      
      default:
        csvContent = 'Tipo de relatório não suportado';
    }
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}