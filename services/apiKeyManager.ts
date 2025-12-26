interface ApiKeyInfo {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  quotaExceeded: boolean;
  lastUsed: Date | null;
  requestCount: number;
  errorCount: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  quotaExceededKeys: number;
  currentKeyId: string | null;
  lastRotation: Date | null;
}

export class ApiKeyManager {
  private static readonly STORAGE_KEY = 'txopito_api_keys';
  private static readonly CURRENT_KEY_STORAGE = 'txopito_current_api_key';
  private static readonly STATS_STORAGE = 'txopito_api_stats';
  
  private keys: ApiKeyInfo[] = [];
  private currentKeyIndex: number = 0;
  
  constructor() {
    this.loadKeys();
  }

  // Carregar chaves do localStorage
  private loadKeys(): void {
    try {
      const storedKeys = localStorage.getItem(ApiKeyManager.STORAGE_KEY);
      const currentKeyId = localStorage.getItem(ApiKeyManager.CURRENT_KEY_STORAGE);
      
      if (storedKeys) {
        this.keys = JSON.parse(storedKeys).map((key: any) => ({
          ...key,
          lastUsed: key.lastUsed ? new Date(key.lastUsed) : null,
          createdAt: new Date(key.createdAt),
          updatedAt: new Date(key.updatedAt)
        }));
      }
      
      // Definir chave atual
      if (currentKeyId) {
        const currentIndex = this.keys.findIndex(k => k.id === currentKeyId);
        if (currentIndex !== -1) {
          this.currentKeyIndex = currentIndex;
        }
      }
      
      // Se não há chaves, adicionar a chave padrão do .env
      if (this.keys.length === 0) {
        this.addDefaultKey();
      }
      
    } catch (error) {
      console.error('Erro ao carregar chaves API:', error);
      this.addDefaultKey();
    }
  }

  // Adicionar chave padrão do ambiente
  private addDefaultKey(): void {
    console.log('🔄 Inicializando sistema de rotação automática...');
    
    // Chave principal do .env
    const defaultKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (defaultKey && defaultKey.trim().length > 0 && defaultKey !== 'SUA_NOVA_CHAVE_AQUI') {
      try {
        this.addKeyInternal(defaultKey, 'Chave Principal (Ativa)');
        console.log('✅ Chave principal adicionada com sucesso');
      } catch (error) {
        console.error('❌ Erro ao adicionar chave principal:', error);
      }
    }
    
    // Adicionar chaves de backup para rotação automática
    const backupKeys = [
      { key: 'AIzaSyBIUwxf9sLR6DrGZ8BLQHyrf_fjzPpX408', name: 'Chave Backup #1' },
      { key: 'AIzaSyC6ER1G5ufI4p-SMgfguZXIfICRKYa0UlE', name: 'Chave Backup #2' },
      { key: 'AIzaSyAU41QrEUuGQOuHMdAZjI-TZKr4jFnM_O4', name: 'Chave Backup #3' },
    ];
    
    backupKeys.forEach((apiKey, index) => {
      const exists = this.keys.find(k => k.key === apiKey.key);
      if (!exists) {
        try {
          this.addKeyInternal(apiKey.key, apiKey.name);
          console.log(`✅ ${apiKey.name} adicionada com sucesso`);
        } catch (error) {
          console.error(`❌ Erro ao adicionar ${apiKey.name}:`, error);
        }
      }
    });
    
    if (this.keys.length === 0) {
      console.error('🚨 SISTEMA SEM CHAVES API VÁLIDAS!');
      console.error('🔑 Gere novas chaves em: https://aistudio.google.com/app/apikey');
    } else {
      console.log(`🎉 Sistema inicializado com ${this.keys.length} chave(s) API`);
      if (this.keys.length > 1) {
        console.log('🔄 Rotação automática ativada para tolerância a falhas');
      } else {
        console.log('⚠️ Apenas 1 chave disponível - adicione mais chaves para rotação automática');
      }
    }
  }

  // Salvar chaves no localStorage
  private saveKeys(): void {
    try {
      localStorage.setItem(ApiKeyManager.STORAGE_KEY, JSON.stringify(this.keys));
      
      const currentKey = this.getCurrentKey();
      if (currentKey) {
        localStorage.setItem(ApiKeyManager.CURRENT_KEY_STORAGE, currentKey.id);
      }
      
      this.saveStats();
    } catch (error) {
      console.error('Erro ao salvar chaves API:', error);
    }
  }

