import { backendService } from './backendService';
import { storageService } from './storageService';
import { Conversation } from '../types';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  pendingSync: boolean;
  conflictsCount: number;
  syncEnabled: boolean;
}

export interface SyncOptions {
  forceFullSync?: boolean;
  retryOnFailure?: boolean;
  backgroundSync?: boolean;
}

class SyncManager {
  private syncStatus: SyncStatus = {
    isOnline: false,
    lastSync: 0,
    pendingSync: false,
    conflictsCount: 0,
    syncEnabled: true
  };

  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];
  private isInitialized = false;

  constructor() {
    this.initializeSync();
  }

  private async initializeSync(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔄 Inicializando Sync Manager...');

    // Verificar conectividade inicial
    await this.checkConnectivity();

    // Configurar listeners de conectividade
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Recuperar último sync do localStorage
    const lastSync = localStorage.getItem('txopito_last_sync');
    if (lastSync) {
      this.syncStatus.lastSync = parseInt(lastSync);
    }

    // Iniciar sync automático se estiver online e autenticado
    if (this.syncStatus.isOnline && backendService.isAuthenticated()) {
      this.startAutoSync();
    }

    this.isInitialized = true;
    console.log('✅ Sync Manager inicializado');
  }

  private async checkConnectivity(): Promise<void> {
    const wasOnline = this.syncStatus.isOnline;
    this.syncStatus.isOnline = navigator.onLine && await backendService.checkHealth();

    if (wasOnline !== this.syncStatus.isOnline) {
      console.log(`🌐 Status de conectividade: ${this.syncStatus.isOnline ? 'ONLINE' : 'OFFLINE'}`);
      this.notifyListeners();

      // Se ficou online, tentar sincronizar
      if (this.syncStatus.isOnline && backendService.isAuthenticated()) {
        this.syncConversations({ backgroundSync: true });
      }
    }
  }

  private handleOnline(): void {
    console.log('🌐 Dispositivo ficou online');
    this.checkConnectivity();
  }

  private handleOffline(): void {
    console.log('🌐 Dispositivo ficou offline');
    this.syncStatus.isOnline = false;
    this.stopAutoSync();
    this.notifyListeners();
  }

  private startAutoSync(): void {
    if (this.syncInterval) return;

    // Sincronizar a cada 5 minutos
    this.syncInterval = setInterval(() => {
      if (this.syncStatus.isOnline && backendService.isAuthenticated()) {
        this.syncConversations({ backgroundSync: true });
      }
    }, 5 * 60 * 1000);

    console.log('⏰ Auto-sync iniciado (5 minutos)');
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏰ Auto-sync parado');
    }
  }

  // Sincronização principal
  async syncConversations(options: SyncOptions = {}): Promise<boolean> {
    if (!this.syncStatus.syncEnabled) {
      console.log('🔄 Sincronização desabilitada');
      return false;
    }

    if (!backendService.isAuthenticated()) {
      console.log('🔄 Não autenticado - pulando sincronização');
      return false;
    }

    if (!this.syncStatus.isOnline) {
      console.log('🔄 Offline - pulando sincronização');
      return false;
    }

    if (this.syncStatus.pendingSync && !options.forceFullSync) {
      console.log('🔄 Sincronização já em andamento');
      return false;
    }

    try {
      this.syncStatus.pendingSync = true;
      this.notifyListeners();

      console.log('🔄 Iniciando sincronização de conversas...');

      let result;

      if (options.forceFullSync || this.syncStatus.lastSync === 0) {
        // Sincronização completa
        result = await this.fullSync();
      } else {
        // Sincronização incremental
        result = await this.incrementalSync();
      }

      if (result) {
        this.syncStatus.lastSync = Date.now();
        localStorage.setItem('txopito_last_sync', this.syncStatus.lastSync.toString());
        
        if (!options.backgroundSync) {
          console.log('✅ Sincronização concluída com sucesso');
        }
      }

      return result;

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      
      if (options.retryOnFailure) {
        console.log('🔄 Tentando novamente em 30 segundos...');
        setTimeout(() => this.syncConversations(options), 30000);
      }
      
      return false;

    } finally {
      this.syncStatus.pendingSync = false;
      this.notifyListeners();
    }
  }

  private async fullSync(): Promise<boolean> {
    console.log('🔄 Executando sincronização completa...');

    // Obter todas as conversas locais
    const localConversations = storageService.getAllConversations();

    try {
      const response = await backendService.syncConversations(localConversations);

      if (response.success && response.data) {
        await this.processSyncResult(response.data);
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Erro na sincronização completa:', error);
      return false;
    }
  }

  private async incrementalSync(): Promise<boolean> {
    console.log('🔄 Executando sincronização incremental...');

    try {
      const since = new Date(this.syncStatus.lastSync).toISOString();
      const response = await backendService.incrementalSync(since);

      if (response.success && response.data) {
        // Atualizar conversas locais com as mudanças do servidor
        for (const conversation of response.data.conversations) {
          storageService.saveConversation(conversation);
        }

        console.log(`🔄 Sincronização incremental: ${response.data.count} conversas atualizadas`);
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Erro na sincronização incremental:', error);
      return false;
    }
  }

  private async processSyncResult(syncResult: any): Promise<void> {
    console.log('🔄 Processando resultado da sincronização...');

    // Atualizar conversas do servidor
    for (const conversation of syncResult.serverConversations || []) {
      storageService.saveConversation(conversation);
    }

    // Processar conflitos resolvidos
    for (const conversation of syncResult.conflictsResolved || []) {
      storageService.saveConversation(conversation);
      this.syncStatus.conflictsCount++;
    }

    // Processar novas conversas criadas no servidor
    for (const conversation of syncResult.newConversations || []) {
      // Estas já foram criadas no servidor, apenas confirmar localmente
      console.log(`➕ Nova conversa sincronizada: ${conversation.title}`);
    }

    // Processar conversas atualizadas
    for (const conversation of syncResult.updatedConversations || []) {
      console.log(`🔄 Conversa atualizada: ${conversation.title}`);
    }

    console.log(`✅ Sincronização processada: ${syncResult.serverConversations?.length || 0} do servidor, ${syncResult.conflictsResolved?.length || 0} conflitos resolvidos`);
  }

  // Sincronizar conversa específica
  async syncConversation(conversation: Conversation): Promise<boolean> {
    if (!this.syncStatus.isOnline || !backendService.isAuthenticated()) {
      // Marcar para sincronização posterior
      this.markForSync(conversation.id);
      return false;
    }

    try {
      // Verificar se conversa existe no servidor
      const response = await backendService.updateConversation(conversation.id, {
        title: conversation.title,
        messages: conversation.messages,
        mode: conversation.mode,
        lastUpdate: conversation.lastUpdate
      });

      if (response.success) {
        console.log(`✅ Conversa sincronizada: ${conversation.title}`);
        return true;
      }

      // Se não existe, criar no servidor
      if (response.code === 'CONVERSATION_NOT_FOUND') {
        const createResponse = await backendService.createConversation(conversation);
        return createResponse.success;
      }

      return false;

    } catch (error) {
      console.error('❌ Erro ao sincronizar conversa:', error);
      this.markForSync(conversation.id);
      return false;
    }
  }

  private markForSync(conversationId: string): void {
    const pending = JSON.parse(localStorage.getItem('txopito_pending_sync') || '[]');
    if (!pending.includes(conversationId)) {
      pending.push(conversationId);
      localStorage.setItem('txopito_pending_sync', JSON.stringify(pending));
    }
  }

  private async syncPendingConversations(): Promise<void> {
    const pending = JSON.parse(localStorage.getItem('txopito_pending_sync') || '[]');
    
    if (pending.length === 0) return;

    console.log(`🔄 Sincronizando ${pending.length} conversas pendentes...`);

    const synced: string[] = [];

    for (const conversationId of pending) {
      const conversation = storageService.getConversation(conversationId);
      if (conversation && await this.syncConversation(conversation)) {
        synced.push(conversationId);
      }
    }

    // Remover conversas sincronizadas da lista pendente
    const remaining = pending.filter((id: string) => !synced.includes(id));
    localStorage.setItem('txopito_pending_sync', JSON.stringify(remaining));

    console.log(`✅ ${synced.length} conversas pendentes sincronizadas`);
  }

  // Gestão de listeners
  addListener(callback: (status: SyncStatus) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (status: SyncStatus) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.syncStatus }));
  }

  // Controles públicos
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  async forceSync(): Promise<boolean> {
    return this.syncConversations({ forceFullSync: true });
  }

  enableSync(): void {
    this.syncStatus.syncEnabled = true;
    if (this.syncStatus.isOnline && backendService.isAuthenticated()) {
      this.startAutoSync();
    }
    this.notifyListeners();
  }

  disableSync(): void {
    this.syncStatus.syncEnabled = false;
    this.stopAutoSync();
    this.notifyListeners();
  }

  // Chamado quando utilizador faz login
  async onUserLogin(): Promise<void> {
    console.log('👤 Utilizador logado - iniciando sincronização');
    
    if (this.syncStatus.isOnline) {
      await this.syncConversations({ forceFullSync: true });
      await this.syncPendingConversations();
      this.startAutoSync();
    }
  }

  // Chamado quando utilizador faz logout
  onUserLogout(): void {
    console.log('👤 Utilizador deslogado - parando sincronização');
    this.stopAutoSync();
    this.syncStatus.lastSync = 0;
    this.syncStatus.conflictsCount = 0;
    localStorage.removeItem('txopito_last_sync');
    localStorage.removeItem('txopito_pending_sync');
    this.notifyListeners();
  }

  // Cleanup
  destroy(): void {
    this.stopAutoSync();
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    this.listeners = [];
  }
}

// Instância singleton
export const syncManager = new SyncManager();

export default SyncManager;