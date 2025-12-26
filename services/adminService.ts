export interface AdminSession {
  isAdmin: boolean;
  loginTime: number;
  expiresAt: number;
}

export class AdminService {
  private static readonly ADMIN_SESSION_KEY = 'txopito_admin_session';
  
  // Verificar se há uma sessão admin válida
  static isAdminLoggedIn(): boolean {
    try {
      const sessionData = localStorage.getItem(this.ADMIN_SESSION_KEY);
      if (!sessionData) return false;
      
      const session: AdminSession = JSON.parse(sessionData);
      
      // Verificar se a sessão não expirou
      if (Date.now() > session.expiresAt) {
        this.logoutAdmin();
        return false;
      }
      
      return session.isAdmin;
    } catch {
      return false;
    }
  }
  
  // Fazer logout do admin
  static logoutAdmin(): void {
    localStorage.removeItem(this.ADMIN_SESSION_KEY);
  }
  
  // Obter informações da sessão admin
  static getAdminSession(): AdminSession | null {
    try {
      const sessionData = localStorage.getItem(this.ADMIN_SESSION_KEY);
      if (!sessionData) return null;
      
      const session: AdminSession = JSON.parse(sessionData);
      
      // Verificar se a sessão não expirou
      if (Date.now() > session.expiresAt) {
        this.logoutAdmin();
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  }
  
  // Verificar se precisa renovar a sessão (menos de 2 horas restantes)
  static shouldRenewSession(): boolean {
    const session = this.getAdminSession();
    if (!session) return false;
    
    const timeLeft = session.expiresAt - Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    
    return timeLeft < twoHours;
  }
  
  // Renovar sessão admin
  static renewSession(): void {
    const session = this.getAdminSession();
    if (!session) return;
    
    const newSession: AdminSession = {
      ...session,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // Mais 24 horas
    };
    
    localStorage.setItem(this.ADMIN_SESSION_KEY, JSON.stringify(newSession));
  }
}