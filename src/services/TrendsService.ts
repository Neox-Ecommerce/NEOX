export interface Trend {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  status: 'processing' | 'published' | 'rejected';
  publishedAt: string;
  category: string;
  tags: string[];
  productIds: string[];
  lojaId: string;
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
  lojaId: string;
}

export interface ProductForTrend {
  id: string;
  name: string;
  image?: string;
  price: number;
}

export class TrendsService {
  private static TRENDS_KEY = 'neoxstore_trends';

  private static getTrends(): Trend[] {
    const stored = localStorage.getItem(this.TRENDS_KEY);
    if (stored) {
      return JSON.parse(stored).map((trend: any) => ({
        ...trend,
        createdAt: new Date(trend.createdAt)
      }));
    }
    
    // Seed inicial
    const seedTrends: Trend[] = [
      {
        id: '1',
        title: 'Unboxing iPhone 15 Pro Max - Vale a pena?',
        description: 'Confira o unboxing completo do novo iPhone 15 Pro Max e descubra se vale a pena o investimento! #iPhone15 #Unboxing #TechReview',
        videoUrl: 'https://example.com/video1.mp4',
        thumbnail: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400',
        duration: 45,
        views: 12500,
        likes: 890,
        comments: 156,
        shares: 78,
        status: 'published',
        publishedAt: '2024-01-20',
        category: 'Unboxing',
        tags: ['iPhone15', 'Unboxing', 'TechReview'],
        productIds: ['1'],
        lojaId: '1',
        createdAt: new Date('2024-01-20')
      },
      {
        id: '2',
        title: 'MacBook Pro M3 vs M2 - Comparativo Completo',
        description: 'Comparação detalhada entre o novo MacBook Pro M3 e o M2. Qual oferece melhor custo-benefício? #MacBook #M3 #Comparativo',
        videoUrl: 'https://example.com/video2.mp4',
        thumbnail: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
        duration: 38,
        views: 8750,
        likes: 654,
        comments: 89,
        shares: 45,
        status: 'published',
        publishedAt: '2024-01-18',
        category: 'Comparativo',
        tags: ['MacBook', 'M3', 'Comparativo'],
        productIds: ['2'],
        lojaId: '1',
        createdAt: new Date('2024-01-18')
      },
      {
        id: '3',
        title: 'AirPods Pro 3ª Geração - Primeiras Impressões',
        description: 'Testando os novos AirPods Pro de 3ª geração! Confira as novidades e melhorias. #AirPods #Apple #Audio',
        videoUrl: 'https://example.com/video3.mp4',
        thumbnail: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
        duration: 28,
        views: 5420,
        likes: 412,
        comments: 67,
        shares: 23,
        status: 'processing',
        publishedAt: '2024-01-22',
        category: 'Produto em Destaque',
        tags: ['AirPods', 'Apple', 'Audio'],
        productIds: ['3'],
        lojaId: '1',
        createdAt: new Date('2024-01-22')
      }
    ];
    
    this.saveTrends(seedTrends);
    return seedTrends;
  }

  private static saveTrends(trends: Trend[]): void {
    localStorage.setItem(this.TRENDS_KEY, JSON.stringify(trends));
  }

  static async getMyTrends(lojaId: string): Promise<Trend[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.getTrends()
      .filter(trend => trend.lojaId === lojaId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getTrendStats(lojaId: string): Promise<TrendStats> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const trends = this.getTrends().filter(trend => trend.lojaId === lojaId);
    
    const totalViews = trends.reduce((sum, trend) => sum + trend.views, 0);
    const totalLikes = trends.reduce((sum, trend) => sum + trend.likes, 0);
    const totalComments = trends.reduce((sum, trend) => sum + trend.comments, 0);
    
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100) : 0;
    
    return {
      totalTrends: trends.length,
      totalViews,
      totalLikes,
      totalComments,
      engagementRate: Math.round(engagementRate * 100) / 100,
      conversionRate: 3.2, // Mock data
      revenueGenerated: 15750.50 // Mock data
    };
  }

  static async getProductsForTrends(lojaId: string): Promise<ProductForTrend[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock products data
    return [
      {
        id: '1',
        name: 'iPhone 15 Pro Max',
        image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=150',
        price: 8999.99
      },
      {
        id: '2',
        name: 'MacBook Pro 14" M3',
        image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=150',
        price: 12999.90
      },
      {
        id: '3',
        name: 'AirPods Pro (3ª geração)',
        image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=150',
        price: 1899.99
      },
      {
        id: '4',
        name: 'Samsung Galaxy S24 Ultra',
        image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=150',
        price: 7499.99
      }
    ];
  }

  static async uploadTrend(data: TrendUploadData): Promise<Trend> {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate upload time
    
    const trends = this.getTrends();
    
    // Create video URL (in production, this would be uploaded to a CDN)
    const videoUrl = URL.createObjectURL(data.video);
    
    const newTrend: Trend = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      videoUrl,
      thumbnail: videoUrl, // In production, generate thumbnail
      duration: 30, // Mock duration
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      status: 'processing',
      publishedAt: new Date().toISOString().split('T')[0],
      category: data.category,
      tags: data.tags.split(' ').filter(tag => tag.startsWith('#')),
      productIds: data.productIds,
      lojaId: data.lojaId,
      createdAt: new Date()
    };
    
    trends.unshift(newTrend);
    this.saveTrends(trends);
    
    // Simulate processing completion after 5 seconds
    setTimeout(() => {
      const updatedTrends = this.getTrends();
      const trendIndex = updatedTrends.findIndex(t => t.id === newTrend.id);
      if (trendIndex !== -1) {
        updatedTrends[trendIndex].status = 'published';
        this.saveTrends(updatedTrends);
      }
    }, 5000);
    
    return newTrend;
  }

  static async deleteTrend(trendId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const trends = this.getTrends();
    const filteredTrends = trends.filter(trend => trend.id !== trendId);
    this.saveTrends(filteredTrends);
  }

  static async updateTrend(trendId: string, updates: Partial<Trend>): Promise<Trend> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const trends = this.getTrends();
    const trendIndex = trends.findIndex(trend => trend.id === trendId);
    
    if (trendIndex === -1) {
      throw new Error('Trend não encontrado');
    }
    
    trends[trendIndex] = { ...trends[trendIndex], ...updates };
    this.saveTrends(trends);
    
    return trends[trendIndex];
  }

  static async getTrendingHashtags(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      '#TechReview',
      '#Unboxing',
      '#iPhone15',
      '#MacBook',
      '#Comparativo',
      '#Novidade',
      '#Promoção',
      '#Tutorial',
      '#Apple',
      '#Samsung'
    ];
  }
}