  // Salvar estatísticas
  private saveStats(): void {
    const stats: ApiKeyStats = {
      totalKeys: this.keys.length,
      activeKeys: this.keys.filter(k => k.isActive && !k.quotaExceeded).length,
      quotaExceededKeys: this.keys.filter(k => k.quotaExceeded).length,
      currentKeyId: this.getCurrentKey()?.id || null,
      lastRotation: new Date()
    };
    
    localStorage.setItem(ApiKeyManager.STATS_STORAGE, JSON.stringify(stats));
  }

  // Adicionar múltiplas chaves de uma vez
  addMultipleKeys(keys: Array<{key: string, name: string}>): string[] {
    const addedIds: string[] = [];
    
    keys.forEach((keyData, index) => {
      try {
        const id = this.addKey(keyData.key, keyData.name);
        addedIds.push(id);
        console.log(`✅ ${keyData.name} adicionada com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao adicionar ${keyData.name}:`, error);
      }
    });
    
    if (addedIds.length > 0) {
      console.log(`🎉 ${addedIds.length} chaves adicionadas. Rotação automática ativada!`);
    }
    
    return addedIds;
  }

  // Adicionar nova chave
  addKey(key: string, name: string): string {
    // Verificar se a chave já existe
    const existingKey = this.keys.find(k => k.key === key.trim());
    if (existingKey) {
      throw new Error('Esta chave API já existe');
    }
    
    return this.addKeyInternal(key, name);
  }

