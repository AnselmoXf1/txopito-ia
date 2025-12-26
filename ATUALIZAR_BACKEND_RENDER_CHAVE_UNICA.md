# 🔧 ATUALIZAR BACKEND NO RENDER - CHAVE ÚNICA

## 🎯 SITUAÇÃO ATUAL
- ✅ Backend funcionando: https://txopito-backend.onrender.com
- ✅ Database conectado: MongoDB Atlas
- ✅ Frontend com chave única funcionando
- ⚠️ Backend ainda tem 4 chaves Gemini (desnecessárias)

## 🚀 SOLUÇÃO: Simplificar Backend

### 📋 PASSOS PARA ATUALIZAR

#### 1. Aceder ao Dashboard do Render
🔗 **Link:** https://dashboard.render.com/

#### 2. Ir ao Serviço Backend
- Procura por `txopito-backend` ou similar
- Clica no serviço

#### 3. Ir às Variáveis de Ambiente
- Clica em **Environment**
- Clica em **Edit** ou **Add Environment Variable**

#### 4. Atualizar Variáveis

**REMOVER estas chaves antigas:**
```
GEMINI_API_KEY=AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ
GEMINI_API_KEY_1=AIzaSyBIUwxf9sLR6DrGZ8BLQHyrf_fjzPpX408
GEMINI_API_KEY_2=AIzaSyC6ER1G5ufI4p-SMgfguZXIfICRKYa0UlE
GEMINI_API_KEY_3=AIzaSyAU41QrEUuGQOuHMdAZjI-TZKr4jFnM_O4
```

**ADICIONAR apenas esta chave:**
```
GEMINI_API_KEY=AIzaSyAvGLE3ZCk62qoPA33clgUCyyIqCal1qEM
```

**ATUALIZAR URL do frontend:**
```
FRONTEND_URL=https://txopito-ia.vercel.app
```

#### 5. Salvar e Redeploy
- Clica **Save Changes**
- O serviço vai reiniciar automaticamente
- Aguarda 2-3 minutos

## ✅ CONFIGURAÇÃO FINAL DO BACKEND

### 🔧 **Variáveis Essenciais:**
```bash
# Sistema
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://txopito-admin:TxopitoIA2024!@txopito-ia-cluster.nslcyy0.mongodb.net/txopito-ia?retryWrites=true&w=majority

# JWT
JWT_SECRET=txopito_jwt_secret_muito_seguro_2024_anselmo_bistiro_gulane
JWT_EXPIRES_IN=7d

# Gemini (CHAVE ÚNICA)
GEMINI_API_KEY=AIzaSyAvGLE3ZCk62qoPA33clgUCyyIqCal1qEM

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=deeppianovibes@gmail.com
EMAIL_PASS=hrgffnyfycnmqamo

# Frontend
FRONTEND_URL=https://txopito-ia.vercel.app

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=5

# Logs
LOG_LEVEL=info
LOG_FILE=logs/txopito-backend.log

# Backup
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 2 * * *
```

## 🧪 TESTAR APÓS ATUALIZAÇÃO

### 1. Testar Health Check
```bash
curl https://txopito-backend.onrender.com/api/health
```

### 2. Testar Integração Completa
```bash
node testar-integracao-completa.js
```

## ✅ RESULTADO ESPERADO

### ✅ **Backend Simplificado:**
- Apenas 1 chave Gemini (mesma do frontend)
- Configuração limpa e organizada
- Funcionamento mantido

### ✅ **Sistema Unificado:**
- Frontend e backend usam a mesma chave
- Configuração consistente
- Mais fácil de manter

## 💡 VANTAGENS

### 🎯 **Consistência**
- Mesma chave em frontend e backend
- Configuração unificada
- Comportamento previsível

### 🔧 **Manutenção**
- Apenas 1 chave para gerir
- Menos pontos de falha
- Debugging mais fácil

### 💰 **Economia**
- Sem chaves desnecessárias
- Quota mais controlada
- Gestão simplificada

---

**Status:** 🟡 **AGUARDANDO ATUALIZAÇÃO**  
**Tempo:** 5 minutos  
**Impacto:** Zero downtime (hot reload)