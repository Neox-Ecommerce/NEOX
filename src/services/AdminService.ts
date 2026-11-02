import { api, withDates } from '@/lib/api';

export type StoreStatus = 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'SUSPENSA';
export type DocumentStatus = 'PENDENTE' | 'VERIFICADO' | 'REJEITADO';

export interface AdminStoreDocument {
  id: string;
  tipo: string;
  description?: string | null;
  url: string;
  dataEnvio: Date;
  status: DocumentStatus;
}

export interface AdminStoreWarning {
  id: string;
  motivo: string;
  data: Date;
  resolvido: boolean;
}

export interface AdminStore {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  cnpjVerificado: boolean;
  segmento: string;
  telefone?: string | null;
  endereco?: string | null;
  status: StoreStatus;
  statusReason?: string | null;
  owner: string;
  email: string;
  createdAt: Date;
  documentos: AdminStoreDocument[];
  advertencias: AdminStoreWarning[];
}

export interface AdminVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string | null;
  storeId: string;
  storeName: string;
  status: 'processing' | 'published' | 'rejected' | 'removed';
  moderationReason?: string | null;
  views: number;
  likes: number;
  reports: number;
  duration: number;
  createdAt: Date;
}

export interface AdminStoreDetail extends AdminStore {
  ownerId: string;
  ownerActive: boolean;
  productsCount: number;
  ordersCount: number;
  revenuePaid: number;
  videos: AdminVideo[];
}

