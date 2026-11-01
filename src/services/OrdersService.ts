import { api, toCsvBlob, withDates } from '@/lib/api';

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  sku?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
}

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface Order {
  id: string;
  code: string; // número exibido ao usuário (#000123)
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingMethod: string;
  shippingAddress: ShippingAddress;
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  trackingCode?: string;
  estimatedDelivery?: string;
  createdAt: Date;
  updatedAt: Date;
  lojaId: string;
  lojaNome?: string;
  notes?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  averageTicket: number;
  ordersToday: number;
  revenueToday: number;
  conversionRate: number;
}

export interface StatusUpdateData {
  orderId: string;
  status: string;
  trackingCode?: string;
  notes?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  returned: 'Devolvido',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  a_combinar: 'A combinar com a loja',
};

const parse = (o: Order): Order => withDates(o, ['createdAt', 'updatedAt']);

// Rotas do lojista usam a loja do token; /me/orders são os pedidos do cliente logado.
export const OrdersService = {
  async getOrders(filters?: { status?: string; startDate?: string; endDate?: string }): Promise<Order[]> {
    return (await api<Order[]>('/orders', { query: filters })).map(parse);
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      return parse(await api<Order>(`/orders/${orderId}`));
    } catch {
      return null;
    }
  },

  async getOrderStats(): Promise<OrderStats> {
    return api<OrderStats>('/orders/stats');
  },

  async updateOrderStatus({ orderId, ...data }: StatusUpdateData): Promise<Order> {
    return parse(await api<Order>(`/orders/${orderId}/status`, { method: 'PATCH', body: data }));
  },

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return OrdersService.getOrders({ status });
  },

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    return OrdersService.getOrders({ startDate, endDate });
  },

  async getMyOrders(): Promise<Order[]> {
    return (await api<Order[]>('/me/orders')).map(parse);
  },

  async getMyOrder(orderId: string): Promise<Order> {
    return parse(await api<Order>(`/me/orders/${orderId}`));
  },

  exportOrders(orders: Order[]): Blob {
    return toCsvBlob([
      ['Pedido', 'Cliente', 'Email', 'Data', 'Status', 'Pagamento', 'Total', 'Itens'],
      ...orders.map((o) => [
        o.code,
        o.customer.name,
        o.customer.email,
        o.createdAt.toLocaleString('pt-BR'),
        ORDER_STATUS_LABELS[o.status] ?? o.status,
        o.paymentStatus,
        o.total.toFixed(2).replace('.', ','),
        o.items.reduce((n, i) => n + i.quantity, 0),
      ]),
    ]);
  },
};
