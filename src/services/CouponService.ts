export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  customerLimit?: number;
  lojaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  orderId: string;
  customerId: string;
  discountAmount: number;
  usedAt: Date;
}

export interface CreateCouponData {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom: Date;
  validUntil: Date;
  applicableProducts?: string[];
  applicableCategories?: string[];
  customerLimit?: number;
}

export class CouponService {
  private static COUPONS_KEY = 'neox_coupons';
  private static USAGE_KEY = 'neox_coupon_usage';

  private static getCoupons(): Coupon[] {
    const stored = localStorage.getItem(this.COUPONS_KEY);
    if (stored) {
      return JSON.parse(stored).map((c: any) => ({
        ...c,
        validFrom: new Date(c.validFrom),
        validUntil: new Date(c.validUntil),
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));
    }
    
    // Seed inicial
    const seedCoupons: Coupon[] = [
      {
        id: '1',
        code: 'WELCOME10',
        name: 'Bem-vindo - 10% OFF',
        description: 'Desconto de boas-vindas para novos clientes',
        type: 'percentage',
        value: 10,
        minOrderValue: 50,
        maxDiscount: 100,
        usageLimit: 1000,
        usedCount: 45,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        isActive: true,
        lojaId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        code: 'FRETE_GRATIS',
        name: 'Frete Grátis',
        description: 'Frete grátis para pedidos acima de R$ 100',
        type: 'free_shipping',
        value: 0,
        minOrderValue: 100,
        usageLimit: 500,
        usedCount: 23,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-06-30'),
        isActive: true,
        lojaId: '1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '3',
        code: 'DESCONTO20',
        name: 'Desconto R$ 20',
        description: 'Desconto fixo de R$ 20',
        type: 'fixed',
        value: 20,
        minOrderValue: 80,
        usageLimit: 200,
        usedCount: 12,
        validFrom: new Date('2024-02-01'),
        validUntil: new Date('2024-03-31'),
        isActive: true,
        lojaId: '1',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
    ];
    
    this.saveCoupons(seedCoupons);
    return seedCoupons;
  }

  private static getUsage(): CouponUsage[] {
    const stored = localStorage.getItem(this.USAGE_KEY);
    if (stored) {
      return JSON.parse(stored).map((u: any) => ({
        ...u,
        usedAt: new Date(u.usedAt),
      }));
    }
    return [];
  }

  private static saveCoupons(coupons: Coupon[]): void {
    localStorage.setItem(this.COUPONS_KEY, JSON.stringify(coupons));
  }

  private static saveUsage(usage: CouponUsage[]): void {
    localStorage.setItem(this.USAGE_KEY, JSON.stringify(usage));
  }

  static async getCoupons(lojaId: string = '1'): Promise<Coupon[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getCoupons()
      .filter(c => c.lojaId === lojaId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getCouponById(id: string): Promise<Coupon | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.getCoupons().find(c => c.id === id) || null;
  }

  static async getCouponByCode(code: string, lojaId: string = '1'): Promise<Coupon | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.getCoupons().find(c => 
      c.code.toUpperCase() === code.toUpperCase() && 
      c.lojaId === lojaId && 
      c.isActive
    ) || null;
  }

  static async createCoupon(data: CreateCouponData, lojaId: string = '1'): Promise<Coupon> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const coupons = this.getCoupons();
    
    // Verificar se o código já existe
    const existingCoupon = coupons.find(c => 
      c.code.toUpperCase() === data.code.toUpperCase() && 
      c.lojaId === lojaId
    );
    
    if (existingCoupon) {
      throw new Error('Código de cupom já existe');
    }
    
    const newCoupon: Coupon = {
      ...data,
      id: Date.now().toString(),
      usedCount: 0,
      isActive: true,
      lojaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    coupons.unshift(newCoupon);
    this.saveCoupons(coupons);
    return newCoupon;
  }

  static async updateCoupon(id: string, data: Partial<CreateCouponData>): Promise<Coupon> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const coupons = this.getCoupons();
    const index = coupons.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Cupom não encontrado');
    }
    
    coupons[index] = {
      ...coupons[index],
      ...data,
      updatedAt: new Date(),
    };
    
    this.saveCoupons(coupons);
    return coupons[index];
  }

  static async deleteCoupon(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const coupons = this.getCoupons();
    const filtered = coupons.filter(c => c.id !== id);
    this.saveCoupons(filtered);
  }

  static async toggleCouponStatus(id: string): Promise<Coupon> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const coupons = this.getCoupons();
    const index = coupons.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Cupom não encontrado');
    }
    
    coupons[index] = {
      ...coupons[index],
      isActive: !coupons[index].isActive,
      updatedAt: new Date(),
    };
    
    this.saveCoupons(coupons);
    return coupons[index];
  }

  static async validateCoupon(code: string, orderValue: number, customerId?: string, lojaId: string = '1'): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discount?: number;
    error?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const coupon = await this.getCouponByCode(code, lojaId);
    
    if (!coupon) {
      return { valid: false, error: 'Cupom não encontrado' };
    }
    
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return { valid: false, error: 'Cupom fora do período de validade' };
    }
    
    if (!coupon.isActive) {
      return { valid: false, error: 'Cupom inativo' };
    }
    
    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      return { 
        valid: false, 
        error: `Valor mínimo do pedido: R$ ${coupon.minOrderValue.toFixed(2)}` 
      };
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Cupom esgotado' };
    }
    
    // Calcular desconto
    let discount = 0;
    
    if (coupon.type === 'percentage') {
      discount = (orderValue * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    } else if (coupon.type === 'free_shipping') {
      discount = 0; // Será aplicado no frete
    }
    
    return {
      valid: true,
      coupon,
      discount: Math.min(discount, orderValue),
    };
  }

  static async useCoupon(couponId: string, orderId: string, customerId: string, discountAmount: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const coupons = this.getCoupons();
    const couponIndex = coupons.findIndex(c => c.id === couponId);
    
    if (couponIndex === -1) {
      throw new Error('Cupom não encontrado');
    }
    
    // Incrementar contador de uso
    coupons[couponIndex].usedCount += 1;
    coupons[couponIndex].updatedAt = new Date();
    
    // Registrar uso
    const usage: CouponUsage = {
      id: Date.now().toString(),
      couponId,
      orderId,
      customerId,
      discountAmount,
      usedAt: new Date(),
    };
    
    const usageRecords = this.getUsage();
    usageRecords.push(usage);
    
    this.saveCoupons(coupons);
    this.saveUsage(usageRecords);
  }

  static async getCouponStats(lojaId: string = '1'): Promise<{
    total: number;
    active: number;
    expired: number;
    totalUsage: number;
    totalDiscount: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const coupons = this.getCoupons().filter(c => c.lojaId === lojaId);
    const usage = this.getUsage();
    const now = new Date();
    
    const stats = {
      total: coupons.length,
      active: coupons.filter(c => c.isActive && c.validUntil > now).length,
      expired: coupons.filter(c => c.validUntil <= now).length,
      totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0),
      totalDiscount: usage.reduce((sum, u) => sum + u.discountAmount, 0),
    };
    
    return stats;
  }

  static async getCouponUsage(couponId: string): Promise<CouponUsage[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getUsage()
      .filter(u => u.couponId === couponId)
      .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());
  }
}
