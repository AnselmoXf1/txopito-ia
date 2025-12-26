# 🚨 URGENTE: ATUALIZAR CHAVE NO RENDER AGORA

## ⚠️ PROBLEMA IDENTIFICADO
```
{"success":false,"error":"Falha na conexão com Gemini","details":"API key not valid"}
```

**Causa:** Backend no Render não tem a chave Gemini atualizada.

## 🔧 SOLUÇÃO IMEDIATA

### 📋 PASSOS URGENTES:

#### 1. Aceder ao Dashboard do Render
🔗 **Link:** https://dashboard.render.com/

#### 2. Encontrar o Serviço Backend
- Procura por `txopito-backend` ou similar
- Clica no serviço

#### 3. Ir às Variáveis de Ambiente
- Clica em **Environment**
- Procura por `GEMINI_API_KEY`

#### 4. Atualizar/Adicionar a Chave
**ADICIONAR ou ATUALIZAR:**
```
GEMINI_API_KEY=AIzaSyAvGLE3ZCk62qoPA33clgUCyyIqCal1qEM
```

#### 5. Salvar e Redeploy
- Clica **Save Changes**
- Aguarda redeploy automático (2-3 minutos)

## 🧪 TESTAR APÓS ATUALIZAÇÃO

### Teste 1: Health Check
```bash
curl https://txopito-backend.onrender.com/api/health
```
**Resultado esperado:** `"gemini": "configured"`

### Teste 2: Gemini Test
```bash
curl https://txopito-backend.onrender.com/api/gemini/test
```
**Resultado esperado:** `"success": true`

### Teste 3: Geração de Resposta
```bash
curl -X POST https://txopito-backend.onrender.com/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, teste do sistema seguro!"}'
```
**Resultado esperado:** Resposta da IA

## 📋 CHECKLIST COMPLETO

### ✅ **Variáveis Essenciais no Render:**
```bash
# SISTEMA
NODE_ENV=production
PORT=5000

# GEMINI (CHAVE SEGURA)
GEMINI_API_KEY=AIzaSyAvGLE3ZCk62qoPA33clgUCyyIqCal1qEM

# DATABASE
MONGODB_URI=mongodb+srv://txopito-admin:TxopitoIA2024!@txopito-ia-cluster.nslcyy0.mongodb.net/txopito-ia?retryWrites=true&w=majority

# JWT
JWT_SECRET=txopito_jwt_secret_muito_seguro_2024_anselmo_bistiro_gulane
JWT_EXPIRES_IN=7d

# EMAIL
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=deeppianovibes@gmail.com
EMAIL_PASS=hrgffnyfycnmqamo

# FRONTEND
FRONTEND_URL=https://txopito-ia.vercel.app

# RATE LIMITING
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=5

# LOGS
LOG_LEVEL=info
LOG_FILE=logs/txopito-backend.log

# BACKUP
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 2 * * *
```

## 🔍 VERIFICAÇÃO FINAL

### ✅ **Sinais de Sucesso:**
- Health check mostra `"gemini": "configured"`
- Teste Gemini retorna `"success": true`
- Geração de resposta funciona
- Logs mostram requisições bem-sucedidas

### ❌ **Sinais de Problema:**
- `"API key not valid"`
- `"gemini": "not configured"`
- Erros 500 nos endpoints Gemini

## ⏱️ TEMPO ESTIMADO
- **Atualização:** 2 minutos
- **Redeploy:** 3-5 minutos
- **Teste:** 1 minuto
- **Total:** ~10 minutos

## 🎯 RESULTADO ESPERADO

Após a atualização:
```json
{
  "success": true,
  "message": "Conexão com Gemini funcionando",
  "testResponse": "Teste",
  "timestamp": "2025-12-26T21:15:00.000Z"
}
```

---

**Status:** 🔴 **CRÍTICO - REQUER AÇÃO IMEDIATA**  
**Prioridade:** MÁXIMA  
**Impacto:** Sistema não funciona sem esta correção