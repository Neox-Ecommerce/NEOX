import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Video,
  Upload,
  Play,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  TrendingUp,
  Trash2,
  Plus,
  X,
  FileVideo,
  Image as ImageIcon,
  Sparkles,
  Zap
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TrendsService, Trend } from '@/services/TrendsService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const STATUS_BADGE: Record<Trend['status'], { variant: 'success' | 'warning' | 'destructive'; label: string }> = {
  published: { variant: 'success', label: 'Publicado' },
  processing: { variant: 'warning', label: 'Processando' },
  rejected: { variant: 'destructive', label: 'Rejeitado' },
  removed: { variant: 'destructive', label: 'Removido' },
};

export function TrendsPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0); // lido do <video> (loadedmetadata)
  const [trendData, setTrendData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '',
    productIds: [] as string[],
    isPublic: true
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const storeKey = user?.lojaId;

  const { data: trends = [], isLoading } = useQuery({
    queryKey: ['trends', storeKey],
    queryFn: () => TrendsService.getMyTrends()
  });

  const { data: trendStats } = useQuery({
    queryKey: ['trend-stats', storeKey],
    queryFn: () => TrendsService.getTrendStats()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-for-trends', storeKey],
    queryFn: () => TrendsService.getProductsForTrends()
  });

  const uploadTrendMutation = useMutation({
    mutationFn: TrendsService.uploadTrend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['trend-stats'] });
      FeedbackService.success('Trend publicado com sucesso!');
      resetForm();
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao publicar trend');
    }
  });

  const deleteTrendMutation = useMutation({
    mutationFn: TrendsService.deleteTrend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.invalidateQueries({ queryKey: ['trend-stats'] });
      FeedbackService.success('Trend excluído');
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao excluir trend');
    }
  });

  const pickVideo = (file?: File) => {
    if (!file) return;
    // mesmos formatos aceitos pela API
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      FeedbackService.error('Formato não suportado. Use MP4, WEBM ou MOV');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      FeedbackService.error('O vídeo deve ter no máximo 100MB');
      return;
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setSelectedVideo(file);
    setVideoDuration(0);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    pickVideo(event.target.files?.[0]);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    pickVideo(event.dataTransfer.files[0]);
  };

  const handleDeleteTrend = (trendId: string, title: string) => {
    if (window.confirm(`Excluir o trend "${title}"?`)) deleteTrendMutation.mutate(trendId);
  };

  const shareTrend = (videoUrl: string) => {
    navigator.clipboard.writeText(videoUrl);
    FeedbackService.success('Link do vídeo copiado!');
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleSubmit = () => {
    if (!selectedVideo) {
      FeedbackService.error('Selecione um vídeo para publicar');
      return;
    }

    if (!trendData.title.trim()) {
      FeedbackService.error('Digite um título para o trend');
      return;
    }

    uploadTrendMutation.mutate({
      video: selectedVideo,
      ...trendData,
      duration: Number.isFinite(videoDuration) ? videoDuration : 0
    });
  };

  const resetForm = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setSelectedVideo(null);
    setVideoPreview('');
    setVideoDuration(0);
    setTrendData({
      title: '',
      description: '',
      tags: '',
      category: '',
      productIds: [],
      isPublic: true
    });
    setUploadModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categories = [
    'Produto em Destaque',
    'Tutorial/Como Usar',
    'Unboxing',
    'Comparativo',
    'Promoção',
    'Novidade',
    'Bastidores',
    'Depoimento',
    'Outros'
  ];

  if (isLoading) {
    return (
      <RoleGuard requiredRole="EMPREENDEDOR">
        <AppShell>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AppShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="EMPREENDEDOR">
      <AppShell>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Trends da Loja
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Crie vídeos virais para promover seus produtos
              </p>
            </div>

            <Button onClick={() => setUploadModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Trend
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Total de Trends</p>
                    <p className="text-2xl font-bold">
                      {trendStats?.totalTrends || 0}
                    </p>
                  </div>
                  <Video className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100">Total de Views</p>
                    <p className="text-2xl font-bold">
                      {formatViews(trendStats?.totalViews || 0)}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-pink-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Total de Likes</p>
                    <p className="text-2xl font-bold">
                      {formatViews(trendStats?.totalLikes || 0)}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Engajamento</p>
                    <p className="text-2xl font-bold">
                      {trendStats?.engagementRate || 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="my-trends" className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-trends">Meus Trends</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="trending">Em Alta</TabsTrigger>
            </TabsList>

            <TabsContent value="my-trends" className="space-y-6">
              {trends.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhum trend publicado ainda
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Comece criando seu primeiro trend para promover seus produtos
                    </p>
                    <Button onClick={() => setUploadModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Trend
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trends.map((trend) => (
                    <Card key={trend.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <video
                          className="w-full h-48 object-cover bg-black"
                          src={trend.videoUrl}
                          preload="metadata"
                          muted
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            className="rounded-full bg-white/20 backdrop-blur-sm"
                            onClick={() => window.open(trend.videoUrl, '_blank')}
                            aria-label="Assistir vídeo"
                          >
                            <Play className="h-6 w-6 text-white" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(trend.duration)}
                        </div>
                        <Badge className="absolute top-2 left-2" variant={STATUS_BADGE[trend.status].variant}>
                          {STATUS_BADGE[trend.status].label}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {trend.title}
                        </h3>
                        {trend.moderationReason && (
                          <p className="text-xs text-red-600 mb-2">Moderação: {trend.moderationReason}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatViews(trend.views)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {formatViews(trend.likes)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {trend.comments}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {(trend.publishedAt ?? trend.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shareTrend(trend.videoUrl)} aria-label="Copiar link">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleDeleteTrend(trend.id, trend.title)}
                              disabled={deleteTrendMutation.isPending}
                              aria-label="Excluir trend"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance dos Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Views Totais</span>
                        <span className="font-semibold">{formatViews(trendStats?.totalViews || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taxa de Engajamento</span>
                        <span className="font-semibold">{trendStats?.engagementRate || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Conversão em Vendas</span>
                        <span className="font-semibold">{trendStats?.conversionRate || 0}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Receita Gerada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600 mb-2">
                        {formatCurrency(trendStats?.revenueGenerated || 0)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Vendas atribuídas aos trends
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        A atribuição de vendas aos vídeos ainda não está disponível.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Trends em Alta na Plataforma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    O ranking de trends da plataforma ainda não está disponível.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Upload Modal */}
          <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Criar Novo Trend
                </DialogTitle>
                <DialogDescription>
                  Publique um vídeo para promover seus produtos e alcançar mais clientes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Video Upload */}
                <div>
                  <Label>Vídeo *</Label>
                  {!selectedVideo ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Arraste um vídeo aqui ou clique para selecionar
                      </p>
                      <p className="text-sm text-gray-500">
                        MP4, WEBM ou MOV (máx. 100MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_VIDEO_TYPES.join(',')}
                        onChange={handleVideoSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        src={videoPreview}
                        className="w-full h-64 object-cover rounded-lg"
                        controls
                        onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          if (videoPreview) URL.revokeObjectURL(videoPreview);
                          setSelectedVideo(null);
                          setVideoPreview('');
                          setVideoDuration(0);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={trendData.title}
                    onChange={(e) => setTrendData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Dê um título chamativo para seu trend..."
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {trendData.title.length}/100 caracteres
                  </p>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={trendData.description}
                    onChange={(e) => setTrendData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva seu trend e inclua hashtags relevantes..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {trendData.description.length}/500 caracteres
                  </p>
                </div>

                {/* Category */}
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={trendData.category}
                    onValueChange={(value) => setTrendData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Products */}
                <div>
                  <Label>Produtos em Destaque</Label>
                  <Select
                    value={trendData.productIds[0] || ''}
                    onValueChange={(value) => setTrendData(prev => ({ ...prev, productIds: value ? [value] : [] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            {product.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={trendData.tags}
                    onChange={(e) => setTrendData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="#trend #produto #loja (separadas por espaço)"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={uploadTrendMutation.isPending || !selectedVideo || !trendData.title}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {uploadTrendMutation.isPending ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-pulse" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Publicar Trend
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppShell>
    </RoleGuard>
  );
}