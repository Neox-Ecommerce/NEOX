import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, Check, DollarSign, ExternalLink, FileText, Mail, Package, Phone, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import { EmptyState, PageHeader, QueryState } from '@/components/PageStates';
import { StatusBadge } from '@/components/StatusBadge';
import { FeedbackService } from '@/services/FeedbackService';
import { AdminService, type DocumentStatus, type StoreStatus } from '@/services/AdminService';
import { Pill, ReasonDialog } from './shared';
import { DOCUMENT_STATUS, VIDEO_STATUS, formatDate } from './labels';

type Action = { status: StoreStatus; title: string; confirm: string; needsReason: boolean; destructive?: boolean };

const ACTIONS: Record<string, Action> = {
  approve: { status: 'APROVADA', title: 'Aprovar loja', confirm: 'Aprovar', needsReason: false },
  reactivate: { status: 'APROVADA', title: 'Reativar loja', confirm: 'Reativar', needsReason: false },
  reject: { status: 'REJEITADA', title: 'Rejeitar loja', confirm: 'Rejeitar', needsReason: true, destructive: true },
  suspend: { status: 'SUSPENSA', title: 'Suspender loja', confirm: 'Suspender', needsReason: true, destructive: true },
};

const AVAILABLE: Record<StoreStatus, (keyof typeof ACTIONS)[]> = {
  PENDENTE: ['approve', 'reject'],
  APROVADA: ['suspend'],
  SUSPENSA: ['reactivate'],
  REJEITADA: ['approve'],
};

