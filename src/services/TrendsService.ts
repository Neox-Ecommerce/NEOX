import { api, withDates } from '@/lib/api';

export interface Trend {
  id: string;
  storeId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string | null; // não há geração de miniatura: a UI usa <video preload="metadata">
  duration: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reports: number;
  status: 'processing' | 'published' | 'rejected' | 'removed';
  moderationReason?: string | null;
  publishedAt?: Date | null;
  category: string;
  tags: string[];
  productIds: string[];
  isPublic: boolean;
  createdAt: Date;
}

export interface TrendStats {
  totalTrends: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  conversionRate: number;
  revenueGenerated: number;
}

export interface TrendUploadData {
  video: File;
  title: string;
  description: string;
  tags: string;
  category: string;
  productIds: string[];
  isPublic: boolean;
  duration: number; // segundos, lido dos metadados do vídeo no navegador
}

export interface ProductForTrend {
  id: string;
  name: string;
  image?: string;
  price: number;
}

const revive = (t: Trend) => withDates(t, ['publishedAt', 'createdAt']);

// Loja vem do token: nenhum método recebe lojaId.
export class TrendsService {
  static async getMyTrends(): Promise<Trend[]> {
    return (await api<Trend[]>('/trends')).map(revive);
  }

  static getTrendStats(): Promise<TrendStats> {
    return api<TrendStats>('/trends/stats');
  }

  static getProductsForTrends(): Promise<ProductForTrend[]> {
    return api<ProductForTrend[]>('/trends/products');
  }

  static async uploadTrend(data: TrendUploadData): Promise<Trend> {
    const form = new FormData();
    form.append('video', data.video);
    form.append('title', data.title);
    form.append('description', data.description);
    form.append('tags', data.tags);
    form.append('category', data.category);
    form.append('productIds', JSON.stringify(data.productIds));
    form.append('isPublic', String(data.isPublic));
    form.append('duration', String(Math.round(data.duration)));
    return revive(await api<Trend>('/trends', { method: 'POST', body: form }));
  }

  static deleteTrend(trendId: string): Promise<void> {
    return api(`/trends/${trendId}`, { method: 'DELETE' });
  }

  static async updateTrend(
    trendId: string,
    updates: Partial<Pick<Trend, 'title' | 'description' | 'category' | 'tags' | 'productIds' | 'isPublic'>>,
  ): Promise<Trend> {
    return revive(await api<Trend>(`/trends/${trendId}`, { method: 'PATCH', body: updates }));
  }
}
