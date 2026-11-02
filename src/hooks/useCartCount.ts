import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { CartService } from '@/services/CartService';
import { useGuestCart } from '@/services/GuestCartService';

/**
 * Quantidade de unidades no carrinho, para o contador do cabeçalho.
 * Cliente logado: carrinho da API (query ['cart'], a mesma usada pelas páginas).
 * Visitante sem login: carrinho local (localStorage).
 */
export function useCartCount(): number {
  const { user } = useAuth();
  const guest = useGuestCart();
  const { data } = useQuery({
    queryKey: ['cart'],
    queryFn: CartService.getCart,
    enabled: user?.role === 'CLIENTE',
  });
  const items = user ? (user.role === 'CLIENTE' ? data ?? [] : []) : guest;
  return items.reduce((n, item) => n + item.quantity, 0);
}
