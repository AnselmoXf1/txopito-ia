import { apiKeyManager } from './apiKeyManager';

interface RotationEvent {
  type: 'rotation' | 'quota_exceeded' | 'key_failed' | 'key_added' | 'key_removed';
  keyId: string;
  keyName: string;
  timestamp: Date;
  details?: string;
}

export class KeyRotationService {
  private static instance: KeyRotationService;
  private events: RotationEvent[] = [];
  private listeners: ((event: RotationEvent) => void)[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): KeyRotationService {
    if (!KeyRotationService.instance) {
      KeyRotationService.instance = new KeyRotationService();
    }
    return KeyRotationService.instance;
  }

  // Iniciar monitorização automática
  private startMonitoring(): void {
    // Verificar status das chaves a cada 5 minutos
    this.monitoringInterval = setInterval(() => {
      this.checkKeysHealth();
    }, 5 * 60 * 1000);

    // Verificação inicial
    setTimeout(() => this.checkKeysHealth(), 1000);
  }

  // Verificar saúde das chaves
  private async checkKeysHealth(): Promise<void> {
    const keys = apiKeyManager.getAllKeys();
    const stats = apiKeyManager.getStats();

    // Alertar se poucas chaves ativas
    if (stats.activeKeys <= 1 && stats.totalKeys > 1) {
      this.notifyLowActiveKeys(stats.activeKeys, stats.totalKeys);
    }

    // Alertar se nenhuma chave ativa
    if (stats.activeKeys === 0) {
      this.notifyNoActiveKeys();
    }

    // Testar chaves periodicamente (apenas algumas para não gastar quota)
    const activeKeys = keys.filter(k => k.isActive && !k.quotaExceeded);
    if (activeKeys.length > 0) {
      // Testar apenas a chave atual
      const currentKey = apiKeyManager.getCurrentKey();
      if (currentKey) {
        try {
          const result = await apiKeyManager.testKey(currentKey.id);
          if (!result.success) {
            this.addEvent({
              type: 'key_failed',
              keyId: currentKey.id,
              keyName: currentKey.name,
              timestamp: new Date(),
              details: result.error
            });
          }
        } catch (error) {
          console.warn('Erro ao testar chave atual:', error);
        }
      }
    }
  }

  // Adicionar evento
  addEvent(event: RotationEvent): void {
    this.events.unshift(event);
    
    // Manter apenas os últimos 100 eventos
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }

    // Notificar listeners
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });

    // Salvar no localStorage
    this.saveEvents();
  }

  // Adicionar listener para eventos
  addListener(listener: (event: RotationEvent) => void): () => void {
    this.listeners.push(listener);
    
    // Retornar função para remover listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Obter eventos recentes
  getRecentEvents(limit: number = 20): RotationEvent[] {
    return this.events.slice(0, limit);
  }

  // Obter estatísticas de rotação
  getRotationStats(): {
    totalRotations: number;
    quotaExceededCount: number;
    keyFailuresCount: number;
    lastRotation: Date | null;
  } {
    const rotations = this.events.filter(e => e.type === 'rotation');
    const quotaExceeded = this.events.filter(e => e.type === 'quota_exceeded');
    const keyFailures = this.events.filter(e => e.type === 'key_failed');
    
    return {
      totalRotations: rotations.length,
      quotaExceededCount: quotaExceeded.length,
      keyFailuresCount: keyFailures.length,
      lastRotation: rotations.length > 0 ? rotations[0].timestamp : null
    };
  }

  // Notificações específicas
  private notifyLowActiveKeys(activeCount: number, totalCount: number): void {
    console.warn(`⚠️ Poucas chaves ativas: ${activeCount}/${totalCount}`);
    
    // Mostrar notificação no browser se suportado
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Txopito IA - Alerta de Chaves', {
        body: `Apenas ${activeCount} de ${totalCount} chaves API estão ativas. Considera adicionar mais chaves.`,
        icon: '/logo-192x192.png'
      });
    }
  }

  private notifyNoActiveKeys(): void {
    console.error('❌ Nenhuma chave API ativa!');
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Txopito IA - Erro Crítico', {
        body: 'Nenhuma chave API está ativa! O sistema não consegue responder.',
        icon: '/logo-192x192.png'
      });
    }
  }

  // Solicitar permissão para notificações
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Salvar eventos no localStorage
  private saveEvents(): void {
    try {
      localStorage.setItem('txopito_rotation_events', JSON.stringify(
        this.events.map(event => ({
          ...event,
          timestamp: event.timestamp.toISOString()
        }))
      ));
    } catch (error) {
      console.error('Erro ao salvar eventos de rotação:', error);
    }
  }

  // Carregar eventos do localStorage
  private loadEvents(): void {
    try {
      const stored = localStorage.getItem('txopito_rotation_events');
      if (stored) {
        const events = JSON.parse(stored);
        this.events = events.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar eventos de rotação:', error);
      this.events = [];
    }
  }

  // Limpar eventos antigos
  clearOldEvents(daysOld: number = 7): number {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const initialCount = this.events.length;
    
    this.events = this.events.filter(event => event.timestamp > cutoffDate);
    
    const removedCount = initialCount - this.events.length;
    if (removedCount > 0) {
      this.saveEvents();
    }
    
    return removedCount;
  }

  // Parar monitorização
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // Reiniciar monitorização
  restartMonitoring(): void {
    this.stopMonitoring();
    this.startMonitoring();
  }
}

// Instância singleton
export const keyRotationService = KeyRotationService.getInstance();

// Integração com apiKeyManager para registrar eventos automaticamente
const originalMarkKeyAsQuotaExceeded = apiKeyManager.markKeyAsQuotaExceeded.bind(apiKeyManager);
apiKeyManager.markKeyAsQuotaExceeded = function(keyId: string, error: string) {
  const key = this.getAllKeys().find(k => k.id === keyId);
  if (key) {
    keyRotationService.addEvent({
      type: 'quota_exceeded',
      keyId,
      keyName: key.name,
      timestamp: new Date(),
      details: error
    });
  }
  return originalMarkKeyAsQuotaExceeded(keyId, error);
};

const originalRotateToNextKey = apiKeyManager.rotateToNextKey.bind(apiKeyManager);
apiKeyManager.rotateToNextKey = function() {
  const currentKey = this.getCurrentKey();
  const result = originalRotateToNextKey();
  
  if (result && currentKey) {
    const newKey = this.getCurrentKey();
    if (newKey && newKey.id !== currentKey.id) {
      keyRotationService.addEvent({
        type: 'rotation',
        keyId: newKey.id,
        keyName: newKey.name,
        timestamp: new Date(),
        details: `Rotação de ${currentKey.name} para ${newKey.name}`
      });
    }
  }
  
  return result;
};

const originalAddKey = apiKeyManager.addKey.bind(apiKeyManager);
apiKeyManager.addKey = function(key: string, name: string) {
  const keyId = originalAddKey(key, name);
  
  keyRotationService.addEvent({
    type: 'key_added',
    keyId,
    keyName: name,
    timestamp: new Date(),
    details: 'Nova chave adicionada'
  });
  
  return keyId;
};

const originalRemoveKey = apiKeyManager.removeKey.bind(apiKeyManager);
apiKeyManager.removeKey = function(keyId: string) {
  const key = this.getAllKeys().find(k => k.id === keyId);
  const result = originalRemoveKey(keyId);
  
  if (result && key) {
    keyRotationService.addEvent({
      type: 'key_removed',
      keyId,
      keyName: key.name,
      timestamp: new Date(),
      details: 'Chave removida'
    });
  }
  
  return result;
};