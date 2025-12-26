import { AdminService } from './adminService';
import { UserService } from './userService';

export interface ErrorInfo {
  type: 'api' | 'network' | 'auth' | 'quota' | 'validation' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  originalError: string;
  userMessage: string;
  adminMessage: string;
  timestamp: number;
  context?: any;
}

export class ErrorHandlingService {
  private static readonly ERROR_LOG_KEY = 'txopito_error_log';
  private static readonly MAX_LOG_ENTRIES = 100;

  // Processar erro e retornar mensagem apropriada
  static processError(error: Error | string, context?: any): string {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorInfo = this.categorizeError(errorMessage, context);
    
    // Registar erro no log
    this.logError(errorInfo);
    
    // Verificar se é admin
    const isAdmin = AdminService.isAdminLoggedIn();
    const currentUser = UserService.getCurrentUser();
    const isCreator = currentUser?.role === 'creator';
    
    // Retornar mensagem apropriada
    if (isAdmin || isCreator) {
      return errorInfo.adminMessage;
    } else {
      return errorInfo.userMessage;
    }
  }

  // Categorizar erro e criar mensagens
  private static categorizeError(errorMessage: string, context?: any): ErrorInfo {
    const lowerError = errorMessage.toLowerCase();
    const timestamp = Date.now();

    // Erros de API Key
    if (lowerError.includes('api_key_invalid') || lowerError.includes('401') || lowerError.includes('unauthorized')) {
      return {
        type: 'auth',
        severity: 'high',
        originalError: errorMessage,
        userMessage: 'Txopito está com problemas... aguarde 🔧',
        adminMessage: `🔑 Erro de Autenticação: ${errorMessage}\n\nChave API inválida ou expirada. Verifica as chaves no painel administrativo.`,
        timestamp,
        context
      };
    }

    // Erros de Quota
    if (lowerError.includes('quota') || lowerError.includes('429') || lowerError.includes('rate limit')) {
      return {
        type: 'quota',
        severity: 'medium',
        originalError: errorMessage,
        userMessage: 'Txopito está com problemas... aguarde ⏰',
        adminMessage: `⏰ Erro de Quota: ${errorMessage}\n\nQuota da API excedida. O sistema está tentando usar chaves alternativas.`,
        timestamp,
        context
      };
    }

    // Erros de Rede
    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
      return {
        type: 'network',
        severity: 'medium',
        originalError: errorMessage,
        userMessage: 'Txopito está com problemas... aguarde 🌐',
        adminMessage: `🌐 Erro de Rede: ${errorMessage}\n\nProblema de conectividade. Verifica a ligação à internet.`,
        timestamp,
        context
      };
    }

    // Erros de Configuração
    if (lowerError.includes('nenhuma chave') || lowerError.includes('no api key') || lowerError.includes('todas as chaves')) {
      return {
        type: 'api',
        severity: 'critical',
        originalError: errorMessage,
        userMessage: 'Txopito está com problemas... aguarde 🔧',
        adminMessage: `🔧 Erro de Configuração: ${errorMessage}\n\nNenhuma chave API válida disponível. Adiciona chaves no painel administrativo.`,
        timestamp,
        context
      };
    }

    // Erros de Segurança
    if (lowerError.includes('safety') || lowerError.includes('blocked') || lowerError.includes('content policy')) {
      return {
        type: 'validation',
        severity: 'low',
        originalError: errorMessage,
        userMessage: 'Essa mensagem não pode ser processada. Tenta reformular de forma mais apropriada 🛡️',
        adminMessage: `🛡️ Erro de Segurança: ${errorMessage}\n\nConteúdo bloqueado pelas políticas de segurança da API.`,
        timestamp,
        context
      };
    }

    // Erros de Timeout
    if (lowerError.includes('timeout') || lowerError.includes('time limit')) {
      return {
        type: 'system',
        severity: 'low',
        originalError: errorMessage,
        userMessage: 'Txopito está com problemas... aguarde ⏱️',
        adminMessage: `⏱️ Erro de Timeout: ${errorMessage}\n\nTempo limite excedido na comunicação com a API.`,
        timestamp,
        context
      };
    }

    // Erros de Stack Overflow (como mencionado pelo utilizador)
    if (lowerError.includes('maximum call stack') || lowerError.includes('stack overflow')) {
      return {
        type: 'system',
        severity: 'high',
        originalError: errorMessage,
        userMessage: 'Txopito está com problemas... aguarde 💥',
        adminMessage: `💥 Erro Técnico: ${errorMessage}\n\nProblema de recursão infinita ou stack overflow. Verifica a lógica do código.`,
        timestamp,
        context
      };
    }

    // Erro genérico
    return {
      type: 'system',
      severity: 'medium',
      originalError: errorMessage,
      userMessage: 'Txopito está com problemas... aguarde 🤖',
      adminMessage: `🤖 Erro do Sistema: ${errorMessage}\n\nErro não categorizado. Verifica os logs para mais detalhes.`,
      timestamp,
      context
    };
  }

  // Registar erro no log
  private static logError(errorInfo: ErrorInfo): void {
    try {
      const existingLog = this.getErrorLog();
      existingLog.unshift(errorInfo); // Adicionar no início
      
      // Manter apenas os últimos MAX_LOG_ENTRIES
      if (existingLog.length > this.MAX_LOG_ENTRIES) {
        existingLog.splice(this.MAX_LOG_ENTRIES);
      }
      
      localStorage.setItem(this.ERROR_LOG_KEY, JSON.stringify(existingLog));
    } catch (logError) {
      console.error('Falha ao registar erro:', logError);
    }
  }

  // Obter log de erros (apenas para admins)
  static getErrorLog(): ErrorInfo[] {
    try {
      const stored = localStorage.getItem(this.ERROR_LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Limpar log de erros
  static clearErrorLog(): void {
    localStorage.removeItem(this.ERROR_LOG_KEY);
  }

  // Obter estatísticas de erros
  static getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    last24Hours: number;
  } {
    const log = this.getErrorLog();
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const stats = {
      total: log.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      last24Hours: 0
    };
    
    log.forEach(error => {
      // Contar por tipo
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      
      // Contar por severidade
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      
      // Contar últimas 24 horas
      if (error.timestamp > last24Hours) {
        stats.last24Hours++;
      }
    });
    
    return stats;
  }

  // Verificar se há muitos erros recentes (alerta para admins)
  static hasHighErrorRate(): boolean {
    const stats = this.getErrorStats();
    return stats.last24Hours > 10; // Mais de 10 erros nas últimas 24h
  }

  // Obter mensagem de status do sistema
  static getSystemStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    message: string;
  } {
    const stats = this.getErrorStats();
    
    if (stats.last24Hours === 0) {
      return {
        status: 'healthy',
        message: 'Sistema funcionando normalmente'
      };
    }
    
    if (stats.last24Hours < 5) {
      return {
        status: 'healthy',
        message: `${stats.last24Hours} erro(s) nas últimas 24h - Normal`
      };
    }
    
    if (stats.last24Hours < 10) {
      return {
        status: 'warning',
        message: `${stats.last24Hours} erros nas últimas 24h - Atenção`
      };
    }
    
    return {
      status: 'critical',
      message: `${stats.last24Hours} erros nas últimas 24h - Crítico`
    };
  }
}