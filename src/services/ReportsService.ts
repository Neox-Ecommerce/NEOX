import { api, toCsvBlob } from '@/lib/api';

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
    /** Perda (%) em relação à etapa anterior. */
    dropoffRate: number;
    conversionRate: number;
  }>;
  totalVisitors: number;
  finalConversions: number;
  overallConversionRate: number;
}

// period: week (7 dias), month (30), quarter (90) ou year (365); a loja vem do token.
export const ReportsService = {
  getSalesReport(period: string): Promise<SalesReport> {
    return api<SalesReport>('/reports/sales', { query: { period } });
  },

  getConversionReport(period: string): Promise<ConversionReport> {
    return api<ConversionReport>('/reports/conversion', { query: { period } });
  },

  getFunnelReport(period: string): Promise<FunnelReport> {
    return api<FunnelReport>('/reports/funnel', { query: { period } });
  },

  /** CSV gerado no navegador a partir do relatório já carregado. */
  exportReport(type: 'sales' | 'conversion' | 'funnel', data: SalesReport | ConversionReport | FunnelReport): Blob {
    switch (type) {
      case 'sales':
        return toCsvBlob([
          ['Data', 'Vendas (R$)', 'Pedidos'],
          ...(data as SalesReport).salesByDay.map((d) => [d.date, d.sales.toFixed(2), d.orders]),
        ]);
      case 'conversion':
        return toCsvBlob([
          ['Etapa', 'Visitantes', 'Taxa de Conversão (%)'],
          ...(data as ConversionReport).funnelSteps.map((s) => [s.step, s.visitors, s.conversionRate.toFixed(1)]),
        ]);
      case 'funnel':
        return toCsvBlob([
          ['Etapa', 'Visitantes', 'Perda (%)', 'Conversão (%)'],
          ...(data as FunnelReport).steps.map((s) => [s.name, s.visitors, s.dropoffRate.toFixed(1), s.conversionRate.toFixed(1)]),
        ]);
    }
  },
};
