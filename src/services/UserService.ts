import { AuthService, type User } from '@/services/AuthService';

// Dados da conta vêm de /auth/me (mesma fonte do AuthContext); prefira useAuth() nas páginas.
export const UserService = {
  getProfile: async (): Promise<User> => {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('Sessão expirada');
    return user;
  },
  updateProfile: (data: Partial<User>): Promise<User> => AuthService.updateProfile(data),
  changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    AuthService.changePassword(currentPassword, newPassword),
};
