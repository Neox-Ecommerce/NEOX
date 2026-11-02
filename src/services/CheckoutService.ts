import { api } from '@/lib/api';
import type { ShippingAddress } from '@/services/OrdersService';
import { AnalyticsService } from '@/services/AnalyticsService';
import type { CartItem } from '@/services/CartService';

export interface CheckoutData {
  shippingAddress: ShippingAddress;
  customer: { phone: string; document: string };
  couponCode?: string;
}

export interface CheckoutOrderSummary {
  id: string;
  code: string;
  storeId: string;
  storeName: string;
  total: number;
  status: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface CheckoutResult {
  checkoutId: string;
  orders: CheckoutOrderSummary[];
  total: number;
  redirectUrl: string | null; // Mercado Pago; null = pagamento combinado com a loja
  paymentStatus: CheckoutOrderSummary['paymentStatus'];
}

export interface QuoteGroup {
  storeId: string;
  storeName: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponApplied: string | null;
}

export interface Quote {
  groups: QuoteGroup[];
  total: number;
  couponCode: string | null;
  onlinePayment: boolean; // true = paga no Mercado Pago (redireciona)
}

export const CheckoutService = {
  /** Simula o checkout (frete por loja, cupom, totais) sem criar pedido. Cupom inválido → erro com a mensagem da API. */
  quote(couponCode?: string): Promise<Quote> {
    return api<Quote>('/checkout/quote', { method: 'POST', body: { couponCode: couponCode || undefined } });
  },


  checkout(data: CheckoutData): Promise<CheckoutResult> {
    return api<CheckoutResult>('/checkout', {
      method: 'POST',
      body: { ...data, couponCode: data.couponCode || undefined, sessionId: AnalyticsService.sessionId() },
    });
  },

  /** Retorno do Mercado Pago: a API consulta o pagamento no MP antes de responder. */
  confirm(params: { paymentId?: string | null; checkoutId?: string | null }): Promise<CheckoutResult> {
    return api<CheckoutResult>('/checkout/confirm', {
      method: 'POST',
      query: { payment_id: params.paymentId, checkout_id: params.checkoutId },
    });
  },
};
