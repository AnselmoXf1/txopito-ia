const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting específico para Gemini (mais restritivo)
const geminiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requests por minuto por IP
  message: {
    error: 'Muitas requisições para IA. Aguarda 1 minuto.',
    code: 'GEMINI_RATE_LIMIT_EXCEEDED'
  }
});

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint para gerar resposta
router.post('/generate', geminiLimiter, async (req, res) => {
  try {
    const { message, history = [], settings = {}, user } = req.body;
    
    // Validação básica
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória e deve ser texto válido'
      });
    }
    
    if (message.length > 4000) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem muito longa. Máximo 4000 caracteres.'
      });
    }
    
    console.log(`🤖 Gerando resposta para: ${message.substring(0, 50)}...`);
    
    // Configurar modelo
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: `Sou o Txopito IA, assistente inteligente moçambicano criado por Anselmo Dora Bistiro Gulane.
      
      IDENTIDADE:
      - Assistente masculino, amigável e prestativo
      - Especializado em ajudar utilizadores moçambicanos
      - Uso linguagem natural e acessível
      - Respondo em português de Moçambique
      
      COMPORTAMENTO:
      - Respostas úteis e diretas
      - Tom profissional mas descontraído
      - Adapto o tamanho da resposta ao contexto
      - Priorizo clareza e precisão
      
      CONTEXTO ATUAL:
      - Data: ${new Date().toLocaleDateString('pt-MZ')}
      - Hora: ${new Date().toLocaleTimeString('pt-MZ')}
      - Sistema: Backend seguro com chave protegida
      
      ${user ? `Utilizador: ${user.name || 'Utilizador'}` : ''}
      `
    });
    
    // Preparar histórico de conversa
    const contents = [];
    
    // Adicionar histórico se existir
    if (history && history.length > 0) {
      history.slice(-10).forEach(msg => { // Últimas 10 mensagens
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }
    
    // Adicionar mensagem atual
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });
    
    // Configuração de geração
    const generationConfig = {
      temperature: settings.temperature || 0.8,
      maxOutputTokens: settings.maxTokens || 2048,
      topP: settings.topP || 0.95,
      topK: settings.topK || 40,
    };
    
    // Gerar resposta
    const result = await model.generateContent({
      contents,
      generationConfig,
    });
    
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Resposta vazia recebida da IA');
    }
    
    console.log(`✅ Resposta gerada: ${text.substring(0, 100)}...`);
    
    // Log da requisição (sem dados sensíveis)
    const logData = {
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      messageLength: message.length,
      responseLength: text.length,
      model: 'gemini-2.5-flash',
      ip: req.ip
    };
    
    console.log('📊 Gemini Request:', JSON.stringify(logData));
    
    res.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString(),
      model: 'gemini-2.5-flash',
      usage: {
        inputTokens: contents.reduce((acc, c) => acc + c.parts[0].text.length, 0),
        outputTokens: text.length
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no Gemini:', error);
    
    // Tratar erros específicos
    let errorMessage = 'Erro interno do servidor';
    let statusCode = 500;
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      errorMessage = 'Quota da IA excedida. Tenta novamente mais tarde.';
      statusCode = 429;
    } else if (error.message?.includes('api_key_invalid') || error.message?.includes('401')) {
      errorMessage = 'Erro de configuração da IA. Contacta o suporte.';
      statusCode = 500;
    } else if (error.message?.includes('safety') || error.message?.includes('blocked')) {
      errorMessage = 'Mensagem bloqueada por segurança. Reformula a pergunta.';
      statusCode = 400;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Tempo limite excedido. Tenta com mensagem mais curta.';
      statusCode = 408;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: 'GEMINI_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para testar conexão
router.get('/test', async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Teste' }] }],
      generationConfig: { maxOutputTokens: 10, temperature: 0.1 },
    });
    
    const response = await result.response;
    const text = response.text();
    
    res.json({
      success: true,
      message: 'Conexão com Gemini funcionando',
      testResponse: text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Teste Gemini falhou:', error);
    
    res.status(500).json({
      success: false,
      error: 'Falha na conexão com Gemini',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para estatísticas (admin)
router.get('/stats', async (req, res) => {
  try {
    // Aqui poderias implementar estatísticas de uso
    res.json({
      success: true,
      stats: {
        model: 'gemini-2.5-flash',
        status: 'active',
        rateLimit: {
          window: '1 minute',
          maxRequests: 10
        },
        lastCheck: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;