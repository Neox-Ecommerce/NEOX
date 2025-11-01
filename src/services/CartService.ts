import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  total: number;
  lojaId: string;
  lojaNome: string;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutData {
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  billingAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  cardData?: {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
  };
}

export class CartService {
  private static CART_KEY = 'neox_cart';

  /**
   * Obtém o carrinho do usuário (localStorage para usuários não logados, API para logados)
   */
  static async getCart(userId?: string): Promise<Cart> {
    // Se não tiver userId, buscar do localStorage
    if (!userId) {
      return this.getLocalCart();
    }

    try {
      const response = await apiClient.get<Cart>(
        `${API_CONFIG.ENDPOINTS.ORDERS}/cart`,
        { userId }
      );

      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error: any) {
      // Se erro de rede, usar localStorage como fallback
      if (error.status === 0) {
        console.warn('Backend não disponível, usando carrinho local');
        return this.getLocalCart();
      }
      throw new Error(error.message || 'Erro ao buscar carrinho');
    }
  }

  /**
   * Adiciona um produto ao carrinho
   */
  static async addItem(
    productId: string,
    quantity: number = 1,
    userId?: string
  ): Promise<Cart> {
    if (!userId) {
      return this.addItemLocal(productId, quantity);
    }

    try {
      const response = await apiClient.post<Cart>(
        `${API_CONFIG.ENDPOINTS.ORDERS}/cart/items`,
        { productId, quantity, userId }
      );

      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error: any) {
      if (error.status === 0) {
        console.warn('Backend não disponível, usando carrinho local');
        return this.addItemLocal(productId, quantity);
      }
      throw new Error(error.message || 'Erro ao adicionar item ao carrinho');
    }
  }

  /**
   * Atualiza a quantidade de um item no carrinho
   */
  static async updateItemQuantity(
    itemId: string,
    quantity: number,
    userId?: string
  ): Promise<Cart> {
    if (!userId) {
      return this.updateItemQuantityLocal(itemId, quantity);
    }

    try {
      const response = await apiClient.put<Cart>(
        `${API_CONFIG.ENDPOINTS.ORDERS}/cart/items/${itemId}`,
        { quantity, userId }
      );

      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error: any) {
      if (error.status === 0) {
        return this.updateItemQuantityLocal(itemId, quantity);
      }
      throw new Error(error.message || 'Erro ao atualizar quantidade');
    }
  }

  /**
   * Remove um item do carrinho
   */
  static async removeItem(itemId: string, userId?: string): Promise<Cart> {
    if (!userId) {
      return this.removeItemLocal(itemId);
    }

    try {
      const response = await apiClient.delete<Cart>(
        `${API_CONFIG.ENDPOINTS.ORDERS}/cart/items/${itemId}?userId=${userId}`
      );

      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error: any) {
      if (error.status === 0) {
        return this.removeItemLocal(itemId);
      }
      throw new Error(error.message || 'Erro ao remover item');
    }
  }

  /**
   * Aplica cupom de desconto
   */
  static async applyCoupon(couponCode: string, userId?: string): Promise<Cart> {
    if (!userId) {
      return this.applyCouponLocal(couponCode);
    }

    try {
      const response = await apiClient.post<Cart>(
        `${API_CONFIG.ENDPOINTS.ORDERS}/cart/coupon`,
        { couponCode, userId }
      );

      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      };
    } catch (error: any) {
      if (error.status === 0) {
        return this.applyCouponLocal(couponCode);
      }
      throw new Error(error.message || 'Cupom inválido');
    }
  }

  /**
   * Finaliza a compra
   */
  static async checkout(data: CheckoutData, userId?: string): Promise<{ orderId: string; paymentUrl?: string }> {
    try {
      const response = await apiClient.post<{ orderId: string; paymentUrl?: string }>(
        `${API_CONFIG.ENDPOINTS.ORDERS}/checkout`,
        { ...data, userId }
      );

      // Limpar carrinho após checkout bem-sucedido
      if (!userId) {
        this.clearLocalCart();
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao finalizar compra');
    }
  }

  /**
   * Limpa o carrinho
   */
  static async clearCart(userId?: string): Promise<void> {
    if (!userId) {
      this.clearLocalCart();
      return;
    }

    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.ORDERS}/cart?userId=${userId}`);
    } catch (error: any) {
      if (error.status === 0) {
        this.clearLocalCart();
        return;
      }
      throw new Error(error.message || 'Erro ao limpar carrinho');
    }
  }

  // ==================== MÉTODOS LOCAIS (FALLBACK) ====================

  private static getLocalCart(): Cart {
    const stored = localStorage.getItem(this.CART_KEY);
    if (stored) {
      const cart = JSON.parse(stored);
      return {
        ...cart,
        createdAt: new Date(cart.createdAt),
        updatedAt: new Date(cart.updatedAt)
      };
    }

    // Carrinho vazio
    return {
      id: 'local-cart',
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private static saveLocalCart(cart: Cart): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  }

  private static async addItemLocal(productId: string, quantity: number): Promise<Cart> {
    // Simular busca de produto (em produção, deve buscar do ProductService)
    const cart = this.getLocalCart();

    // Verificar se o item já existe
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].total = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
    } else {
      // Adicionar novo item (dados mock - em produção buscar do ProductService)
      cart.items.push({
        id: `item-${Date.now()}`,
        productId,
        productName: 'Produto Mock', // Buscar do ProductService
        price: 100,
        quantity,
        total: 100 * quantity,
        lojaId: 'mock-loja',
        lojaNome: 'Loja Mock'
      });
    }

    // Recalcular totais
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.total = cart.subtotal - cart.discount + cart.shipping;
    cart.updatedAt = new Date();

    this.saveLocalCart(cart);
    return cart;
  }

  private static updateItemQuantityLocal(itemId: string, quantity: number): Cart {
    const cart = this.getLocalCart();
    const itemIndex = cart.items.findIndex(item => item.id === itemId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].total = cart.items[itemIndex].price * quantity;
      }

      // Recalcular totais
      cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
      cart.total = cart.subtotal - cart.discount + cart.shipping;
      cart.updatedAt = new Date();

      this.saveLocalCart(cart);
    }

    return cart;
  }

  private static removeItemLocal(itemId: string): Cart {
    const cart = this.getLocalCart();
    cart.items = cart.items.filter(item => item.id !== itemId);

    // Recalcular totais
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.total = cart.subtotal - cart.discount + cart.shipping;
    cart.updatedAt = new Date();

    this.saveLocalCart(cart);
    return cart;
  }

  private static applyCouponLocal(couponCode: string): Cart {
    const cart = this.getLocalCart();

    // Simular validação de cupom (mock)
    if (couponCode === 'DESC10') {
      cart.couponCode = couponCode;
      cart.discount = cart.subtotal * 0.1; // 10% de desconto
    } else {
      throw new Error('Cupom inválido');
    }

    cart.total = cart.subtotal - cart.discount + cart.shipping;
    cart.updatedAt = new Date();

    this.saveLocalCart(cart);
    return cart;
  }

  private static clearLocalCart(): void {
    localStorage.removeItem(this.CART_KEY);
  }
}
