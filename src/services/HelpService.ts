import { api, withDates } from '@/lib/api';

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
  businessHours: Array<{ days: string; hours: string }>;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export type TicketInput = Pick<SupportTicket, 'subject' | 'description' | 'category' | 'priority'>;

const faqItem = (f: FAQItem) => withDates(f, ['createdAt', 'updatedAt']);
const tutorial = (t: Tutorial) => withDates(t, ['createdAt']);
const ticket = (t: SupportTicket): SupportTicket => ({
  ...withDates(t, ['createdAt', 'updatedAt']),
  messages: t.messages.map((m) => withDates(m, ['createdAt'])),
});

export const HelpService = {
  getFAQ: async (category?: string): Promise<FAQItem[]> =>
    (await api<FAQItem[]>('/help/faq', { query: { category } })).map(faqItem),

  searchFAQ: async (query: string): Promise<FAQItem[]> =>
    (await api<FAQItem[]>('/help/faq', { query: { search: query } })).map(faqItem),

  rateFAQ: (faqId: string, helpful: boolean): Promise<void> =>
    api(`/help/faq/${faqId}/rate`, { method: 'POST', body: { helpful } }),

  /** Tickets do usuário logado. */
  getSupportTickets: async (): Promise<SupportTicket[]> =>
    (await api<SupportTicket[]>('/help/tickets')).map(ticket),

  createSupportTicket: async (data: TicketInput): Promise<SupportTicket> =>
    ticket(await api<SupportTicket>('/help/tickets', { method: 'POST', body: data })),

  addTicketMessage: async (ticketId: string, content: string): Promise<SupportTicket> =>
    ticket(await api<SupportTicket>(`/help/tickets/${ticketId}/messages`, { method: 'POST', body: { content } })),

  getTutorials: async (category?: string): Promise<Tutorial[]> =>
    (await api<Tutorial[]>('/help/tutorials', { query: { category } })).map(tutorial),

  /** Abre o tutorial (o servidor conta a visualização). */
  getTutorialById: async (id: string): Promise<Tutorial> => tutorial(await api<Tutorial>(`/help/tutorials/${id}`)),

  /** Formulário público de contato. */
  sendContactMessage: (data: ContactMessageInput): Promise<{ message: string }> =>
    api('/help/contact', { method: 'POST', body: data }),

  getContactInfo(): ContactInfo {
    return {
      email: 'suporte@neoxstore.com',
      businessHours: [
        { days: 'Segunda a Sexta', hours: '9h às 18h' },
        { days: 'Sábado, Domingo e feriados', hours: 'Fechado' },
      ],
    };
  },

  getFAQCategories(): string[] {
    return ['Cadastro e Loja', 'Produtos', 'Estoque', 'Pedidos', 'Pagamentos', 'Financeiro', 'Marketing', 'Trends', 'Configurações'];
  },

  getTutorialCategories(): string[] {
    return ['Primeiros Passos', 'Produtos', 'Vendas', 'Financeiro', 'Marketing'];
  },
};
