import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '@/services/ProductService';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('getMyProducts', () => {
    it('should return products for specific store', async () => {
      const mockProducts = [
        {
          id: '1',
          nome: 'Test Product',
          descricao: 'Test Description',
          preco: 100,
          estoque: 10,
          categoria: 'Test',
          ativo: true,
          lojaId: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          nome: 'Another Product',
          descricao: 'Another Description',
          preco: 200,
          estoque: 5,
          categoria: 'Test',
          ativo: true,
          lojaId: '2',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProducts));

      const result = await ProductService.getMyProducts('1');

      expect(result).toHaveLength(1);
      expect(result[0].lojaId).toBe('1');
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));

      const productData = {
        nome: 'New Product',
        descricao: 'New Description',
        preco: 150,
        estoque: 20,
        categoria: 'New Category',
        ativo: true,
      };

      const result = await ProductService.create(productData, '1');

      expect(result.nome).toBe('New Product');
      expect(result.lojaId).toBe('1');
      expect(result.id).toBeDefined();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const mockProducts = [
        {
          id: '1',
          nome: 'Original Product',
          descricao: 'Original Description',
          preco: 100,
          estoque: 10,
          categoria: 'Test',
          ativo: true,
          lojaId: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProducts));

      const updateData = {
        nome: 'Updated Product',
        preco: 150,
      };

      const result = await ProductService.update('1', updateData);

      expect(result.nome).toBe('Updated Product');
      expect(result.preco).toBe(150);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should throw error for non-existent product', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));

      await expect(ProductService.update('999', { nome: 'Test' })).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const mockProducts = [
        {
          id: '1',
          nome: 'Product to Delete',
          descricao: 'Description',
          preco: 100,
          estoque: 10,
          categoria: 'Test',
          ativo: true,
          lojaId: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProducts));

      await ProductService.delete('1');

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search products by name', async () => {
      const mockProducts = [
        {
          id: '1',
          nome: 'iPhone 15',
          descricao: 'Apple smartphone',
          preco: 1000,
          estoque: 5,
          categoria: 'Eletrônicos',
          ativo: true,
          lojaId: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          nome: 'Samsung Galaxy',
          descricao: 'Android smartphone',
          preco: 800,
          estoque: 3,
          categoria: 'Eletrônicos',
          ativo: true,
          lojaId: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProducts));

      const result = await ProductService.search('iPhone', '1');

      expect(result).toHaveLength(1);
      expect(result[0].nome).toBe('iPhone 15');
    });
  });

  describe('getCategories', () => {
    it('should return list of categories', () => {
      const categories = ProductService.getCategories();
      
      expect(categories).toContain('Eletrônicos');
      expect(categories).toContain('Informática');
      expect(categories).toContain('Moda e Acessórios');
      expect(Array.isArray(categories)).toBe(true);
    });
  });
});
