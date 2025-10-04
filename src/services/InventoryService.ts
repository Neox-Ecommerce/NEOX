export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  averageCost: number;
  lastUpdated: Date;
  location?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  cost?: number;
  date: string;
  userId: string;
  reference?: string;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  type: 'low_stock' | 'out_of_stock' | 'critical';
  message: string;
  createdAt: Date;
}

export interface AdjustmentData {
  productId: string;
  type: 'add' | 'remove';
  quantity: number;
  reason: string;
  cost?: number;
}

export class InventoryService {
  private static INVENTORY_KEY = 'neox_inventory';
  private static MOVEMENTS_KEY = 'neox_inventory_movements';

  private static getStoredInventory(): InventoryItem[] {
    const stored = localStorage.getItem(this.INVENTORY_KEY);
    if (stored) {
      return JSON.parse(stored).map((item: any) => ({
        ...item,
        lastUpdated: new Date(item.lastUpdated)
      }));
    }
    
    // Seed inicial
    const seedInventory: InventoryItem[] = [
      {
        id: '1',
        productId: '1',
        productName: 'iPhone 15 Pro Max',
        sku: 'IPH15PM-256-TIT',
        category: 'Eletrônicos',
        currentStock: 15,
        minStock: 5,
        maxStock: 50,
        averageCost: 7500.00,
        lastUpdated: new Date(),
        location: 'A1-B2'
      },
      {
        id: '2',
        productId: '2',
        productName: 'MacBook Pro 14" M3',
        sku: 'MBP14-M3-512-SG',
        category: 'Informática',
        currentStock: 8,
        minStock: 3,
        maxStock: 20,
        averageCost: 11500.00,
        lastUpdated: new Date(),
        location: 'A2-B1'
      },
      {
        id: '3',
        productId: '3',
        productName: 'AirPods Pro (3ª geração)',
        sku: 'APP3-WHT-USB',
        category: 'Eletrônicos',
        currentStock: 0,
        minStock: 10,
        maxStock: 100,
        averageCost: 1600.00,
        lastUpdated: new Date(),
        location: 'B1-C3'
      },
      {
        id: '4',
        productId: '4',
        productName: 'Samsung Galaxy S24 Ultra',
        sku: 'GS24U-512-BLK',
        category: 'Eletrônicos',
        currentStock: 3,
        minStock: 5,
        maxStock: 30,
        averageCost: 6800.00,
        lastUpdated: new Date(),
        location: 'A1-C2'
      }
    ];
    
    this.saveInventory(seedInventory);
    return seedInventory;
  }

  private static saveInventory(inventory: InventoryItem[]): void {
    localStorage.setItem(this.INVENTORY_KEY, JSON.stringify(inventory));
  }

  private static getStoredMovements(): InventoryMovement[] {
    const stored = localStorage.getItem(this.MOVEMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Seed inicial
    const seedMovements: InventoryMovement[] = [
      {
        id: '1',
        productId: '1',
        productName: 'iPhone 15 Pro Max',
        type: 'in',
        quantity: 10,
        reason: 'Compra de estoque',
        cost: 7500.00,
        date: '2024-01-20',
        userId: '1',
        reference: 'NF-001234'
      },
      {
        id: '2',
        productId: '3',
        productName: 'AirPods Pro (3ª geração)',
        type: 'out',
        quantity: 5,
        reason: 'Venda online',
        date: '2024-01-19',
        userId: '1',
        reference: 'PED-001235'
      },
      {
        id: '3',
        productId: '2',
        productName: 'MacBook Pro 14" M3',
        type: 'in',
        quantity: 5,
        reason: 'Reposição de estoque',
        cost: 11500.00,
        date: '2024-01-18',
        userId: '1',
        reference: 'NF-001236'
      }
    ];
    
    this.saveMovements(seedMovements);
    return seedMovements;
  }

  private static saveMovements(movements: InventoryMovement[]): void {
    localStorage.setItem(this.MOVEMENTS_KEY, JSON.stringify(movements));
  }

  static async getInventory(lojaId: string): Promise<InventoryItem[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.getStoredInventory().filter(item => item.productId); // Mock filter by store
  }

  static async getMovements(lojaId: string): Promise<InventoryMovement[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.getStoredMovements().slice(0, 10); // Return recent movements
  }

  static async getAlerts(lojaId: string): Promise<InventoryAlert[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const inventory = this.getStoredInventory();
    const alerts: InventoryAlert[] = [];
    
    inventory.forEach(item => {
      if (item.currentStock === 0) {
        alerts.push({
          id: `alert-${item.id}-out`,
          productId: item.productId,
          productName: item.productName,
          type: 'out_of_stock',
          message: 'Produto esgotado - reposição urgente necessária',
          createdAt: new Date()
        });
      } else if (item.currentStock <= item.minStock) {
        alerts.push({
          id: `alert-${item.id}-low`,
          productId: item.productId,
          productName: item.productName,
          type: item.currentStock <= Math.floor(item.minStock / 2) ? 'critical' : 'low_stock',
          message: `Estoque baixo - apenas ${item.currentStock} unidades restantes`,
          createdAt: new Date()
        });
      }
    });
    
    return alerts;
  }

  static async adjustInventory(data: AdjustmentData): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const inventory = this.getStoredInventory();
    const movements = this.getStoredMovements();
    
    // Update inventory
    const itemIndex = inventory.findIndex(item => item.productId === data.productId);
    if (itemIndex !== -1) {
      const item = inventory[itemIndex];
      
      if (data.type === 'add') {
        item.currentStock += data.quantity;
        // Update average cost if provided
        if (data.cost) {
          const totalValue = (item.currentStock - data.quantity) * item.averageCost + data.quantity * data.cost;
          item.averageCost = totalValue / item.currentStock;
        }
      } else {
        item.currentStock = Math.max(0, item.currentStock - data.quantity);
      }
      
      item.lastUpdated = new Date();
      inventory[itemIndex] = item;
    }
    
    // Add movement record
    const newMovement: InventoryMovement = {
      id: Date.now().toString(),
      productId: data.productId,
      productName: inventory.find(item => item.productId === data.productId)?.productName || '',
      type: data.type === 'add' ? 'in' : 'out',
      quantity: data.quantity,
      reason: data.reason,
      cost: data.cost,
      date: new Date().toISOString().split('T')[0],
      userId: '1', // Current user
      reference: `ADJ-${Date.now()}`
    };
    
    movements.unshift(newMovement);
    
    this.saveInventory(inventory);
    this.saveMovements(movements);
  }

  static async updateMinStock(productId: string, minStock: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const inventory = this.getStoredInventory();
    const itemIndex = inventory.findIndex(item => item.productId === productId);
    
    if (itemIndex !== -1) {
      inventory[itemIndex].minStock = minStock;
      inventory[itemIndex].lastUpdated = new Date();
      this.saveInventory(inventory);
    }
  }

  static async exportInventory(lojaId: string): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const inventory = this.getStoredInventory();
    const csvContent = [
      'Produto,SKU,Categoria,Estoque Atual,Estoque Mínimo,Custo Médio,Valor Total,Localização',
      ...inventory.map(item => 
        `"${item.productName}","${item.sku || ''}","${item.category}",${item.currentStock},${item.minStock},${item.averageCost.toFixed(2)},${(item.currentStock * item.averageCost).toFixed(2)},"${item.location || ''}"`
      )
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}