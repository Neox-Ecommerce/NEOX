import { apiClient, ApiResponse } from '@/lib/api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  is_active: boolean;
  avatar_url?: string | null;
  created_at: string;
}

export class AuthApiService {
  private static readonly BASE_PATH = '/auth';

  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    return apiClient.post(`${this.BASE_PATH}/login`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  static async register(userData: RegisterRequest): Promise<ApiResponse<UserProfile>> {
    return apiClient.post(`${this.BASE_PATH}/register`, userData);
  }

  static async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get(`${this.BASE_PATH}/me`);
  }

  static async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post(`${this.BASE_PATH}/refresh`, { refresh_token: refreshToken });
  }
}
