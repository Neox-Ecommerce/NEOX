import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ToastAction } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { AnalyticsService } from '@/services/AnalyticsService';
import { CartService } from '@/services/CartService';
import type { CatalogProduct } from '@/services/CatalogService';
import { FeedbackService } from '@/services/FeedbackService';
import { GuestCartService } from '@/services/GuestCartService';

/**
 * Adiciona ao carrinho: cliente → API; visitante → carrinho local (sem redirecionar).
 * Contas de lojista/admin recebem uma explicação. `isAdding(id)` dá o estado de cada card.
 */
export function useAddToCart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<Set<string>>(new Set());

  const add = async (product: CatalogProduct, quantity = 1): Promise<boolean> => {
    if (user && user.role !== 'CLIENTE') {
      FeedbackService.info(
        'Esta conta não faz compras',
        'Contas de lojista e de administrador não compram na NEOX. Saia e entre com uma conta de cliente.',
      );
      return false;
    }
    setPending((s) => new Set(s).add(product.id));
    try {
      if (user) queryClient.setQueryData(['cart'], await CartService.addItem({ productId: product.id, quantity }));
      else GuestCartService.add(product, quantity);
      AnalyticsService.track('add_to_cart', product.lojaId, product.id);
      toast({
        variant: 'success',
        title: 'Produto adicionado ao carrinho',
        description: product.nome,
        action: (
          <ToastAction altText="Ver carrinho" onClick={() => navigate('/carrinho')}>
            Ver carrinho
          </ToastAction>
        ),
      });
      return true;
    } catch (e) {
      FeedbackService.error(e instanceof Error ? e.message : 'Não foi possível adicionar ao carrinho');
      return false;
    } finally {
      setPending((s) => {
        const next = new Set(s);
        next.delete(product.id);
        return next;
      });
    }
  };

  return { add, isAdding: (id: string) => pending.has(id) };
}
