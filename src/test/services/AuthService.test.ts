import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '@/services/AuthService';
import { AuthApiService } from '@/services/AuthApiService';
import { apiClient } from '@/lib/api-client';

vi.mock('@/services/AuthApiService', () => ({
  AuthApiService: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

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
  const apiClientGetSpy = vi.spyOn(apiClient, 'get');

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    apiClientGetSpy.mockReset();
  });

  describe('login', () => {
    it('should authenticate and store user data', async () => {
      (AuthApiService.login as vi.Mock).mockResolvedValue({
        data: { access_token: 'access', refresh_token: 'refresh', token_type: 'bearer' },
        success: true,
      });

      (AuthApiService.getCurrentUser as vi.Mock).mockResolvedValue({
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'CLIENTE',
          phone: null,
          is_active: true,
          avatar_url: null,
          created_at: '2024-01-01T00:00:00Z',
        },
        success: true,
      });

      apiClientGetSpy.mockResolvedValue({
        data: { id: 10 },
        success: true,
      });

      const user = await AuthService.login('test@example.com', 'password');

      expect(AuthApiService.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
      expect(AuthApiService.getCurrentUser).toHaveBeenCalled();
      expect(apiClientGetSpy).toHaveBeenCalledWith('/stores/my-store');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('neox_token', 'access');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('neox_refresh_token', 'refresh');
      expect(user).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENTE',
        phone: null,
        avatarUrl: null,
        lojaId: 10,
      });
    });

    it('should throw when API rejects', async () => {
      (AuthApiService.login as vi.Mock).mockRejectedValue(new Error('Invalid credentials'));

      await expect(AuthService.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('clears stored session', () => {
      AuthService.logout();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('neox_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('neox_refresh_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('neox_user');
    });
  });

  describe('getCurrentUser', () => {
    it('returns parsed user when stored', () => {
      const storedUser = {
        id: 1,
        name: 'Stored User',
        email: 'stored@example.com',
        role: 'CLIENTE',
        phone: null,
        avatarUrl: null,
        lojaId: null,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedUser));

      const result = AuthService.getCurrentUser();
      expect(result).toEqual(storedUser);
    });

    it('returns null when storage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const result = AuthService.getCurrentUser();
      expect(result).toBeNull();
    });
  });
});
