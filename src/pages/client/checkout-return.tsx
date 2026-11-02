import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/PageStates';
import { cn, formatCurrency } from '@/lib/utils';
import { CheckoutService } from '@/services/CheckoutService';

const RESULT = {
  paid: { icon: CheckCircle2, tone: 'text-success', title: 'Pagamento aprovado!', text: 'Seu pedido foi confirmado e a loja já foi avisada.' },
  pending: { icon: Clock, tone: 'text-warning', title: 'Pagamento em análise', text: 'Assim que o Mercado Pago confirmar, seu pedido será atualizado.' },
  failed: { icon: XCircle, tone: 'text-destructive', title: 'Pagamento não aprovado', text: 'Nenhum valor foi cobrado. Você pode tentar de novo.' },
  refunded: { icon: XCircle, tone: 'text-muted-foreground', title: 'Pagamento estornado', text: 'O valor foi devolvido pelo Mercado Pago.' },
  created: { icon: CheckCircle2, tone: 'text-success', title: 'Pedido criado!', text: 'Cada loja vai combinar o pagamento e a entrega com você.' },
};

export function CheckoutReturnPage() {
  const [params] = useSearchParams();
  // O MP manda payment_id (ou collection_id) e external_reference (= checkoutId); o status da URL não é confiável.
  const paymentId = params.get('payment_id') || params.get('collection_id');
  const checkoutId = params.get('external_reference');
  const validPaymentId = paymentId && paymentId !== 'null' ? paymentId : null;
  const withoutOnlinePayment = params.get('origem') === 'pedido';

  const { data, isLoading, error } = useQuery({
    queryKey: ['checkout-confirm', validPaymentId, checkoutId],
    queryFn: () => CheckoutService.confirm({ paymentId: validPaymentId, checkoutId }),
    enabled: !!(validPaymentId || checkoutId),
    retry: false,
  });

  if (isLoading) return <PageLoader label="Confirmando pagamento…" />;

  const key = data ? (withoutOnlinePayment && data.paymentStatus === 'pending' ? 'created' : data.paymentStatus) : 'failed';
  const result = data ? RESULT[key] ?? RESULT.pending : null;
  const Icon = result?.icon ?? XCircle;
  const failed = !data || data.paymentStatus === 'failed';
  const firstOrder = data?.orders[0];

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center">
      <Icon className={cn('mx-auto h-12 w-12', result?.tone ?? 'text-destructive')} aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{result?.title ?? 'Não foi possível confirmar o pagamento'}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {result?.text ?? (error instanceof Error ? error.message : 'Retorno de pagamento inválido.')}
      </p>

      {data && (
        <ul className="mt-6 divide-y rounded-lg border bg-card text-left text-sm">
          {data.orders.map((o) => (
            <li key={o.id}>
              <Link to={`/conta/pedidos/${o.id}`} className="flex min-h-11 items-center justify-between gap-3 p-3 hover:bg-accent">
                <span><strong>{o.code}</strong> · {o.storeName}</span>
                <span className="font-medium">{formatCurrency(o.total)}</span>
              </Link>
            </li>
          ))}
          <li className="flex justify-between p-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(data.total)}</span>
          </li>
        </ul>
      )}

      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        {failed && (
          <Button asChild>
            <Link to="/carrinho">Tentar novamente</Link>
          </Button>
        )}
        <Button asChild variant={failed ? 'outline' : 'default'}>
          <Link to={firstOrder && data?.orders.length === 1 ? `/conta/pedidos/${firstOrder.id}` : '/conta/pedidos'}>
            {data && data.orders.length === 1 ? 'Ver pedido' : 'Ver meus pedidos'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
