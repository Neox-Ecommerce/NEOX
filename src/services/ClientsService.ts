export interface Client {
  id: string;
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

export class ClientsService {
  private static CLIENTS_KEY = 'neoxstore_clients';

  private static getStoredClients(): Client[] {
    const stored = localStorage.getItem(this.CLIENTS_KEY);
    if (stored) {
      return JSON.parse(stored).map((client: any) => ({
        ...client,
        createdAt: new Date(client.createdAt),
        updatedAt: new Date(client.updatedAt)
      }));
    }
    
    // Seed inicial
    const seedClients: Client[] = [
      {
        id: '1',
        name: 'João Silva Santos',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-1234',
        document: '123.456.789-00',
        birthDate: '1985-03-15',
        gender: 'M',
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        totalOrders: 5,
        totalSpent: 15420.50,
        averageTicket: 3084.10,
        lastOrderDate: '2024-01-20',
        status: 'active',
        tags: ['VIP', 'Fidelizado'],
        notes: 'Cliente preferencial, sempre compra produtos premium',
        createdAt: new Date('2023-06-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@email.com',
        phone: '(11) 98888-5678',
        document: '987.654.321-00',
        birthDate: '1990-07-22',
        gender: 'F',
        address: {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100'
        },
        totalOrders: 3,
        totalSpent: 8750.30,
        averageTicket: 2916.77,
        lastOrderDate: '2024-01-19',
        status: 'active',
        tags: ['Novo Cliente'],
        createdAt: new Date('2023-12-10'),
        updatedAt: new Date('2024-01-19')
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        phone: '(11) 97777-9012',
        document: '456.789.123-00',
        birthDate: '1988-11-08',
        gender: 'M',
        address: {
          street: 'Rua Augusta',
          number: '500',
          neighborhood: 'Consolação',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01305-000'
        },
        totalOrders: 1,
        totalSpent: 7519.89,
        averageTicket: 7519.89,
        lastOrderDate: '2024-01-22',
        status: 'active',
        tags: ['Primeira Compra'],
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22')
      },
      {
        id: '4',
        name: 'Ana Rodrigues',
        email: 'ana.rodrigues@email.com',
        phone: '(11) 96666-3456',
        document: '789.123.456-00',
        birthDate: '1992-05-30',
        gender: 'F',
        address: {
          street: 'Rua Oscar Freire',
          number: '200',
          neighborhood: 'Jardins',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01426-000'
        },
        totalOrders: 8,
        totalSpent: 25680.45,
        averageTicket: 3210.06,
        lastOrderDate: '2024-01-18',
        status: 'active',
        tags: ['VIP', 'Fidelizado', 'Alto Valor'],
        notes: 'Excelente cliente, sempre indica novos compradores',
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date('2024-01-18')
      },
      {
        id: '5',
        name: 'Carlos Mendes',
        email: 'carlos.mendes@email.com',
        phone: '(11) 95555-7890',
        document: '321.654.987-00',
        birthDate: '1980-12-12',
        gender: 'M',
        address: {
          street: 'Rua da Consolação',
          number: '800',
          neighborhood: 'Consolação',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01302-000'
        },
        totalOrders: 2,
        totalSpent: 3250.75,
        averageTicket: 1625.38,
        lastOrderDate: '2023-12-15',
        status: 'inactive',
        tags: ['Inativo'],
        notes: 'Cliente não compra há mais de 30 dias',
        createdAt: new Date('2023-08-10'),
        updatedAt: new Date('2023-12-15')
      }
    ];
    
    this.saveClients(seedClients);
    return seedClients;
  }

  private static saveClients(clients: Client[]): void {
    localStorage.setItem(this.CLIENTS_KEY, JSON.stringify(clients));
  }

  static async getClients(lojaId: string): Promise<Client[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.getStoredClients()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async getClientById(clientId: string): Promise<Client | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getStoredClients().find(client => client.id === clientId) || null;
  }

  static async getClientStats(lojaId: string): Promise<ClientStats> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const clients = this.getStoredClients();
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const activeClients = clients.filter(client => client.status === 'active');
    const newClientsThisMonth = clients.filter(client => 
      new Date(client.createdAt) >= thisMonth
    );
    
    const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0);
    const totalOrders = clients.reduce((sum, client) => sum + client.totalOrders, 0);
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalClients: clients.length,
      activeClients: activeClients.length,
      newClientsThisMonth: newClientsThisMonth.length,
      averageTicket,
      totalRevenue,
      retentionRate: 78.5 // Mock data
    };
  }

  static async updateClient(clientId: string, data: Partial<Client>): Promise<Client> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const clients = this.getStoredClients();
    const clientIndex = clients.findIndex(client => client.id === clientId);
    
    if (clientIndex === -1) {
      throw new Error('Cliente não encontrado');
    }
    
    clients[clientIndex] = {
      ...clients[clientIndex],
      ...data,
      updatedAt: new Date()
    };
    
    this.saveClients(clients);
    return clients[clientIndex];
  }

  static async searchClients(query: string): Promise<Client[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const searchTerm = query.toLowerCase();
    return this.getStoredClients().filter(client =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.phone.includes(searchTerm) ||
      client.document.includes(searchTerm)
    );
  }

  static async exportClients(): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const clients = this.getStoredClients();
    const csvContent = [
      'Nome,Email,Telefone,CPF,Total Pedidos,Total Gasto,Ticket Médio,Status,Data Cadastro',
      ...clients.map(client => 
        `"${client.name}","${client.email}","${client.phone}","${client.document}",${client.totalOrders},${client.totalSpent.toFixed(2)},${client.averageTicket.toFixed(2)},"${client.status}","${client.createdAt.toLocaleDateString('pt-BR')}"`
      )
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}