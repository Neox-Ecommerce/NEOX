export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'transfer';
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'refunded';
  gateway: string;
  transactionId?: string;
  fees: number;
  netAmount: number;
  processedAt?: Date;
  createdAt: Date;
}

export interface Payout {
  id: string;
  amount: number;
  fees: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'checking' | 'savings';
  };
  scheduledDate: Date;
  processedDate?: Date;
  createdAt: Date;
}

export interface FinancialStats {
  totalRevenue: number;
  totalFees: number;
  netRevenue: number;
  pendingAmount: number;
  availableForPayout: number;
  totalPayouts: number;
  averageTicket: number;
  transactionCount: number;
}

export interface BankAccount {
  id: string;
  bank: string;
  agency: string;
  account: string;
  accountType: 'checking' | 'savings';
  holderName: string;
  holderDocument: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
}

export class FinancialService {
  private static PAYMENTS_KEY = 'neox_financial_payments';
  private static PAYOUTS_KEY = 'neox_financial_payouts';
  private static BANK_ACCOUNTS_KEY = 'neox_financial_bank_accounts';

  private static getStoredPayments(): Payment[] {
    const stored = localStorage.getItem(this.PAYMENTS_KEY);
    if (stored) {
      return JSON.parse(stored).map((payment: any) => ({
        ...payment,
        processedAt: payment.processedAt ? new Date(payment.processedAt) : undefined,
        createdAt: new Date(payment.createdAt)
      }));
    }
    
    // Seed inicial
    const seedPayments: Payment[] = [
      {
        id: '1',
        orderId: '#001234',
        amount: 10899.98,
        method: 'credit_card',
        status: 'approved',
        gateway: 'Stripe',
        transactionId: 'pi_1234567890',
        fees: 326.99,
        netAmount: 10572.99,
        processedAt: new Date('2024-01-20T14:30:00'),
        createdAt: new Date('2024-01-20T14:30:00')
      },
      {
        id: '2',
        orderId: '#001235',
        amount: 12529.80,
        method: 'pix',
        status: 'approved',
        gateway: 'PagSeguro',
        transactionId: 'pix_9876543210',
        fees: 125.30,
        netAmount: 12404.50,
        processedAt: new Date('2024-01-19T09:15:00'),
        createdAt: new Date('2024-01-19T09:15:00')
      },
      {
        id: '3',
        orderId: '#001236',
        amount: 7519.89,
        method: 'boleto',
        status: 'pending',
        gateway: 'PagSeguro',
        fees: 75.20,
        netAmount: 7444.69,
        createdAt: new Date('2024-01-22T16:45:00')
      }
    ];
    
    this.savePayments(seedPayments);
    return seedPayments;
  }

  private static getStoredPayouts(): Payout[] {
    const stored = localStorage.getItem(this.PAYOUTS_KEY);
    if (stored) {
      return JSON.parse(stored).map((payout: any) => ({
        ...payout,
        scheduledDate: new Date(payout.scheduledDate),
        processedDate: payout.processedDate ? new Date(payout.processedDate) : undefined,
        createdAt: new Date(payout.createdAt)
      }));
    }
    
    const seedPayouts: Payout[] = [
      {
        id: '1',
        amount: 22977.49,
        fees: 45.95,
        netAmount: 22931.54,
        status: 'completed',
        bankAccount: {
          bank: 'Banco do Brasil',
          agency: '1234-5',
          account: '12345-6',
          accountType: 'checking'
        },
        scheduledDate: new Date('2024-01-15'),
        processedDate: new Date('2024-01-15T10:00:00'),
        createdAt: new Date('2024-01-10')
      },
      {
        id: '2',
        amount: 15420.30,
        fees: 30.84,
        netAmount: 15389.46,
        status: 'pending',
        bankAccount: {
          bank: 'Banco do Brasil',
          agency: '1234-5',
          account: '12345-6',
          accountType: 'checking'
        },
        scheduledDate: new Date('2024-01-25'),
        createdAt: new Date('2024-01-20')
      }
    ];
    
    this.savePayouts(seedPayouts);
    return seedPayouts;
  }

  private static getStoredBankAccounts(): BankAccount[] {
    const stored = localStorage.getItem(this.BANK_ACCOUNTS_KEY);
    if (stored) {
      return JSON.parse(stored).map((account: any) => ({
        ...account,
        createdAt: new Date(account.createdAt)
      }));
    }
    
    const seedAccounts: BankAccount[] = [
      {
        id: '1',
        bank: 'Banco do Brasil',
        agency: '1234-5',
        account: '12345-6',
        accountType: 'checking',
        holderName: 'TechStore Premium LTDA',
        holderDocument: '12.345.678/0001-90',
        isDefault: true,
        isActive: true,
        createdAt: new Date('2023-06-15')
      }
    ];
    
    this.saveBankAccounts(seedAccounts);
    return seedAccounts;
  }

