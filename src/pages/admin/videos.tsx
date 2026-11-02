import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Ban, Eye, Flag, Play, Search, Send, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState, PageHeader, QueryState } from '@/components/PageStates';
import { FeedbackService } from '@/services/FeedbackService';
import { AdminService, type AdminVideo } from '@/services/AdminService';
import { Pill, ReasonDialog } from './shared';
import { VIDEO_STATUS, formatDate } from './labels';

const FILTERS: { value: string; label: string; test: (v: AdminVideo) => boolean }[] = [
  { value: 'denunciados', label: 'Denunciados', test: (v) => v.reports > 0 && v.status !== 'removed' },
  { value: 'todos', label: 'Todos', test: () => true },
  { value: 'publicados', label: 'Publicados', test: (v) => v.status === 'published' },
  { value: 'removidos', label: 'Removidos', test: (v) => v.status === 'removed' },
];

const duration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const compact = (n: number) => new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(n);

export function AdminVideosPage() {
  const [params, setParams] = useSearchParams();
  const filter = params.get('filtro') ?? 'denunciados';
  const q = params.get('q') ?? '';
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-videos'], queryFn: () => AdminService.getVideos() });
  const [watching, setWatching] = useState<AdminVideo | null>(null);
  const [action, setAction] = useState<{ video: AdminVideo; type: 'remove' | 'notify' } | null>(null);

  const mutation = useMutation({
    mutationFn: ({ video, type, reason }: { video: AdminVideo; type: 'remove' | 'notify'; reason: string }): Promise<unknown> =>
      type === 'remove'
        ? AdminService.removeVideo({ videoId: video.id, reason })
        : AdminService.notifyVideoStore({ videoId: video.id, reason }),
    onSuccess: (_d, { type }) => {
      qc.invalidateQueries({ queryKey: ['admin-videos'] });
      qc.invalidateQueries({ queryKey: ['admin-overview'] });
      qc.invalidateQueries({ queryKey: ['admin-store'] });
      FeedbackService.success(type === 'remove' ? 'Vídeo removido e loja advertida' : 'Loja notificada');
      setAction(null);
      setWatching(null);
    },
    onError: (e: Error) => FeedbackService.error(e.message),
  });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const actions = (v: AdminVideo) => (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => setWatching(v)}>
        <Eye className="mr-1 h-4 w-4" aria-hidden="true" />Assistir
      </Button>
      <Button size="sm" variant="outline" onClick={() => setAction({ video: v, type: 'notify' })}>
        <Send className="mr-1 h-4 w-4" aria-hidden="true" />Notificar loja
      </Button>
      {v.status !== 'removed' && (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setAction({ video: v, type: 'remove' })}>
          <Ban className="mr-1 h-4 w-4" aria-hidden="true" />Remover
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="Vídeos" description="Revise vídeos denunciados e remova conteúdo que viole as regras." />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={filter} onValueChange={(v) => setParam('filtro', v)}>
          <TabsList className="h-auto flex-wrap justify-start">
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="min-h-10">
                {f.label}
                <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{query.data?.filter(f.test).length ?? 0}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" aria-label="Buscar vídeos" placeholder="Título, descrição ou loja" value={q}
            onChange={(e) => setParam('q', e.target.value)} className="h-11 rounded-full pl-9" />
        </div>
      </div>

      <QueryState query={query}>
        {(videos) => {
          const term = q.trim().toLowerCase();
          const test = (FILTERS.find((f) => f.value === filter) ?? FILTERS[1]).test;
          const rows = videos.filter((v) => test(v) && (!term || [v.title, v.description, v.storeName].some((t) => t.toLowerCase().includes(term))));
          if (rows.length === 0) {
            return (
              <EmptyState
                icon={filter === 'denunciados' ? Flag : Video}
                title={filter === 'denunciados' && !term ? 'Nenhum vídeo denunciado' : 'Nenhum vídeo encontrado'}
                description={filter === 'denunciados' && !term ? 'Nada para revisar agora.' : undefined}
                action={filter !== 'todos' && <Button variant="outline" onClick={() => setParams({ filtro: 'todos' }, { replace: true })}>Ver todos os vídeos</Button>}
              />
            );
          }
          return (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((v) => (
                <li key={v.id} className="flex flex-col overflow-hidden rounded-lg border bg-card">
                  <button type="button" onClick={() => setWatching(v)} className="group relative aspect-video bg-muted" aria-label={`Assistir ${v.title}`}>
                    {v.thumbnail
                      ? <img src={v.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                      : <Video className="absolute inset-0 m-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />}
                    <Play className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-background/80 p-2 text-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
                    <span className="absolute bottom-2 right-2 rounded bg-background/90 px-1.5 text-xs">{duration(v.duration)}</span>
                  </button>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 font-medium">{v.title}</p>
                      <Pill map={VIDEO_STATUS} value={v.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <Link to={`/admin/lojas/${v.storeId}`} className="hover:text-admin hover:underline">{v.storeName}</Link>
                      {' · '}{compact(v.views)} visualizações · {formatDate(v.createdAt)}
                    </p>
                    {v.reports > 0 && (
                      <p className="flex items-center gap-1 text-sm font-medium text-destructive">
                        <Flag className="h-4 w-4" aria-hidden="true" />{v.reports} denúncia(s)
                      </p>
                    )}
                    {v.moderationReason && <p className="text-xs text-muted-foreground">Motivo: {v.moderationReason}</p>}
                    <div className="mt-auto pt-2">{actions(v)}</div>
                  </div>
                </li>
              ))}
            </ul>
          );
        }}
      </QueryState>

      <Dialog open={!!watching} onOpenChange={(o) => !o && setWatching(null)}>
        <DialogContent className="max-w-2xl">
          {watching && (
            <>
              <DialogHeader>
                <DialogTitle>{watching.title}</DialogTitle>
                <DialogDescription>
                  {watching.storeName} · {watching.likes} curtidas · {watching.reports} denúncia(s)
                </DialogDescription>
              </DialogHeader>
              <video src={watching.videoUrl} controls className="max-h-[60vh] w-full rounded-md bg-muted" />
              {watching.description && <p className="text-sm text-muted-foreground">{watching.description}</p>}
              {actions(watching)}
            </>
          )}
        </DialogContent>
      </Dialog>

      <ReasonDialog
        open={!!action}
        onOpenChange={(o) => !o && setAction(null)}
        title={action?.type === 'remove' ? 'Remover vídeo' : 'Notificar loja'}
        description={action?.type === 'remove'
          ? `"${action.video.title}" sai do ar e a loja recebe uma advertência com este motivo.`
          : 'A mensagem fica registrada como advertência no histórico da loja.'}
        fieldLabel={action?.type === 'remove' ? 'Motivo da remoção' : 'Mensagem para a loja'}
        required
        confirmLabel={action?.type === 'remove' ? 'Remover vídeo' : 'Enviar'}
        destructive={action?.type === 'remove'}
        pending={mutation.isPending}
        onConfirm={(reason) => action && mutation.mutate({ ...action, reason })}
      />
    </div>
  );
}
