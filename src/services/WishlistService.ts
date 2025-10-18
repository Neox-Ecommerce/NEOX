export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  productSku?: string;
  productCategory: string;
  addedAt: Date;
  customerId: string;
  lojaId: string;
}

export interface Wishlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  items: WishlistItem[];
  customerId: string;
  lojaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWishlistData {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export class WishlistService {
  private static WISHLISTS_KEY = 'neox_wishlists';
  private static WISHLIST_ITEMS_KEY = 'neox_wishlist_items';

  private static getWishlists(): Wishlist[] {
    const stored = localStorage.getItem(this.WISHLISTS_KEY);
    if (stored) {
      return JSON.parse(stored).map((w: any) => ({
        ...w,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt),
      }));
    }
    return [];
  }

  private static getWishlistItems(): WishlistItem[] {
    const stored = localStorage.getItem(this.WISHLIST_ITEMS_KEY);
    if (stored) {
      return JSON.parse(stored).map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt),
      }));
    }
    return [];
  }

  private static saveWishlists(wishlists: Wishlist[]): void {
    localStorage.setItem(this.WISHLISTS_KEY, JSON.stringify(wishlists));
  }

  private static saveWishlistItems(items: WishlistItem[]): void {
    localStorage.setItem(this.WISHLIST_ITEMS_KEY, JSON.stringify(items));
  }

  static async getWishlists(customerId: string, lojaId: string = '1'): Promise<Wishlist[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const wishlists = this.getWishlists()
      .filter(w => w.customerId === customerId && w.lojaId === lojaId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    // Adicionar itens às wishlists
    const items = this.getWishlistItems();
    return wishlists.map(wishlist => ({
      ...wishlist,
      items: items.filter(item => item.customerId === customerId && item.lojaId === lojaId),
    }));
  }

  static async getWishlistById(id: string): Promise<Wishlist | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const wishlist = this.getWishlists().find(w => w.id === id);
    if (!wishlist) return null;
    
    const items = this.getWishlistItems().filter(item => item.customerId === wishlist.customerId);
    return { ...wishlist, items };
  }

  static async createWishlist(data: CreateWishlistData, customerId: string, lojaId: string = '1'): Promise<Wishlist> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const wishlists = this.getWishlists();
    const newWishlist: Wishlist = {
      ...data,
      id: Date.now().toString(),
      items: [],
      customerId,
      lojaId,
      isPublic: data.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    wishlists.unshift(newWishlist);
    this.saveWishlists(wishlists);
    return newWishlist;
  }

  static async updateWishlist(id: string, data: Partial<CreateWishlistData>): Promise<Wishlist> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const wishlists = this.getWishlists();
    const index = wishlists.findIndex(w => w.id === id);
    
    if (index === -1) {
      throw new Error('Wishlist não encontrada');
    }
    
    wishlists[index] = {
      ...wishlists[index],
      ...data,
      updatedAt: new Date(),
    };
    
    this.saveWishlists(wishlists);
    return wishlists[index];
  }

  static async deleteWishlist(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const wishlists = this.getWishlists();
    const filtered = wishlists.filter(w => w.id !== id);
    this.saveWishlists(filtered);
    
    // Remover itens da wishlist
    const items = this.getWishlistItems();
    const filteredItems = items.filter(item => item.customerId !== id);
    this.saveWishlistItems(filteredItems);
  }

  static async addToWishlist(
    wishlistId: string,
    productId: string,
    productData: {
      name: string;
      price: number;
      image?: string;
      sku?: string;
      category: string;
    },
    customerId: string,
    lojaId: string = '1'
  ): Promise<WishlistItem> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const items = this.getWishlistItems();
    
    // Verificar se o produto já está na wishlist
    const existingItem = items.find(item => 
      item.productId === productId && 
      item.customerId === customerId && 
      item.lojaId === lojaId
    );
    
    if (existingItem) {
      throw new Error('Produto já está na wishlist');
    }
    
    const newItem: WishlistItem = {
      id: Date.now().toString(),
      productId,
      productName: productData.name,
      productPrice: productData.price,
      productImage: productData.image,
      productSku: productData.sku,
      productCategory: productData.category,
      addedAt: new Date(),
      customerId,
      lojaId,
    };
    
    items.unshift(newItem);
    this.saveWishlistItems(items);
    
    // Atualizar timestamp da wishlist
    const wishlists = this.getWishlists();
    const wishlistIndex = wishlists.findIndex(w => w.id === wishlistId);
    if (wishlistIndex !== -1) {
      wishlists[wishlistIndex].updatedAt = new Date();
      this.saveWishlists(wishlists);
    }
    
    return newItem;
  }

  static async removeFromWishlist(itemId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const items = this.getWishlistItems();
    const filtered = items.filter(item => item.id !== itemId);
    this.saveWishlistItems(filtered);
  }

  static async moveToCart(itemId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const items = this.getWishlistItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item não encontrado na wishlist');
    }
    
    // Aqui você integraria com o serviço de carrinho
    // Por enquanto, apenas removemos da wishlist
    await this.removeFromWishlist(itemId);
  }

  static async getWishlistStats(customerId: string, lojaId: string = '1'): Promise<{
    totalWishlists: number;
    totalItems: number;
    totalValue: number;
    categories: Record<string, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const wishlists = await this.getWishlists(customerId, lojaId);
    const allItems = wishlists.flatMap(w => w.items);
    
    const categories: Record<string, number> = {};
    allItems.forEach(item => {
      categories[item.productCategory] = (categories[item.productCategory] || 0) + 1;
    });
    
    return {
      totalWishlists: wishlists.length,
      totalItems: allItems.length,
      totalValue: allItems.reduce((sum, item) => sum + item.productPrice, 0),
      categories,
    };
  }

  static async getPublicWishlists(lojaId: string = '1'): Promise<Wishlist[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const wishlists = this.getWishlists()
      .filter(w => w.isPublic && w.lojaId === lojaId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    const items = this.getWishlistItems();
    return wishlists.map(wishlist => ({
      ...wishlist,
      items: items.filter(item => item.customerId === wishlist.customerId),
    }));
  }

  static async shareWishlist(id: string): Promise<{ shareUrl: string; shareCode: string }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const shareUrl = `${window.location.origin}/wishlist/${shareCode}`;
    
    return { shareUrl, shareCode };
  }
}
