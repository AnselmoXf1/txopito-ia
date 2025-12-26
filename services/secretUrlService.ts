import { securityService } from './securityService';

export class SecretUrlService {
  private static readonly STORAGE_KEY = 'txopito_secret_admin_url';
  private static readonly URL_EXPIRY_KEY = 'txopito_secret_url_expiry';
  private static readonly URL_LIFETIME = 10 * 60 * 1000; // 10 minutos

  // Gerar nova URL secreta
  static generateSecretUrl(): string {
    const randomPart = this.generateRandomString(16);
    const timestamp = Date.now().toString(36);
    const secretUrl = `/admin-${randomPart}-${timestamp}`;
    
    // Salvar URL e tempo de expiração
    localStorage.setItem(this.STORAGE_KEY, secretUrl);
    localStorage.setItem(this.URL_EXPIRY_KEY, (Date.now() + this.URL_LIFETIME).toString());
    
    console.log('🔐 Nova URL secreta gerada:', secretUrl);
    console.log('🔐 Válida por 10 minutos até:', new Date(Date.now() + this.URL_LIFETIME).toLocaleTimeString());
    return secretUrl;
  }

  // Obter URL secreta atual (se válida)
  static getCurrentSecretUrl(): string | null {
    const url = localStorage.getItem(this.STORAGE_KEY);
    const expiry = localStorage.getItem(this.URL_EXPIRY_KEY);
    
    console.log('🔍 getCurrentSecretUrl: url =', url);
    console.log('🔍 getCurrentSecretUrl: expiry =', expiry);
    
    if (!url || !expiry) {
      console.log('🔍 getCurrentSecretUrl: URL ou expiry não encontrados');
      return null;
    }
    
    // Verificar se ainda é válida
    const now = Date.now();
    const expiryTime = parseInt(expiry);
    console.log('🔍 getCurrentSecretUrl: now =', now, 'expiry =', expiryTime);
    
    if (now > expiryTime) {
      console.log('🔍 getCurrentSecretUrl: URL expirada, limpando...');
      this.clearSecretUrl();
      return null;
    }
    
    console.log('🔍 getCurrentSecretUrl: URL válida =', url);
    return url;
  }

  // Verificar se URL é válida
  static isValidSecretUrl(url: string): boolean {
    const currentUrl = this.getCurrentSecretUrl();
    return currentUrl === url;
  }

  // Limpar URL secreta
  static clearSecretUrl(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.URL_EXPIRY_KEY);
  }

  // Gerar string aleatória
  private static generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Verificar se URL atual é tentativa de acesso direto
  static isDirectAdminAccess(): boolean {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    
    // Bloquear acessos diretos conhecidos
    const blockedPaths = ['/admin', '/admin/', '/dashboard', '/panel'];
    const blockedHashes = ['#admin', '#dashboard', '#panel'];
    
    return blockedPaths.includes(currentPath) || blockedHashes.includes(currentHash);
  }

  // Redirecionar para home se acesso inválido
  static redirectIfInvalidAccess(): boolean {
    // Verificar se está bloqueado
    if (securityService.isBlocked()) {
      const timeRemaining = securityService.formatBlockTime();
      console.error(`🔒 Acesso bloqueado. Tempo restante: ${timeRemaining}`);
      window.history.replaceState({}, '', '/');
      return true;
    }

    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;

    // Verificar apenas URLs conhecidas como suspeitas (não URLs geradas dinamicamente)
    const suspiciousPaths = ['/admin', '/admin/', '/dashboard', '/panel'];
    const suspiciousHashes = ['#admin', '#dashboard', '#panel'];
    
    const isSuspicious = suspiciousPaths.includes(currentPath) || suspiciousHashes.includes(currentHash);
    
    if (isSuspicious) {
      const currentUrl = this.getCurrentSecretUrl();
      
      // Se não há URL secreta válida, bloquear
      if (!currentUrl) {
        securityService.registerInvalidAttempt();
        securityService.logSecurityEvent('invalid_admin_access', {
          path: currentPath,
          hash: currentHash,
          hasValidUrl: false
        });
        
        console.warn('🚫 Tentativa de acesso direto ao admin bloqueada');
        window.history.replaceState({}, '', '/');
        return true;
      }
    }
    
    return false;
  }
}

export const secretUrlService = SecretUrlService;