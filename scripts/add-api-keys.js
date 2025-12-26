// Script para adicionar as 3 chaves API ao sistema de rotação automática
// Execute este script no console do navegador ou use como referência

const API_KEYS = [
  {
    key: 'AIzaSyDst05_JK65CtieKNvqRZsWXv2kf9RVGQo',
    name: 'Chave Principal #1'
  },
  {
    key: 'AIzaSyDBXiZE0jJe2A8Xt9lqe5VsVT7fy8RAWAU', 
    name: 'Chave Backup #2'
  },
  {
    key: 'AIzaSyDaDKW5OPiYx_p605rqXfPqp-L7fw__psk',
    name: 'Chave Reserva #3'
  }
];

// Função para adicionar as chaves
function addApiKeys() {
  console.log('🔄 Iniciando adição das chaves API...');
  
  // Simular a estrutura do apiKeyManager
  const STORAGE_KEY = 'txopito_api_keys';
  
  try {
    // Carregar chaves existentes
    let existingKeys = [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      existingKeys = JSON.parse(stored);
    }
    
    let addedCount = 0;
    
    API_KEYS.forEach((apiKey, index) => {
      // Verificar se a chave já existe
      const exists = existingKeys.find(k => k.key === apiKey.key);
      if (exists) {
        console.log(`⚠️ Chave ${apiKey.name} já existe, pulando...`);
        return;
      }
      
      // Criar nova chave
      const keyInfo = {
        id: 'key_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        key: apiKey.key,
        name: apiKey.name,
        isActive: true,
        quotaExceeded: false,
        lastUsed: null,
        requestCount: 0,
        errorCount: 0,
        lastError: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      existingKeys.push(keyInfo);
      addedCount++;
      console.log(`✅ Adicionada: ${apiKey.name}`);
    });
    
    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingKeys));
    
    // Atualizar estatísticas
    const stats = {
      totalKeys: existingKeys.length,
      activeKeys: existingKeys.filter(k => k.isActive && !k.quotaExceeded).length,
      quotaExceededKeys: existingKeys.filter(k => k.quotaExceeded).length,
      currentKeyId: existingKeys[0]?.id || null,
      lastRotation: new Date().toISOString()
    };
    
    localStorage.setItem('txopito_api_stats', JSON.stringify(stats));
    
    console.log(`🎉 Processo concluído! ${addedCount} chaves adicionadas.`);
    console.log(`📊 Total de chaves no sistema: ${existingKeys.length}`);
    
    return {
      success: true,
      addedCount,
      totalKeys: existingKeys.length
    };
    
  } catch (error) {
    console.error('❌ Erro ao adicionar chaves:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar automaticamente se estiver no navegador
if (typeof window !== 'undefined') {
  addApiKeys();
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addApiKeys, API_KEYS };
}