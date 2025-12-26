# 🚀 ATUALIZAR BACKEND NO RENDER - CHAVE ÚNICA

## 🎯 SITUAÇÃO
O backend no Render tem 4 chaves Gemini desnecessárias. O backend **NÃO USA** as chaves Gemini - apenas armazena dados.

## ✅ SOLUÇÃO SIMPLES
**NÃO PRECISAS** de redesploy! Apenas remove as chaves desnecessárias.

## 📋 PASSOS PARA ATUALIZAR

### 1. Aceder ao Dashboard do Render
🔗 **Link:** https://dashboard.render.com/

### 2. Ir ao Teu Serviço Backend
- Clica no serviço `txopito-ia` (backend)
- Vai a **Environment**

### 3. Remover Chaves Desnecessárias
**REMOVE estas variáveis:**
```
GEMINI_API_KEY=AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ
GEMINI_API_KEY_1=AIzaSyBIUwxf9sLR6DrGZ8BLQHyrf_fjzPpX408
GEMINI_API_KEY_2=AIzaSyC6ER1G5ufI4p-SMgfguZXIfICRKYa0UlE
GEMINI_API_KEY_3=AIzaSyAU41QrEUuGQOuHMdAZjI-TZKr4jFnM_O4
```

### 4. Manter Apenas Estas Variáveis
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://txopito-admin:TxopitoIA2024!@txopito-ia-cluster.nslcyy0.mongodb.net/txopito-ia?retryWrites=true&w=majority
JWT_SECRET=txopito_jwt_secret_muito_seguro_2024_anselmo_bistiro_gulane
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=deeppianovibes@gmail.com
EMAIL_PASS=hrgffnyfycnmqamo
FRONTEND_URL=https://txopito-ia.vercel.app
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=5
LOG_LEVEL=info
LOG_FILE=logs/txopito-backend.log
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 2 * * *
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

### 5. Salvar Alterações
- Clica **Save Changes**
- O serviço vai reiniciar automaticamente

## ✅ RESULTADO

### ✅ **Backend Limpo:**
- Sem chaves Gemini desnecessárias
- Apenas variáveis essenciais
- Funcionamento normal mantido

### ✅ **Frontend com Chave Única:**
- Usa apenas: `AIzaSyAvGLE3ZCk62qoPA33clgUCyyIqCal1qEM`
- Sistema simplificado
- Sem rotação automática

## 🔍 VERIFICAÇÃO

Após atualizar, testa:
```bash
# Testar backend
curl https://txopito-ia.onrender.com/api/health

# Testar frontend
npm run dev
```

## 💡 EXPLICAÇÃO

**Por que o backend não precisa das chaves Gemini?**
- Backend apenas armazena conversas no MongoDB
- Frontend faz as chamadas para Gemini API
- Backend recebe dados já processados
- Separação clara de responsabilidades

## 🎯 ARQUITETURA SIMPLIFICADA

```
Frontend (Vite) → Gemini API (chave única)
       ↓
Backend (Render) → MongoDB (apenas dados)
```

---

**Status:** 🟢 **PRONTO PARA ATUALIZAR**  
**Tempo:** 2 minutos  
**Impacto:** Zero downtime