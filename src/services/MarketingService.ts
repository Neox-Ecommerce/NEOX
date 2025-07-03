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

export class MarketingService {
  private static CAMPAIGNS_KEY = 'neoxstore_campaigns';
  private static COUPONS_KEY = 'neoxstore_coupons';
  private static AFFILIATES_KEY = 'neoxstore_affiliates';

  private static getStoredCampaigns(): Campaign[] {
    const stored = localStorage.getItem(this.CAMPAIGNS_KEY);
    if (stored) {
      return JSON.parse(stored).map((campaign: any) => ({
        ...campaign,
        scheduledDate: campaign.scheduledDate ? new Date(campaign.scheduledDate) : undefined,
        sentDate: campaign.sentDate ? new Date(campaign.sentDate) : undefined,
        createdAt: new Date(campaign.createdAt),
        updatedAt: new Date(campaign.updatedAt)
      }));
    }
    
    const seedCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Promoção Black Friday 2024',
        type: 'email',
        status: 'completed',
        subject: '🔥 Black Friday: Até 70% OFF em Eletrônicos!',
        content: 'Aproveite nossa mega promoção de Black Friday com descontos imperdíveis!',
        targetAudience: ['VIP', 'Fidelizado'],
        sentDate: new Date('2024-01-15'),
        stats: {
          sent: 1250,
          delivered: 1198,
          opened: 456,
          clicked: 89,
          converted: 23
        },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Lançamento iPhone 15',
        type: 'push',
        status: 'active',
        content: 'O novo iPhone 15 chegou! Seja um dos primeiros a ter o seu.',
        targetAudience: ['Todos'],
        scheduledDate: new Date('2024-01-25'),
        stats: {
          sent: 2340,
          delivered: 2298,
          opened: 892,
          clicked: 156,
          converted: 45
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22')
      }
    ];
    
    this.saveCampaigns(seedCampaigns);
    return seedCampaigns;
  }

  private static getStoredCoupons(): Coupon[] {
    const stored = localStorage.getItem(this.COUPONS_KEY);
    if (stored) {
      return JSON.parse(stored).map((coupon: any) => ({
        ...coupon,
        validFrom: new Date(coupon.validFrom),
        validUntil: new Date(coupon.validUntil),
        createdAt: new Date(coupon.createdAt)
      }));
    }
    
    const seedCoupons: Coupon[] = [
      {
        id: '1',
        code: 'BEMVINDO10',
        name: 'Desconto Boas-vindas',
        type: 'percentage',
        value: 10,
        minOrderValue: 100,
        maxDiscount: 50,
        usageLimit: 100,
        usageCount: 23,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        isActive: true,
        applicableProducts: [],
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        code: 'FRETEGRATIS',
        name: 'Frete Grátis',
        type: 'shipping',
        value: 0,
        minOrderValue: 200,
        usageLimit: 500,
        usageCount: 156,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-06-30'),
        isActive: true,
        applicableProducts: [],
        createdAt: new Date('2024-01-01')
      }
    ];
    
    this.saveCoupons(seedCoupons);
    return seedCoupons;
  }

  private static getStoredAffiliates(): Affiliate[] {
    const stored = localStorage.getItem(this.AFFILIATES_KEY);
    if (stored) {
      return JSON.parse(stored).map((affiliate: any) => ({
        ...affiliate,
        createdAt: new Date(affiliate.createdAt)
      }));
    }
    
    const seedAffiliates: Affiliate[] = [
      {
        id: '1',
        name: 'Influencer Tech',
        email: 'contato@influencertech.com',
        phone: '(11) 99999-0001',
        commissionRate: 5,
        totalSales: 15420.50,
        totalCommission: 771.03,
        status: 'active',
        referralCode: 'TECHINFLU',
        bankInfo: {
          bank: 'Banco do Brasil',
          agency: '1234-5',
          account: '12345-6',
          accountType: 'checking'
        },
        createdAt: new Date('2023-06-15')
      }
    ];
    
    this.saveAffiliates(seedAffiliates);
    return seedAffiliates;
  }

  private static saveCampaigns(campaigns: Campaign[]): void {
    localStorage.setItem(this.CAMPAIGNS_KEY, JSON.stringify(campaigns));
  }

  private static saveCoupons(coupons: Coupon[]): void {
    localStorage.setItem(this.COUPONS_KEY, JSON.stringify(coupons));
  }

  private static saveAffiliates(affiliates: Affiliate[]): void {
    localStorage.setItem(this.AFFILIATES_KEY, JSON.stringify(affiliates));
  }

  static async getCampaigns(lojaId: string): Promise<Campaign[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.getStoredCampaigns()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async getCoupons(lojaId: string): Promise<Coupon[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.getStoredCoupons()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getAffiliates(lojaId: string): Promise<Affiliate[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.getStoredAffiliates()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getMarketingStats(lojaId: string): Promise<MarketingStats> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const campaigns = this.getStoredCampaigns();
    const coupons = this.getStoredCoupons();
    const affiliates = this.getStoredAffiliates();
    
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter(c => c.isActive).length,
      totalAffiliates: affiliates.length,
      activeAffiliates: affiliates.filter(a => a.status === 'active').length,
      conversionRate: 3.2,
      emailOpenRate: 38.1,
      clickThroughRate: 19.5
    };
  }

  static async createCampaign(data: Omit<Campaign, 'id' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const campaigns = this.getStoredCampaigns();
    const newCampaign: Campaign = {
      ...data,
      id: Date.now().toString(),
      stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    campaigns.unshift(newCampaign);
    this.saveCampaigns(campaigns);
    return newCampaign;
  }

  static async createCoupon(data: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>): Promise<Coupon> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const coupons = this.getStoredCoupons();
    const newCoupon: Coupon = {
      ...data,
      id: Date.now().toString(),
      usageCount: 0,
      createdAt: new Date()
    };
    
    coupons.unshift(newCoupon);
    this.saveCoupons(coupons);
    return newCoupon;
  }

  static async createAffiliate(data: Omit<Affiliate, 'id' | 'totalSales' | 'totalCommission' | 'createdAt'>): Promise<Affiliate> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const affiliates = this.getStoredAffiliates();
    const newAffiliate: Affiliate = {
      ...data,
      id: Date.now().toString(),
      totalSales: 0,
      totalCommission: 0,
      createdAt: new Date()
    };
    
    affiliates.unshift(newAffiliate);
    this.saveAffiliates(affiliates);
    return newAffiliate;
  }

  static generateCouponCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}