export interface AdminOverview {
  storesByStatus: Partial<Record<StoreStatus, number>>;
  pendingStores: { id: string; nomeFantasia: string; owner: string; createdAt: Date }[];
  reportedVideosCount: number;
  reportedVideos: { id: string; title: string; storeName: string; reports: number }[];
  openTicketsCount: number;
  openTickets: { id: string; subject: string; status: TicketStatus; priority: TicketPriority; userName: string; updatedAt: Date }[];
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
  usersByRole: Partial<Record<UserRole, number>>;
  thisMonth: { orders: number; gmv: number };
  lastMonth: { orders: number; gmv: number };
  newUsersThisMonth: number;
}

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AdminPayout {
  id: string;
  storeId: string;
  storeName: string;
  amount: number;
  fees: number;
  netAmount: number;
  status: PayoutStatus;
  bankAccount: { bank?: string; agency?: string; account?: string; accountType?: string; holderName?: string };
  note?: string | null;
  scheduledDate: Date;
  processedDate?: Date | null;
  createdAt: Date;
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'CLIENTE' | 'EMPREENDEDOR' | 'ADMIN';

export interface AdminTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminTicketMessage {
  id: string;
  content: string;
  isFromSupport: boolean;
  createdAt: Date;
}

export interface AdminTicketDetail extends AdminTicket {
  messages: AdminTicketMessage[];
}

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  createdAt: Date;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  storeId?: string | null;
  storeName?: string | null;
  createdAt: Date;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PlatformSettings {
  supportEmail: string;
  supportPhone: string;
  platformFeePercent: number;
}

const reviveWarning = (w: AdminStoreWarning) => withDates(w, ['data']);
const reviveVideo = (v: AdminVideo) => withDates(v, ['createdAt']);
const reviveStore = <T extends AdminStore>(s: T): T => ({
  ...withDates(s, ['createdAt']),
  documentos: s.documentos.map((d) => withDates(d, ['dataEnvio'])),
  advertencias: s.advertencias.map(reviveWarning),
});
const reviveDetail = (s: AdminStoreDetail): AdminStoreDetail => ({ ...reviveStore(s), videos: s.videos.map(reviveVideo) });
const revivePayout = (p: AdminPayout) => withDates(p, ['scheduledDate', 'processedDate', 'createdAt']);
const reviveTicket = <T extends AdminTicket>(t: T): T => withDates(t, ['createdAt', 'updatedAt']);
const reviveTicketDetail = (t: AdminTicketDetail): AdminTicketDetail => ({
  ...reviveTicket(t),
  messages: t.messages.map((m) => withDates(m, ['createdAt'])),
});

export class AdminService {
  // ---------- Lojas ----------
  static async getStores(filters: { status?: StoreStatus; search?: string } = {}): Promise<AdminStore[]> {
    return (await api<AdminStore[]>('/admin/stores', { query: filters })).map(reviveStore);
  }

  static async getStore(storeId: string): Promise<AdminStoreDetail> {
    return reviveDetail(await api<AdminStoreDetail>(`/admin/stores/${storeId}`));
  }

  static async updateStoreStatus({ storeId, status, reason }: { storeId: string; status: StoreStatus; reason?: string }): Promise<AdminStore> {
    return reviveStore(await api<AdminStore>(`/admin/stores/${storeId}/status`, { method: 'PATCH', body: { status, reason } }));
  }

  static async addWarning({ storeId, motivo }: { storeId: string; motivo: string }): Promise<AdminStoreWarning> {
    return reviveWarning(await api<AdminStoreWarning>(`/admin/stores/${storeId}/warnings`, { method: 'POST', body: { motivo } }));
  }

  static async updateDocumentStatus({ documentId, status }: { documentId: string; status: DocumentStatus }): Promise<AdminStoreDocument> {
    return withDates(await api<AdminStoreDocument>(`/admin/documents/${documentId}`, { method: 'PATCH', body: { status } }), ['dataEnvio']);
  }

  // ---------- Vídeos ----------
  static async getVideos(filters: { status?: AdminVideo['status']; reported?: boolean } = {}): Promise<AdminVideo[]> {
    return (await api<AdminVideo[]>('/admin/videos', { query: filters })).map(reviveVideo);
  }

  static async removeVideo({ videoId, reason }: { videoId: string; reason: string }): Promise<AdminVideo> {
    return reviveVideo(await api<AdminVideo>(`/admin/videos/${videoId}/remove`, { method: 'PATCH', body: { reason } }));
  }

  static async notifyVideoStore({ videoId, reason }: { videoId: string; reason: string }): Promise<AdminStoreWarning> {
    return reviveWarning(await api<AdminStoreWarning>(`/admin/videos/${videoId}/notify`, { method: 'POST', body: { reason } }));
  }

  // ---------- Visão geral ----------
  static async getOverview(): Promise<AdminOverview> {
    const o = await api<AdminOverview>('/admin/overview');
    return {
      ...o,
      pendingStores: o.pendingStores.map((s) => withDates(s, ['createdAt'])),
      openTickets: o.openTickets.map((t) => withDates(t, ['updatedAt'])),
    };
  }

  // ---------- Repasses ----------
  static async getPayouts(status?: PayoutStatus): Promise<AdminPayout[]> {
    return (await api<AdminPayout[]>('/admin/payouts', { query: { status } })).map(revivePayout);
  }

  static async updatePayout({ payoutId, status, note }: { payoutId: string; status: Exclude<PayoutStatus, 'pending'>; note?: string }): Promise<AdminPayout> {
    return revivePayout(await api<AdminPayout>(`/admin/payouts/${payoutId}`, { method: 'PATCH', body: { status, note } }));
  }

  // ---------- Suporte ----------
  static async getTickets(filters: { status?: TicketStatus; q?: string } = {}): Promise<AdminTicket[]> {
    return (await api<AdminTicket[]>('/admin/tickets', { query: filters })).map(reviveTicket);
  }

  static async getTicket(ticketId: string): Promise<AdminTicketDetail> {
    return reviveTicketDetail(await api<AdminTicketDetail>(`/admin/tickets/${ticketId}`));
  }

  static async replyTicket({ ticketId, content }: { ticketId: string; content: string }): Promise<AdminTicketDetail> {
    return reviveTicketDetail(await api<AdminTicketDetail>(`/admin/tickets/${ticketId}/messages`, { method: 'POST', body: { content } }));
  }

  static async updateTicket({ ticketId, ...body }: { ticketId: string; status?: TicketStatus; priority?: TicketPriority; assignedTo?: string | null }): Promise<AdminTicketDetail> {
    return reviveTicketDetail(await api<AdminTicketDetail>(`/admin/tickets/${ticketId}`, { method: 'PATCH', body }));
  }

  static async getContactMessages(): Promise<AdminContactMessage[]> {
    return (await api<AdminContactMessage[]>('/admin/contact-messages')).map((m) => withDates(m, ['createdAt']));
  }

  // ---------- Usuários ----------
  static async getUsers(filters: { role?: UserRole; q?: string; status?: 'active' | 'blocked'; page?: number; pageSize?: number } = {}): Promise<Page<AdminUser>> {
    const p = await api<Page<AdminUser>>('/admin/users', { query: filters });
    return { ...p, items: p.items.map((u) => withDates(u, ['createdAt'])) };
  }

  static async setUserActive({ userId, isActive }: { userId: string; isActive: boolean }): Promise<AdminUser> {
    return withDates(await api<AdminUser>(`/admin/users/${userId}`, { method: 'PATCH', body: { isActive } }), ['createdAt']);
  }

  // ---------- Configurações ----------
  static getSettings(): Promise<PlatformSettings> {
    return api<PlatformSettings>('/admin/settings');
  }

  static saveSettings(body: PlatformSettings): Promise<PlatformSettings> {
    return api<PlatformSettings>('/admin/settings', { method: 'PUT', body });
  }

  /** Contato de suporte público (sem login): /admin/public/info. */
  static getPublicInfo(): Promise<Pick<PlatformSettings, 'supportEmail' | 'supportPhone'>> {
    return api('/admin/public/info');
  }
}
