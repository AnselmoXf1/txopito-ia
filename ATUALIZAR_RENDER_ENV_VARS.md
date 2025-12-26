# 🔧 ATUALIZAR ENVIRONMENT VARIABLES NO RENDER

## 🎯 **BACKEND RENDER - ENVIRONMENT VARIABLES**

### **Ir para Render Dashboard:**
```
https://render.com → Backend: txopito-ia → Environment
```

### **Variáveis para Atualizar/Adicionar:**

```env
# Servidor
NODE_ENV=production
PORT=10000

# Base de Dados
MONGODB_URI=mongodb+srv://txopito-admin:TxopitoIA2024!@txopito-ia-cluster.nslcyy0.mongodb.net/txopito-ia?retryWrites=true&w=majority

# JWT
JWT_SECRET=txopito_jwt_secret_muito_seguro_2024_anselmo_bistiro_gulane
JWT_EXPIRES_IN=7d

# Frontend URL (IMPORTANTE - atualizar)
FRONTEND_URL=https://txopito-frontend.onrender.com

# Gemini AI - Sistema de Rotação com 4 Chaves
GEMINI_API_KEY=AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ
GEMINI_API_KEY_1=AIzaSyBIUwxf9sLR6DrGZ8BLQHyrf_fjzPpX408
GEMINI_API_KEY_2=AIzaSyC6ER1G5ufI4p-SMgfguZXIfICRKYa0UlE
GEMINI_API_KEY_3=AIzaSyAU41QrEUuGQOuHMdAZjI-TZKr4jFnM_O4

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=deeppianovibes@gmail.com
EMAIL_PASS=hrgffnyfycnmqamo

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Backup
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Logs
LOG_LEVEL=info
LOG_FILE=logs/txopito-backend.log

# CORS (CRÍTICO - incluir frontend URL)
CORS_ORIGIN=https://txopito-frontend.onrender.com,http://localhost:3000
```

---

## 🚀 **PASSO A PASSO:**

### **1. Acessar Render**
- Vai para: `https://render.com`
- Login na conta
- Selecionar: Backend `txopito-ia`

### **2. Environment Variables**
- Clicar: **"Environment"** (menu lateral)
- **"Add Environment Variable"** para cada nova
- **"Edit"** para atualizar existentes

### **3. Variáveis Críticas para Atualizar:**
```
✅ GEMINI_API_KEY_1 (NOVA)
✅ GEMINI_API_KEY_2 (NOVA)  
✅ GEMINI_API_KEY_3 (NOVA)
✅ FRONTEND_URL (atualizar para Render frontend)
✅ CORS_ORIGIN (incluir frontend URL)
✅ NODE_ENV=production
```

### **4. Salvar e Redeploy**
- **"Save Changes"**
- **Manual Deploy** → "Deploy latest commit"
- Aguardar 3-5 minutos

---

## 🧪 **TESTAR APÓS ATUALIZAÇÃO:**

### **1. Health Check:**
```bash
curl https://txopito-ia.onrender.com/api/health
```

### **2. Verificar Logs:**
```
Render Dashboard → Logs
Procurar por:
✅ "Servidor Txopito IA Backend rodando"
✅ "Conectado à base de dados MongoDB"
✅ Sem erros de API key
```

### **3. Testar Frontend → Backend:**
```
Frontend: https://txopito-frontend.onrender.com
Fazer pergunta à IA
Verificar se responde sem erros CORS
```

---

## 🔄 **SISTEMA DE ROTAÇÃO ATIVO:**

### **Com 4 Chaves Configuradas:**
- ✅ **Rotação automática** quando quota excedida
- ✅ **Failover** para próxima chave disponível
- ✅ **Logs** de rotação nos logs do Render
- ✅ **Tolerância a falhas** máxima

### **Logs Esperados:**
```
✅ "Sistema inicializado com 4 chave(s) API"
✅ "Rotação automática ativada"
🔄 "Rotação para chave: Chave Backup #1" (quando necessário)
```

---

## 🚨 **IMPORTANTE:**

### **URLs Corretas:**
- **Frontend**: `https://txopito-frontend.onrender.com`
- **Backend**: `https://txopito-ia.onrender.com`
- **CORS**: Deve incluir ambas as URLs

### **Chaves API:**
- **4 chaves** configuradas para máxima redundância
- **Rotação automática** ativa
- **Sistema robusto** contra falhas de quota

**Depois de atualizar, o sistema terá rotação automática completa!** 🔄🚀🇲🇿