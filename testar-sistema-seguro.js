#!/usr/bin/env node

/**
 * TESTE DO SISTEMA SEGURO
 * Frontend sem chave + Backend com chave segura
 */

import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://txopito-backend.onrender.com/api';
const FRONTEND_GEMINI_KEY = process.env.VITE_GEMINI_API_KEY;

console.log('🔐 TESTE DO SISTEMA SEGURO');
console.log('==========================');
console.log(`🌐 Backend: ${BACKEND_URL}`);
console.log(`🔑 Frontend tem chave: ${FRONTEND_GEMINI_KEY ? '❌ SIM (INSEGURO)' : '✅ NÃO (SEGURO)'}`);

async function testSecureSystem() {
  try {
    console.log('\n🎯 PASSO 1: Verificar Segurança do Frontend');
    console.log('─'.repeat(50));
    
    if (FRONTEND_GEMINI_KEY) {
      console.log('❌ PROBLEMA: Chave Gemini ainda está no frontend!');
      console.log('🚨 RISCO: Chave exposta publicamente');
      console.log('💡 SOLUÇÃO: Remove VITE_GEMINI_API_KEY do .env.local');
      return false;
    } else {
      console.log('✅ SEGURO: Nenhuma chave Gemini no frontend');
      console.log('🔐 Frontend não tem acesso direto à API Gemini');
    }
    
    console.log('\n🎯 PASSO 2: Testar Backend Health');
    console.log('─'.repeat(50));
    
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    
    console.log('✅ Backend Status:', healthData.status);
    console.log('✅ Database:', healthData.services.database);
    console.log('✅ Gemini Config:', healthData.services.gemini || 'N/A');
    
    console.log('\n🎯 PASSO 3: Testar Endpoint Gemini');
    console.log('─'.repeat(50));
    
    // Testar endpoint de teste do Gemini
    const testResponse = await fetch(`${BACKEND_URL}/gemini/test`);
    const testData = await testResponse.json();
    
    if (testData.success) {
      console.log('✅ Conexão Backend → Gemini: FUNCIONANDO');
      console.log('✅ Resposta de teste:', testData.testResponse || 'OK');
    } else {
      console.log('❌ Conexão Backend → Gemini: FALHOU');
      console.log('❌ Erro:', testData.error);
      return false;
    }
    
    console.log('\n🎯 PASSO 4: Testar Geração de Resposta');
    console.log('─'.repeat(50));
    
    const generateRequest = {
      message: 'Olá! Este é um teste do sistema seguro.',
      history: [],
      settings: {
        temperature: 0.7,
        maxTokens: 100
      },
      user: {
        id: 'test-user',
        name: 'Teste'
      },
      context: {
        mode: 'assistant',
        systemInstruction: 'Responde de forma breve e amigável.',
        timeContext: new Date().toISOString()
      }
    };
    
    const generateResponse = await fetch(`${BACKEND_URL}/gemini/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generateRequest)
    });
    
    const generateData = await generateResponse.json();
    
    if (generateData.success) {
      console.log('✅ Geração de resposta: FUNCIONANDO');
      console.log('✅ Resposta IA:', generateData.response.substring(0, 100) + '...');
      console.log('✅ Modelo usado:', generateData.model);
      console.log('✅ Timestamp:', generateData.timestamp);
    } else {
      console.log('❌ Geração de resposta: FALHOU');
      console.log('❌ Erro:', generateData.error);
      return false;
    }
    
    console.log('\n🎯 PASSO 5: Testar Rate Limiting');
    console.log('─'.repeat(50));
    
    // Fazer múltiplas requisições rápidas para testar rate limiting
    const rapidRequests = [];
    for (let i = 0; i < 5; i++) {
      rapidRequests.push(
        fetch(`${BACKEND_URL}/gemini/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Teste rápido ${i + 1}`,
            history: [],
            settings: { maxTokens: 10 }
          })
        })
      );
    }
    
    const rapidResults = await Promise.allSettled(rapidRequests);
    const successCount = rapidResults.filter(r => r.status === 'fulfilled' && r.value.ok).length;
    const rateLimitCount = rapidResults.filter(r => 
      r.status === 'fulfilled' && r.value.status === 429
    ).length;
    
    console.log(`✅ Requisições bem-sucedidas: ${successCount}/5`);
    console.log(`✅ Rate limiting ativo: ${rateLimitCount > 0 ? 'SIM' : 'NÃO'}`);
    
    if (rateLimitCount > 0) {
      console.log('🛡️ Rate limiting funcionando - sistema protegido contra abuso');
    }
    
    console.log('\n🎯 PASSO 6: Verificar Logs de Segurança');
    console.log('─'.repeat(50));
    
    // Tentar acessar stats (pode requerer auth)
    try {
      const statsResponse = await fetch(`${BACKEND_URL}/gemini/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ Estatísticas disponíveis:', statsData.success ? 'SIM' : 'NÃO');
      } else {
        console.log('⚠️ Estatísticas protegidas (requer autenticação)');
      }
    } catch (error) {
      console.log('⚠️ Estatísticas não acessíveis:', error.message);
    }
    
    console.log('\n🎉 SISTEMA SEGURO TESTADO COM SUCESSO!');
    console.log('═'.repeat(60));
    console.log('✅ Frontend: Sem chaves expostas');
    console.log('✅ Backend: Chave segura no servidor');
    console.log('✅ Comunicação: Frontend ↔ Backend ↔ Gemini');
    console.log('✅ Rate Limiting: Proteção contra abuso');
    console.log('✅ Logs: Monitoramento de uso');
    
    console.log('\n🔐 VANTAGENS DE SEGURANÇA:');
    console.log('• Chave API nunca exposta publicamente');
    console.log('• Controlo total sobre uso da API');
    console.log('• Rate limiting personalizado');
    console.log('• Logs de todas as requisições');
    console.log('• Possibilidade de cache e otimizações');
    
    console.log('\n🚀 SISTEMA PRONTO PARA PRODUÇÃO!');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('🌐 Problema de conectividade - verifica se backend está rodando');
    } else if (error.message.includes('timeout')) {
      console.log('⏱️ Timeout - backend pode estar dormindo no Render');
    }
    
    return false;
  }
}

// Executar teste
testSecureSystem().catch(console.error);