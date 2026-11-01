import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, User, RegisterData, StoreRegisterData } from '@/services/AuthService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (data: RegisterData) => Promise<User>;
  registerStore: (data: StoreRegisterData) => Promise<User>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
    // a API respondeu 401 (token expirado ou inválido): encerra a sessão local
    const onUnauthorized = () => setUser(null);
    window.addEventListener('neox:unauthorized', onUnauthorized);
    return () => window.removeEventListener('neox:unauthorized', onUnauthorized);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const loggedUser = await AuthService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const register = async (data: RegisterData): Promise<User> => {
    const newUser = await AuthService.register(data);
    setUser(newUser);
    return newUser;
  };

  const registerStore = async (data: StoreRegisterData): Promise<User> => {
    const newUser = await AuthService.registerStore(data);
    setUser(newUser);
    return newUser;
  };

  const updateProfile = async (data: Partial<User>) => {
    setUser(await AuthService.updateProfile(data));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      register,
      registerStore,
      updateProfile,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
