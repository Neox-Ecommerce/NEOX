import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

type Tone = 'primary' | 'success' | 'warning' | 'info' | 'destructive';

const TONE: Record<Tone, string> = {
  primary: 'bg-primary-muted text-primary',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  info: 'bg-info-muted text-info',
  destructive: 'bg-destructive-muted text-destructive',
};

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  format?: 'number' | 'currency' | 'percentage';
  delta?: number;
  hint?: string;
  tone?: Tone;
  /** Torna o card inteiro um link (ex.: alerta que leva à lista filtrada). */
  to?: string;
  className?: string;
  suffix?: string;
}

function formatValue(value: number | string, format: MetricCardProps['format'], suffix = '') {
  if (typeof value === 'string') return value;
  if (format === 'currency') return formatCurrency(value);
  if (format === 'percentage') return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
  return `${value.toLocaleString('pt-BR')}${suffix}`;
}

/** Número-resumo dos dashboards (lojista e admin). */
export function MetricCard({
  title, value, icon: Icon, format = 'number', delta, hint, tone = 'primary', to, className, suffix,
}: MetricCardProps) {
  const body = (
    <Card className={cn('h-full transition-shadow', to && 'hover:shadow-md', className)}>
      <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="truncate text-xl font-semibold text-foreground sm:text-2xl">{formatValue(value, format, suffix)}</p>
          {delta !== undefined && (
            <p className={cn('text-xs font-medium', delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground')}>
              {delta > 0 ? '+' : ''}{delta.toFixed(1)}% vs. período anterior
            </p>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', TONE[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
  return to ? <Link to={to} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{body}</Link> : body;
}
