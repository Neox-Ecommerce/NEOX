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

export class OrdersService {
  private static ORDERS_KEY = 'neox_orders';

  private static getStoredOrders(): Order[] {
    const stored = localStorage.getItem(this.ORDERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Seed inicial
    const seedOrders: Order[] = [
      {
        id: '#001234',
        customer: {
          id: '1',
          name: 'João Silva Santos',
          email: 'joao.silva@email.com',
          phone: '(11) 99999-1234',
          document: '123.456.789-00'
        },
        items: [
          {
            id: '1',
            productId: '1',
            productName: 'iPhone 15 Pro Max',
            sku: 'IPH15PM-256-TIT',
            quantity: 1,
            price: 8999.99,
            image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          {
            id: '2',
            productId: '3',
            productName: 'AirPods Pro (3ª geração)',
            sku: 'APP3-WHT-USB',
            quantity: 1,
            price: 1899.99,
            image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=150'
          }
        ],
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'Cartão de Crédito',
        shippingMethod: 'Entrega Expressa',
        shippingAddress: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil'
        },
        shippingCost: 0,
        subtotal: 10899.98,
        discount: 0,
        total: 10899.98,
        trackingCode: 'BR123456789SP',
        estimatedDelivery: '2-3 dias úteis',
        createdAt: '2024-01-20',
        createdTime: '14:30',
        updatedAt: '2024-01-21',
        lojaId: '1'
      },
      {
        id: '#001235',
        customer: {
          id: '2',
          name: 'Maria Oliveira',
          email: 'maria.oliveira@email.com',
          phone: '(11) 98888-5678',
          document: '987.654.321-00'
        },
        items: [
          {
            id: '3',
            productId: '2',
            productName: 'MacBook Pro 14" M3',
            sku: 'MBP14-M3-512-SG',
            quantity: 1,
            price: 12999.90
          }
        ],
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'PIX',
        shippingMethod: 'Entrega Padrão',
        shippingAddress: {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          country: 'Brasil'
        },
        shippingCost: 29.90,
        subtotal: 12999.90,
        discount: 500.00,
        total: 12529.80,
        estimatedDelivery: '5-7 dias úteis',
        createdAt: '2024-01-19',
        createdTime: '09:15',
        updatedAt: '2024-01-19',
        lojaId: '1'
      },
      {
        id: '#001236',
        customer: {
          id: '3',
          name: 'Pedro Costa',
          email: 'pedro.costa@email.com',
          phone: '(11) 97777-9012',
          document: '456.789.123-00'
        },
        items: [
          {
            id: '4',
            productId: '4',
            productName: 'Samsung Galaxy S24 Ultra',
            sku: 'GS24U-512-BLK',
            quantity: 1,
            price: 7499.99
          }
        ],
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'Boleto Bancário',
        shippingMethod: 'Entrega Padrão',
        shippingAddress: {
          street: 'Rua Augusta',
          number: '500',
          neighborhood: 'Consolação',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01305-000',
          country: 'Brasil'
        },
        shippingCost: 19.90,
        subtotal: 7499.99,
        discount: 0,
        total: 7519.89,
        estimatedDelivery: '5-7 dias úteis',
        createdAt: '2024-01-22',
        createdTime: '16:45',
        updatedAt: '2024-01-22',
        lojaId: '1'
      },
      {
        id: '#001237',
        customer: {
          id: '4',
          name: 'Ana Rodrigues',
          email: 'ana.rodrigues@email.com',
          phone: '(11) 96666-3456',
          document: '789.123.456-00'
        },
        items: [
          {
            id: '5',
            productId: '1',
            productName: 'iPhone 15 Pro Max',
            sku: 'IPH15PM-256-TIT',
            quantity: 2,
            price: 8999.99
          }
        ],
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'Cartão de Débito',
        shippingMethod: 'Entrega Expressa',
        shippingAddress: {
          street: 'Rua Oscar Freire',
          number: '200',
          neighborhood: 'Jardins',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01426-000',
          country: 'Brasil'
        },
        shippingCost: 0,
        subtotal: 17999.98,
        discount: 1000.00,
        total: 16999.98,
        trackingCode: 'BR987654321SP',
        estimatedDelivery: '2-3 dias úteis',
        createdAt: '2024-01-15',
        createdTime: '11:20',
        updatedAt: '2024-01-18',
        lojaId: '1'
      },
      {
        id: '#001238',
        customer: {
          id: '5',
          name: 'Carlos Mendes',
          email: 'carlos.mendes@email.com',
          phone: '(11) 95555-7890',
          document: '321.654.987-00'
        },
        items: [
          {
            id: '6',
            productId: '3',
            productName: 'AirPods Pro (3ª geração)',
            sku: 'APP3-WHT-USB',
            quantity: 3,
            price: 1899.99
          }
        ],
        status: 'cancelled',
        paymentStatus: 'refunded',
        paymentMethod: 'Cartão de Crédito',
        shippingMethod: 'Entrega Padrão',
        shippingAddress: {
          street: 'Rua da Consolação',
          number: '800',
          neighborhood: 'Consolação',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01302-000',
          country: 'Brasil'
        },
        shippingCost: 15.90,
        subtotal: 5699.97,
        discount: 0,
        total: 5715.87,
        estimatedDelivery: '5-7 dias úteis',
        createdAt: '2024-01-18',
        createdTime: '13:10',
        updatedAt: '2024-01-19',
        lojaId: '1',
        notes: 'Cancelado a pedido do cliente'
      }
    ];
    
    this.saveOrders(seedOrders);
    return seedOrders;
  }

  private static saveOrders(orders: Order[]): void {
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  }

  static async getOrders(lojaId: string): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.getStoredOrders()
      .filter(order => order.lojaId === lojaId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getStoredOrders().find(order => order.id === orderId) || null;
  }

  static async getOrderStats(lojaId: string): Promise<OrderStats> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const orders = this.getStoredOrders().filter(order => order.lojaId === lojaId);
    const today = new Date().toISOString().split('T')[0];
    
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.total, 0);
    
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const ordersToday = orders.filter(order => order.createdAt === today).length;
    const revenueToday = orders
      .filter(order => order.createdAt === today && order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.total, 0);
    
    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      averageTicket,
      ordersToday,
      revenueToday,
      conversionRate: 3.2 // Mock data
    };
  }

  static async updateOrderStatus(data: StatusUpdateData): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const orders = this.getStoredOrders();
    const orderIndex = orders.findIndex(order => order.id === data.orderId);
    
    if (orderIndex === -1) {
      throw new Error('Pedido não encontrado');
    }
    
    const order = orders[orderIndex];
    order.status = data.status as any;
    order.updatedAt = new Date().toISOString().split('T')[0];
    
    if (data.trackingCode) {
      order.trackingCode = data.trackingCode;
    }
    
    if (data.notes) {
      order.notes = data.notes;
    }
    
    // Auto-update payment status based on order status
    if (data.status === 'delivered' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
    } else if (data.status === 'cancelled' && order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }
    
    orders[orderIndex] = order;
    this.saveOrders(orders);
    
    return order;
  }

  static async getOrdersByStatus(lojaId: string, status: string): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.getStoredOrders()
      .filter(order => order.lojaId === lojaId && order.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getOrdersByDateRange(lojaId: string, startDate: string, endDate: string): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.getStoredOrders()
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return order.lojaId === lojaId && orderDate >= start && orderDate <= end;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async exportOrders(lojaId: string, filters?: any): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const orders = this.getStoredOrders().filter(order => order.lojaId === lojaId);
    
    const csvContent = [
      'Pedido,Cliente,Email,Data,Status,Pagamento,Total,Itens',
      ...orders.map(order => 
        `"${order.id}","${order.customer.name}","${order.customer.email}","${order.createdAt}","${order.status}","${order.paymentStatus}",${order.total.toFixed(2)},"${order.items.length}"`
      )
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const orders = this.getStoredOrders();
    const newOrder: Order = {
      ...orderData,
      id: `#${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString().split('T')[0],
      createdTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    orders.unshift(newOrder);
    this.saveOrders(orders);
    
    return newOrder;
  }

  static async deleteOrder(orderId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const orders = this.getStoredOrders();
    const filteredOrders = orders.filter(order => order.id !== orderId);
    this.saveOrders(filteredOrders);
  }
}