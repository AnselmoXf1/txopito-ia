// Script para limpar o banco de dados local
console.log('🧹 Limpando banco de dados...');

// Limpar todos os dados do localStorage relacionados ao Txopito IA
const keysToRemove = [
  'txopito_users',
  'txopito_current_user',
  'txopito_conversations',
  'admin_logs'
];

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Removido: ${key}`);
});

// Limpar todas as conversas
const allKeys = Object.keys(localStorage);
allKeys.forEach(key => {
  if (key.startsWith('txopito_conversations_')) {
    localStorage.removeItem(key);
    console.log(`✅ Removido: ${key}`);
  }
});

console.log('🎉 Banco de dados limpo com sucesso!');
console.log('ℹ️  Recarregue a página para inicializar o sistema limpo.');