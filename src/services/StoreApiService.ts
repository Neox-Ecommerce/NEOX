import { apiClient, ApiResponse } from '@/lib/api-client';

export interface Store {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  owner_id: number;
  created_at: string;
  updated_at?: string;
}

export interface StoreCreate {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface StoreUpdate {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active?: boolean;
}

export class StoreApiService {
  private static readonly BASE_PATH = '/stores';

  static async getStores(skip = 0, limit = 100): Promise<ApiResponse<Store[]>> {
    return apiClient.get(`${this.BASE_PATH}/?skip=${skip}&limit=${limit}`);
  }

  static async getStore(id: number): Promise<ApiResponse<Store>> {
    return apiClient.get(`${this.BASE_PATH}/${id}`);
  }

  static async getMyStore(): Promise<ApiResponse<Store>> {
    return apiClient.get(`${this.BASE_PATH}/my-store`);
  }

  static async createStore(storeData: StoreCreate): Promise<ApiResponse<Store>> {
    return apiClient.post(`${this.BASE_PATH}/`, storeData);
  }

  static async updateStore(id: number, storeData: StoreUpdate): Promise<ApiResponse<Store>> {
    return apiClient.post(`${this.BASE_PATH}/${id}`, storeData);
  }

  static async deleteStore(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}



