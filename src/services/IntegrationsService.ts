export interface PaymentGateway {
  id: string;
  name: string;
  type: 'credit_card' | 'pix' | 'boleto' | 'wallet' | 'crypto';
  provider: string;
  isActive: boolean;
  config: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    environment: 'sandbox' | 'production';
    webhookUrl?: string;
  };
  fees: {
    creditCard: number;
    debitCard: number;
    pix: number;
    boleto: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingCarrier {
  id: string;
  name: string;
  code: string;
  type: 'correios' | 'transportadora' | 'motoboy' | 'retirada';
  isActive: boolean;
  config: {
    apiKey?: string;
    contractCode?: string;
    password?: string;
    services: string[];
  };
  coverage: {
    regions: string[];
    maxWeight: number;
    maxDimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Integration {
  id: string;
  name: string;
  category: 'payment' | 'shipping' | 'analytics' | 'marketing' | 'erp' | 'crm';
  provider: string;
  description: string;
  isActive: boolean;
  config: Record<string, any>;
  lastSync?: Date;
  createdAt: Date;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  lastTriggered?: Date;
  successCount: number;
  errorCount: number;
  createdAt: Date;
}

export class IntegrationsService {
  private static GATEWAYS_KEY = 'neox_payment_gateways';
  private static CARRIERS_KEY = 'neox_shipping_carriers';
  private static INTEGRATIONS_KEY = 'neox_integrations';
  private static WEBHOOKS_KEY = 'neox_webhooks';

  private static getStoredGateways(): PaymentGateway[] {
    const stored = localStorage.getItem(this.GATEWAYS_KEY);
    if (stored) {
      return JSON.parse(stored).map((gateway: any) => ({
        ...gateway,
        createdAt: new Date(gateway.createdAt),
        updatedAt: new Date(gateway.updatedAt)
      }));
    }
    
    const seedGateways: PaymentGateway[] = [
      {
        id: '1',
        name: 'Stripe',
        type: 'credit_card',
        provider: 'Stripe',
        isActive: true,
        config: {
          apiKey: 'pk_test_***',
          secretKey: 'sk_test_***',
          environment: 'sandbox'
        },
        fees: {
          creditCard: 3.99,
          debitCard: 2.99,
          pix: 0.99,
          boleto: 3.49
        },
        createdAt: new Date('2023-06-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'PagSeguro',
        type: 'pix',
        provider: 'PagSeguro',
        isActive: true,
        config: {
          apiKey: 'app_***',
          environment: 'sandbox'
        },
        fees: {
          creditCard: 4.99,
          debitCard: 3.49,
          pix: 0.99,
          boleto: 3.99
        },
        createdAt: new Date('2023-08-20'),
        updatedAt: new Date('2024-01-10')
      }
    ];
    
    this.saveGateways(seedGateways);
    return seedGateways;
  }

  private static getStoredCarriers(): ShippingCarrier[] {
    const stored = localStorage.getItem(this.CARRIERS_KEY);
    if (stored) {
      return JSON.parse(stored).map((carrier: any) => ({
        ...carrier,
        createdAt: new Date(carrier.createdAt),
        updatedAt: new Date(carrier.updatedAt)
      }));
    }
    
    const seedCarriers: ShippingCarrier[] = [
      {
        id: '1',
        name: 'Correios',
        code: 'correios',
        type: 'correios',
        isActive: true,
        config: {
          contractCode: '9912345678',
          password: 'senha123',
          services: ['PAC', 'SEDEX', 'SEDEX 10']
        },
        coverage: {
          regions: ['Nacional'],
          maxWeight: 30,
          maxDimensions: {
            length: 105,
            width: 105,
            height: 105
          }
        },
        createdAt: new Date('2023-06-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Transportadora Express',
        code: 'express',
        type: 'transportadora',
        isActive: true,
        config: {
          apiKey: 'api_key_express',
          services: ['Expressa', 'Econômica']
        },
        coverage: {
          regions: ['Sudeste', 'Sul'],
          maxWeight: 50,
          maxDimensions: {
            length: 150,
            width: 150,
            height: 150
          }
        },
        createdAt: new Date('2023-09-10'),
        updatedAt: new Date('2024-01-12')
      }
    ];
    
    this.saveCarriers(seedCarriers);
    return seedCarriers;
  }

  private static getStoredIntegrations(): Integration[] {
    const stored = localStorage.getItem(this.INTEGRATIONS_KEY);
    if (stored) {
      return JSON.parse(stored).map((integration: any) => ({
        ...integration,
        lastSync: integration.lastSync ? new Date(integration.lastSync) : undefined,
        createdAt: new Date(integration.createdAt)
      }));
    }
    
    const seedIntegrations: Integration[] = [
      {
        id: '1',
        name: 'Google Analytics',
        category: 'analytics',
        provider: 'Google',
        description: 'Análise de tráfego e comportamento dos usuários',
        isActive: true,
        config: {
          trackingId: 'GA-XXXXXXXXX',
          enhancedEcommerce: true
        },
        lastSync: new Date('2024-01-22T10:30:00'),
        createdAt: new Date('2023-06-15')
      },
      {
        id: '2',
        name: 'Mailchimp',
        category: 'marketing',
        provider: 'Mailchimp',
        description: 'Email marketing e automação',
        isActive: false,
        config: {
          apiKey: 'mc_api_***',
          listId: 'list_123'
        },
        createdAt: new Date('2023-08-20')
      }
    ];
    
    this.saveIntegrations(seedIntegrations);
    return seedIntegrations;
  }

  private static getStoredWebhooks(): Webhook[] {
    const stored = localStorage.getItem(this.WEBHOOKS_KEY);
    if (stored) {
      return JSON.parse(stored).map((webhook: any) => ({
        ...webhook,
        lastTriggered: webhook.lastTriggered ? new Date(webhook.lastTriggered) : undefined,
        createdAt: new Date(webhook.createdAt)
      }));
    }
    
    const seedWebhooks: Webhook[] = [
      {
        id: '1',
        name: 'Notificação de Pedidos',
        url: 'https://api.exemplo.com/webhooks/orders',
        events: ['order.created', 'order.updated', 'order.cancelled'],
        isActive: true,
        secret: 'webhook_secret_123',
        lastTriggered: new Date('2024-01-22T14:30:00'),
        successCount: 156,
        errorCount: 3,
        createdAt: new Date('2023-06-15')
      }
    ];
    
    this.saveWebhooks(seedWebhooks);
    return seedWebhooks;
  }

  private static saveGateways(gateways: PaymentGateway[]): void {
    localStorage.setItem(this.GATEWAYS_KEY, JSON.stringify(gateways));
  }

  private static saveCarriers(carriers: ShippingCarrier[]): void {
    localStorage.setItem(this.CARRIERS_KEY, JSON.stringify(carriers));
  }

  private static saveIntegrations(integrations: Integration[]): void {
    localStorage.setItem(this.INTEGRATIONS_KEY, JSON.stringify(integrations));
  }

  private static saveWebhooks(webhooks: Webhook[]): void {
    localStorage.setItem(this.WEBHOOKS_KEY, JSON.stringify(webhooks));
  }

  static async getPaymentGateways(lojaId: string): Promise<PaymentGateway[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.getStoredGateways()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async getShippingCarriers(lojaId: string): Promise<ShippingCarrier[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.getStoredCarriers()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async getIntegrations(lojaId: string): Promise<Integration[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getStoredIntegrations()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getWebhooks(lojaId: string): Promise<Webhook[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getStoredWebhooks()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async updateGateway(gatewayId: string, data: Partial<PaymentGateway>): Promise<PaymentGateway> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const gateways = this.getStoredGateways();
    const gatewayIndex = gateways.findIndex(g => g.id === gatewayId);
    
    if (gatewayIndex === -1) {
      throw new Error('Gateway não encontrado');
    }
    
    gateways[gatewayIndex] = {
      ...gateways[gatewayIndex],
      ...data,
      updatedAt: new Date()
    };
    
    this.saveGateways(gateways);
    return gateways[gatewayIndex];
  }

  static async updateCarrier(carrierId: string, data: Partial<ShippingCarrier>): Promise<ShippingCarrier> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const carriers = this.getStoredCarriers();
    const carrierIndex = carriers.findIndex(c => c.id === carrierId);
    
    if (carrierIndex === -1) {
      throw new Error('Transportadora não encontrada');
    }
    
    carriers[carrierIndex] = {
      ...carriers[carrierIndex],
      ...data,
      updatedAt: new Date()
    };
    
    this.saveCarriers(carriers);
    return carriers[carrierIndex];
  }

  static async createWebhook(data: Omit<Webhook, 'id' | 'successCount' | 'errorCount' | 'createdAt'>): Promise<Webhook> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const webhooks = this.getStoredWebhooks();
    const newWebhook: Webhook = {
      ...data,
      id: Date.now().toString(),
      successCount: 0,
      errorCount: 0,
      createdAt: new Date()
    };
    
    webhooks.unshift(newWebhook);
    this.saveWebhooks(webhooks);
    return newWebhook;
  }

  static async testWebhook(webhookId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate webhook test
    const success = Math.random() > 0.2; // 80% success rate
    
    return {
      success,
      message: success 
        ? 'Webhook testado com sucesso! Resposta 200 OK recebida.'
        : 'Falha no teste do webhook. Verifique a URL e tente novamente.'
    };
  }

  static getAvailableGateways(): Array<{
    id: string;
    name: string;
    provider: string;
    types: string[];
    description: string;
  }> {
    return [
      {
        id: 'stripe',
        name: 'Stripe',
        provider: 'Stripe',
        types: ['credit_card', 'pix'],
        description: 'Gateway internacional com suporte a múltiplas moedas'
      },
      {
        id: 'pagseguro',
        name: 'PagSeguro',
        provider: 'PagSeguro',
        types: ['credit_card', 'pix', 'boleto'],
        description: 'Gateway brasileiro com PIX e boleto'
      },
      {
        id: 'mercadopago',
        name: 'Mercado Pago',
        provider: 'Mercado Pago',
        types: ['credit_card', 'pix', 'wallet'],
        description: 'Gateway do Mercado Livre com carteira digital'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        provider: 'PayPal',
        types: ['wallet', 'credit_card'],
        description: 'Gateway internacional com carteira PayPal'
      }
    ];
  }

  static getAvailableCarriers(): Array<{
    id: string;
    name: string;
    type: string;
    description: string;
  }> {
    return [
      {
        id: 'correios',
        name: 'Correios',
        type: 'correios',
        description: 'Serviços nacionais dos Correios (PAC, SEDEX)'
      },
      {
        id: 'jadlog',
        name: 'Jadlog',
        type: 'transportadora',
        description: 'Transportadora nacional com cobertura ampla'
      },
      {
        id: 'total_express',
        name: 'Total Express',
        type: 'transportadora',
        description: 'Entrega expressa para grandes centros'
      },
      {
        id: 'loggi',
        name: 'Loggi',
        type: 'motoboy',
        description: 'Entrega rápida por motoboy em capitais'
      }
    ];
  }
}