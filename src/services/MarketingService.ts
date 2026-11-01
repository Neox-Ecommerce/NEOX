import { api, withDates } from '@/lib/api';

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'social';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  subject?: string;
  content: string;
  targetAudience: string[];
  scheduledDate?: Date;
  sentDate?: Date;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts: string[];
  createdAt: Date;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  status: 'active' | 'inactive' | 'pending';
  referralCode: string;
  bankInfo?: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'checking' | 'savings';
  };
  createdAt: Date;
}

export interface MarketingStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalCoupons: number;
  activeCoupons: number;
  totalAffiliates: number;
  activeAffiliates: number;
  conversionRate: number;
  emailOpenRate: number;
  clickThroughRate: number;
}

const reviveCampaign = (c: Campaign) => withDates(c, ['scheduledDate', 'sentDate', 'createdAt', 'updatedAt']);
const reviveCoupon = (c: Coupon) => withDates(c, ['validFrom', 'validUntil', 'createdAt']);
const reviveAffiliate = (a: Affiliate) => withDates(a, ['createdAt']);

export type CampaignInput = Omit<Campaign, 'id' | 'stats' | 'sentDate' | 'createdAt' | 'updatedAt'>;
export type CouponInput = Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>;
export type AffiliateInput = Omit<Affiliate, 'id' | 'totalSales' | 'totalCommission' | 'createdAt'>;

// Loja vem do token: nenhum método recebe lojaId.
export class MarketingService {
  static async getCampaigns(): Promise<Campaign[]> {
    return (await api<Campaign[]>('/marketing/campaigns')).map(reviveCampaign);
  }

  static async getCoupons(): Promise<Coupon[]> {
    return (await api<Coupon[]>('/marketing/coupons')).map(reviveCoupon);
  }

  static async getAffiliates(): Promise<Affiliate[]> {
    return (await api<Affiliate[]>('/marketing/affiliates')).map(reviveAffiliate);
  }

  static getMarketingStats(): Promise<MarketingStats> {
    return api<MarketingStats>('/marketing/stats');
  }

  static async createCampaign(data: CampaignInput): Promise<Campaign> {
    return reviveCampaign(await api<Campaign>('/marketing/campaigns', { method: 'POST', body: data }));
  }

  static async updateCampaign({ id, ...data }: Partial<CampaignInput> & { id: string }): Promise<Campaign> {
    return reviveCampaign(await api<Campaign>(`/marketing/campaigns/${id}`, { method: 'PATCH', body: data }));
  }

  static deleteCampaign(id: string): Promise<void> {
    return api(`/marketing/campaigns/${id}`, { method: 'DELETE' });
  }

  static async createCoupon(data: CouponInput): Promise<Coupon> {
    return reviveCoupon(await api<Coupon>('/marketing/coupons', { method: 'POST', body: data }));
  }

  static async updateCoupon({ id, ...data }: Partial<CouponInput> & { id: string }): Promise<Coupon> {
    return reviveCoupon(await api<Coupon>(`/marketing/coupons/${id}`, { method: 'PATCH', body: data }));
  }

  static async toggleCoupon(id: string): Promise<Coupon> {
    return reviveCoupon(await api<Coupon>(`/marketing/coupons/${id}/toggle`, { method: 'PATCH' }));
  }

  static deleteCoupon(id: string): Promise<void> {
    return api(`/marketing/coupons/${id}`, { method: 'DELETE' });
  }

  static async createAffiliate(data: AffiliateInput): Promise<Affiliate> {
    return reviveAffiliate(await api<Affiliate>('/marketing/affiliates', { method: 'POST', body: data }));
  }

  static async updateAffiliate({ id, ...data }: Partial<AffiliateInput> & { id: string }): Promise<Affiliate> {
    return reviveAffiliate(await api<Affiliate>(`/marketing/affiliates/${id}`, { method: 'PATCH', body: data }));
  }

  // Sugestão de código no cliente; a API valida unicidade por loja.
  static generateCouponCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
