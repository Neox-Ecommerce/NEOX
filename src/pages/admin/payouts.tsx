import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, PageHeader, QueryState } from '@/components/PageStates';
import { FeedbackService } from '@/services/FeedbackService';
import { AdminService, type AdminPayout, type PayoutStatus } from '@/services/AdminService';
import { formatCurrency } from '@/lib/utils';
import { Pill, ReasonDialog } from './shared';
import { PAYOUT_STATUS, formatDate } from './labels';

type Target = Exclude<PayoutStatus, 'pending'>;

// Espelha PAYOUT_TRANSITIONS em Neox-APIs/app/admin/router.py
const NEXT: Record<PayoutStatus, Target[]> = {
  pending: ['processing', 'completed', 'failed'],
  processing: ['completed', 'failed'],
  completed: [],
  failed: [],
};

const ACTION: Record<Target, { label: string; title: string; description: string }> = {
  processing: { label: 'Em processamento', title: 'Marcar como em processamento', description: 'Use quando a transferência já foi iniciada no banco.' },
  completed: { label: 'Marcar como pago', title: 'Confirmar pagamento', description: 'Confirme apenas depois que a transferência foi concluída. O lojista verá o repasse como pago.' },
  failed: { label: 'Falhou', title: 'Registrar falha', description: 'O valor volta para o saldo disponível do lojista. Explique o motivo para ele corrigir os dados.' },
};

const TABS = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'processing', label: 'Em processamento' },
  { value: 'completed', label: 'Pagos' },
  { value: 'failed', label: 'Falharam' },
  { value: 'todos', label: 'Todos' },
];

const bankLine = (b: AdminPayout['bankAccount']) =>
  [b.bank, b.agency && `ag. ${b.agency}`, b.account && `cc ${b.account}`].filter(Boolean).join(' · ') || '—';

export function AdminPayoutsPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('status') ?? 'pending';
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-payouts'], queryFn: () => AdminService.getPayouts() });
  const [action, setAction] = useState<{ payout: AdminPayout; status: Target } | null>(null);

  const mutation = useMutation({
    mutationFn: AdminService.updatePayout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payouts'] });
      qc.invalidateQueries({ queryKey: ['admin-overview'] });
      FeedbackService.success('Repasse atualizado');
      setAction(null);
    },
    onError: (e: Error) => FeedbackService.error(e.message),
  });

  const buttons = (p: AdminPayout) => NEXT[p.status].map((s) => (
    <Button key={s} size="sm" variant={s === 'completed' ? 'default' : s === 'failed' ? 'ghost' : 'outline'}
      className={s === 'failed' ? 'text-destructive' : undefined} onClick={() => setAction({ payout: p, status: s })}>
      {ACTION[s].label}
    </Button>
  ));

  return (
    <div>
      <PageHeader
        title="Repasses"
        description="Pedidos de saque dos lojistas. Faça a transferência no banco e registre o resultado aqui."
      />
      <Tabs value={tab} onValueChange={(v) => setParams({ status: v }, { replace: true })} className="mb-4">
        <TabsList className="h-auto flex-wrap justify-start">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="min-h-10">
              {t.label}
              <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                {query.data?.filter((p) => t.value === 'todos' || p.status === t.value).length ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <QueryState query={query}>
        {(payouts) => {
          const rows = payouts.filter((p) => tab === 'todos' || p.status === tab);
          if (rows.length === 0) {
            return <EmptyState icon={Wallet} title="Nenhum repasse aqui" description={tab === 'pending' ? 'Nenhum pedido de saque aguardando.' : undefined} />;
          }
          const total = rows.reduce((sum, p) => sum + p.amount, 0);
          return (
            <>
              <p className="mb-3 text-sm text-muted-foreground">{rows.length} repasse(s) · {formatCurrency(total)}</p>
              <ul className="space-y-3 md:hidden">
                {rows.map((p) => (
                  <li key={p.id} className="rounded-lg border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/admin/lojas/${p.storeId}`} className="font-medium hover:text-admin hover:underline">{p.storeName}</Link>
                        <p className="text-lg font-semibold">{formatCurrency(p.amount)}</p>
                      </div>
                      <Pill map={PAYOUT_STATUS} value={p.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{bankLine(p.bankAccount)}</p>
                    {p.bankAccount.holderName && <p className="text-sm text-muted-foreground">Titular: {p.bankAccount.holderName}</p>}
                    <p className="text-xs text-muted-foreground">Pedido em {formatDate(p.createdAt, true)}{p.processedDate && ` · concluído em ${formatDate(p.processedDate, true)}`}</p>
                    {p.note && <p className="mt-1 text-sm">Obs.: {p.note}</p>}
                    {NEXT[p.status].length > 0 && <div className="mt-3 flex flex-wrap gap-2">{buttons(p)}</div>}
                  </li>
                ))}
              </ul>
              <Card className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loja</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Conta de destino</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Datas</TableHead>
                      <TableHead><span className="sr-only">Ações</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link to={`/admin/lojas/${p.storeId}`} className="font-medium hover:text-admin hover:underline">{p.storeName}</Link>
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-semibold">{formatCurrency(p.amount)}</TableCell>
                        <TableCell className="text-sm">
                          {bankLine(p.bankAccount)}
                          {p.bankAccount.holderName && <p className="text-xs text-muted-foreground">{p.bankAccount.holderName}</p>}
                        </TableCell>
                        <TableCell>
                          <Pill map={PAYOUT_STATUS} value={p.status} />
                          {p.note && <p className="mt-1 max-w-48 text-xs text-muted-foreground">{p.note}</p>}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          Pedido {formatDate(p.createdAt)}
                          {p.processedDate && <><br />Concluído {formatDate(p.processedDate)}</>}
                        </TableCell>
                        <TableCell><div className="flex flex-wrap justify-end gap-2">{buttons(p)}</div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          );
        }}
      </QueryState>

      <ReasonDialog
        open={!!action}
        onOpenChange={(o) => !o && setAction(null)}
        title={action ? ACTION[action.status].title : ''}
        description={action ? `${action.payout.storeName} · ${formatCurrency(action.payout.amount)}. ${ACTION[action.status].description}` : undefined}
        fieldLabel={action?.status === 'failed' ? 'Motivo da falha' : 'Observação'}
        required={action?.status === 'failed'}
        confirmLabel="Confirmar"
        destructive={action?.status === 'failed'}
        pending={mutation.isPending}
        onConfirm={(note) => action && mutation.mutate({ payoutId: action.payout.id, status: action.status, note: note || undefined })}
      />
    </div>
  );
}
