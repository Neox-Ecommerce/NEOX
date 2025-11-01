// ============================================
// TIPOS RELACIONADOS À AUTENTICAÇÃO
// ============================================

export type UserRole = 'ADMIN' | 'EMPREENDEDOR' | 'CLIENTE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  lojaId?: number;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

