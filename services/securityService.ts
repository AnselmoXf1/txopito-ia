export class SecurityService {
  private static readonly ATTEMPTS_KEY = 'txopito_admin_attempts';
  private static readonly BLOCKED_KEY = 'txopito_admin_blocked';
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly BLOCK_DURATION = 30 * 60 * 1000; // 30 minutos

  // Registrar tentativa de acesso inválido
  static registerInvalidAttempt(): void {
    const attempts = this.getAttempts();
    const newAttempts = {
      count: attempts.count + 1,
      lastAttempt: Date.now(),
      ips: [...attempts.ips, this.getCurrentIP()]
    };

    localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(newAttempts));

    // Bloquear se exceder tentativas
    if (newAttempts.count >= this.MAX_ATTEMPTS) {
      this.blockAccess();
    }

    console.warn(`🚨 Tentativa de acesso inválido registrada (${newAttempts.count}/${this.MAX_ATTEMPTS})`);
  }

  // Verificar se acesso está bloqueado
  static isBlocked(): boolean {
    const blocked = localStorage.getItem(this.BLOCKED_KEY);
    if (!blocked) return false;

    const blockData = JSON.parse(blocked);
    const now = Date.now();

    // Verificar se ainda está no período de bloqueio
    if (now < blockData.until) {
      return true;
    }

    // Remover bloqueio se expirou
    this.clearBlock();
    return false;
  }

  // Bloquear acesso
  private static blockAccess(): void {
    const blockData = {
      blockedAt: Date.now(),
      until: Date.now() + this.BLOCK_DURATION,
      reason: 'Múltiplas tentativas de acesso inválido'
    };

    localStorage.setItem(this.BLOCKED_KEY, JSON.stringify(blockData));
    console.error('🔒 Acesso administrativo bloqueado por 30 minutos');

    // Mostrar notificação se suportado
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Txopito IA - Segurança', {
        body: 'Acesso administrativo bloqueado por tentativas inválidas',
        icon: '/logo-192x192.png'
      });
    }
  }

  // Obter tentativas atuais
  private static getAttempts(): { count: number; lastAttempt: number; ips: string[] } {
    const stored = localStorage.getItem(this.ATTEMPTS_KEY);
    if (!stored) {
      return { count: 0, lastAttempt: 0, ips: [] };
    }

    const attempts = JSON.parse(stored);
    const now = Date.now();

    // Reset se passou mais de 1 hora desde a última tentativa
    if (now - attempts.lastAttempt > 60 * 60 * 1000) {
      return { count: 0, lastAttempt: 0, ips: [] };
    }

    return attempts;
  }

  // Limpar bloqueio
  static clearBlock(): void {
    localStorage.removeItem(this.BLOCKED_KEY);
    localStorage.removeItem(this.ATTEMPTS_KEY);
  }

  // Obter IP atual (simulado)
  private static getCurrentIP(): string {
    // Em produção, isso viria do servidor
    return 'local-' + Date.now().toString(36);
  }

  // Verificar tempo restante de bloqueio
  static getBlockTimeRemaining(): number {
    const blocked = localStorage.getItem(this.BLOCKED_KEY);
    if (!blocked) return 0;

    const blockData = JSON.parse(blocked);
    const remaining = blockData.until - Date.now();
    return Math.max(0, remaining);
  }

  // Formatar tempo restante
  static formatBlockTime(): string {
    const remaining = this.getBlockTimeRemaining();
    if (remaining === 0) return '';

    const minutes = Math.ceil(remaining / (60 * 1000));
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }

  // Verificar se URL parece ser tentativa de hack
  static isSuspiciousUrl(url: string): boolean {
    const suspiciousPatterns = [
      '/admin',
      '/dashboard',
      '/panel',
      '/control',
      '/manage',
      '/config',
      '/settings',
      '#admin',
      '#dashboard',
      '#panel'
    ];

    return suspiciousPatterns.some(pattern => 
      url.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // Log de segurança
  static logSecurityEvent(event: string, details?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.warn('🔒 Evento de Segurança:', logEntry);

    // Em produção, enviar para servidor de logs
    // fetch('/api/security-log', { method: 'POST', body: JSON.stringify(logEntry) });
  }
}

export const securityService = SecurityService;