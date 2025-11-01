import { apiClient, ApiError } from '@/lib/api-client';
import { AuthApiService, LoginRequest, RegisterRequest, UserProfile } from './AuthApiService';

type UserRole = 'EMPREENDEDOR' | 'CLIENTE' | 'ADMIN' | 'ADMINISTRADOR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
  lojaId?: number | null;
}

const USER_STORAGE_KEY = 'neox_user';
const ACCESS_TOKEN_KEY = 'neox_token';
const REFRESH_TOKEN_KEY = 'neox_refresh_token';

function mapUserProfileToUser(profile: UserProfile, lojaId: number | null): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role as UserRole,
    phone: profile.phone ?? null,
    avatarUrl: profile.avatar_url ?? null,
    lojaId,
  };
}

async function fetchStoreId(): Promise<number | null> {
  try {
    const response = await apiClient.get<{ id: number }>(`/stores/my-store`);
    return response.data?.id ?? null;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      return null;
    }
    throw error;
  }
}

export class AuthService {
  private static storeTokens(accessToken: string, refreshToken?: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  private static clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private static saveUser(user: User) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  private static parseStoredUser(): User | null {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as User;
      return parsed;
    } catch (error) {
      console.error('Erro ao parsear usuário armazenado:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }

  private static async fetchAndPersistCurrentUser(): Promise<User> {
    const { data: profile } = await AuthApiService.getCurrentUser();
    const lojaId = await fetchStoreId();
    const user = mapUserProfileToUser(profile, lojaId);
    this.saveUser(user);
    return user;
  }

  static getCurrentUser(): User | null {
    return this.parseStoredUser();
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static async login(email: string, password: string): Promise<User> {
    const payload: LoginRequest = { email, password };
    const { data } = await AuthApiService.login(payload);
    this.storeTokens(data.access_token, data.refresh_token);
    return this.fetchAndPersistCurrentUser();
  }

  static logout(): void {
    this.clearTokens();
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  static async register(userData: RegisterRequest): Promise<User> {
    await AuthApiService.register(userData);
    return this.login(userData.email, userData.password);
  }

  static async refreshSession(): Promise<User | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const { data } = await AuthApiService.refreshToken(refreshToken);
      this.storeTokens(data.access_token, data.refresh_token);
      return this.fetchAndPersistCurrentUser();
    } catch (error) {
      console.error('Falha ao renovar sessão:', error);
      this.logout();
      return null;
    }
  }

  static async syncUser(): Promise<User | null> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return null;
    }

    try {
      return await this.fetchAndPersistCurrentUser();
    } catch (error) {
      console.error('Erro ao sincronizar usuário:', error);
      return null;
    }
  }
}