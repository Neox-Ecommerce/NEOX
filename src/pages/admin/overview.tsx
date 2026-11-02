import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, DollarSign, Flag, LifeBuoy, ShoppingCart, Store, UserPlus, Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import { PageHeader, QueryState } from '@/components/PageStates';
import { STORE_STATUS, StatusBadge } from '@/components/StatusBadge';
import { AdminService } from '@/services/AdminService';
import { formatCurrency } from '@/lib/utils';
import { USER_ROLE, formatDate } from './labels';

function PendingCard({ to, icon: Icon, label, count, detail }: { to: string; icon: LucideIcon; label: string; count: number; detail?: string }) {
  const hasWork = count > 0;
  return (
    <Link
      to={to}
      className="group flex min-h-11 items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-admin/40 hover:bg-admin-muted/40"
    >
      <div className={hasWork ? 'rounded-md bg-warning-muted p-2 text-warning' : 'rounded-md bg-muted p-2 text-muted-foreground'}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-semibold text-foreground">{count}</p>
        <p className="text-sm text-muted-foreground">
          {label}
          {detail && <span className="block text-xs">{detail}</span>}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-admin" aria-hidden="true" />
    </Link>
  );
}

const pctDelta = (now: number, before: number) => (before > 0 ? ((now - before) / before) * 100 : undefined);

export function AdminOverviewPage() {
  const query = useQuery({ queryKey: ['admin-overview'], queryFn: AdminService.getOverview });

  return (
    <div>
      <PageHeader title="Visão geral" description="O que precisa da sua atenção e a saúde da plataforma." />
      <QueryState query={query}>
        {(o) => {
          const totalUsers = Object.values(o.usersByRole).reduce((a, b) => a + (b ?? 0), 0);
          const totalStores = Object.values(o.storesByStatus).reduce((a, b) => a + (b ?? 0), 0);
          return (
            <div className="space-y-8">
              <section aria-labelledby="pendencias">
                <h2 id="pendencias" className="mb-3 text-lg font-semibold">Pendências</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <PendingCard to="/admin/lojas?status=PENDENTE" icon={Store} label="Lojas para aprovar" count={o.storesByStatus.PENDENTE ?? 0} />
                  <PendingCard to="/admin/videos?filtro=denunciados" icon={Flag} label="Vídeos denunciados" count={o.reportedVideosCount} />
                  <PendingCard to="/admin/suporte" icon={LifeBuoy} label="Chamados abertos" count={o.openTicketsCount} />
                  <PendingCard
                    to="/admin/repasses?status=pending"
                    icon={Wallet}
                    label="Repasses a processar"
                    count={o.pendingPayoutsCount}
                    detail={o.pendingPayoutsCount > 0 ? formatCurrency(o.pendingPayoutsAmount) : undefined}
                  />
                </div>
              </section>

              <section aria-labelledby="numeros">
                <h2 id="numeros" className="mb-3 text-lg font-semibold">Números do mês</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title="Vendas pagas (GMV)" value={o.thisMonth.gmv} format="currency" icon={DollarSign} delta={pctDelta(o.thisMonth.gmv, o.lastMonth.gmv)} />
                  <MetricCard title="Pedidos" value={o.thisMonth.orders} icon={ShoppingCart} delta={pctDelta(o.thisMonth.orders, o.lastMonth.orders)} />
                  <MetricCard title="Novos usuários" value={o.newUsersThisMonth} icon={UserPlus} />
                  <MetricCard title="Usuários no total" value={totalUsers} icon={Users} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Variação em relação ao mês passado ({formatCurrency(o.lastMonth.gmv)} em {o.lastMonth.orders} pedidos).
                </p>
              </section>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">Lojas por status</CardTitle>
                    <span className="text-sm text-muted-foreground">{totalStores} no total</span>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y">
                      {Object.keys(STORE_STATUS).map((s) => (
                        <li key={s}>
                          <Link to={`/admin/lojas?status=${s}`} className="flex min-h-11 items-center justify-between gap-2 py-2 hover:text-admin">
                            <StatusBadge kind="store" value={s} />
                            <span className="font-medium">{o.storesByStatus[s as keyof typeof o.storesByStatus] ?? 0}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <h3 className="mb-2 mt-6 text-sm font-medium">Usuários por papel</h3>
                    <ul className="flex flex-wrap gap-4 text-sm">
                      {Object.entries(USER_ROLE).map(([role, { label }]) => (
                        <li key={role}>
                          <Link to={`/admin/usuarios?role=${role}`} className="hover:text-admin hover:underline">
                            {label}: <span className="font-semibold">{o.usersByRole[role as keyof typeof o.usersByRole] ?? 0}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lojas aguardando aprovação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {o.pendingStores.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma loja na fila de análise.</p>
                    ) : (
                      <ul className="divide-y">
                        {o.pendingStores.map((s) => (
                          <li key={s.id}>
                            <Link to={`/admin/lojas/${s.id}`} className="flex min-h-11 items-center justify-between gap-2 py-2 hover:text-admin">
                              <span className="min-w-0">
                                <span className="block truncate font-medium">{s.nomeFantasia}</span>
                                <span className="block text-xs text-muted-foreground">{s.owner} · enviada em {formatDate(s.createdAt)}</span>
                              </span>
                              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {o.reportedVideos.length > 0 && (
                      <>
                        <h3 className="mb-2 mt-6 text-sm font-medium">Vídeos mais denunciados</h3>
                        <ul className="space-y-1 text-sm">
                          {o.reportedVideos.map((v) => (
                            <li key={v.id} className="flex justify-between gap-2">
                              <span className="truncate">{v.title} <span className="text-muted-foreground">· {v.storeName}</span></span>
                              <span className="shrink-0 font-medium text-destructive">{v.reports} denúncia(s)</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        }}
      </QueryState>
    </div>
  );
}
