import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Video, 
  Search, 
  Filter, 
  Flag, 
  Eye, 
  Ban, 
  Play, 
  Calendar, 
  User, 
  AlertTriangle, 
  MoreHorizontal, 
  ExternalLink,
  Clock,
  Store,
  Mail,
  Shield,
  ShoppingBag,
  LogOut,
  ChevronDown,
  X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleGuard } from '@/components/RoleGuard';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  storeId: string;
  storeName: string;
  status: 'PUBLICADO' | 'REMOVIDO';
  views: number;
  likes: number;
  reports: number;
  createdAt: Date;
  duration: number;
}

export function AdminVideosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [actionType, setActionType] = useState<'remove' | 'notify' | null>(null);
  const [videoDetailsOpen, setVideoDetailsOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [userSwitcherOpen, setUserSwitcherOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Mock data para vídeos
  const videos: Video[] = [
    {
      id: 'v1',
      title: 'Unboxing iPhone 15 Pro Max - Vale a pena?',
      description: 'Confira o unboxing completo do novo iPhone 15 Pro Max e descubra se vale a pena o investimento!',
      thumbnailUrl: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl: 'https://example.com/video1.mp4',
      storeId: '1',
      storeName: 'TechStore Premium',
      status: 'PUBLICADO',
      views: 12500,
      likes: 890,
      reports: 0,
      createdAt: new Date('2024-01-20'),
      duration: 45
    },
    {
      id: 'v2',
      title: 'MacBook Pro M3 vs M2 - Comparativo Completo',
      description: 'Comparação detalhada entre o novo MacBook Pro M3 e o M2. Qual oferece melhor custo-benefício?',
      thumbnailUrl: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl: 'https://example.com/video2.mp4',
      storeId: '1',
      storeName: 'TechStore Premium',
      status: 'PUBLICADO',
      views: 8750,
      likes: 654,
      reports: 2,
      createdAt: new Date('2024-01-18'),
      duration: 38
    },
    {
      id: 'v3',
      title: 'Tênis Nike Falsificado - Comparativo com Original',
      description: 'Mostrando as diferenças entre um tênis Nike original e uma réplica. Cuidado com as falsificações!',
      thumbnailUrl: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl: 'https://example.com/video3.mp4',
      storeId: '4',
      storeName: 'Esporte Total',
      status: 'REMOVIDO',
      views: 5420,
      likes: 412,
      reports: 25,
      createdAt: new Date('2024-01-05'),
      duration: 28
    },
    {
      id: 'v4',
      title: 'Novos Produtos da Moda & Estilo - Coleção Verão',
      description: 'Apresentando a nova coleção de verão da Moda & Estilo. Roupas leves e estilosas para o calor!',
      thumbnailUrl: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl: 'https://example.com/video4.mp4',
      storeId: '2',
      storeName: 'Moda & Estilo',
      status: 'PUBLICADO',
      views: 3200,
      likes: 245,
      reports: 0,
      createdAt: new Date('2024-01-22'),
      duration: 32
    },
    {
      id: 'v5',
      title: 'Dicas de Decoração para Apartamentos Pequenos',
      description: 'Aprenda como otimizar espaços pequenos com dicas de decoração práticas e econômicas.',
      thumbnailUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl: 'https://example.com/video5.mp4',
      storeId: '3',
      storeName: 'Casa & Decoração',
      status: 'PUBLICADO',
      views: 4800,
      likes: 320,
      reports: 1,
      createdAt: new Date('2024-01-21'),
      duration: 40
    }
  ];

  const updateVideoMutation = useMutation({
    mutationFn: async ({ videoId, action, reason }: { videoId: string; action: string; reason: string }) => {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { videoId, action, reason };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      FeedbackService.success(`Ação realizada com sucesso!`);
      setSelectedVideo(null);
      setActionType(null);
      setActionModalOpen(false);
      setActionReason('');
    },
    onError: () => {
      FeedbackService.error('Erro ao processar ação');
    }
  });

  const handleVideoAction = (video: Video, action: 'remove' | 'notify') => {
    setSelectedVideo(video);
    setActionType(action);
    setActionModalOpen(true);
  };

  const confirmAction = () => {
    if (!selectedVideo || !actionType || !actionReason) {
      FeedbackService.error('Informe o motivo da ação');
      return;
    }

    updateVideoMutation.mutate({
      videoId: selectedVideo.id,
      action: actionType,
      reason: actionReason
    });
  };

  const handleViewVideo = (video: Video) => {
    setSelectedVideo(video);
    setVideoDetailsOpen(true);
  };

  const getVideoStatusBadge = (status: string) => {
    const variants = {
      'PUBLICADO': { variant: 'success' as const, label: 'Publicado' },
      'REMOVIDO': { variant: 'destructive' as const, label: 'Removido' }
    };

    const config = variants[status as keyof typeof variants] || variants.PUBLICADO;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'PUBLICADO' && video.status === 'PUBLICADO') ||
      (statusFilter === 'REMOVIDO' && video.status === 'REMOVIDO') ||
      (statusFilter === 'reported' && video.reports > 0);
    
    return matchesSearch && matchesStatus;
  });

  const getActionText = () => {
    switch (actionType) {
      case 'remove': return 'remover';
      case 'notify': return 'notificar';
      default: return '';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleSwitchUser = (role: string) => {
    setUserSwitcherOpen(false);
    
    if (role === 'admin') {
      // Already in admin
      return;
    } else if (role === 'empreendedor') {
      navigate('/painel/dashboard');
    } else if (role === 'cliente') {
      navigate('/cliente');
    } else {
      navigate('/auth');
    }
  };

  return (
    <RoleGuard requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link to="/admin/lojas" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">NEOX Admin</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Tabs defaultValue="videos" className="w-[400px]">
                  <TabsList>
                    <TabsTrigger value="stores" asChild>
                      <Link to="/admin/lojas" className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        <span>Lojas</span>
                      </Link>
                    </TabsTrigger>
                    <TabsTrigger value="videos" asChild>
                      <Link to="/admin/videos" className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span>Vídeos</span>
                      </Link>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <DropdownMenu open={userSwitcherOpen} onOpenChange={setUserSwitcherOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">Administrador</span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="flex items-center gap-2" onSelect={() => handleSwitchUser('admin')}>
                      <Shield className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Administrador</span>
                        <span className="text-xs text-muted-foreground">Gerenciar plataforma</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2" onSelect={() => handleSwitchUser('empreendedor')}>
                      <Store className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Empreendedor</span>
                        <span className="text-xs text-muted-foreground">Gerenciar loja</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2" onSelect={() => handleSwitchUser('cliente')}>
                      <ShoppingBag className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Cliente</span>
                        <span className="text-xs text-muted-foreground">Comprar produtos</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 text-red-600" onSelect={() => setLogoutConfirmOpen(true)}>
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Supervisão de Vídeos</h1>
            <p className="text-gray-600 mt-1">
              Supervisione os vídeos publicados na plataforma e atue em caso de denúncias
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Vídeos</p>
                    <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
                  </div>
                  <Video className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Publicados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {videos.filter(v => v.status === 'PUBLICADO').length}
                    </p>
                  </div>
                  <Play className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Denúncias</p>
                    <p className="text-2xl font-bold text-red-600">
                      {videos.reduce((sum, v) => sum + v.reports, 0)}
                    </p>
                  </div>
                  <Flag className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Visualizações</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatViews(videos.reduce((sum, v) => sum + v.views, 0))}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar vídeos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vídeos</SelectItem>
                <SelectItem value="PUBLICADO">Publicados</SelectItem>
                <SelectItem value="REMOVIDO">Removidos</SelectItem>
                <SelectItem value="reported">Com denúncias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className={video.status === 'REMOVIDO' ? 'opacity-60' : ''}>
                <div className="relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                  {video.reports > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Flag className="h-3 w-3" />
                      {video.reports}
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    {getVideoStatusBadge(video.status)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{video.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{video.storeName}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {formatViews(video.views)}
                    </div>
                    <div>
                      {new Date(video.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewVideo(video)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                    
                    {video.status === 'PUBLICADO' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {video.reports > 0 && (
                            <DropdownMenuItem onClick={() => handleVideoAction(video, 'remove')}>
                              <Ban className="h-4 w-4 mr-2 text-red-600" />
                              Remover Vídeo
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleVideoAction(video, 'notify')}>
                            <Mail className="h-4 w-4 mr-2" />
                            Notificar Loja
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(video.videoUrl, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Assistir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Video Details Modal */}
          <Dialog open={videoDetailsOpen} onOpenChange={setVideoDetailsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedVideo && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      {selectedVideo.title}
                    </DialogTitle>
                    <DialogDescription>
                      Detalhes completos do vídeo
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Video Preview */}
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      <img 
                        src={selectedVideo.thumbnailUrl} 
                        alt={selectedVideo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button 
                          size="icon" 
                          className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 h-16 w-16"
                          onClick={() => window.open(selectedVideo.videoUrl, '_blank')}
                        >
                          <Play className="h-8 w-8 text-white" />
                        </Button>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Informações do Vídeo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Título</p>
                            <p className="font-medium">{selectedVideo.title}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Descrição</p>
                            <p className="text-sm">{selectedVideo.description}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <div className="mt-1">{getVideoStatusBadge(selectedVideo.status)}</div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Data de Publicação</p>
                            <p className="font-medium">{selectedVideo.createdAt.toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Duração</p>
                            <p className="font-medium">{formatDuration(selectedVideo.duration)}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Estatísticas e Loja</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Loja</p>
                            <p className="font-medium">{selectedVideo.storeName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Visualizações</p>
                            <p className="font-medium">{formatViews(selectedVideo.views)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Curtidas</p>
                            <p className="font-medium">{formatViews(selectedVideo.likes)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Denúncias</p>
                            <p className="font-medium text-red-600">{selectedVideo.reports}</p>
                          </div>
                          <div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/admin/lojas?storeId=${selectedVideo.storeId}`)}
                            >
                              <Store className="h-4 w-4 mr-2" />
                              Ver Loja
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Reports Section */}
                    {selectedVideo.reports > 0 && (
                      <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2 text-red-800">
                            <Flag className="h-5 w-5" />
                            Denúncias ({selectedVideo.reports})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="p-4 border border-red-200 rounded-lg bg-white">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                  <p className="font-medium">Conteúdo inadequado ou ilegal</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Este vídeo parece mostrar produtos falsificados e incentiva a compra de itens ilegais.
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date('2024-01-10').toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <User className="h-4 w-4" />
                                      Usuário anônimo
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {selectedVideo.reports > 1 && (
                              <div className="p-4 border border-red-200 rounded-lg bg-white">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Violação de direitos autorais</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      O vídeo utiliza material protegido por direitos autorais sem permissão.
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date('2024-01-12').toLocaleDateString('pt-BR')}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        Nike Brasil
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setVideoDetailsOpen(false)}>
                        Fechar
                      </Button>
                      {selectedVideo.status === 'PUBLICADO' && (
                        <>
                          {selectedVideo.reports > 0 && (
                            <Button 
                              variant="destructive"
                              onClick={() => {
                                setVideoDetailsOpen(false);
                                handleVideoAction(selectedVideo, 'remove');
                              }}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Remover Vídeo
                            </Button>
                          )}
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setVideoDetailsOpen(false);
                              handleVideoAction(selectedVideo, 'notify');
                            }}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Notificar Loja
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Action Confirmation Modal */}
          <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Ação</DialogTitle>
                <DialogDescription>
                  {selectedVideo && (
                    <>
                      {actionType === 'remove' ? (
                        <>Tem certeza que deseja remover o vídeo "{selectedVideo.title}"?</>
                      ) : (
                        <>Enviar notificação para a loja "{selectedVideo.storeName}" sobre o vídeo "{selectedVideo.title}"</>
                      )}
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo (obrigatório)</Label>
                  <Textarea
                    id="reason"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder={`Informe o motivo para ${getActionText()} o vídeo...`}
                    rows={3}
                  />
                </div>

                {actionType === 'remove' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Atenção: Remoção de conteúdo
                        </p>
                        <ul className="text-sm text-red-700 mt-1 space-y-1 list-disc list-inside">
                          <li>O vídeo será removido permanentemente da plataforma</li>
                          <li>A loja será notificada sobre a remoção e o motivo</li>
                          <li>Múltiplas violações podem resultar em suspensão da loja</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {actionType === 'notify' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Informações sobre notificações
                        </p>
                        <ul className="text-sm text-yellow-700 mt-1 space-y-1 list-disc list-inside">
                          <li>A loja receberá um email com o motivo da notificação</li>
                          <li>O vídeo permanecerá publicado</li>
                          <li>A loja terá 48 horas para resolver o problema</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setActionModalOpen(false);
                  setActionReason('');
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmAction}
                  disabled={!actionReason}
                  variant={actionType === 'notify' ? 'default' : 'destructive'}
                >
                  {updateVideoMutation.isPending
                    ? 'Processando...' 
                    : actionType === 'remove' ? 'Remover Vídeo' : 'Enviar Notificação'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Logout Confirmation Dialog */}
          <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Logout</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja sair do painel administrativo?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Confirmar Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </RoleGuard>
  );
}