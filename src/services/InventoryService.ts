import { api, toCsvBlob, toDate, withDates } from '@/lib/api';

export interface InventoryItem {
  id: string; // igual ao productId
  productId: string;
  productName: string;
  sku?: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  averageCost: number;
  lastUpdated: Date;
  location?: string;
}

export interface InventoryMovement {
  id: string;
  productId?: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  cost?: number;
  date: string; // já formatada em pt-BR
  userId?: string;
  reference?: string;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  type: 'low_stock' | 'out_of_stock' | 'critical';
  message: string;
  createdAt: Date;
}

export interface AdjustmentData {
  productId: string;
  type: 'add' | 'remove';
  quantity: number;
  reason: string;
  cost?: number;
}

export const InventoryService = {
  async getInventory(): Promise<InventoryItem[]> {
    return (await api<InventoryItem[]>('/inventory')).map((i) => withDates(i, ['lastUpdated']));
  },

  async getMovements(skip = 0, limit = 50): Promise<InventoryMovement[]> {
    const rows = await api<InventoryMovement[]>('/inventory/movements', { query: { skip, limit } });
    return rows.map((m) => ({ ...m, date: toDate(m.date).toLocaleString('pt-BR') }));
  },

  async getAlerts(): Promise<InventoryAlert[]> {
    return (await api<InventoryAlert[]>('/inventory/alerts')).map((a) => withDates(a, ['createdAt']));
  },

  async adjustInventory(data: AdjustmentData): Promise<InventoryItem> {
    return withDates(await api<InventoryItem>('/inventory/adjust', { method: 'POST', body: data }), ['lastUpdated']);
  },

  async updateMinStock(productId: string, minStock: number): Promise<void> {
    await api(`/inventory/${productId}/min-stock`, { method: 'PATCH', body: { minStock } });
  },

  exportInventory(items: InventoryItem[]): Blob {
    const money = (n: number) => n.toFixed(2).replace('.', ',');
    return toCsvBlob([
      ['Produto', 'SKU', 'Categoria', 'Estoque Atual', 'Estoque Mínimo', 'Custo Médio', 'Valor Total', 'Localização'],
      ...items.map((i) => [
        i.productName,
        i.sku,
        i.category,
        i.currentStock,
        i.minStock,
        money(i.averageCost),
        money(i.currentStock * i.averageCost),
        i.location,
      ]),
    ]);
  },
};
