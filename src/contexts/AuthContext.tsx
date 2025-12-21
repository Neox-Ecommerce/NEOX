import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, User, RegisterData } from '@/services/AuthService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<User>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const currentUser = AuthService.getCurrentUser();
      // Garantir que o ID seja string
      if (currentUser && typeof currentUser.id !== 'string') {
        currentUser.id = String(currentUser.id);
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
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

  const register = async (userData: RegisterData): Promise<User> => {
    const newUser = await AuthService.register(userData);
    setUser(newUser);
    return newUser;
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = await AuthService.updateProfile(user.id, data);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      register,
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