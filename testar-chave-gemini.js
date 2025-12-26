#!/usr/bin/env node

/**
 * TESTE RÁPIDO DA CHAVE GEMINI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAvGLE3ZCk62qoPA33clgUCyyIqCal1qEM';

console.log('🧪 TESTE RÁPIDO DA CHAVE GEMINI');
console.log('==============================');
console.log(`🔑 Chave: ${API_KEY.substring(0, 10)}...`);

async function testKey() {
  try {
    console.log('\n🔄 Testando chave...');
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: 'Responde apenas "OK" sem mais nada.' }] 
      }],
      generationConfig: {
        maxOutputTokens: 10,
        temperature: 0.1,
      },
    });
    
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ RESPOSTA: ${text.trim()}`);
    console.log('✅ CHAVE VÁLIDA E FUNCIONANDO!');
    
    return true;
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    
    if (error.message.includes('API key not valid')) {
      console.log('🚨 CHAVE INVÁLIDA!');
      console.log('💡 Gera nova chave em: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('leaked')) {
      console.log('🚨 CHAVE COMPROMETIDA!');
      console.log('💡 Gera nova chave em: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('quota')) {
      console.log('⏰ QUOTA EXCEDIDA!');
      console.log('💡 Aguarda renovação ou gera nova chave');
    }
    
    return false;
  }
}

testKey().catch(console.error);