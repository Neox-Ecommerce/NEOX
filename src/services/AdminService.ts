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

const reviveWarning = (w: AdminStoreWarning) => withDates(w, ['data']);
const reviveStore = (s: AdminStore): AdminStore => ({
  ...withDates(s, ['createdAt']),
  documentos: s.documentos.map((d) => withDates(d, ['dataEnvio'])),
  advertencias: s.advertencias.map(reviveWarning),
});
const reviveVideo = (v: AdminVideo) => withDates(v, ['createdAt']);

export class AdminService {
  static async getStores(filters: { status?: StoreStatus; search?: string } = {}): Promise<AdminStore[]> {
    return (await api<AdminStore[]>('/admin/stores', { query: filters })).map(reviveStore);
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

  static async getVideos(filters: { status?: AdminVideo['status']; reported?: boolean } = {}): Promise<AdminVideo[]> {
    return (await api<AdminVideo[]>('/admin/videos', { query: filters })).map(reviveVideo);
  }

  static async removeVideo({ videoId, reason }: { videoId: string; reason: string }): Promise<AdminVideo> {
    return reviveVideo(await api<AdminVideo>(`/admin/videos/${videoId}/remove`, { method: 'PATCH', body: { reason } }));
  }

  static async notifyVideoStore({ videoId, reason }: { videoId: string; reason: string }): Promise<AdminStoreWarning> {
    return reviveWarning(await api<AdminStoreWarning>(`/admin/videos/${videoId}/notify`, { method: 'POST', body: { reason } }));
  }
}
