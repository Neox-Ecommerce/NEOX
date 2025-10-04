export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem?: string;
  categoria: string;
  ativo: boolean;
  peso?: number;
  dimensoes?: string;
  marca?: string;
  sku?: string;
  desconto?: number;
  lojaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem?: string;
  categoria: string;
  ativo: boolean;
  peso?: number;
  dimensoes?: string;
  marca?: string;
  sku?: string;
  desconto?: number;
}

export class ProductService {
  private static STORAGE_KEY = 'neox_products';

  private static getProducts(): Product[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }));
    }
    
    // Seed inicial
    const seedProducts: Product[] = [
      {
        id: '1',
        nome: 'iPhone 15 Pro Max',
        descricao: 'O iPhone 15 Pro Max representa o ápice da tecnologia móvel da Apple. Com seu design em titânio premium, tela Super Retina XDR de 6,7 polegadas e o revolucionário chip A17 Pro, oferece desempenho incomparável.',
        preco: 8999.99,
        estoque: 15,
        imagem: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800',
        categoria: 'Eletrônicos',
        ativo: true,
        peso: 0.221,
        dimensoes: '15.9 x 7.7 x 0.83 cm',
        marca: 'Apple',
        sku: 'IPH15PM-256-TIT',
        desconto: 5,
        lojaId: '1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        nome: 'MacBook Pro 14" M3',
        descricao: 'O MacBook Pro de 14 polegadas com chip M3 redefine o que é possível em um notebook. Com arquitetura de 3 nanômetros, oferece até 22 horas de bateria e desempenho excepcional.',
        preco: 12999.90,
        estoque: 8,
        imagem: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=800',
        categoria: 'Informática',
        ativo: true,
        peso: 1.55,
        dimensoes: '31.26 x 22.12 x 1.55 cm',
        marca: 'Apple',
        sku: 'MBP14-M3-512-SG',
        desconto: 8,
        lojaId: '1',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '3',
        nome: 'AirPods Pro (3ª geração)',
        descricao: 'Os AirPods Pro de 3ª geração elevam a experiência de áudio sem fio a um novo patamar. Com cancelamento ativo de ruído adaptativo.',
        preco: 1899.99,
        estoque: 0,
        imagem: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
        categoria: 'Eletrônicos',
        ativo: true,
        peso: 0.0056,
        dimensoes: '3.05 x 2.18 x 2.4 cm',
        marca: 'Apple',
        sku: 'APP3-WHT-USB',
        desconto: 10,
        lojaId: '1',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08')
      },
      {
        id: '4',
        nome: 'Samsung Galaxy S24 Ultra',
        descricao: 'O Galaxy S24 Ultra representa o futuro dos smartphones Android. Com tela Dynamic AMOLED 2X de 6,8 polegadas.',
        preco: 7499.99,
        estoque: 3,
        imagem: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800',
        categoria: 'Eletrônicos',
        ativo: false,
        peso: 0.232,
        dimensoes: '16.26 x 7.9 x 0.86 cm',
        marca: 'Samsung',
        sku: 'GS24U-512-BLK',
        desconto: 12,
        lojaId: '1',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05')
      }
    ];
    
    this.saveProducts(seedProducts);
    return seedProducts;
  }

  private static saveProducts(products: Product[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
  }

  static async getMyProducts(lojaId: string = '1'): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.getProducts()
      .filter(p => p.lojaId === lojaId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async getById(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getProducts().find(p => p.id === id) || null;
  }

  static async create(data: CreateProductData, lojaId: string = '1'): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const products = this.getProducts();
    const newProduct: Product = {
      ...data,
      id: Date.now().toString(),
      lojaId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  static async update(id: string, data: Partial<CreateProductData>): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Produto não encontrado');
    }
    
    products[index] = {
      ...products[index],
      ...data,
      updatedAt: new Date()
    };
    
    this.saveProducts(products);
    return products[index];
  }

  static async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
  }

  static async deleteMany(ids: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const products = this.getProducts();
    const filtered = products.filter(p => !ids.includes(p.id));
    this.saveProducts(filtered);
  }

  static async toggleStatus(id: string): Promise<Product> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Produto não encontrado');
    }
    
    products[index] = {
      ...products[index],
      ativo: !products[index].ativo,
      updatedAt: new Date()
    };
    
    this.saveProducts(products);
    return products[index];
  }

  static async toggleManyStatus(ids: string[], status: boolean): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const products = this.getProducts();
    
    ids.forEach(id => {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = {
          ...products[index],
          ativo: status,
          updatedAt: new Date()
        };
      }
    });
    
    this.saveProducts(products);
  }

  static async search(query: string, lojaId: string = '1'): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const searchTerm = query.toLowerCase();
    return this.getProducts()
      .filter(product => product.lojaId === lojaId)
      .filter(product => 
        product.nome.toLowerCase().includes(searchTerm) ||
        product.descricao.toLowerCase().includes(searchTerm) ||
        product.categoria.toLowerCase().includes(searchTerm) ||
        product.marca?.toLowerCase().includes(searchTerm) ||
        product.sku?.toLowerCase().includes(searchTerm)
      );
  }

  static async getByCategory(category: string, lojaId: string = '1'): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.getProducts()
      .filter(product => product.lojaId === lojaId && product.categoria === category);
  }

  static getCategories(): string[] {
    return [
      'Eletrônicos',
      'Informática',
      'Moda e Acessórios',
      'Casa e Jardim',
      'Esportes e Lazer',
      'Livros e Papelaria',
      'Alimentação',
      'Saúde e Beleza',
      'Automotivo',
      'Brinquedos',
      'Móveis',
      'Outros'
    ];
  }

  static getCategoryCounts(lojaId: string = '1'): Record<string, number> {
    const products = this.getProducts().filter(p => p.lojaId === lojaId);
    const counts: Record<string, number> = {};
    
    this.getCategories().forEach(category => {
      counts[category] = products.filter(p => p.categoria === category).length;
    });
    
    return counts;
  }

  static getProductStats(lojaId: string = '1'): {
    total: number;
    ativo: number;
    inativo: number;
    estoqueBaixo: number;
    esgotado: number;
  } {
    const products = this.getProducts().filter(p => p.lojaId === lojaId);
    
    return {
      total: products.length,
      ativo: products.filter(p => p.ativo).length,
      inativo: products.filter(p => !p.ativo).length,
      estoqueBaixo: products.filter(p => p.estoque > 0 && p.estoque <= 5).length,
      esgotado: products.filter(p => p.estoque === 0).length
    };
  }
}