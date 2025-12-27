#!/usr/bin/env node

/**
 * Teste completo do backend Render
 * Anselmo Dora Bistiro Gulane - 26/12/2024
 */

const https = require('https');

const BACKEND_URL = 'https://txopito-backend.onrender.com';

console.log('🧪 TESTANDO BACKEND RENDER COMPLETO');
console.log('=' .repeat(50));

// Função para fazer requisição HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Teste 1: Health Check
async function testHealth() {
  console.log('\n🏥 TESTE 1: Health Check');
  console.log('-'.repeat(30));
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    
    console.log(`📊 Status: ${response.statusCode}`);
    console.log(`📄 Resposta: ${response.data}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Backend está ONLINE e funcionando!');
      return true;
    } else {
      console.log('❌ Backend com problemas');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erro na conexão com backend:');
    console.log(error.message);
    return false;
  }
}

// Teste 2: Gemini Test
async function testGemini() {
  console.log('\n🤖 TESTE 2: Gemini API via Backend');
  console.log('-'.repeat(30));
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/gemini/test`);
    
    console.log(`📊 Status: ${response.statusCode}`);
    console.log(`📄 Resposta: ${response.data}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      if (data.success) {
        console.log('✅ Gemini API funcionando via backend!');
        return true;
      } else {
        console.log('❌ Gemini API com problemas:', data.error);
        return false;
      }
    } else {
      console.log('❌ Endpoint Gemini não disponível');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erro no teste Gemini:');
    console.log(error.message);
    return false;
  }
}

// Teste 3: Chat Test
async function testChat() {
  console.log('\n💬 TESTE 3: Chat via Backend');
  console.log('-'.repeat(30));
  
  const testMessage = {
    message: "Teste simples. Responde apenas 'OK'.",
    history: [],
    settings: {
      temperature: 0.1,
      maxTokens: 50
    },
    context: {
      mode: 'casual',
      userName: 'Teste'
    }
  };
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/gemini/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });
    
    console.log(`📊 Status: ${response.statusCode}`);
    console.log(`📄 Resposta: ${response.data}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      if (data.success && data.response) {
        console.log('✅ Chat funcionando via backend!');
        console.log(`🤖 Resposta IA: "${data.response}"`);
        return true;
      } else {
        console.log('❌ Chat com problemas:', data.error);
        return false;
      }
    } else {
      console.log('❌ Endpoint chat não disponível');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erro no teste chat:');
    console.log(error.message);
    return false;
  }
}

// Teste 4: CORS Test
async function testCORS() {
  console.log('\n🌐 TESTE 4: CORS Headers');
  console.log('-'.repeat(30));
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/health`);
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers']
    };
    
    console.log('📋 CORS Headers:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        console.log(`  ${key}: ${value}`);
      }
    });
    
    if (corsHeaders['access-control-allow-origin']) {
      console.log('✅ CORS configurado');
      return true;
    } else {
      console.log('⚠️ CORS pode não estar configurado');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erro no teste CORS:');
    console.log(error.message);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log(`🎯 Testando backend: ${BACKEND_URL}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  const results = {
    health: await testHealth(),
    gemini: await testGemini(),
    chat: await testChat(),
    cors: await testCORS()
  };
  
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('=' .repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${test.toUpperCase().padEnd(10)} ${status}`);
  });
  
  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 RESULTADO: ${totalPassed}/${totalTests} testes passaram`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 BACKEND TOTALMENTE FUNCIONAL!');
    console.log('✅ Pronto para receber frontend');
  } else if (results.health && results.cors) {
    console.log('⚠️ Backend online mas IA com problemas');
    console.log('🔑 Precisa de nova chave Gemini válida');
  } else {
    console.log('🚨 Backend com problemas sérios');
    console.log('🔧 Verificar configuração no Render');
  }
  
  console.log('\n🔗 Links úteis:');
  console.log(`📊 Render Dashboard: https://render.com`);
  console.log(`🔑 Gerar chave Gemini: https://aistudio.google.com/app/apikey`);
  console.log(`🌐 Backend URL: ${BACKEND_URL}`);
}

// Executar
runAllTests().catch(console.error);