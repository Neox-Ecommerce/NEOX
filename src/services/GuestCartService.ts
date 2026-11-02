import { useSyncExternalStore } from 'react';
import type { CartItem } from '@/services/CartService';
import { CartService } from '@/services/CartService';
import type { CatalogProduct } from '@/services/CatalogService';

// Carrinho do visitante sem login: fica no localStorage (mesmo formato do carrinho da API)
// e é enviado para a API quando ele entra como cliente (mergeIntoApi).
const KEY = 'neox_guest_cart';
const EVENT = 'neox:guest-cart';

let cacheRaw: string | null = null;
let cache: CartItem[] = [];

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* armazenamento bloqueado: carrinho vazio */
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      cache = Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
      cache = [];
    }
  }
  return cache;
}

function write(items: CartItem[]) {
  try {
    if (items.length) localStorage.setItem(KEY, JSON.stringify(items));
    else localStorage.removeItem(KEY);
  } catch {
    /* sem armazenamento: nada a fazer */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb); // outras abas
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

const withQty = (item: CartItem, quantity: number): CartItem => ({ ...item, quantity, subtotal: item.price * quantity });

function stockError(name: string, stock: number) {
  return new Error(`Estoque insuficiente para ${name} (disponível: ${stock})`);
}

export const GuestCartService = {
  items: read,

  add(product: CatalogProduct, quantity = 1) {
    const items = read();
    const current = items.find((i) => i.productId === product.id);
    const qty = (current?.quantity ?? 0) + quantity;
    if (qty > product.estoque) throw stockError(product.nome, product.estoque);
    const snapshot: CartItem = {
      id: product.id,
      productId: product.id,
      name: product.nome,
      image: product.imagem,
      price: product.precoFinal,
      originalPrice: product.preco,
      quantity: qty,
      stock: product.estoque,
      storeId: product.lojaId,
      storeName: product.lojaNome,
      subtotal: product.precoFinal * qty,
    };
    write(current ? items.map((i) => (i.productId === product.id ? snapshot : i)) : [...items, snapshot]);
  },

  /** Recoloca um item removido (botão "Desfazer"). */
  restore(item: CartItem) {
    const items = read().filter((i) => i.productId !== item.productId);
    write([...items, item]);
  },

  setQuantity(productId: string, quantity: number) {
    const items = read();
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    if (quantity > item.stock) throw stockError(item.name, item.stock);
    write(items.map((i) => (i.productId === productId ? withQty(i, quantity) : i)));
  },

  remove(productId: string) {
    write(read().filter((i) => i.productId !== productId));
  },

  clear() {
    write([]);
  },

  /**
   * Envia o carrinho do visitante para a API (cliente acabou de entrar) e o esvazia.
   * Limpa antes de enviar para não duplicar se for chamado duas vezes. Devolve quantos itens falharam.
   */
  async mergeIntoApi(): Promise<number> {
    const items = read();
    if (!items.length) return 0;
    write([]);
    let failed = 0;
    for (const item of items) {
      try {
        await CartService.addItem({ productId: item.productId, quantity: item.quantity });
      } catch {
        failed += 1; // produto indisponível ou sem estoque agora
      }
    }
    return failed;
  },
};

/** Itens do carrinho do visitante, reativo a mudanças (inclusive em outras abas). */
export function useGuestCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => []);
}
