import { api, withDates } from '@/lib/api';

export interface Payment {
  id: string;
  orderId: string;
  orderCode?: string;
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
  /** Observação do admin (ex.: motivo da falha). */
  note?: string | null;
  createdAt: Date;
}

export interface FinancialStats {
  totalRevenue: number;
  totalFees: number;
  netRevenue: number;
  pendingAmount: number;
  availableForPayout: number;
  totalPayouts: number;
  /** Taxa da plataforma (%) definida pelo admin; já descontada de availableForPayout. */
  platformFeePercent?: number;
  /** Valor da taxa da plataforma sobre o bruto aprovado. */
  platformFees?: number;
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

/** Pedido da loja ainda sem pagamento confirmado (opção do registro manual de pagamento). */
export interface PayableOrder {
  id: string;
  code: string;
  total: number;
}

// Lista estática de referência (códigos COMPE), usada de forma síncrona pelo formulário de conta.
const BANKS: Array<{ code: string; name: string }> = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '237', name: 'Bradesco' },
  { code: '341', name: 'Itaú' },
  { code: '033', name: 'Santander' },
  { code: '260', name: 'Nu Pagamentos (Nubank)' },
  { code: '077', name: 'Banco Inter' },
  { code: '212', name: 'Banco Original' },
  { code: '290', name: 'PagSeguro' },
  { code: '323', name: 'Mercado Pago' },
  { code: '336', name: 'Banco C6' },
  { code: '748', name: 'Sicredi' },
  { code: '756', name: 'Sicoob' },
];

export const FinancialService = {
  async getPayments(): Promise<Payment[]> {
    const rows = await api<Payment[]>('/finance/payments');
    return rows.map((p) => withDates(p, ['createdAt', 'processedAt']));
  },

  async getPayouts(): Promise<Payout[]> {
    const rows = await api<Payout[]>('/finance/payouts');
    return rows.map((p) => withDates(p, ['createdAt', 'scheduledDate', 'processedDate']));
  },

  async getBankAccounts(): Promise<BankAccount[]> {
    const rows = await api<BankAccount[]>('/finance/bank-accounts');
    return rows.map((a) => withDates(a, ['createdAt']));
  },

  getFinancialStats(): Promise<FinancialStats> {
    return api<FinancialStats>('/finance/stats');
  },

  getPayableOrders(): Promise<PayableOrder[]> {
    return api<PayableOrder[]>('/finance/payable-orders');
  },

  /** Registro manual (ex.: pago em dinheiro): gateway "manual", sem taxa. */
  async createPayment(data: {
    orderId: string;
    amount: number;
    method: Payment['method'];
    status: 'pending' | 'approved';
  }): Promise<Payment> {
    const p = await api<Payment>('/finance/payments', { method: 'POST', body: data });
    return withDates(p, ['createdAt', 'processedAt']);
  },

  async createPayout(amount: number, bankAccountId: string): Promise<Payout> {
    const p = await api<Payout>('/finance/payouts', { method: 'POST', body: { amount, bankAccountId } });
    return withDates(p, ['createdAt', 'scheduledDate', 'processedDate']);
  },

  async addBankAccount(data: Omit<BankAccount, 'id' | 'createdAt'>): Promise<BankAccount> {
    const a = await api<BankAccount>('/finance/bank-accounts', { method: 'POST', body: data });
    return withDates(a, ['createdAt']);
  },

  getBanks(): Array<{ code: string; name: string }> {
    return BANKS;
  },
};
