import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { CartService, type CartItem } from '@/services/CartService';
import { FeedbackService } from '@/services/FeedbackService';
import { GuestCartService, useGuestCart } from '@/services/GuestCartService';

/**
 * Carrinho único para as páginas: API para cliente logado, localStorage para visitante.
 * `mode` = 'other' quando a conta logada não é de cliente (lojista/admin não compram).
 */
export function useCart() {
  const { user } = useAuth();
  const mode: 'guest' | 'client' | 'other' = !user ? 'guest' : user.role === 'CLIENTE' ? 'client' : 'other';
  const guest = useGuestCart();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['cart'], queryFn: CartService.getCart, enabled: mode === 'client' });
  const [pending, setPending] = useState<Set<string>>(new Set());

  const run = async (productId: string, api: () => Promise<CartItem[]>, local: () => void) => {
    setPending((s) => new Set(s).add(productId));
    try {
      if (mode === 'client') queryClient.setQueryData(['cart'], await api());
      else local();
      return true;
    } catch (e) {
      FeedbackService.error(e instanceof Error ? e.message : 'Não foi possível atualizar o carrinho');
      return false;
    } finally {
      setPending((s) => {
        const next = new Set(s);
        next.delete(productId);
        return next;
      });
    }
  };

  return {
    mode,
    items: mode === 'client' ? query.data ?? [] : mode === 'guest' ? guest : [],
    isLoading: mode === 'client' && query.isLoading,
    error: mode === 'client' ? query.error : null,
    refetch: query.refetch,
    isPending: (productId: string) => pending.has(productId),
    setQuantity: (item: CartItem, quantity: number) =>
      run(
        item.productId,
        () => CartService.updateQuantity({ productId: item.productId, quantity }),
        () => GuestCartService.setQuantity(item.productId, quantity),
      ),
    remove: (item: CartItem) =>
      run(item.productId, () => CartService.removeItem(item.productId), () => GuestCartService.remove(item.productId)),
    restore: (item: CartItem) =>
      run(
        item.productId,
        () => CartService.addItem({ productId: item.productId, quantity: item.quantity }),
        () => GuestCartService.restore(item),
      ),
  };
}
