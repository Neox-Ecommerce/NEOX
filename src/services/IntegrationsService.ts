import { api, withDates } from '@/lib/api';

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
  config: Record<string, string>;
  /** Campos configuráveis do catálogo (secret = guardado criptografado e exibido mascarado). */
  fields: Array<{ key: string; label: string; secret: boolean }>;
  lastSync?: Date;
  createdAt: Date;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string; // sempre mascarado (••••1234) nas respostas da API
  lastTriggered?: Date;
  successCount: number;
  errorCount: number;
  createdAt: Date;
}

export type GatewayInput = {
  provider: string; // id do catálogo (getAvailableGateways)
  type: PaymentGateway['type'];
  isActive?: boolean;
  config: Partial<PaymentGateway['config']>;
  fees: PaymentGateway['fees'];
};

export type CarrierInput = {
  code: string; // id do catálogo (getAvailableCarriers)
  isActive?: boolean;
  config: Partial<ShippingCarrier['config']>;
  coverage: ShippingCarrier['coverage'];
};

export type WebhookInput = Omit<Webhook, 'id' | 'successCount' | 'errorCount' | 'createdAt' | 'lastTriggered'>;

const gw = (g: PaymentGateway) => withDates(g, ['createdAt', 'updatedAt']);
const carrier = (c: ShippingCarrier) => withDates(c, ['createdAt', 'updatedAt']);
const app = (i: Integration) => withDates(i, ['createdAt', 'lastSync']);
const hook = (w: Webhook) => withDates(w, ['createdAt', 'lastTriggered']);

// Configurações por loja (a loja vem do token). Os pagamentos dos pedidos passam pelo Mercado Pago da plataforma.
export const IntegrationsService = {
  getPaymentGateways: async (): Promise<PaymentGateway[]> =>
    (await api<PaymentGateway[]>('/integrations/gateways')).map(gw),
  createGateway: async (data: GatewayInput): Promise<PaymentGateway> =>
    gw(await api<PaymentGateway>('/integrations/gateways', { method: 'POST', body: data })),
  updateGateway: async (gatewayId: string, data: Partial<GatewayInput & { isActive: boolean }>): Promise<PaymentGateway> =>
    gw(await api<PaymentGateway>(`/integrations/gateways/${gatewayId}`, { method: 'PUT', body: data })),
  deleteGateway: (gatewayId: string): Promise<void> => api(`/integrations/gateways/${gatewayId}`, { method: 'DELETE' }),

  getShippingCarriers: async (): Promise<ShippingCarrier[]> =>
    (await api<ShippingCarrier[]>('/integrations/carriers')).map(carrier),
  createCarrier: async (data: CarrierInput): Promise<ShippingCarrier> =>
    carrier(await api<ShippingCarrier>('/integrations/carriers', { method: 'POST', body: data })),
  updateCarrier: async (carrierId: string, data: Partial<CarrierInput & { isActive: boolean }>): Promise<ShippingCarrier> =>
    carrier(await api<ShippingCarrier>(`/integrations/carriers/${carrierId}`, { method: 'PUT', body: data })),
  deleteCarrier: (carrierId: string): Promise<void> => api(`/integrations/carriers/${carrierId}`, { method: 'DELETE' }),

  getIntegrations: async (): Promise<Integration[]> => (await api<Integration[]>('/integrations/apps')).map(app),
  updateIntegration: async (id: string, data: { isActive?: boolean; config?: Record<string, string> }): Promise<Integration> =>
    app(await api<Integration>(`/integrations/apps/${id}`, { method: 'PUT', body: data })),
  toggleIntegration: async (id: string): Promise<Integration> =>
    app(await api<Integration>(`/integrations/apps/${id}/toggle`, { method: 'POST' })),

  getWebhooks: async (): Promise<Webhook[]> => (await api<Webhook[]>('/integrations/webhooks')).map(hook),
  createWebhook: async (data: WebhookInput): Promise<Webhook> =>
    hook(await api<Webhook>('/integrations/webhooks', { method: 'POST', body: data })),
  updateWebhook: async (id: string, data: Partial<WebhookInput>): Promise<Webhook> =>
    hook(await api<Webhook>(`/integrations/webhooks/${id}`, { method: 'PUT', body: data })),
  deleteWebhook: (id: string): Promise<void> => api(`/integrations/webhooks/${id}`, { method: 'DELETE' }),
  /** Envia um evento de teste assinado (X-Neox-Signature: sha256=HMAC do corpo com o secret). */
  testWebhook: (webhookId: string): Promise<{ success: boolean; message: string }> =>
    api(`/integrations/webhooks/${webhookId}/test`, { method: 'POST' }),

  getAvailableGateways(): Array<{
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
  },

  getAvailableCarriers(): Array<{
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
  },
};
