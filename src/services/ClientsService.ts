import { api, toCsvBlob, toDate, withDates } from '@/lib/api';

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'Other';
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  totalOrders: number;
  totalSpent: number;
  averageTicket: number;
  lastOrderDate?: string;
  status: 'active' | 'inactive' | 'blocked';
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  averageTicket: number;
  totalRevenue: number;
  retentionRate: number;
}

export type ClientUpdate = Partial<Pick<Client, 'status' | 'tags' | 'notes' | 'document' | 'birthDate' | 'gender' | 'address'>>;

// lastOrderDate continua string (ISO com fuso) para `new Date(...)` da página funcionar.
const parse = (c: Client): Client => {
  const out = withDates(c, ['createdAt', 'updatedAt']);
  return c.lastOrderDate ? { ...out, lastOrderDate: toDate(c.lastOrderDate).toISOString() } : out;
};

export const ClientsService = {
  async getClients(): Promise<Client[]> {
    return (await api<Client[]>('/customers')).map(parse);
  },

  async getClientById(clientId: string): Promise<Client | null> {
    try {
      return parse(await api<Client>(`/customers/${clientId}`));
    } catch {
      return null;
    }
  },

  async getClientStats(): Promise<ClientStats> {
    return api<ClientStats>('/customers/stats');
  },

  async updateClient(clientId: string, data: ClientUpdate): Promise<Client> {
    return parse(await api<Client>(`/customers/${clientId}`, { method: 'PATCH', body: data }));
  },

  async searchClients(query: string): Promise<Client[]> {
    return (await api<Client[]>('/customers', { query: { q: query } })).map(parse);
  },

  exportClients(clients: Client[]): Blob {
    return toCsvBlob([
      ['Nome', 'Email', 'Telefone', 'CPF', 'Total Pedidos', 'Total Gasto', 'Ticket Médio', 'Status', 'Data Cadastro'],
      ...clients.map((c) => [
        c.name,
        c.email,
        c.phone,
        c.document,
        c.totalOrders,
        c.totalSpent.toFixed(2).replace('.', ','),
        c.averageTicket.toFixed(2).replace('.', ','),
        c.status,
        c.createdAt.toLocaleDateString('pt-BR'),
      ]),
    ]);
  },
};
