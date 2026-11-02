import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Search, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, PageHeader, QueryState } from '@/components/PageStates';
import { StatusBadge } from '@/components/StatusBadge';
import { AdminService, type AdminStore } from '@/services/AdminService';
import { formatDate } from './labels';

const TABS = [
  { value: 'PENDENTE', label: 'Em análise' },
  { value: 'todas', label: 'Todas' },
  { value: 'APROVADA', label: 'Aprovadas' },
  { value: 'SUSPENSA', label: 'Suspensas' },
  { value: 'REJEITADA', label: 'Rejeitadas' },
];

const matches = (s: AdminStore, term: string) =>
  [s.nomeFantasia, s.razaoSocial, s.cnpj, s.owner, s.email].some((v) => v.toLowerCase().includes(term));

export function AdminStoresPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('status') ?? 'PENDENTE'; // fila "Em análise" primeiro
  const q = params.get('q') ?? '';
  const query = useQuery({ queryKey: ['admin-stores'], queryFn: () => AdminService.getStores() });

  const counts = useMemo(() => {
    const c: Record<string, number> = { todas: query.data?.length ?? 0 };
    query.data?.forEach((s) => { c[s.status] = (c[s.status] ?? 0) + 1; });
    return c;
  }, [query.data]);

  // Links antigos /admin/lojas?storeId=… agora vão para a página de detalhe
  const legacyId = params.get('storeId');
  if (legacyId) return <Navigate to={`/admin/lojas/${legacyId}`} replace />;

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <div>
      <PageHeader title="Lojas" description="Aprove novas lojas, acompanhe documentos e modere quem vende na plataforma." />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={(v) => setParam('status', v)}>
          <TabsList className="h-auto flex-wrap justify-start">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="min-h-10">
                {t.label}
                <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{counts[t.value] ?? 0}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Buscar lojas"
            placeholder="Nome, CNPJ, dono ou e-mail"
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            className="h-11 rounded-full pl-9"
          />
        </div>
      </div>

      <QueryState query={query}>
        {(stores) => {
          const term = q.trim().toLowerCase();
          const rows = stores.filter((s) => (tab === 'todas' || s.status === tab) && (!term || matches(s, term)));
          if (rows.length === 0) {
            return (
              <EmptyState
                icon={Store}
                title={term ? 'Nenhuma loja encontrada' : tab === 'PENDENTE' ? 'Nenhuma loja em análise' : 'Nenhuma loja aqui'}
                description={term ? 'Tente outro termo de busca.' : tab === 'PENDENTE' ? 'A fila de aprovação está em dia.' : undefined}
                action={(term || tab !== 'todas') && (
                  <Button variant="outline" onClick={() => setParams({ status: 'todas' }, { replace: true })}>Ver todas as lojas</Button>
                )}
              />
            );
          }
          return (
            <>
              {/* Celular: cards */}
              <ul className="space-y-3 md:hidden">
                {rows.map((s) => (
                  <li key={s.id}>
                    <Link to={`/admin/lojas/${s.id}`} className="block rounded-lg border bg-card p-4 hover:border-admin/40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{s.nomeFantasia}</p>
                          <p className="truncate text-sm text-muted-foreground">{s.owner} · {s.email}</p>
                        </div>
                        <StatusBadge kind="store" value={s.status} />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        CNPJ {s.cnpj} · {s.segmento} · desde {formatDate(s.createdAt)}
                        {s.documentos.some((d) => d.status === 'PENDENTE') && ' · documentos pendentes'}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Desktop: tabela */}
              <Card className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loja</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Documentos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead><span className="sr-only">Abrir</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((s) => {
                      const pendingDocs = s.documentos.filter((d) => d.status === 'PENDENTE').length;
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Link to={`/admin/lojas/${s.id}`} className="font-medium hover:text-admin hover:underline">{s.nomeFantasia}</Link>
                            <p className="text-xs text-muted-foreground">{s.segmento}</p>
                          </TableCell>
                          <TableCell>
                            <p>{s.owner}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {s.cnpj}
                            {s.cnpjVerificado && <span className="ml-1 text-xs text-success">(verificado)</span>}
                          </TableCell>
                          <TableCell className="text-sm">
                            {s.documentos.length === 0 ? <span className="text-muted-foreground">Nenhum</span>
                              : pendingDocs > 0 ? <span className="text-warning">{pendingDocs} a verificar</span>
                              : `${s.documentos.length} enviado(s)`}
                          </TableCell>
                          <TableCell><StatusBadge kind="store" value={s.status} /></TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                          <TableCell>
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/admin/lojas/${s.id}`} aria-label={`Abrir ${s.nomeFantasia}`}>
                                {s.status === 'PENDENTE' ? 'Analisar' : 'Abrir'} <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </>
          );
        }}
      </QueryState>
    </div>
  );
}
