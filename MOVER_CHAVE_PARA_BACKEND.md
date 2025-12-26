# 🔐 MOVER CHAVE GEMINI PARA BACKEND

## 🎯 OBJETIVO
Mover a chave Gemini do frontend para o backend para maior segurança.

## 📊 COMPARAÇÃO

### ❌ **ATUAL (Frontend):**
```
Frontend (.env.local) → Gemini API
```
- Chave exposta no browser
- Qualquer pessoa pode ver e usar
- Sem controlo de quota

### ✅ **PROPOSTO (Backend):**
```
Frontend → Backend → Gemini API → Backend → Frontend
```
- Chave segura no servidor
- Controlo total sobre uso
- Rate limiting personalizado

## 🔧 IMPLEMENTAÇÃO

### 1. **Atualizar Backend**

#### Criar endpoint para Gemini:
```javascript
// backend/routes/gemini.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', async (req, res) => {
  try {
    const { message, history, settings } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.8,
      },
    });
    
    const response = await result.response;
    const text = response.text();
    
    res.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

#### Adicionar ao server.js:
```javascript
const geminiRoutes = require('./routes/gemini');
app.use('/api/gemini', authMiddleware, geminiRoutes);
```

### 2. **Atualizar Frontend**

#### Remover chave do .env.local:
```bash
# REMOVER ESTA LINHA:
# VITE_GEMINI_API_KEY=AIzaSyAvGLE3ZCk62qoPA33clgUCyyIqCal1qEM
```

#### Atualizar GeminiService:
```typescript
// services/geminiService.ts
export class GeminiService {
  async generateResponse(message: string, history: Message[]) {
    try {
      const response = await fetch(`${BACKEND_URL}/gemini/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` // Se tiver auth
        },
        body: JSON.stringify({
          message,
          history,
          settings: { /* configurações */ }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.response;
      } else {
        throw new Error(data.error);
      }
      
    } catch (error) {
      throw new Error(`Erro na comunicação: ${error.message}`);
    }
  }
}
```

### 3. **Configurar Render Backend**

#### Variáveis de ambiente:
```bash
# Manter apenas no backend
GEMINI_API_KEY=AIzaSyAvGLE3ZCk62qoPA33clgUCyyIqCal1qEM

# Outras configurações...
NODE_ENV=production
MONGODB_URI=...
JWT_SECRET=...
```

## ✅ VANTAGENS DA MUDANÇA

### 🔐 **Segurança:**
- Chave nunca exposta publicamente
- Controlo de acesso via autenticação
- Logs de todas as requisições

### 💰 **Controlo de Custos:**
- Rate limiting personalizado
- Quota controlada por utilizador
- Possibilidade de implementar limites

### 🚀 **Funcionalidades Extras:**
- Cache de respostas frequentes
- Filtros de conteúdo
- Analytics de uso
- Backup de conversas

### 🔧 **Manutenção:**
- Chave centralizada
- Fácil rotação de chaves
- Monitoramento centralizado

## 📋 PASSOS PARA IMPLEMENTAR

### 1. **Preparar Backend**
```bash
cd backend
npm install @google/generative-ai
# Criar routes/gemini.js
# Atualizar server.js
```

### 2. **Atualizar Render**
```bash
# Adicionar GEMINI_API_KEY no dashboard
# Fazer redeploy do backend
```

### 3. **Atualizar Frontend**
```bash
# Remover VITE_GEMINI_API_KEY do .env.local
# Atualizar services/geminiService.ts
# Testar integração
```

### 4. **Deploy Frontend**
```bash
# Deploy sem chave Gemini
# Apenas VITE_BACKEND_URL necessário
```

## 🧪 TESTE

### Backend:
```bash
curl -X POST https://txopito-backend.onrender.com/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, como estás?"}'
```

### Frontend:
```bash
npm run dev
# Testar conversa normal
```

---

**Recomendação:** 🟢 **IMPLEMENTAR ESTA MUDANÇA**  
**Benefício:** Segurança muito maior  
**Esforço:** Médio (2-3 horas)  
**Impacto:** Positivo em todos os aspectos