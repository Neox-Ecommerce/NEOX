export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
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

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingMethod: string;
  shippingAddress: ShippingAddress;
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
  trackingCode?: string;
  estimatedDelivery: string;
  createdAt: string;
  createdTime: string;
  updatedAt: string;
  lojaId: string;
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

import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

export class OrdersService {
  static async getOrders(lojaId?: string): Promise<Order[]> {
    try {
      const params = lojaId ? { lojaId } : {};
      return await apiClient.get<Order[]>(API_CONFIG.ENDPOINTS.ORDERS, params);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar pedidos.');
    }
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      return await apiClient.get<Order>(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`);
    } catch (error: any) {
      if (error.status === 404) return null;
      throw new Error(error.message || 'Erro ao buscar pedido.');
    }
  }

  static async getOrderStats(lojaId?: string): Promise<OrderStats> {
    try {
      const params = lojaId ? { lojaId } : {};
      return await apiClient.get<OrderStats>(`${API_CONFIG.ENDPOINTS.ORDERS}/stats`, params);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar estatísticas de pedidos.');
    }
  }

  static async updateOrderStatus(data: StatusUpdateData): Promise<Order> {
    try {
      return await apiClient.put<Order>(
        `${API_CONFIG.ENDPOINTS.ORDERS}/${data.orderId}/status`,
        { status: data.status, trackingCode: data.trackingCode, notes: data.notes }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar status do pedido.');
    }
  }

  static async getOrdersByStatus(lojaId: string, status: string): Promise<Order[]> {
    try {
      return await apiClient.get<Order[]>(API_CONFIG.ENDPOINTS.ORDERS, { lojaId, status });
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar pedidos.');
    }
  }

  static async getOrdersByDateRange(lojaId: string, startDate: string, endDate: string): Promise<Order[]> {
    try {
      return await apiClient.get<Order[]>(API_CONFIG.ENDPOINTS.ORDERS, { lojaId, startDate, endDate });
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar pedidos.');
    }
  }

  static async exportOrders(lojaId: string, filters?: any): Promise<Blob> {
    try {
      const params: any = { lojaId, ...filters };
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}/export?${new URLSearchParams(params)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('neox_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Erro ao exportar pedidos.');
      return await response.blob();
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao exportar pedidos.');
    }
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'createdTime'>): Promise<Order> {
    try {
      return await apiClient.post<Order>(API_CONFIG.ENDPOINTS.ORDERS, orderData);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar pedido.');
    }
  }

  static async deleteOrder(orderId: string): Promise<void> {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao excluir pedido.');
    }
  }
}
