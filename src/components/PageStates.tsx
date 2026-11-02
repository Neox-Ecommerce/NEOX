import { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Cabeçalho padrão de página: trilha, título, descrição e ações. */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}) {
  return (
    <div className="mb-6 space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Trilha de navegação" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            {breadcrumbs.map((b, i) => (
              <li key={b.label} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden="true">/</span>}
                {b.to ? (
                  <Link to={b.to} className="hover:text-foreground hover:underline">{b.label}</Link>
                ) : (
                  <span aria-current="page" className="text-foreground">{b.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function PageLoader({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-4 py-12 text-center', className)}>
      <div className="mb-3 rounded-full bg-muted p-3">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error?: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : 'Não foi possível carregar os dados.';
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-3 rounded-full bg-destructive-muted p-3">
        <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
      </div>
      <p className="font-medium text-foreground">Algo deu errado</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

/**
 * Trata os 4 estados de uma query do react-query: carregando, erro, vazio e com dados.
 * Ex.: <QueryState query={q} isEmpty={(d) => d.length === 0} empty={<EmptyState …/>}>{(d) => …}</QueryState>
 */
export function QueryState<T>({
  query,
  isEmpty,
  empty,
  loading,
  children,
}: {
  query: { data: T | undefined; isLoading: boolean; error: unknown; refetch: () => unknown };
  isEmpty?: (data: T) => boolean;
  empty?: React.ReactNode;
  loading?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}) {
  if (query.isLoading) return <>{loading ?? <PageLoader />}</>;
  if (query.error || query.data === undefined) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (isEmpty?.(query.data) && empty) return <>{empty}</>;
  return <>{children(query.data)}</>;
}

/** Botão só com ícone: o rótulo é obrigatório (vira aria-label e dica). */
export const IconButton = forwardRef<
  HTMLButtonElement,
  { label: string; icon: LucideIcon } & Omit<React.ComponentProps<typeof Button>, 'children'>
>(({ label, icon: Icon, className, ...props }, ref) => (
  <Button ref={ref} variant="ghost" size="icon" aria-label={label} title={label} className={className} {...props}>
    <Icon className="h-4 w-4" aria-hidden="true" />
  </Button>
));
IconButton.displayName = 'IconButton';
