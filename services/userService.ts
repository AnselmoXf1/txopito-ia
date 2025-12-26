// Sistema de gestão de utilizadores simplificado
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'creator' | 'admin' | 'user';
  preferences: UserPreferences;
  createdAt: number;
  lastActive: number;
  usage: UsageStats;
  status: 'active' | 'suspended';
}

export interface UserPreferences {
  language: 'Portuguese' | 'Simple Portuguese';
  responseLength: 'short' | 'detailed';
  theme: 'light' | 'dark';
  favoriteMode: string;
  notifications: boolean;
  aiPersonality: 'formal' | 'casual' | 'technical';
}

export interface UsageStats {
  totalMessages: number;
  messagesThisMonth: number;
  favoriteTopics: string[];
  timeSpent: number; // em minutos
}

export class UserService {
  private static readonly USERS_KEY = 'txopito_users';
  private static readonly CURRENT_USER_KEY = 'txopito_current_user';
  
  // Inicializar sistema limpo
  static initializeCleanSystem(): void {
    // Limpar todos os dados existentes
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    
    // Criar apenas conta admin
    const adminUser: UserProfile = {
      id: 'admin_001',
      name: 'Administrador',
      email: 'admin@txopito.mz',
      role: 'admin',
      preferences: {
        language: 'Portuguese',
        responseLength: 'detailed',
        theme: 'light',
        favoriteMode: 'general',
        notifications: true,
        aiPersonality: 'technical'
      },
      createdAt: Date.now(),
      lastActive: Date.now(),
      usage: {
        totalMessages: 0,
        messagesThisMonth: 0,
        favoriteTopics: [],
        timeSpent: 0
      },
      status: 'active'
    };
    
    localStorage.setItem(this.USERS_KEY, JSON.stringify([adminUser]));
  }
  
  // Obter todos os utilizadores
  static getAllUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      const users = stored ? JSON.parse(stored) : [];
      
      // Se não há utilizadores, inicializar sistema
      if (users.length === 0) {
        this.initializeCleanSystem();
        return this.getAllUsers();
      }
      
      return users;
    } catch {
      this.initializeCleanSystem();
      return this.getAllUsers();
    }
  }
  
  // Obter utilizador atual
  static getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(this.CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  
  // Registar novo utilizador
  static registerUser(name: string, email: string): UserProfile {
    const users = this.getAllUsers();
    
    // Verificar se já existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Utilizador já existe com este email');
    }
    
    // Determinar role baseado no email/nome
    let role: UserProfile['role'] = 'user';
    if (name.toLowerCase().includes('anselmo') && 
        (name.toLowerCase().includes('bistiro') || name.toLowerCase().includes('gulane'))) {
      role = 'creator';
    }
    
    const newUser: UserProfile = {
      id: Date.now().toString(),
      name,
      email,
      role,
      preferences: {
        language: 'Portuguese',
        responseLength: 'short',
        theme: 'light',
        favoriteMode: 'general',
        notifications: true,
        aiPersonality: role === 'creator' ? 'technical' : 'casual'
      },
      createdAt: Date.now(),
      lastActive: Date.now(),
      usage: {
        totalMessages: 0,
        messagesThisMonth: 0,
        favoriteTopics: [],
        timeSpent: 0
      },
      status: 'active'
    };
    
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    
    return newUser;
  }
  
  // Login de utilizador
  static loginUser(email: string): UserProfile | null {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (user && user.status === 'active') {
      user.lastActive = Date.now();
      this.updateUser(user);
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    
    return null;
  }
  
  // Logout
  static logoutUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }
  
  // Atualizar utilizador
  static updateUser(updatedUser: UserProfile): void {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      
      // Atualizar utilizador atual se for o mesmo
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === updatedUser.id) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }
    }
  }
  
  // Apagar utilizador
  static deleteUser(userId: string): void {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers));
    
    // Se for o utilizador atual, fazer logout
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.logoutUser();
    }
  }
  
  // Incrementar estatísticas de uso
  static incrementUsage(userId: string, topic?: string): void {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      user.usage.totalMessages++;
      user.usage.messagesThisMonth++;
      
      if (topic && !user.usage.favoriteTopics.includes(topic)) {
        user.usage.favoriteTopics.push(topic);
      }
      
      this.updateUser(user);
    }
  }
  
  // Sistema simplificado - sem limites de uso
  static checkUsageLimits(user: UserProfile): { canUse: boolean; reason?: string } {
    if (user.status === 'suspended') {
      return { 
        canUse: false, 
        reason: 'Conta suspensa. Contacta o administrador.' 
      };
    }
    
    return { canUse: true };
  }
  
  // Todos os utilizadores têm acesso a todas as funcionalidades
  static getAvailableFeatures(user: UserProfile): string[] {
    return ['Conversa Geral', 'História de Moçambique', 'Contador de Histórias', 'Modo Estudante', 'Programação'];
  }
}