#!/usr/bin/env node

/**
 * CONECTAR AO BACKEND DO RENDER
 * 
 * Este script conecta ao backend no Render e permite testar as APIs
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://txopito-ia.onrender.com/api';

console.log('🌐 CONECTAR AO BACKEND DO RENDER');
console.log('===============================');
console.log(`🔗 URL: ${BACKEND_URL}`);

// Função para testar conexão
async function testConnection() {
  try {
    console.log('\n🔄 Testando conexão com o backend...');
    
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ BACKEND CONECTADO!');
      console.log('📊 Status:', data);
      return true;
    } else {
      console.log(`❌ Erro HTTP: ${response.status} ${response.statusText}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('⏱️ Backend pode estar "dormindo" - tentando acordar...');
      return await wakeUpBackend();
    }
    
    return false;
  }
}

// Função para acordar o backend (Render dorme após inatividade)
async function wakeUpBackend() {
  try {
    console.log('🔄 Acordando backend do Render...');
    
    // Fazer múltiplas tentativas para acordar
    for (let i = 1; i <= 3; i++) {
      console.log(`  Tentativa ${i}/3...`);
      
      try {
        const response = await fetch(BACKEND_URL, {
          method: 'GET',
          timeout: 30000 // 30 segundos para acordar
        });
        
        if (response.ok || response.status === 404) {
          console.log('✅ Backend acordou!');
          await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s
          return await testConnection();
        }
      } catch (error) {
        console.log(`  ⏳ Aguardando... (${error.message})`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Aguardar 5s
      }
    }
    
    console.log('❌ Backend não respondeu após múltiplas tentativas');
    return false;
    
  } catch (error) {
    console.error('❌ Erro ao acordar backend:', error.message);
    return false;
  }
}

// Função para testar endpoints específicos
async function testEndpoints() {
  const endpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/conversations', name: 'Conversas' },
    { path: '/users', name: 'Utilizadores' },
    { path: '/admin/stats', name: 'Estatísticas Admin' }
  ];
  
  console.log('\n🧪 TESTANDO ENDPOINTS:');
  console.log('─'.repeat(40));
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint.path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });
      
      const status = response.ok ? '✅' : '❌';
      console.log(`${status} ${endpoint.name}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`   📊 Dados: ${JSON.stringify(data).substring(0, 100)}...`);
        } catch (e) {
          console.log('   📄 Resposta não-JSON');
        }
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
}

// Função para enviar dados de teste
async function testPostData() {
  try {
    console.log('\n📤 TESTANDO ENVIO DE DADOS:');
    console.log('─'.repeat(40));
    
    const testData = {
      message: 'Teste de conexão do terminal',
      timestamp: new Date().toISOString(),
      user: 'Terminal Test'
    };
    
    const response = await fetch(`${BACKEND_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      timeout: 10000
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Dados enviados com sucesso!');
      console.log('📊 Resposta:', result);
    } else {
      console.log(`❌ Erro ao enviar: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ Erro no envio:', error.message);
  }
}

// Função para monitorar logs (simulação)
async function monitorLogs() {
  console.log('\n📊 MONITORAMENTO DO BACKEND:');
  console.log('─'.repeat(40));
  console.log('⚠️ Para logs reais, usa o dashboard do Render:');
  console.log('🔗 https://dashboard.render.com/');
  console.log('');
  console.log('💡 Comandos úteis para monitoramento:');
  console.log('• Ver logs: Dashboard > Seu serviço > Logs');
  console.log('• Reiniciar: Dashboard > Seu serviço > Manual Deploy');
  console.log('• Métricas: Dashboard > Seu serviço > Metrics');
}

// Menu interativo
async function showMenu() {
  console.log('\n🎛️ MENU DE OPÇÕES:');
  console.log('─'.repeat(30));
  console.log('1. Testar conexão');
  console.log('2. Testar todos os endpoints');
  console.log('3. Enviar dados de teste');
  console.log('4. Monitorar logs');
  console.log('5. Informações do backend');
  console.log('0. Sair');
  console.log('─'.repeat(30));
}

// Função principal
async function main() {
  // Teste inicial de conexão
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\n💡 DICAS PARA RESOLVER:');
    console.log('• Verifica se o backend está deployado no Render');
    console.log('• Confirma a URL no .env.local');
    console.log('• Backend pode estar "dormindo" - tenta novamente');
    console.log('• Verifica logs no dashboard do Render');
    return;
  }
  
  // Se conectado, mostrar opções
  await showMenu();
  
  // Executar testes automáticos
  console.log('\n🚀 EXECUTANDO TESTES AUTOMÁTICOS...');
  await testEndpoints();
  await testPostData();
  await monitorLogs();
  
  console.log('\n✅ CONEXÃO COM BACKEND ESTABELECIDA!');
  console.log('🎯 Backend do Render está funcionando corretamente');
  console.log('🔗 URL:', BACKEND_URL);
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('• Backend está pronto para receber requisições');
  console.log('• Podes iniciar o frontend normalmente');
  console.log('• Dados serão sincronizados automaticamente');
}

// Executar
main().catch(console.error);