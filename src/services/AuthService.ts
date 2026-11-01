import { api, tokenStore } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'EMPREENDEDOR' | 'CLIENTE' | 'ADMIN';
  phone?: string;
  avatar?: string;
  lojaId?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface StoreRegisterData extends RegisterData {
  storeName: string;
  cnpj: string;
  companyName: string;
  document: File | null;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

function startSession(res: AuthResponse): User {
  tokenStore.set(res.accessToken);
  return res.user;
}

export const AuthService = {
  async login(email: string, password: string): Promise<User> {
    return startSession(await api<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }));
  },

  logout(): void {
    tokenStore.clear();
  },

  /** Usuário da sessão atual (valida o token na API); null se não houver sessão. */
  async getCurrentUser(): Promise<User | null> {
    if (!tokenStore.get()) return null;
    try {
      return await api<User>('/auth/me');
    } catch {
      tokenStore.clear();
      return null;
    }
  },

  async register(data: RegisterData): Promise<User> {
    return startSession(await api<AuthResponse>('/auth/register', { method: 'POST', body: data }));
  },

  async registerStore(data: StoreRegisterData): Promise<User> {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') form.append(k, v as string | Blob);
    });
    return startSession(await api<AuthResponse>('/auth/register-store', { method: 'POST', body: form }));
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return api<User>('/auth/me', { method: 'PUT', body: data });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
  },
};