  private static savePayments(payments: Payment[]): void {
    localStorage.setItem(this.PAYMENTS_KEY, JSON.stringify(payments));
  }

  private static savePayouts(payouts: Payout[]): void {
    localStorage.setItem(this.PAYOUTS_KEY, JSON.stringify(payouts));
  }

  private static saveBankAccounts(accounts: BankAccount[]): void {
    localStorage.setItem(this.BANK_ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  static async getPayments(lojaId: string): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.getStoredPayments()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getPayouts(lojaId: string): Promise<Payout[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.getStoredPayouts()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getBankAccounts(lojaId: string): Promise<BankAccount[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getStoredBankAccounts()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getFinancialStats(lojaId: string): Promise<FinancialStats> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const payments = this.getStoredPayments();
    const approvedPayments = payments.filter(p => p.status === 'approved');
    
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalFees = approvedPayments.reduce((sum, p) => sum + p.fees, 0);
    const netRevenue = totalRevenue - totalFees;
    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.netAmount, 0);
    
    const payouts = this.getStoredPayouts();
    const totalPayouts = payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.netAmount, 0);
    
    const availableForPayout = netRevenue - totalPayouts;
    const averageTicket = approvedPayments.length > 0 ? totalRevenue / approvedPayments.length : 0;
    
    return {
      totalRevenue,
      totalFees,
      netRevenue,
      pendingAmount,
      availableForPayout,
      totalPayouts,
      averageTicket,
      transactionCount: payments.length
    };
  }

  static async createPayment(data: {
    orderId: string;
    amount: number;
    method: string;
    gateway: string;
    status: string;
  }): Promise<Payment> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const payments = this.getStoredPayments();
    
    // Calculate fees based on payment method
    let feeRate = 0;
    switch (data.method) {
      case 'credit_card': feeRate = 0.03; break; // 3%
      case 'debit_card': feeRate = 0.02; break; // 2%
      case 'pix': feeRate = 0.01; break; // 1%
      case 'boleto': feeRate = 0.015; break; // 1.5%
      case 'transfer': feeRate = 0.005; break; // 0.5%
      default: feeRate = 0.02; // 2%
    }
    
    const fees = data.amount * feeRate;
    const netAmount = data.amount - fees;
    
    const newPayment: Payment = {
      id: Date.now().toString(),
      orderId: data.orderId,
      amount: data.amount,
      method: data.method as any,
      status: data.status as any,
      gateway: data.gateway,
      transactionId: `tx_${Math.random().toString(36).substring(2, 10)}`,
      fees,
      netAmount,
      processedAt: data.status === 'approved' ? new Date() : undefined,
      createdAt: new Date()
    };
    
    payments.unshift(newPayment);
    this.savePayments(payments);
    return newPayment;
  }

  static async createPayout(amount: number, bankAccountId: string): Promise<Payout> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const bankAccounts = this.getStoredBankAccounts();
    const bankAccount = bankAccounts.find(acc => acc.id === bankAccountId);
    
    if (!bankAccount) {
      throw new Error('Conta bancária não encontrada');
    }
    
    const payouts = this.getStoredPayouts();
    const fees = amount * 0.002; // 0.2% fee
    const netAmount = amount - fees;
    
    const newPayout: Payout = {
      id: Date.now().toString(),
      amount,
      fees,
      netAmount,
      status: 'pending',
      bankAccount: {
        bank: bankAccount.bank,
        agency: bankAccount.agency,
        account: bankAccount.account,
        accountType: bankAccount.accountType
      },
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      createdAt: new Date()
    };
    
    payouts.unshift(newPayout);
    this.savePayouts(payouts);
    return newPayout;
  }

  static async addBankAccount(data: Omit<BankAccount, 'id' | 'createdAt'>): Promise<BankAccount> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const accounts = this.getStoredBankAccounts();
    
    // If this is the default account, remove default from others
    if (data.isDefault) {
      accounts.forEach(acc => acc.isDefault = false);
    }
    
    const newAccount: BankAccount = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    accounts.unshift(newAccount);
    this.saveBankAccounts(accounts);
    return newAccount;
  }

  static getBanks(): Array<{ code: string; name: string }> {
    return [
      { code: '001', name: 'Banco do Brasil' },
      { code: '104', name: 'Caixa Econômica Federal' },
      { code: '237', name: 'Bradesco' },
      { code: '341', name: 'Itaú' },
      { code: '033', name: 'Santander' },
      { code: '260', name: 'Nu Pagamentos (Nubank)' },
      { code: '077', name: 'Banco Inter' },
      { code: '212', name: 'Banco Original' },
      { code: '290', name: 'PagSeguro' },
      { code: '323', name: 'Mercado Pago' }
    ];
  }
}