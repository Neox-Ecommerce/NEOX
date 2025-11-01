import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, User } from '@/services/AuthService';
import { RegisterRequest } from '@/services/AuthApiService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterRequest) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = AuthService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          const synced = await AuthService.syncUser();
          if (synced) {
            setUser(synced);
            return;
          }
        } else {
          const refreshed = await AuthService.refreshSession();
          if (refreshed) {
            setUser(refreshed);
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      const loggedUser = await AuthService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<User> => {
    try {
      setIsLoading(true);
      const registeredUser = await AuthService.register(userData);
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}