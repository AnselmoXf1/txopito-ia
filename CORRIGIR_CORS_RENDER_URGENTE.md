# 🚨 CORRIGIR CORS NO RENDER - URGENTE

## ⚠️ PROBLEMA IDENTIFICADO

```
Access to fetch at 'https://txopito-backend.onrender.com/api/health' 
from origin 'https://txopito-app.onrender.com' has been blocked by CORS policy: 
The 'Access-Control-Allow-Origin' header has a value 'https://txopito-ia.vercel.app' 
that is not equal to the supplied origin.
```

**Causa:** Backend configurado para aceitar apenas `vercel.app`, mas frontend está em `txopito-app.onrender.com`

## 🔧 SOLUÇÃO IMEDIATA

### 📋 ATUALIZAR VARIÁVEIS NO BACKEND (RENDER)

#### 1. Aceder ao Dashboard do Render
🔗 **Link:** https://dashboard.render.com/

#### 2. Ir ao Serviço Backend
- Procura por `txopito-backend`
- Clica no serviço

#### 3. Atualizar Environment Variables
- Clica em **Environment**
- Procura por `FRONTEND_URL` e `CORS_ORIGIN`

#### 4. ATUALIZAR estas variáveis:

**FRONTEND_URL:**
```
FRONTEND_URL=https://txopito-app.onrender.com
```

**CORS_ORIGIN:**
```
CORS_ORIGIN=https://txopito-app.onrender.com,http://localhost:3000
```

#### 5. Salvar e Redeploy
- Clica **Save Changes**
- Aguarda redeploy automático (2-3 minutos)

## 🧪 TESTAR APÓS CORREÇÃO

### 1. Verificar CORS:
```bash
curl -H "Origin: https://txopito-app.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://txopito-backend.onrender.com/api/health
```

### 2. Testar Frontend:
- Aceder: https://txopito-app.onrender.com
- Fazer pergunta à IA
- Verificar se funciona

## 📋 CONFIGURAÇÃO COMPLETA PARA RENDER

### **Variáveis de Ambiente do Backend:**
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

# FRONTEND (RENDER)
FRONTEND_URL=https://txopito-app.onrender.com

# CORS (RENDER + LOCAL)
CORS_ORIGIN=https://txopito-app.onrender.com,http://localhost:3000

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

## 🎯 RESULTADO ESPERADO

Após a correção:
- ✅ Frontend carrega sem erros CORS
- ✅ IA responde normalmente
- ✅ Sistema completamente funcional
- ✅ Logs limpos no console

## ⏱️ TEMPO ESTIMADO
- **Atualização:** 2 minutos
- **Redeploy:** 3-5 minutos
- **Teste:** 1 minuto
- **Total:** ~10 minutos

---

**Status:** 🔴 **CRÍTICO - BLOQUEIA FUNCIONAMENTO**  
**Prioridade:** MÁXIMA  
**Ação:** Atualizar CORS_ORIGIN no backend imediatamente