import { api } from '@/lib/api';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  price: number; // unitário já com desconto
  originalPrice: number;
  quantity: number;
  stock: number;
  storeId: string;
  storeName: string;
  subtotal: number;
}

// Carrinho do cliente logado, guardado na API. Toda mutação devolve o carrinho atualizado.
export const CartService = {
  getCart(): Promise<CartItem[]> {
    return api<CartItem[]>('/cart');
  },

  addItem({ productId, quantity = 1 }: { productId: string; quantity?: number }): Promise<CartItem[]> {
    return api<CartItem[]>('/cart', { method: 'POST', body: { productId, quantity } });
  },

  updateQuantity({ productId, quantity }: { productId: string; quantity: number }): Promise<CartItem[]> {
    return api<CartItem[]>(`/cart/${productId}`, { method: 'PUT', body: { quantity } });
  },

  removeItem(productId: string): Promise<CartItem[]> {
    return api<CartItem[]>(`/cart/${productId}`, { method: 'DELETE' });
  },

  clear(): Promise<void> {
    return api('/cart', { method: 'DELETE' });
  },
};
