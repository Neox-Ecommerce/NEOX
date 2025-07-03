interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export class UserService {
  private static profile: UserProfile = {
    id: '1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    phone: '(11) 99999-9999',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
  };

  static async getProfile(): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...this.profile };
  }

  static async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 800));
    this.profile = { ...this.profile, ...data };
    return { ...this.profile };
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simular validação de senha
    if (currentPassword !== '123456') {
      throw new Error('Senha atual incorreta');
    }
  }
}