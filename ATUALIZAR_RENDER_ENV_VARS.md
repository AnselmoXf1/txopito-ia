# 🔧 ATUALIZAR ENVIRONMENT VARIABLES NO RENDER - SISTEMA 4 CHAVES

## 🎯 **BACKEND RENDER - ENVIRONMENT VARIABLES**

### **Ir para Render Dashboard:**
```
https://render.com → Backend: txopito-ia → Environment
```

### **🔑 CHAVES GEMINI - SISTEMA DE ROTAÇÃO COM 4 CHAVES:**

```env
# Chave Principal
GEMINI_API_KEY=AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ

# Sistema de Rotação (3 chaves backup)
GEMINI_API_KEY_1=AIzaSyBIUwxf9sLR6DrGZ8BLQHyrf_fjzPpX408
GEMINI_API_KEY_2=AIzaSyC6ER1G5ufI4p-SMgfguZXIfICRKYa0UlE
GEMINI_API_KEY_3=AIzaSyAU41QrEUuGQOuHMdAZjI-TZKr4jFnM_O4
```

### **📋 TODAS AS ENVIRONMENT VARIABLES:**

```env
# Servidor
NODE_ENV=production
PORT=10000

# Base de Dados MongoDB Atlas
MONGODB_URI=mongodb+srv://txopito-admin:TxopitoIA2024!@txopito-ia-cluster.nslcyy0.mongodb.net/txopito-ia?retryWrites=true&w=majority

# JWT
JWT_SECRET=txopito_jwt_secret_muito_seguro_2024_anselmo_bistiro_gulane
JWT_EXPIRES_IN=7d

# Frontend URL (IMPORTANTE - atualizar quando frontend estiver online)
FRONTEND_URL=https://txopito-frontend.onrender.com

# Gemini AI - Sistema de Rotação com 4 Chaves
GEMINI_API_KEY=AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ
GEMINI_API_KEY_1=AIzaSyBIUwxf9sLR6DrGZ8BLQHyrf_fjzPpX408
GEMINI_API_KEY_2=AIzaSyC6ER1G5ufI4p-SMgfguZXIfICRKYa0UlE
GEMINI_API_KEY_3=AIzaSyAU41QrEUuGQOuHMdAZjI-TZKr4jFnM_O4

# Email (Gmail SMTP)
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

# CORS (CRÍTICO - incluir frontend URL quando estiver online)
CORS_ORIGIN=https://txopito-frontend.onrender.com,http://localhost:3000

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

---

## 🚀 **PASSO A PASSO ATUALIZAÇÃO:**

### **1. Acessar Render Backend**
- Vai para: `https://render.com`
- Login na conta
- Selecionar: Backend `txopito-ia`
- Clicar: **"Environment"** (menu lateral)

### **2. Adicionar/Atualizar Chaves Gemini**
```
✅ GEMINI_API_KEY = AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ
✅ GEMINI_API_KEY_1 = AIzaSyBIUwxf9sLR6DrGZ8BLQHyrf_fjzPpX408
✅ GEMINI_API_KEY_2 = AIzaSyC6ER1G5ufI4p-SMgfguZXIfICRKYa0UlE
✅ GEMINI_API_KEY_3 = AIzaSyAU41QrEUuGQOuHMdAZjI-TZKr4jFnM_O4
```

### **3. Verificar Outras Variáveis Importantes**
```
✅ NODE_ENV = production
✅ PORT = 10000
✅ MONGODB_URI = (já configurada)
✅ JWT_SECRET = (já configurada)
✅ CORS_ORIGIN = https://txopito-frontend.onrender.com,http://localhost:3000
```

### **4. Salvar e Redeploy**
- **"Save Changes"** após cada variável
- **Manual Deploy** → "Deploy latest commit"
- Aguardar 3-5 minutos para deploy completo

---

## 🧪 **TESTAR APÓS ATUALIZAÇÃO:**

### **1. Health Check Backend:**
```bash
curl https://txopito-ia.onrender.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Servidor Txopito IA Backend funcionando",
  "timestamp": "2025-12-26T..."
}
```

### **2. Verificar Logs do Render:**
```
Render Dashboard → Logs (aba)
Procurar por:
✅ "Servidor Txopito IA Backend rodando na porta 10000"
✅ "Conectado à base de dados MongoDB"
✅ "Sistema inicializado com 4 chave(s) API"
✅ "Rotação automática ativada"
❌ Sem erros de API key
```

### **3. Testar Rotação de Chaves:**
```bash
# Testar endpoint de IA (se disponível)
curl -X POST https://txopito-ia.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "teste"}'
```

---

## 🔄 **SISTEMA DE ROTAÇÃO ATIVO:**

### **Com 4 Chaves Configuradas:**
- ✅ **Chave Principal**: AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ
- ✅ **Chave Backup #1**: AIzaSyBIUwxf9sLR6DrGZ8BLQHyrf_fjzPpX408
- ✅ **Chave Backup #2**: AIzaSyC6ER1G5ufI4p-SMgfguZXIfICRKYa0UlE
- ✅ **Chave Backup #3**: AIzaSyAU41QrEUuGQOuHMdAZjI-TZKr4jFnM_O4

### **Comportamento Esperado:**
```
🔄 Rotação automática quando quota excedida
🛡️ Failover instantâneo para próxima chave
📊 Logs detalhados de uso por chave
⚡ Tolerância máxima a falhas
```

### **Logs Esperados no Render:**
```
✅ "Sistema inicializado com 4 chave(s) API"
✅ "Rotação automática ativada para tolerância a falhas"
🔄 "Rotação para chave: Chave Gemini #2" (quando necessário)
⚠️ "Quota excedida para chave: Chave Gemini #1" (quando acontecer)
```

---

## 🚨 **PRÓXIMOS PASSOS:**

### **1. Atualizar Environment Variables (AGORA)**
- Adicionar as 4 chaves Gemini no Render
- Fazer redeploy do backend
- Verificar logs

### **2. Deploy Frontend (DEPOIS)**
- Render Static Site ou Vercel
- Configurar VITE_BACKEND_URL
- Testar integração completa

### **3. Configurar CORS (IMPORTANTE)**
- Atualizar CORS_ORIGIN com URL do frontend
- Redeploy backend novamente
- Testar comunicação frontend ↔ backend

---

## 🎯 **RESULTADO ESPERADO:**

Após esta atualização:
- ✅ **Backend** com 4 chaves Gemini ativas
- ✅ **Rotação automática** funcionando
- ✅ **Tolerância máxima** a falhas de quota
- ✅ **Sistema robusto** para produção

**O backend ficará preparado para receber o frontend!** 🚀🇲🇿