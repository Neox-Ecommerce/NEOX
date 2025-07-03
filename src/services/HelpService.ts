export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'feature_request' | 'bug_report';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  userId: string;
  assignedTo?: string;
  messages: Array<{
    id: string;
    content: string;
    isFromSupport: boolean;
    attachments?: string[];
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  steps: Array<{
    title: string;
    content: string;
    image?: string;
    video?: string;
  }>;
  tags: string[];
  views: number;
  likes: number;
  createdAt: Date;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  businessHours: {
    monday: { start: string; end: string; active: boolean };
    tuesday: { start: string; end: string; active: boolean };
    wednesday: { start: string; end: string; active: boolean };
    thursday: { start: string; end: string; active: boolean };
    friday: { start: string; end: string; active: boolean };
    saturday: { start: string; end: string; active: boolean };
    sunday: { start: string; end: string; active: boolean };
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export class HelpService {
  private static FAQ_KEY = 'neoxstore_faq';
  private static TICKETS_KEY = 'neoxstore_support_tickets';
  private static TUTORIALS_KEY = 'neoxstore_tutorials';

  private static getStoredFAQ(): FAQItem[] {
    const stored = localStorage.getItem(this.FAQ_KEY);
    if (stored) {
      return JSON.parse(stored).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    }
    
    const seedFAQ: FAQItem[] = [
      {
        id: '1',
        question: 'Como criar meu primeiro produto?',
        answer: 'Para criar seu primeiro produto, acesse o menu "Produtos" no painel e clique em "Novo Produto". Preencha as informações obrigatórias como nome, descrição, preço e categoria. Adicione uma imagem de qualidade e configure o estoque. Após salvar, seu produto estará disponível na loja.',
        category: 'Produtos',
        helpful: 45,
        notHelpful: 3,
        tags: ['produto', 'criar', 'primeiro'],
        createdAt: new Date('2023-06-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        question: 'Como configurar métodos de pagamento?',
        answer: 'Vá até "Integrações" > "Gateways de Pagamento" no painel. Escolha entre os gateways disponíveis (Stripe, PagSeguro, Mercado Pago) e configure suas credenciais. Ative os métodos desejados (cartão, PIX, boleto) e defina as taxas. Teste a integração antes de ativar em produção.',
        category: 'Pagamentos',
        helpful: 38,
        notHelpful: 2,
        tags: ['pagamento', 'gateway', 'configurar'],
        createdAt: new Date('2023-07-20'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '3',
        question: 'Como acompanhar meus pedidos?',
        answer: 'No painel, acesse "Pedidos" para ver todos os pedidos da sua loja. Você pode filtrar por status, data ou cliente. Para cada pedido, é possível visualizar detalhes, atualizar status, adicionar código de rastreamento e imprimir etiquetas.',
        category: 'Pedidos',
        helpful: 52,
        notHelpful: 1,
        tags: ['pedidos', 'acompanhar', 'status'],
        createdAt: new Date('2023-08-10'),
        updatedAt: new Date('2024-01-12')
      },
      {
        id: '4',
        question: 'Como configurar frete?',
        answer: 'Acesse "Integrações" > "Transportadoras" e configure os Correios ou outras transportadoras. Defina as regras de frete grátis em "Configurações" > "Envio". Você pode configurar frete grátis acima de um valor mínimo ou por região.',
        category: 'Envio',
        helpful: 29,
        notHelpful: 4,
        tags: ['frete', 'envio', 'transportadora'],
        createdAt: new Date('2023-09-05'),
        updatedAt: new Date('2024-01-08')
      },
      {
        id: '5',
        question: 'Como personalizar minha loja?',
        answer: 'Em "Configurações" > "Aparência", você pode alterar cores, logo, favicon e outras configurações visuais. Para mudanças mais avançadas, acesse "Configurações" > "SEO" para otimizar meta tags e descrições.',
        category: 'Personalização',
        helpful: 33,
        notHelpful: 2,
        tags: ['personalizar', 'aparência', 'logo'],
        createdAt: new Date('2023-10-12'),
        updatedAt: new Date('2024-01-05')
      }
    ];
    
    this.saveFAQ(seedFAQ);
    return seedFAQ;
  }

  private static getStoredTickets(): SupportTicket[] {
    const stored = localStorage.getItem(this.TICKETS_KEY);
    if (stored) {
      return JSON.parse(stored).map((ticket: any) => ({
        ...ticket,
        messages: ticket.messages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt)
        })),
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt)
      }));
    }
    
    const seedTickets: SupportTicket[] = [
      {
        id: 'TICKET-001',
        subject: 'Problema com gateway de pagamento',
        description: 'Estou tendo dificuldades para configurar o PagSeguro na minha loja.',
        category: 'technical',
        priority: 'medium',
        status: 'resolved',
        userId: '1',
        assignedTo: 'Suporte NeoxStore',
        messages: [
          {
            id: '1',
            content: 'Estou tendo dificuldades para configurar o PagSeguro na minha loja. Já tentei várias vezes mas não consigo.',
            isFromSupport: false,
            createdAt: new Date('2024-01-20T10:00:00')
          },
          {
            id: '2',
            content: 'Olá! Vou te ajudar com a configuração do PagSeguro. Primeiro, verifique se você tem as credenciais corretas (App ID e App Key) em sua conta PagSeguro.',
            isFromSupport: true,
            createdAt: new Date('2024-01-20T10:30:00')
          },
          {
            id: '3',
            content: 'Consegui resolver! Era um problema com as credenciais mesmo. Muito obrigado!',
            isFromSupport: false,
            createdAt: new Date('2024-01-20T11:00:00')
          }
        ],
        createdAt: new Date('2024-01-20T10:00:00'),
        updatedAt: new Date('2024-01-20T11:00:00')
      }
    ];
    
    this.saveTickets(seedTickets);
    return seedTickets;
  }

  private static getStoredTutorials(): Tutorial[] {
    const stored = localStorage.getItem(this.TUTORIALS_KEY);
    if (stored) {
      return JSON.parse(stored).map((tutorial: any) => ({
        ...tutorial,
        createdAt: new Date(tutorial.createdAt)
      }));
    }
    
    const seedTutorials: Tutorial[] = [
      {
        id: '1',
        title: 'Como criar sua primeira loja',
        description: 'Aprenda passo a passo como configurar sua loja virtual do zero',
        category: 'Primeiros Passos',
        difficulty: 'beginner',
        estimatedTime: 15,
        steps: [
          {
            title: 'Configuração inicial',
            content: 'Primeiro, acesse o painel administrativo e vá até Configurações > Geral para definir o nome da sua loja, descrição e informações básicas.',
            image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          {
            title: 'Adicionar produtos',
            content: 'Vá até Produtos > Novo Produto e adicione seus primeiros itens com fotos, descrições e preços.',
            image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          {
            title: 'Configurar pagamentos',
            content: 'Configure pelo menos um método de pagamento em Integrações > Gateways para começar a receber pedidos.',
            image: 'https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ],
        tags: ['iniciante', 'configuração', 'loja'],
        views: 1250,
        likes: 89,
        createdAt: new Date('2023-06-15')
      },
      {
        id: '2',
        title: 'Otimizando suas vendas',
        description: 'Estratégias para aumentar suas conversões e vendas',
        category: 'Marketing',
        difficulty: 'intermediate',
        estimatedTime: 25,
        steps: [
          {
            title: 'Análise de métricas',
            content: 'Use o dashboard para identificar produtos mais vendidos e páginas com maior taxa de abandono.',
            image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          {
            title: 'Criação de cupons',
            content: 'Configure cupons de desconto estratégicos para incentivar compras e fidelizar clientes.',
            image: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          {
            title: 'Email marketing',
            content: 'Configure campanhas de email para recuperar carrinho abandonado e promover novos produtos.',
            image: 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        ],
        tags: ['vendas', 'marketing', 'conversão'],
        views: 890,
        likes: 67,
        createdAt: new Date('2023-08-20')
      }
    ];
    
    this.saveTutorials(seedTutorials);
    return seedTutorials;
  }

  private static saveFAQ(faq: FAQItem[]): void {
    localStorage.setItem(this.FAQ_KEY, JSON.stringify(faq));
  }

  private static saveTickets(tickets: SupportTicket[]): void {
    localStorage.setItem(this.TICKETS_KEY, JSON.stringify(tickets));
  }

  private static saveTutorials(tutorials: Tutorial[]): void {
    localStorage.setItem(this.TUTORIALS_KEY, JSON.stringify(tutorials));
  }

  static async getFAQ(category?: string): Promise<FAQItem[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const faq = this.getStoredFAQ();
    
    if (category) {
      return faq.filter(item => item.category === category);
    }
    
    return faq.sort((a, b) => b.helpful - a.helpful);
  }

  static async searchFAQ(query: string): Promise<FAQItem[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const searchTerm = query.toLowerCase();
    return this.getStoredFAQ().filter(item =>
      item.question.toLowerCase().includes(searchTerm) ||
      item.answer.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  static async getSupportTickets(userId: string): Promise<SupportTicket[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return this.getStoredTickets()
      .filter(ticket => ticket.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async createSupportTicket(data: Omit<SupportTicket, 'id' | 'status' | 'messages' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const tickets = this.getStoredTickets();
    const newTicket: SupportTicket = {
      ...data,
      id: `TICKET-${String(Date.now()).slice(-6)}`,
      status: 'open',
      messages: [
        {
          id: '1',
          content: data.description,
          isFromSupport: false,
          createdAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    tickets.unshift(newTicket);
    this.saveTickets(tickets);
    return newTicket;
  }

  static async addTicketMessage(ticketId: string, content: string, isFromSupport: boolean = false): Promise<SupportTicket> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const tickets = this.getStoredTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) {
      throw new Error('Ticket não encontrado');
    }
    
    const newMessage = {
      id: Date.now().toString(),
      content,
      isFromSupport,
      createdAt: new Date()
    };
    
    tickets[ticketIndex].messages.push(newMessage);
    tickets[ticketIndex].updatedAt = new Date();
    
    this.saveTickets(tickets);
    return tickets[ticketIndex];
  }

  static async getTutorials(category?: string): Promise<Tutorial[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const tutorials = this.getStoredTutorials();
    
    if (category) {
      return tutorials.filter(tutorial => tutorial.category === category);
    }
    
    return tutorials.sort((a, b) => b.views - a.views);
  }

  static async getTutorialById(id: string): Promise<Tutorial | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const tutorial = this.getStoredTutorials().find(t => t.id === id);
    
    if (tutorial) {
      // Increment view count
      const tutorials = this.getStoredTutorials();
      const tutorialIndex = tutorials.findIndex(t => t.id === id);
      tutorials[tutorialIndex].views += 1;
      this.saveTutorials(tutorials);
      
      return { ...tutorial, views: tutorial.views + 1 };
    }
    
    return null;
  }

  static async rateFAQ(faqId: string, helpful: boolean): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const faq = this.getStoredFAQ();
    const faqIndex = faq.findIndex(item => item.id === faqId);
    
    if (faqIndex !== -1) {
      if (helpful) {
        faq[faqIndex].helpful += 1;
      } else {
        faq[faqIndex].notHelpful += 1;
      }
      
      this.saveFAQ(faq);
    }
  }

  static getContactInfo(): ContactInfo {
    return {
      email: 'suporte@neoxstore.com',
      phone: '(11) 3000-0000',
      whatsapp: '5511999999999',
      businessHours: {
        monday: { start: '09:00', end: '18:00', active: true },
        tuesday: { start: '09:00', end: '18:00', active: true },
        wednesday: { start: '09:00', end: '18:00', active: true },
        thursday: { start: '09:00', end: '18:00', active: true },
        friday: { start: '09:00', end: '18:00', active: true },
        saturday: { start: '09:00', end: '12:00', active: true },
        sunday: { start: '09:00', end: '12:00', active: false }
      },
      socialMedia: {
        facebook: 'NeoxStore',
        instagram: '@neoxstore',
        twitter: '@neoxstore',
        youtube: 'NeoxStore'
      }
    };
  }

  static getFAQCategories(): string[] {
    return ['Produtos', 'Pagamentos', 'Pedidos', 'Envio', 'Personalização', 'Relatórios', 'Integrações'];
  }

  static getTutorialCategories(): string[] {
    return ['Primeiros Passos', 'Produtos', 'Marketing', 'Vendas', 'Relatórios', 'Integrações', 'Avançado'];
  }
}