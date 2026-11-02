import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, PageHeader, QueryState } from '@/components/PageStates';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackService } from '@/services/FeedbackService';
import { AdminService, type AdminUser, type UserRole } from '@/services/AdminService';
import { Pill, ReasonDialog } from './shared';
import { USER_ROLE, formatDate } from './labels';

const PAGE_SIZE = 20;
const ACTIVE = { active: { label: 'Ativo', tone: 'success' as const }, blocked: { label: 'Bloqueado', tone: 'danger' as const } };

export function AdminUsersPage() {
  const [params, setParams] = useSearchParams();
  const role = params.get('role') ?? 'todos';
  const status = params.get('status') ?? 'todos';
  const q = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('pagina')) || 1);
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [target, setTarget] = useState<AdminUser | null>(null);

  const query = useQuery({
    queryKey: ['admin-users', role, status, q, page],
    queryFn: () => AdminService.getUsers({
      role: role === 'todos' ? undefined : (role as UserRole),
      status: status === 'todos' ? undefined : (status as 'active' | 'blocked'),
      q, page, pageSize: PAGE_SIZE,
    }),
    placeholderData: keepPreviousData,
  });

  const mutation = useMutation({
    mutationFn: AdminService.setUserActive,
    onSuccess: (u) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      FeedbackService.success(u.isActive ? 'Usuário desbloqueado' : 'Usuário bloqueado');
      setTarget(null);
    },
    onError: (e: Error) => FeedbackService.error(e.message),
  });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'todos') next.set(key, value);
    else next.delete(key);
    if (key !== 'pagina') next.delete('pagina');
    setParams(next, { replace: true });
  };

  const toggle = (u: AdminUser) => (
    <Button size="sm" variant={u.isActive ? 'ghost' : 'outline'} className={u.isActive ? 'text-destructive' : undefined}
      disabled={u.id === me?.id} title={u.id === me?.id ? 'Você não pode bloquear a própria conta' : undefined}
      onClick={() => setTarget(u)}>
      {u.isActive ? 'Bloquear' : 'Desbloquear'}
    </Button>
  );
  const storeLink = (u: AdminUser) => u.storeId && (
    <Link to={`/admin/lojas/${u.storeId}`} className="text-sm hover:text-admin hover:underline">{u.storeName}</Link>
  );

  return (
    <div>
      <PageHeader title="Usuários" description="Clientes, lojistas e administradores. Contas bloqueadas não conseguem entrar." />
      <div className="mb-4 flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" aria-label="Buscar usuários" placeholder="Nome, e-mail ou loja" value={q}
            onChange={(e) => setParam('q', e.target.value)} className="h-11 rounded-full pl-9" />
        </div>
        <Select value={role} onValueChange={(v) => setParam('role', v)}>
          <SelectTrigger aria-label="Filtrar por papel" className="h-11 md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os papéis</SelectItem>
            {Object.entries(USER_ROLE).map(([v, { label }]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setParam('status', v)}>
          <SelectTrigger aria-label="Filtrar por situação" className="h-11 md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as situações</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="blocked">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <QueryState query={query} isEmpty={(d) => d.items.length === 0}
        empty={<EmptyState icon={Users} title="Nenhum usuário encontrado" description="Ajuste a busca ou os filtros." />}>
        {(data) => {
          const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
          return (
            <>
              <ul className="space-y-3 md:hidden">
                {data.items.map((u) => (
                  <li key={u.id} className="rounded-lg border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                        {storeLink(u)}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Pill map={USER_ROLE} value={u.role} />
                        <Pill map={ACTIVE} value={u.isActive ? 'active' : 'blocked'} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Desde {formatDate(u.createdAt)}</span>
                      {toggle(u)}
                    </div>
                  </li>
                ))}
              </ul>
              <Card className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead><span className="sr-only">Ações</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <p className="font-medium">{u.name}{u.id === me?.id && <span className="text-muted-foreground"> (você)</span>}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </TableCell>
                        <TableCell><Pill map={USER_ROLE} value={u.role} /></TableCell>
                        <TableCell>{storeLink(u) || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell><Pill map={ACTIVE} value={u.isActive ? 'active' : 'blocked'} /></TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                        <TableCell className="text-right">{toggle(u)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
              <nav aria-label="Paginação" className="mt-4 flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{data.total} usuário(s) · página {data.page} de {pages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParam('pagina', String(page - 1))}>Anterior</Button>
                  <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setParam('pagina', String(page + 1))}>Próxima</Button>
                </div>
              </nav>
            </>
          );
        }}
      </QueryState>

      <ReasonDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title={target?.isActive ? 'Bloquear usuário' : 'Desbloquear usuário'}
        description={target?.isActive
          ? `${target.name} não conseguirá mais entrar${target.storeName ? ' nem gerenciar a loja' : ''} até ser desbloqueado.`
          : `${target?.name} volta a ter acesso à conta.`}
        confirmLabel={target?.isActive ? 'Bloquear' : 'Desbloquear'}
        destructive={target?.isActive}
        pending={mutation.isPending}
        onConfirm={() => target && mutation.mutate({ userId: target.id, isActive: !target.isActive })}
      />
    </div>
  );
}
