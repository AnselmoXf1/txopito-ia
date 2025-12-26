#!/usr/bin/env node

/**
 * TESTE COMPLETO DO SISTEMA SIMPLIFICADO
 * 
 * Testa frontend (chave única) + backend (sem chaves Gemini)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const FRONTEND_API_KEY = process.env.VITE_GEMINI_API_KEY;
const BACKEND_URL = process.env.VITE_BACKEND_URL;

console.log('🧪 TESTE COMPLETO DO SISTEMA SIMPLIFICADO');
console.log('=========================================');

// Teste 1: Frontend - Chave única Gemini
async function testFrontendGemini() {
  console.log('\n🎯 TESTE 1: FRONTEND - CHAVE ÚNICA GEMINI');
  console.log('─'.repeat(50));
  
  if (!FRONTEND_API_KEY || FRONTEND_API_KEY === 'SUA_NOVA_CHAVE_AQUI') {
    console.log('❌ Chave Gemini não configurada no frontend');
    return false;
  }
  
  console.log(`🔑 Chave: ${FRONTEND_API_KEY.substring(0, 10)}...`);
  
  try {
    const genAI = new GoogleGenerativeAI(FRONTEND_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: 'Responde apenas "Frontend OK" sem mais nada.' }] 
      }],
      generationConfig: {
        maxOutputTokens: 10,
        temperature: 0.1,
      },
    });
    
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ Resposta: ${text.trim()}`);
    console.log('✅ Frontend com chave única: FUNCIONANDO');
    return true;
    
  } catch (error) {
    console.error('❌ Erro no frontend:', error.message);
    
    if (error.message.includes('leaked')) {
      console.log('🚨 Chave comprometida! Gera nova em: https://aistudio.google.com/app/apikey');
    }
    
    return false;
  }
}

// Teste 2: Backend - Sem chaves Gemini
async function testBackend() {
  console.log('\n🎯 TESTE 2: BACKEND - SEM CHAVES GEMINI');
  console.log('─'.repeat(50));
  
  if (!BACKEND_URL) {
    console.log('❌ URL do backend não configurada');
    return false;
  }
  
  console.log(`🔗 URL: ${BACKEND_URL}`);
  
  try {
    // Usar fetch nativo do Node.js 18+
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Status:', data.status);
    console.log('✅ Serviços:', data.services);
    console.log('✅ Backend sem chaves Gemini: FUNCIONANDO');
    return true;
    
  } catch (error) {
    console.error('❌ Erro no backend:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('⏱️ Backend pode estar dormindo no Render');
    }
    
    return false;
  }
}

// Teste 3: Integração completa
async function testIntegration() {
  console.log('\n🎯 TESTE 3: INTEGRAÇÃO FRONTEND + BACKEND');
  console.log('─'.repeat(50));
  
  try {
    // Simular fluxo completo
    console.log('1. Frontend gera resposta com Gemini...');
    const genAI = new GoogleGenerativeAI(FRONTEND_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: 'Diz apenas "Integração OK"' }] 
      }],
      generationConfig: { maxOutputTokens: 10, temperature: 0.1 },
    });
    
    const aiResponse = await result.response;
    const aiText = aiResponse.text();
    console.log(`   ✅ IA respondeu: ${aiText.trim()}`);
    
    // Simular envio para backend
    console.log('2. Enviando dados para backend...');
    const backendResponse = await fetch(`${BACKEND_URL}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Teste de integração',
        response: aiText.trim(),
        timestamp: new Date().toISOString()
      })
    });
    
    if (backendResponse.ok) {
      console.log('   ✅ Dados salvos no backend');
      console.log('✅ INTEGRAÇÃO COMPLETA: FUNCIONANDO');
      return true;
    } else {
      console.log(`   ❌ Erro ao salvar: ${backendResponse.status}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro na integração:', error.message);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 INICIANDO TESTES...\n');
  
  const results = {
    frontend: await testFrontendGemini(),
    backend: await testBackend(),
    integration: false
  };
  
  // Só testa integração se frontend e backend estão OK
  if (results.frontend && results.backend) {
    results.integration = await testIntegration();
  }
  
  // Resumo final
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('═'.repeat(50));
  console.log(`Frontend (Chave Única):  ${results.frontend ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Backend (Sem Gemini):    ${results.backend ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Integração Completa:     ${results.integration ? '✅ OK' : '❌ FALHOU'}`);
  
  const allPassed = results.frontend && results.backend && results.integration;
  
  if (allPassed) {
    console.log('\n🎉 SISTEMA SIMPLIFICADO FUNCIONANDO PERFEITAMENTE!');
    console.log('✅ Frontend usa chave única');
    console.log('✅ Backend sem chaves desnecessárias');
    console.log('✅ Integração completa funcionando');
    console.log('\n🚀 PRONTO PARA PRODUÇÃO!');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM');
    console.log('💡 Verifica as mensagens de erro acima');
    
    if (!results.frontend) {
      console.log('🔑 Frontend: Verifica chave Gemini no .env.local');
    }
    if (!results.backend) {
      console.log('🌐 Backend: Verifica se está rodando no Render');
    }
  }
  
  return allPassed;
}

// Executar
runAllTests().catch(console.error);