import { apiClient, ApiResponse } from '@/lib/api-client';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string | null;
  is_active: boolean;
  store_id: number;
  created_at: string;
  updated_at?: string | null;
}

export interface ProductCreate {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string | null;
  is_active?: boolean;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  image_url?: string | null;
  is_active?: boolean;
}

export class ProductApiService {
  private static readonly BASE_PATH = '/products';

  static async getProducts(skip = 0, limit = 100): Promise<ApiResponse<Product[]>> {
    return apiClient.get(`${this.BASE_PATH}/?skip=${skip}&limit=${limit}`);
  }

  static async getProduct(id: number): Promise<ApiResponse<Product>> {
    return apiClient.get(`${this.BASE_PATH}/${id}`);
  }

  static async createProduct(productData: ProductCreate): Promise<ApiResponse<Product>> {
    return apiClient.post(`${this.BASE_PATH}/`, productData);
  }

  static async updateProduct(id: number, productData: ProductUpdate): Promise<ApiResponse<Product>> {
    return apiClient.put(`${this.BASE_PATH}/${id}`, productData);
  }

  static async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  static async getProductsByStore(storeId: number): Promise<ApiResponse<Product[]>> {
    return apiClient.get(`${this.BASE_PATH}/store/${storeId}`);
  }
}