export function AdminStoreDetailPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-store', id], queryFn: () => AdminService.getStore(id) });
  const [action, setAction] = useState<Action | null>(null);
  const [warnOpen, setWarnOpen] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-store', id] });
    qc.invalidateQueries({ queryKey: ['admin-stores'] });
    qc.invalidateQueries({ queryKey: ['admin-overview'] });
  };
  const onError = (e: Error) => FeedbackService.error(e.message);

  const statusMut = useMutation({
    mutationFn: AdminService.updateStoreStatus,
    onSuccess: () => { refresh(); setAction(null); FeedbackService.success('Status da loja atualizado'); },
    onError,
  });
  const warnMut = useMutation({
    mutationFn: AdminService.addWarning,
    onSuccess: () => { refresh(); setWarnOpen(false); FeedbackService.success('Advertência registrada'); },
    onError,
  });
  const docMut = useMutation({
    mutationFn: AdminService.updateDocumentStatus,
    onSuccess: () => { refresh(); FeedbackService.success('Documento atualizado'); },
    onError,
  });
  const setDoc = (documentId: string, status: DocumentStatus) => docMut.mutate({ documentId, status });

  return (
    <div>
      <QueryState query={query}>
        {(s) => (
          <>
            <PageHeader
              breadcrumbs={[{ label: 'Lojas', to: '/admin/lojas' }, { label: s.nomeFantasia }]}
              title={s.nomeFantasia}
              description={`${s.razaoSocial} · ${s.segmento}`}
              actions={
                <>
                  <StatusBadge kind="store" value={s.status} />
                  {AVAILABLE[s.status].map((key) => {
                    const a = ACTIONS[key];
                    return (
                      <Button key={key} variant={a.destructive ? 'outline' : 'default'} onClick={() => setAction(a)}
                        className={a.destructive ? 'text-destructive' : undefined}>
                        {a.confirm}
                      </Button>
                    );
                  })}
                </>
              }
            />

            {s.statusReason && (
              <p role="note" className="mb-6 flex items-start gap-2 rounded-md border border-warning/30 bg-warning-muted p-3 text-sm text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span><strong>Motivo do status:</strong> {s.statusReason}</span>
              </p>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricCard title="Produtos" value={s.productsCount} icon={Package} />
              <MetricCard title="Pedidos" value={s.ordersCount} icon={ShoppingCart} />
              <MetricCard title="Faturamento pago" value={s.revenuePaid} format="currency" icon={DollarSign} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-lg">Dados da loja</CardTitle></CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">CNPJ</dt>
                    <dd>{s.cnpj} {s.cnpjVerificado ? <span className="text-success">(verificado)</span> : <span className="text-warning">(não verificado)</span>}</dd>
                    <dt className="text-muted-foreground">Telefone</dt><dd>{s.telefone || '—'}</dd>
                    <dt className="text-muted-foreground">Endereço</dt><dd>{s.endereco || '—'}</dd>
                    <dt className="text-muted-foreground">Cadastro</dt><dd>{formatDate(s.createdAt)}</dd>
                  </dl>
                  <h3 className="mb-2 mt-6 text-sm font-medium">Responsável</h3>
                  <p className="text-sm">
                    {s.owner}{' '}
                    {!s.ownerActive && <span className="text-destructive">(conta bloqueada)</span>}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={`mailto:${s.email}`}><Mail className="mr-2 h-4 w-4" aria-hidden="true" />{s.email}</a>
                    </Button>
                    {s.telefone && (
                      <Button asChild variant="outline" size="sm">
                        <a href={`tel:${s.telefone}`}><Phone className="mr-2 h-4 w-4" aria-hidden="true" />Ligar</a>
                      </Button>
                    )}
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/admin/usuarios?q=${encodeURIComponent(s.email)}`}>Ver conta do usuário</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Documentos</CardTitle></CardHeader>
                <CardContent>
                  {s.documentos.length === 0 ? (
                    <EmptyState icon={FileText} title="Nenhum documento enviado" className="py-6" />
                  ) : (
                    <ul className="divide-y">
                      {s.documentos.map((d) => (
                        <li key={d.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium hover:text-admin hover:underline">
                              {d.tipo} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                              <span className="sr-only">(abre em nova aba)</span>
                            </a>
                            <p className="text-xs text-muted-foreground">{d.description ? `${d.description} · ` : ''}enviado em {formatDate(d.dataEnvio)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Pill map={DOCUMENT_STATUS} value={d.status} />
                            {d.status !== 'VERIFICADO' && (
                              <Button size="sm" variant="outline" disabled={docMut.isPending} onClick={() => setDoc(d.id, 'VERIFICADO')}>
                                <Check className="mr-1 h-4 w-4" aria-hidden="true" />Verificar
                              </Button>
                            )}
                            {d.status !== 'REJEITADO' && (
                              <Button size="sm" variant="ghost" className="text-destructive" disabled={docMut.isPending} onClick={() => setDoc(d.id, 'REJEITADO')}>
                                <X className="mr-1 h-4 w-4" aria-hidden="true" />Rejeitar
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">Advertências</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setWarnOpen(true)}>Adicionar</Button>
                </CardHeader>
                <CardContent>
                  {s.advertencias.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma advertência.</p>
                  ) : (
                    <ul className="space-y-3">
                      {s.advertencias.map((w) => (
                        <li key={w.id} className="rounded-md border p-3 text-sm">
                          <p>{w.motivo}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(w.data, true)} · {w.resolvido ? 'Resolvida' : 'Em aberto'}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">Vídeos ({s.videos.length})</CardTitle>
                  <Button asChild size="sm" variant="ghost"><Link to="/admin/videos">Moderar vídeos</Link></Button>
                </CardHeader>
                <CardContent>
                  {s.videos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Esta loja ainda não publicou vídeos.</p>
                  ) : (
                    <ul className="divide-y">
                      {s.videos.map((v) => (
                        <li key={v.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{v.title}</span>
                            <span className="text-xs text-muted-foreground">{v.views} visualizações · {formatDate(v.createdAt)}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            {v.reports > 0 && <span className="text-xs font-medium text-destructive">{v.reports} denúncia(s)</span>}
                            <Pill map={VIDEO_STATUS} value={v.status} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <ReasonDialog
              open={!!action}
              onOpenChange={(o) => !o && setAction(null)}
              title={action?.title ?? ''}
              description={action?.needsReason
                ? 'O lojista verá este motivo no painel. Seja claro sobre o que precisa ser corrigido.'
                : `Confirma ${action?.confirm.toLowerCase()} "${s.nomeFantasia}"? A loja passa a vender na plataforma.`}
              fieldLabel={action?.needsReason ? 'Motivo' : undefined}
              required={action?.needsReason}
              confirmLabel={action?.confirm ?? ''}
              destructive={action?.destructive}
              pending={statusMut.isPending}
              onConfirm={(reason) => action && statusMut.mutate({ storeId: s.id, status: action.status, reason: reason || undefined })}
            />
            <ReasonDialog
              open={warnOpen}
              onOpenChange={setWarnOpen}
              title="Nova advertência"
              description="A advertência fica registrada no histórico da loja."
              fieldLabel="Motivo da advertência"
              required
              confirmLabel="Registrar"
              pending={warnMut.isPending}
              onConfirm={(motivo) => warnMut.mutate({ storeId: s.id, motivo })}
            />
          </>
        )}
      </QueryState>
    </div>
  );
}
