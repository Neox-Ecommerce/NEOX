import { apiClient, ApiResponse } from '@/lib/api-client';

export interface JWTToken {
  sub: string;
  email: string;
  role: string;
  lojaId?: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    lojaId?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthApiService {
  private static readonly BASE_PATH = '/auth';

  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post(`${this.BASE_PATH}/login`, credentials);
  }

  static async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post(`${this.BASE_PATH}/register`, userData);
  }

  static async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> {
    return apiClient.post(`${this.BASE_PATH}/refresh`, data);
  }

  static async logout(): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.BASE_PATH}/logout`);
  }

  static async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.BASE_PATH}/forgot-password`, { email });
  }

  static async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.BASE_PATH}/reset-password`, { token, newPassword });
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.BASE_PATH}/change-password`, { currentPassword, newPassword });
  }

  static async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.BASE_PATH}/verify-email`, { token });
  }

  static async resendVerificationEmail(): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.BASE_PATH}/resend-verification`);
  }

  static async getProfile(): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.BASE_PATH}/profile`);
  }

  static async updateProfile(data: Partial<any>): Promise<ApiResponse<any>> {
    return apiClient.put(`${this.BASE_PATH}/profile`, data);
  }

  static async deleteAccount(): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE_PATH}/account`);
  }

  // JWT Token utilities
  static parseJWT(token: string): JWTToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const parsed = this.parseJWT(token);
    if (!parsed) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return parsed.exp < now;
  }

  static getTokenExpirationTime(token: string): Date | null {
    const parsed = this.parseJWT(token);
    if (!parsed) return null;
    
    return new Date(parsed.exp * 1000);
  }
}
