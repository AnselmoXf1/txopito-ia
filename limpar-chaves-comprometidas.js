#!/usr/bin/env node

/**
 * SCRIPT PARA LIMPAR CHAVES COMPROMETIDAS DO LOCALSTORAGE
 * 
 * Este script remove todas as chaves comprometidas do localStorage
 * para garantir que o sistema inicie limpo com a nova chave.
 */

console.log('🧹 LIMPEZA DE CHAVES COMPROMETIDAS');
console.log('=================================');

// Simular limpeza do localStorage (será executado no browser)
const localStorageKeys = [
  'txopito_api_keys',
  'txopito_current_api_key', 
  'txopito_api_stats'
];

console.log('📋 Chaves do localStorage a serem removidas:');
localStorageKeys.forEach(key => {
  console.log(`  • ${key}`);
});

console.log('\n🔧 Para limpar no browser, executa no Console (F12):');
console.log('─'.repeat(50));
console.log(`
// Limpar todas as chaves comprometidas
localStorage.removeItem('txopito_api_keys');
localStorage.removeItem('txopito_current_api_key');
localStorage.removeItem('txopito_api_stats');

// Confirmar limpeza
console.log('✅ Chaves comprometidas removidas do localStorage');
console.log('🔄 Recarrega a página para inicializar com nova chave');
`);
console.log('─'.repeat(50));

console.log('\n✅ INSTRUÇÕES:');
console.log('1. Abre a aplicação no browser');
console.log('2. Pressiona F12 para abrir DevTools');
console.log('3. Vai ao tab "Console"');
console.log('4. Cola e executa o código acima');
console.log('5. Recarrega a página');

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('• localStorage limpo de chaves comprometidas');
console.log('• Sistema pronto para nova chave');
console.log('• Inicialização limpa na próxima execução');

console.log('\n⚠️ LEMBRA-TE:');
console.log('• Gera nova chave em: https://aistudio.google.com/app/apikey');
console.log('• Substitui VITE_GEMINI_API_KEY no .env.local');
console.log('• Testa com: node test-single-key.js');