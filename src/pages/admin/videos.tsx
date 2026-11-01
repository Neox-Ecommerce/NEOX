import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Video,
  Search,
  Filter,
  Flag,
  Eye,
  Ban,
  Play,
  AlertTriangle,
  MoreHorizontal,
  ExternalLink,
  Store,
  Mail,
  Shield,
  ShoppingBag,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleGuard } from '@/components/RoleGuard';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { AdminService, AdminVideo } from '@/services/AdminService';

export function AdminVideosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<AdminVideo | null>(null);
  const [actionType, setActionType] = useState<'remove' | 'notify' | null>(null);
  const [videoDetailsOpen, setVideoDetailsOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [userSwitcherOpen, setUserSwitcherOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: videosData, isLoading, isError } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: () => AdminService.getVideos(),
  });
  const videos = videosData ?? [];

  const updateVideoMutation = useMutation({
    mutationFn: ({ videoId, action, reason }: { videoId: string; action: 'remove' | 'notify'; reason: string }): Promise<unknown> =>
      action === 'remove'
        ? AdminService.removeVideo({ videoId, reason })
        : AdminService.notifyVideoStore({ videoId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      FeedbackService.success(`Ação realizada com sucesso!`);
      setSelectedVideo(null);
      setActionType(null);
      setActionModalOpen(false);
      setActionReason('');
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao processar ação');
    }
  });

  const handleVideoAction = (video: AdminVideo, action: 'remove' | 'notify') => {
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

  const handleViewVideo = (video: AdminVideo) => {
    setSelectedVideo(video);
    setVideoDetailsOpen(true);
  };

  const getVideoStatusBadge = (status: string) => {
    const variants = {
      'published': { variant: 'success' as const, label: 'Publicado' },
      'processing': { variant: 'warning' as const, label: 'Processando' },
      'rejected': { variant: 'destructive' as const, label: 'Rejeitado' },
      'removed': { variant: 'destructive' as const, label: 'Removido' }
    };

    const config = variants[status as keyof typeof variants] || variants.published;

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
      (statusFilter === 'published' && video.status === 'published') ||
      (statusFilter === 'removed' && video.status === 'removed') ||
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
                  <span className="text-xl font-bold text-gray-900">NeoxStore Admin</span>
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
                      {videos.filter(v => v.status === 'published').length}
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
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="removed">Removidos</SelectItem>
                <SelectItem value="reported">Com denúncias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Videos Grid */}
          {(isLoading || isError || filteredVideos.length === 0) && (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                {isLoading ? 'Carregando vídeos...' : isError ? 'Erro ao carregar vídeos' : 'Nenhum vídeo encontrado'}
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className={video.status === 'removed' ? 'opacity-60' : ''}>
                <div className="relative">
                  <video
                    src={video.videoUrl}
                    preload="metadata"
                    muted
                    className="w-full h-48 object-cover rounded-t-lg bg-black"
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

                    {video.status === 'published' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleVideoAction(video, 'remove')}>
                            <Ban className="h-4 w-4 mr-2 text-red-600" />
                            Remover Vídeo
                          </DropdownMenuItem>
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
                      <video
                        src={selectedVideo.videoUrl}
                        preload="metadata"
                        controls
                        className="w-full h-full object-contain"
                      />
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
                            {selectedVideo.moderationReason && (
                              <p className="text-sm text-gray-500 mt-1">Motivo: {selectedVideo.moderationReason}</p>
                            )}
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
                          <p className="text-sm text-red-700">
                            Este vídeo recebeu {selectedVideo.reports} denúncia(s) de usuários. Avalie o conteúdo e, se necessário, remova o vídeo ou notifique a loja.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setVideoDetailsOpen(false)}>
                        Fechar
                      </Button>
                      {selectedVideo.status === 'published' && (
                        <>
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
                          <li>O vídeo deixará de ser exibido na plataforma</li>
                          <li>Uma advertência com o motivo será registrada para a loja</li>
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
                          <li>A notificação fica registrada como advertência no cadastro da loja</li>
                          <li>O vídeo permanecerá publicado</li>
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
                  disabled={!actionReason.trim() || updateVideoMutation.isPending}
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