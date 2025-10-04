export interface User {
  id: string;
  name: string;
  email: string;
  role: 'EMPREENDEDOR' | 'CLIENTE' | 'ADMIN';
  phone?: string;
  avatar?: string;
  lojaId?: string;
}

export class AuthService {
  private static STORAGE_KEY = 'neox_user';
  private static USERS_KEY = 'neox_users';

  private static getUsers(): User[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Seed inicial
    const seedUsers: User[] = [
      {
        id: '1',
        name: 'Administrador',
        email: 'admin@neox.com',
        role: 'ADMIN',
        phone: '(11) 99999-0001'
      },
      {
        id: '2',
        name: 'João Silva',
        email: 'lojista@neox.com',
        role: 'EMPREENDEDOR',
        phone: '(11) 99999-0002',
        lojaId: '1'
      },
      {
        id: '3',
        name: 'Maria Santos',
        email: 'cliente@neox.com',
        role: 'CLIENTE',
        phone: '(11) 99999-0003'
      }
    ];
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }

  static async login(email: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    // Senha de teste diferente para admin e outros usuários
    const correctPassword = user?.role === 'ADMIN' ? 'admin' : '123456';

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (password !== correctPassword) {
      throw new Error('Credenciais inválidas');
    }
    
    // Ensure user has a role property
    const userWithRole: User = {
      ...user,
      role: user.role || 'CLIENTE' // Default to CLIENTE if no role
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userWithRole));
    return userWithRole;
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    const user = JSON.parse(stored);
    
    // Ensure user has a role property
    return {
      ...user,
      role: user.role || 'CLIENTE'
    };
  }

  static async register(userData: Omit<User, 'id'>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = this.getUsers();
    const existingUser = users.find(u => u.email === userData.email);
    
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }
    
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      role: userData.role || 'CLIENTE' // Ensure role is set
    };
    
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newUser));
    
    return newUser;
  }

  static async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      throw new Error('Usuário não encontrado');
    }
    
    users[index] = { 
      ...users[index], 
      ...data,
      role: data.role || users[index].role || 'CLIENTE' // Ensure role is preserved
    };
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    
    // Atualizar usuário logado se for o mesmo
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users[index]));
    }
    
    return users[index];
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = this.getUsers().find(u => u.id === userId);
    const correctPassword = user?.role === 'ADMIN' ? 'admin' : '123456';

    if (currentPassword !== correctPassword) {
      throw new Error('Senha atual incorreta');
    }
    
    // Em uma implementação real, aqui salvaria a nova senha hasheada
    console.log('Senha alterada com sucesso');
  }
}