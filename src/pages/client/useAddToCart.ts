import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AnalyticsService } from '@/services/AnalyticsService';
import { CartService } from '@/services/CartService';
import { FeedbackService } from '@/services/FeedbackService';

/** Adiciona ao carrinho da API; visitante sem login vai para /auth. */
export function useAddToCart() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: CartService.addItem,
    onSuccess: (items) => {
      queryClient.setQueryData(['cart'], items);
      FeedbackService.success('Produto adicionado ao carrinho');
    },
    onError: (error: Error) => FeedbackService.error(error.message),
  });

  const add = (product: { id: string; lojaId: string }, quantity = 1) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (user?.role !== 'CLIENTE') {
      FeedbackService.error('Apenas contas de cliente podem comprar');
      return;
    }
    AnalyticsService.track('add_to_cart', product.lojaId, product.id);
    mutation.mutate({ productId: product.id, quantity });
  };

  return { add, isPending: mutation.isPending };
}
