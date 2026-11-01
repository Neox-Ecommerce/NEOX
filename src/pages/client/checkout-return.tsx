import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { CheckoutService } from '@/services/CheckoutService';

const RESULT = {
  paid: { icon: CheckCircle, color: 'text-green-600', title: 'Pagamento aprovado!', text: 'Seu pedido foi confirmado e a loja já foi avisada.' },
  pending: { icon: Clock, color: 'text-yellow-600', title: 'Pagamento em análise', text: 'Assim que o Mercado Pago confirmar, seu pedido será atualizado.' },
  failed: { icon: XCircle, color: 'text-red-600', title: 'Pagamento não aprovado', text: 'Nenhum valor foi cobrado. Fale com a loja para tentar novamente.' },
  refunded: { icon: XCircle, color: 'text-gray-600', title: 'Pagamento estornado', text: 'O valor foi devolvido pelo Mercado Pago.' },
};

export function CheckoutReturnPage() {
  const [params] = useSearchParams();
  // O MP manda payment_id (ou collection_id) e external_reference (= checkoutId); o status da URL não é confiável.
  const paymentId = params.get('payment_id') || params.get('collection_id');
  const checkoutId = params.get('external_reference');
  const validPaymentId = paymentId && paymentId !== 'null' ? paymentId : null;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['checkout-confirm', validPaymentId, checkoutId],
    queryFn: () => CheckoutService.confirm({ paymentId: validPaymentId, checkoutId }),
    enabled: !!(validPaymentId || checkoutId),
    retry: false,
  });

  const result = data ? RESULT[data.paymentStatus] ?? RESULT.pending : null;
  const Icon = result?.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isError || !result || !Icon || !data ? (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Não foi possível confirmar o pagamento</h1>
              <p className="text-gray-600">{error instanceof Error ? error.message : 'Retorno de pagamento inválido.'}</p>
            </>
          ) : (
            <>
              <Icon className={`mx-auto h-12 w-12 ${result.color}`} />
              <h1 className="text-2xl font-bold text-gray-900">{result.title}</h1>
              <p className="text-gray-600">{result.text}</p>
              <div className="text-left border rounded-lg divide-y">
                {data.orders.map((o) => (
                  <div key={o.id} className="flex justify-between p-3 text-sm">
                    <span>
                      <strong>{o.code}</strong> · {o.storeName}
                    </span>
                    <span className="font-medium">{formatCurrency(o.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between p-3 font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(data.total)}</span>
                </div>
              </div>
            </>
          )}
          <Link to="/cliente#pedidos">
            <Button className="mt-4">Ver meus pedidos</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
