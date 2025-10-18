import { AuthApiService, LoginRequest, RegisterRequest } from './AuthApiService';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'EMPREENDEDOR' | 'CLIENTE' | 'ADMIN';
  phone?: string;
  avatar?: string;
  lojaId?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export class AuthService {
  private static STORAGE_KEY = 'neox_user';
  private static TOKEN_KEY = 'neox_token';
  private static REFRESH_TOKEN_KEY = 'neox_refresh_token';

  // Login usando API real
  static async login(email: string, password: string): Promise<User> {
    try {
      const loginRequest: LoginRequest = { email, password };
      const response = await AuthApiService.login(loginRequest);
      
      if (response.success && response.data) {
        const { access_token, refresh_token } = response.data;
        
        // Armazenar tokens
        localStorage.setItem(this.TOKEN_KEY, access_token);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh_token);
        
        // Buscar dados do usuário
        const userResponse = await AuthApiService.getProfile();
        if (userResponse.success && userResponse.data) {
          const user = userResponse.data;
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          return user;
        }
      }
      
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Registro usando API real
  static async register(userData: Omit<User, 'id' | 'created_at'> & { password: string }): Promise<User> {
    try {
      const registerRequest: RegisterRequest = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone
      };
      
      const response = await AuthApiService.register(registerRequest);
      
      if (response.success && response.data) {
        const { access_token, refresh_token } = response.data;
        
        // Armazenar tokens
        localStorage.setItem(this.TOKEN_KEY, access_token);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh_token);
        
        // Buscar dados do usuário
        const userResponse = await AuthApiService.getProfile();
        if (userResponse.success && userResponse.data) {
          const user = userResponse.data;
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          return user;
        }
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await AuthApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpar dados locais independente do resultado da API
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  // Obter usuário atual
  static getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  }

  // Verificar se está logado
  static isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!(user && token);
  }

  // Obter token atual
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Obter refresh token
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Atualizar perfil
  static async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await AuthApiService.updateProfile(updates);
      
      if (response.success && response.data) {
        const updatedUser = response.data;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      throw new Error('Profile update failed');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // Verificar se token está expirado
  static isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    return AuthApiService.isTokenExpired(token);
  }

  // Refresh token
  static async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await AuthApiService.refreshToken({ refreshToken });
      
      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Atualizar tokens
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, newRefreshToken);
        
        return accessToken;
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      // Se falhar, fazer logout
      await this.logout();
      throw error;
    }
  }

  // Verificar se usuário tem permissão
  static hasRole(requiredRole: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  }

  // Verificar se é admin
  static isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  // Verificar se é empreendedor
  static isEntrepreneur(): boolean {
    return this.hasRole('EMPREENDEDOR');
  }

  // Verificar se é cliente
  static isClient(): boolean {
    return this.hasRole('CLIENTE');
  }
}