  // Método interno para adicionar chave sem verificação de duplicatas
  private addKeyInternal(key: string, name: string): string {
    const keyInfo: ApiKeyInfo = {
      id: this.generateId(),
      key: key.trim(),
      name: name.trim(),
      isActive: true,
      quotaExceeded: false,
      lastUsed: null,
      requestCount: 0,
      errorCount: 0,
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.keys.push(keyInfo);
    this.saveKeys();
    
    console.log(`✅ Chave API adicionada: ${name} (${keyInfo.id})`);
    return keyInfo.id;
  }

  // Remover chave
  removeKey(keyId: string): boolean {
    const index = this.keys.findIndex(k => k.id === keyId);
    if (index === -1) {
      return false;
    }
    
    // Não permitir remover se for a única chave ativa
    const activeKeys = this.keys.filter(k => k.isActive && !k.quotaExceeded);
    if (activeKeys.length === 1 && activeKeys[0].id === keyId) {
      throw new Error('Não podes remover a única chave ativa');
    }
    
    const removedKey = this.keys[index];
    this.keys.splice(index, 1);
    
    // Ajustar índice atual se necessário
    if (this.currentKeyIndex >= this.keys.length) {
      this.currentKeyIndex = 0;
    }
    
    this.saveKeys();
    console.log(`🗑️ Chave API removida: ${removedKey.name}`);
    return true;
  }

  // Obter chave atual
  getCurrentKey(): ApiKeyInfo | null {
    if (this.keys.length === 0) {
      return null;
    }
    
    const currentKey = this.keys[this.currentKeyIndex];
    
    // Se a chave atual não está disponível, rodar para próxima
    if (!currentKey || !currentKey.isActive || currentKey.quotaExceeded) {
      this.rotateToNextKey();
      return this.keys[this.currentKeyIndex] || null;
    }
    
    return currentKey;
  }

  // Rodar para próxima chave disponível
  rotateToNextKey(): boolean {
    const availableKeys = this.keys.filter(k => k.isActive && !k.quotaExceeded);
    
    if (availableKeys.length === 0) {
      console.error('❌ Nenhuma chave API disponível!');
      return false;
    }
    
    // Encontrar próxima chave disponível
    let nextIndex = (this.currentKeyIndex + 1) % this.keys.length;
    let attempts = 0;
    
    while (attempts < this.keys.length) {
      const key = this.keys[nextIndex];
      if (key && key.isActive && !key.quotaExceeded) {
        this.currentKeyIndex = nextIndex;
        this.saveKeys();
        console.log(`🔄 Rotação para chave: ${key.name} (${key.id})`);
        return true;
      }
      
      nextIndex = (nextIndex + 1) % this.keys.length;
      attempts++;
    }
    
    return false;
  }

  // Marcar chave como quota excedida
  markKeyAsQuotaExceeded(keyId: string, error: string): void {
    const key = this.keys.find(k => k.id === keyId);
    if (key) {
      key.quotaExceeded = true;
      key.lastError = error;
      key.errorCount++;
      key.updatedAt = new Date();
      
      console.warn(`⚠️ Quota excedida para chave: ${key.name}`);
      
      // Rodar automaticamente para próxima chave
      this.rotateToNextKey();
      this.saveKeys();
    }
  }

  // Marcar chave como usada com sucesso
  markKeyAsUsed(keyId: string): void {
    const key = this.keys.find(k => k.id === keyId);
    if (key) {
      key.lastUsed = new Date();
      key.requestCount++;
      key.updatedAt = new Date();
      this.saveKeys();
    }
  }

  // Marcar erro na chave
  markKeyError(keyId: string, error: string): void {
    const key = this.keys.find(k => k.id === keyId);
    if (key) {
      key.errorCount++;
      key.lastError = error;
      key.updatedAt = new Date();
      
      // Se muitos erros, desativar temporariamente
      if (key.errorCount >= 5) {
        key.isActive = false;
        console.warn(`⚠️ Chave desativada por muitos erros: ${key.name}`);
        this.rotateToNextKey();
      }
      
      this.saveKeys();
    }
  }

  // Reativar chave
  reactivateKey(keyId: string): boolean {
    const key = this.keys.find(k => k.id === keyId);
    if (key) {
      key.isActive = true;
      key.quotaExceeded = false;
      key.errorCount = 0;
      key.lastError = null;
      key.updatedAt = new Date();
      this.saveKeys();
      
      console.log(`✅ Chave reativada: ${key.name}`);
      return true;
    }
    return false;
  }

  // Obter todas as chaves (para admin)
  getAllKeys(): ApiKeyInfo[] {
    return this.keys.map(key => ({
      ...key,
      key: this.maskKey(key.key) // Mascarar chave por segurança
    }));
  }

  // Obter estatísticas
  getStats(): ApiKeyStats {
    try {
      const stored = localStorage.getItem(ApiKeyManager.STATS_STORAGE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
    
    return {
      totalKeys: this.keys.length,
      activeKeys: this.keys.filter(k => k.isActive && !k.quotaExceeded).length,
      quotaExceededKeys: this.keys.filter(k => k.quotaExceeded).length,
      currentKeyId: this.getCurrentKey()?.id || null,
      lastRotation: null
    };
  }

  // Testar chave
  async testKey(keyId: string): Promise<{ success: boolean; error?: string }> {
    const key = this.keys.find(k => k.id === keyId);
    if (!key) {
      return { success: false, error: 'Chave não encontrada' };
    }
    
    try {
      // Importar GoogleGenerativeAI dinamicamente para evitar problemas de build
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(key.key);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Teste' }] }],
        generationConfig: { maxOutputTokens: 10, temperature: 0.1 },
      });
      
      const response = await result.response;
      const text = response.text();
      
      if (text && text.length > 0) {
        this.markKeyAsUsed(keyId);
        return { success: true };
      } else {
        return { success: false, error: 'Resposta vazia' };
      }
    } catch (error: any) {
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        this.markKeyAsQuotaExceeded(keyId, 'Quota excedida');
        return { success: false, error: 'Quota excedida' };
      } else if (errorMessage.includes('api_key_invalid') || errorMessage.includes('401')) {
        return { success: false, error: 'Chave inválida' };
      } else {
        this.markKeyError(keyId, error.message);
        return { success: false, error: error.message };
      }
    }
  }

  // Utilitários
  private generateId(): string {
    return 'key_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private maskKey(key: string): string {
    if (key.length <= 8) return '***';
    return key.substring(0, 4) + '***' + key.substring(key.length - 4);
  }

  // Limpar chaves inválidas
  cleanupInvalidKeys(): number {
    const initialCount = this.keys.length;
    this.keys = this.keys.filter(key => {
      // Remover chaves com muitos erros e inativas há mais de 24h
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return !(key.errorCount >= 10 && !key.isActive && key.updatedAt < dayAgo);
    });
    
    const removedCount = initialCount - this.keys.length;
    if (removedCount > 0) {
      this.saveKeys();
      console.log(`🧹 ${removedCount} chaves inválidas removidas`);
    }
    
    return removedCount;
  }
}

// Instância singleton
export const apiKeyManager = new ApiKeyManager();