import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, FileText, Upload } from 'lucide-react';
import { DocumentUploadModal } from '@/components/DocumentUploadModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, QueryState } from '@/components/PageStates';
import { StatusBadge } from '@/components/StatusBadge';
import { StoreService, type Store, type StoreDocument } from '@/services/StoreService';
import { FeedbackService } from '@/services/FeedbackService';
import { cn } from '@/lib/utils';

const DOC_STATUS: Record<StoreDocument['status'], { label: string; className: string }> = {
  VERIFICADO: { label: 'Verificado', className: 'bg-success-muted text-success border-success/20' },
  PENDENTE: { label: 'Em análise', className: 'bg-warning-muted text-warning border-warning/20' },
  REJEITADO: { label: 'Rejeitado', className: 'bg-destructive-muted text-destructive border-destructive/20' },
};

export function DocumentosTab({ store }: { store: Store }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const docsQuery = useQuery({ queryKey: ['store-documents'], queryFn: StoreService.getDocuments });
  const { data: warnings = [] } = useQuery({ queryKey: ['store-warnings'], queryFn: StoreService.getWarnings });
  const openWarnings = warnings.filter((w) => !w.resolvido);

  const upload = useMutation({
    mutationFn: ({ file, description }: { file: File; description: string }) => StoreService.uploadDocument(file, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-documents'] });
      FeedbackService.success('Documento enviado. A equipe NEOX vai analisar.');
    },
    onError: (e: Error) => FeedbackService.error(e.message || 'Não foi possível enviar o documento.'),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verificação da loja</CardTitle>
          <CardDescription>A loja só aparece para os clientes depois de aprovada.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge kind="store" value={store.status} />
            <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium',
              store.cnpjVerificado ? 'border-success/20 bg-success-muted text-success' : 'border-warning/20 bg-warning-muted text-warning')}>
              {store.cnpjVerificado ? 'CNPJ verificado' : 'CNPJ não verificado'}
            </span>
          </div>
          {store.statusReason && store.status !== 'APROVADA' && (
            <p className="text-sm text-destructive">Motivo: {store.statusReason}</p>
          )}
        </CardContent>
      </Card>

      {openWarnings.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-warning">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" /> Avisos da equipe NEOX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {openWarnings.map((w) => (
                <li key={w.id}><span className="text-muted-foreground">{w.createdAt.toLocaleDateString('pt-BR')}:</span> {w.motivo}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-lg">Documentos enviados</CardTitle>
            <CardDescription>Cartão CNPJ, contrato social ou outro comprovante da empresa.</CardDescription>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" /> Enviar documento
          </Button>
        </CardHeader>
        <CardContent>
          <QueryState
            query={docsQuery}
            isEmpty={(d) => d.length === 0}
            empty={<EmptyState icon={FileText} title="Nenhum documento enviado" description="Envie um comprovante para a equipe NEOX aprovar sua loja." />}
          >
            {(docs) => (
              <ul className="divide-y">
                {docs.map((doc) => (
                  <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <a href={doc.url} target="_blank" rel="noreferrer" className="min-w-0 truncate font-medium text-primary hover:underline">
                      {doc.tipo}{doc.description ? ` — ${doc.description}` : ''}
                    </a>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{doc.createdAt.toLocaleDateString('pt-BR')}</span>
                      <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium', DOC_STATUS[doc.status].className)}>
                        {DOC_STATUS[doc.status].label}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </CardContent>
      </Card>

      <DocumentUploadModal open={open} onOpenChange={setOpen} onSubmit={async (file, description) => { await upload.mutateAsync({ file, description }); }} />
    </div>
  );
}
