import { cn } from '@/lib/utils';

// Tom visual de cada status: sempre cor + texto (nunca só cor).
type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  info: 'bg-info-muted text-info border-info/20',
  warning: 'bg-warning-muted text-warning border-warning/20',
  success: 'bg-success-muted text-success border-success/20',
  danger: 'bg-destructive-muted text-destructive border-destructive/20',
};

export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Pendente', tone: 'warning' },
  confirmed: { label: 'Confirmado', tone: 'info' },
  processing: { label: 'Em separação', tone: 'info' },
  shipped: { label: 'Enviado', tone: 'info' },
  delivered: { label: 'Entregue', tone: 'success' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
  returned: { label: 'Devolvido', tone: 'neutral' },
};

/** Transições válidas de status do pedido. Espelha TRANSITIONS em Neox-APIs/app/orders/service.py. */
export const ORDER_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  confirmed: ['processing', 'shipped', 'delivered', 'cancelled'],
  processing: ['shipped', 'delivered', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

/** Próximo passo natural do fluxo (botão principal na tela de pedidos). */
export const ORDER_NEXT_STEP: Record<string, { status: string; label: string } | undefined> = {
  pending: { status: 'confirmed', label: 'Confirmar pedido' },
  confirmed: { status: 'processing', label: 'Iniciar separação' },
  processing: { status: 'shipped', label: 'Marcar como enviado' },
  shipped: { status: 'delivered', label: 'Marcar como entregue' },
};

export const PAYMENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Pagamento pendente', tone: 'warning' },
  paid: { label: 'Pago', tone: 'success' },
  failed: { label: 'Pagamento recusado', tone: 'danger' },
  refunded: { label: 'Reembolsado', tone: 'neutral' },
};

export const STORE_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDENTE: { label: 'Em análise', tone: 'warning' },
  APROVADA: { label: 'Aprovada', tone: 'success' },
  REJEITADA: { label: 'Rejeitada', tone: 'danger' },
  SUSPENSA: { label: 'Suspensa', tone: 'danger' },
};

/** Regra única de estoque baixo em todo o app: estoque <= mínimo (padrão 5). */
export function stockLevel(stock: number, minStock = 5): 'out' | 'low' | 'ok' {
  if (stock <= 0) return 'out';
  return stock <= minStock ? 'low' : 'ok';
}

export const STOCK_STATUS: Record<string, { label: string; tone: Tone }> = {
  ok: { label: 'Em estoque', tone: 'success' },
  low: { label: 'Estoque baixo', tone: 'warning' },
  out: { label: 'Esgotado', tone: 'danger' },
};

const MAPS = { order: ORDER_STATUS, payment: PAYMENT_STATUS, store: STORE_STATUS, stock: STOCK_STATUS };

interface StatusBadgeProps {
  kind: keyof typeof MAPS;
  value: string;
  className?: string;
}

export function StatusBadge({ kind, value, className }: StatusBadgeProps) {
  const info = MAPS[kind][value] ?? { label: value, tone: 'neutral' as Tone };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASS[info.tone],
        className,
      )}
    >
      {info.label}
    </span>
  );
}
