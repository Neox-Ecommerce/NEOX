import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/AuthService';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'CLIENTE',
        },
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUsers));

      const result = await AuthService.login('test@example.com', '123456');

      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENTE',
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should throw error for invalid credentials', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'CLIENTE',
        },
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUsers));

      await expect(AuthService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw error for non-existent user', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));

      await expect(AuthService.login('nonexistent@example.com', '123456')).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));

      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        role: 'CLIENTE' as const,
      };

      const result = await AuthService.register(userData);

      expect(result.name).toBe('New User');
      expect(result.email).toBe('newuser@example.com');
      expect(result.role).toBe('CLIENTE');
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('should throw error for existing email', async () => {
      const existingUsers = [
        {
          id: '1',
          name: 'Existing User',
          email: 'existing@example.com',
          role: 'CLIENTE',
        },
      ];
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingUsers));

      const userData = {
        name: 'New User',
        email: 'existing@example.com',
        role: 'CLIENTE' as const,
      };

      await expect(AuthService.register(userData)).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('logout', () => {
    it('should remove user from localStorage', () => {
      AuthService.logout();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('neox_user');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from localStorage', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENTE',
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = AuthService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user is stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = AuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });
});
