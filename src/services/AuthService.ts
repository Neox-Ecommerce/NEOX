import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'EMPREENDEDOR' | 'CLIENTE' | 'ADMIN';
  phone?: string;
  avatar?: string;
  lojaId?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'EMPREENDEDOR' | 'CLIENTE' | 'ADMIN';
  lojaId?: string;
}

export class AuthService {
  private static STORAGE_KEY = 'neox_user';
  private static TOKEN_KEY = 'neox_token';

  static async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );

      // Garantir que o ID do usuário seja string
      const user = {
        ...response.user,
        id: String(response.user.id || '')
      };

      // Salvar token e usuário
      apiClient.setToken(response.token);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));

      return user;
    } catch (error: any) {
      const message = error.message || 'Erro ao fazer login. Verifique suas credenciais.';
      throw new Error(message);
    }
  }

  static logout(): void {
    // Tentar fazer logout no backend (não crítico se falhar)
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT).catch(() => {
      // Ignorar erros no logout
    });

    // Limpar dados locais
    apiClient.clearToken();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;

    try {
      const user = JSON.parse(stored);
      return {
        ...user,
        id: String(user.id || ''),
        role: user.role || 'CLIENTE'
      };
    } catch (error) {
      console.error('Erro ao parsear usuário do localStorage:', error);
      // Limpar dados corrompidos
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  static async register(userData: RegisterData): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );

      // Garantir que o ID do usuário seja string
      const user = {
        ...response.user,
        id: String(response.user.id || '')
      };

      // Salvar token e usuário
      apiClient.setToken(response.token);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));

      return user;
    } catch (error: any) {
      const message = error.message || 'Erro ao criar conta. Tente novamente.';
      throw new Error(message);
    }
  }

  static async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    try {
      const updatedUser = await apiClient.put<User>(
        `${API_CONFIG.ENDPOINTS.AUTH.PROFILE}/${userId}`,
        data
      );

      // Atualizar usuário logado se for o mesmo
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
      }

      return updatedUser;
    } catch (error: any) {
      const message = error.message || 'Erro ao atualizar perfil.';
      throw new Error(message);
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
        { userId, currentPassword, newPassword }
      );
    } catch (error: any) {
      const message = error.message || 'Erro ao alterar senha.';
      throw new Error(message);
    }
  }

  static async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post<{ token: string }>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH
      );
      
      apiClient.setToken(response.token);
      return response.token;
    } catch {
      // Se o refresh falhar, fazer logout
      this.logout();
      return null;
    }
  }
}