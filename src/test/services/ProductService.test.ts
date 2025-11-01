import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService, Product } from '@/services/ProductService';
import { ProductApiService } from '@/services/ProductApiService';

vi.mock('@/services/ProductApiService', () => ({
  ProductApiService: {
    getProductsByStore: vi.fn(),
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

describe('ProductService', () => {
  const apiProduct = {
    id: 1,
    name: 'Produto Teste',
    description: 'Descrição',
    price: 100,
    stock: 5,
    category: 'Categoria',
    image_url: null,
    is_active: true,
    store_id: 10,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch and map products from API', async () => {
      (ProductApiService.getProductsByStore as vi.Mock).mockResolvedValue({
        data: [apiProduct],
        success: true,
      });

      const products = await ProductService.getProducts(10);

      expect(ProductApiService.getProductsByStore).toHaveBeenCalledWith(10);
      expect(products).toHaveLength(1);
      expect(products[0]).toMatchObject({
        id: 1,
        nome: 'Produto Teste',
        preco: 100,
        estoque: 5,
        lojaId: 10,
      });
    });
  });

  describe('createProduct', () => {
    it('should send mapped payload and return created product', async () => {
      (ProductApiService.createProduct as vi.Mock).mockResolvedValue({
        data: apiProduct,
        success: true,
      });

      const product = await ProductService.createProduct({
        nome: 'Produto Teste',
        descricao: 'Descrição',
        preco: 100,
        estoque: 5,
        categoria: 'Categoria',
        ativo: true,
        imagem: null,
      });

      expect(ProductApiService.createProduct).toHaveBeenCalledWith({
        name: 'Produto Teste',
        description: 'Descrição',
        price: 100,
        stock: 5,
        category: 'Categoria',
        image_url: null,
        is_active: true,
      });
      expect(product.nome).toBe('Produto Teste');
    });
  });

  describe('updateProduct', () => {
    it('should map updated fields', async () => {
      (ProductApiService.updateProduct as vi.Mock).mockResolvedValue({
        data: { ...apiProduct, name: 'Produto Atualizado', stock: 8 },
        success: true,
      });

      const product = await ProductService.updateProduct(1, {
        nome: 'Produto Atualizado',
        estoque: 8,
      });

      expect(ProductApiService.updateProduct).toHaveBeenCalledWith(1, {
        name: 'Produto Atualizado',
        stock: 8,
      });
      expect(product.nome).toBe('Produto Atualizado');
      expect(product.estoque).toBe(8);
    });
  });

  describe('deleteProduct', () => {
    it('should call API delete', async () => {
      (ProductApiService.deleteProduct as vi.Mock).mockResolvedValue({ data: null, success: true });
      await ProductService.deleteProduct(1);
      expect(ProductApiService.deleteProduct).toHaveBeenCalledWith(1);
    });
  });

  describe('calculate helpers', () => {
    const sampleProducts: Product[] = [
      {
        id: 1,
        nome: 'A',
        descricao: 'Desc',
        preco: 100,
        estoque: 2,
        categoria: 'Categoria',
        ativo: true,
        imagem: null,
        lojaId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        nome: 'B',
        descricao: 'Desc',
        preco: 50,
        estoque: 0,
        categoria: 'Categoria',
        ativo: false,
        imagem: null,
        lojaId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should calculate stats correctly', () => {
      const stats = ProductService.calculateStats(sampleProducts);
      expect(stats.total).toBe(2);
      expect(stats.ativo).toBe(1);
      expect(stats.inativo).toBe(1);
      expect(stats.esgotado).toBe(1);
      expect(stats.valorTotal).toBe(200);
    });

    it('should compute category counts', () => {
      const counts = ProductService.calculateCategoryCounts(sampleProducts);
      expect(counts).toEqual({ Categoria: 2 });
    });
  });
});
