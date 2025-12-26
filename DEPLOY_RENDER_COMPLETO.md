# 🚀 DEPLOY COMPLETO - RENDER + VERCEL + MONGODB ATLAS

## 🎯 ARQUITETURA FINAL

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │  BASE DE DADOS  │
│   (Vercel)      │◄──►│    (Render)     │◄──►│ (MongoDB Atlas) │
│                 │    │                 │    │                 │
│ React + Vite    │    │ Node.js + API   │    │ MongoDB Cloud   │
│ Static Files    │    │ WebSocket       │    │ Backup Auto     │
│ 100% Gratuito   │    │ 750h/mês Grátis│    │ 512MB Grátis    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📊 PARTE 1: BASE DE DADOS (MONGODB ATLAS)

### **1.1 Criar Conta MongoDB Atlas**
```bash
# 1. Vai para: https://www.mongodb.com/atlas
# 2. "Try Free" → Criar conta
# 3. Verificar email e fazer login
```

### **1.2 Criar Cluster Gratuito**
```bash
# 1. "Build a Database" → "M0 Sandbox" (Grátis para sempre)
# 2. Provider: AWS
# 3. Region: Europe (Frankfurt) - mais próximo de África
# 4. Cluster Name: txopito-cluster
# 5. "Create Cluster" (demora 1-3 minutos)
```

### **1.3 Configurar Acesso à Base de Dados**

#### **Database Access (Utilizador):**
```bash
# 1. "Database Access" → "Add New Database User"
# 2. Username: txopito-admin
# 3. Password: [GERAR SENHA FORTE - GUARDAR BEM!]
# 4. Database User Privileges: "Atlas Admin"
# 5. "Add User"
```

#### **Network Access (Rede):**
```bash
# 1. "Network Access" → "Add IP Address"
# 2. "Allow access from anywhere" → 0.0.0.0/0
# 3. Comment: "Render + Vercel Access"
# 4. "Confirm"
```

### **1.4 Obter Connection String**
```bash
# 1. "Clusters" → "Connect" → "Connect your application"
# 2. Driver: Node.js
# 3. Version: 4.1 or later
# 4. COPIAR connection string:

mongodb+srv://txopito-admin:<password>@txopito-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

# ⚠️ IMPORTANTE: Substituir <password> pela senha que criaste!
```

### **1.5 Criar Base de Dados e Coleções**
```javascript
// No MongoDB Compass ou Atlas UI:
// Database: txopito_production

// Coleções:
- users
- conversations  
- messages
- api_keys
- system_logs
- error_logs
```

---

## 🖥️ PARTE 2: BACKEND (RENDER)

### **2.1 Preparar Render**
```bash
# 1. Vai para: https://render.com
# 2. "Get Started for Free"
# 3. "Sign up with GitHub" (conectar conta)
# 4. Autorizar acesso ao GitHub
```

### **2.2 Criar Web Service**
```bash
# 1. Dashboard → "New +" → "Web Service"
# 2. "Build and deploy from a Git repository"
# 3. Conectar repositório: AnselmoXf1/txopito-ia
# 4. "Connect"
```

### **2.3 Configurar Deploy Settings**
```bash
# Basic Settings:
Name: txopito-backend
Region: Frankfurt (EU Central)
Branch: main
Root Directory: backend
Runtime: Node

# Build & Deploy:
Build Command: npm install
Start Command: npm start

# Plan:
Plan Type: Free (0$/month)
```

### **2.4 Configurar Variáveis de Ambiente**

No **Render Dashboard** → **Environment**:

```env
# Base de Dados MongoDB
MONGODB_URI=mongodb+srv://txopito-admin:TUA_SENHA_AQUI@txopito-cluster.xxxxx.mongodb.net/txopito_production

# JWT Secret
JWT_SECRET=txopito_jwt_super_secret_2025_mozambique_render

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=deeppianovibes@gmail.com
EMAIL_PASS=TUA_APP_PASSWORD_GMAIL

# Server Configuration
NODE_ENV=production
PORT=10000

# CORS Origins (será atualizado após Vercel)
CORS_ORIGIN=https://txopito-ia.vercel.app,http://localhost:3000

# Timezone
TZ=Africa/Maputo
```

### **2.5 Deploy Backend**
```bash
# 1. "Create Web Service"
# 2. Render faz deploy automático (5-10 minutos)
# 3. URL gerada: https://txopito-backend.onrender.com
# 4. Verificar logs para confirmar sucesso
```

### **2.6 Testar Backend**
```bash
# Testar health endpoint:
curl https://txopito-backend.onrender.com/api/health

# Resposta esperada:
{
  "status": "healthy",
  "timestamp": "2025-12-26T...",
  "services": {
    "database": "connected",
    "api": "running"
  }
}
```

---

## 🌐 PARTE 3: FRONTEND (VERCEL)

### **3.1 Preparar Vercel**
```bash
# 1. Vai para: https://vercel.com
# 2. "Sign up" → "Continue with GitHub"
# 3. Autorizar acesso
```

### **3.2 Importar Projeto**
```bash
# 1. "New Project"
# 2. "Import Git Repository"
# 3. Selecionar: AnselmoXf1/txopito-ia
# 4. "Import"
```

### **3.3 Configurar Build Settings**
```bash
# Framework Preset: Vite
# Root Directory: ./
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install
# Development Command: npm run dev
```

### **3.4 Configurar Variáveis de Ambiente**

No **Vercel Dashboard** → **Settings** → **Environment Variables**:

```env
# Chaves API Gemini (as 3 configuradas)
VITE_GEMINI_API_KEY=AIzaSyDst05_JK65CtieKNvqRZsWXv2kf9RVGQo

# Backend URL (Render)
VITE_BACKEND_URL=https://txopito-backend.onrender.com/api
VITE_BACKEND_ENABLED=true

# Configurações de Produção
VITE_ENVIRONMENT=production
VITE_SYNC_INTERVAL=300000
VITE_OFFLINE_MODE=false

# Timezone
VITE_TIMEZONE=Africa/Maputo
```

### **3.5 Deploy Frontend**
```bash
# 1. "Deploy"
# 2. Vercel faz build e deploy (2-5 minutos)
# 3. URL gerada: https://txopito-ia.vercel.app
# 4. Verificar se carrega corretamente
```

---

## 🔗 PARTE 4: CONECTAR TUDO

### **4.1 Atualizar CORS no Backend**

No **Render** → **Environment Variables**, atualizar:

```env
CORS_ORIGIN=https://txopito-ia.vercel.app,https://txopito-ia-git-main-anselmoxf1.vercel.app,http://localhost:3000
```

### **4.2 Redeploy Backend**
```bash
# Render → Manual Deploy → "Deploy latest commit"
# Aguardar conclusão (2-3 minutos)
```

### **4.3 Testar Conexão Completa**
```bash
# 1. Frontend carrega
https://txopito-ia.vercel.app

# 2. Backend responde
https://txopito-backend.onrender.com/api/health

# 3. Testar conversa com IA
# 4. Testar acesso admin (7 cliques no logo)
```

---

## 🔧 PARTE 5: OTIMIZAÇÕES

### **5.1 Configurar Custom Domain (Opcional)**

#### **Render (Backend):**
```bash
# Render → Settings → Custom Domains
# Adicionar: api.txopito.mz (se tiveres domínio)
```

#### **Vercel (Frontend):**
```bash
# Vercel → Settings → Domains  
# Adicionar: txopito.mz ou www.txopito.mz
```

### **5.2 Configurar Monitorização**

#### **Render:**
```bash
# Render → Metrics (automático)
# - CPU usage
# - Memory usage  
# - Response times
# - Error rates
```

#### **Vercel:**
```bash
# Vercel → Analytics (automático)
# - Page views
# - Performance metrics
# - Error tracking
```

### **5.3 Configurar Backup Automático**

#### **MongoDB Atlas:**
```bash
# Atlas → Clusters → Backup
# - Continuous backup (automático no plano gratuito)
# - Point-in-time recovery
# - Download snapshots
```

---

## 🚨 PARTE 6: TROUBLESHOOTING

### **6.1 Problemas Comuns**

#### **Backend não conecta à DB:**
```bash
# Verificar:
1. Connection string correto
2. Password sem caracteres especiais
3. IP 0.0.0.0/0 autorizado
4. Utilizador tem permissões Atlas Admin
```

#### **Frontend não conecta ao Backend:**
```bash
# Verificar:
1. VITE_BACKEND_URL correto
2. CORS_ORIGIN inclui URL do Vercel
3. Backend está online (não em sleep)
4. Variáveis de ambiente configuradas
```

#### **Render Sleep Mode:**
```bash
# Plano gratuito "dorme" após 15min inatividade
# Primeira request demora 30-60s para "acordar"
# Solução: Usar cron job ou upgrade para plano pago
```

### **6.2 Logs e Debug**

#### **Render Logs:**
```bash
# Render → Logs (tempo real)
# Filtrar por: Error, Warning, Info
```

#### **Vercel Logs:**
```bash
# Vercel → Functions → View Function Logs
# Ou usar: vercel logs --follow
```

#### **MongoDB Logs:**
```bash
# Atlas → Clusters → Metrics
# Database access logs
# Performance advisor
```

---

## 🎯 PARTE 7: URLS FINAIS

### **7.1 URLs de Produção**
```
Frontend:  https://txopito-ia.vercel.app
Backend:   https://txopito-backend.onrender.com
Database:  MongoDB Atlas (privado)
Admin:     https://txopito-ia.vercel.app/admin-[url-secreta]
Health:    https://txopito-backend.onrender.com/api/health
```

### **7.2 Comandos de Teste**
```bash
# Testar frontend
curl https://txopito-ia.vercel.app

# Testar backend
curl https://txopito-backend.onrender.com/api/health

# Testar IA (via frontend)
# Abrir browser → conversar com IA

# Testar admin
# 7 cliques no logo → dashboard
```

---

## 💰 CUSTOS (TODOS GRATUITOS!)

### **Tier Gratuito Permanente:**
```
MongoDB Atlas:  512MB (gratuito para sempre)
Render:         750 horas/mês (gratuito)
Vercel:         100GB bandwidth (gratuito)
Total:          0$/mês 🎉
```

### **Limites Gratuitos:**
```
MongoDB:        512MB storage, 100 connections
Render:         750h/mês, sleep após 15min inatividade
Vercel:         100GB bandwidth, 100 deployments/dia
```

---

## 🎉 RESULTADO FINAL

### **Arquitetura Profissional 100% Gratuita:**
- ✅ **Frontend otimizado** (Vercel CDN global)
- ✅ **Backend escalável** (Render com Node.js)
- ✅ **Database gerenciada** (MongoDB Atlas)
- ✅ **HTTPS em tudo** (SSL automático)
- ✅ **Deploy automático** (Git push → deploy)
- ✅ **Monitorização** (logs e métricas)

### **Performance:**
- ✅ **CDN global** (Vercel Edge Network)
- ✅ **Auto-scaling** (Render + Atlas)
- ✅ **Cache inteligente** (Frontend + Backend)
- ✅ **Backup automático** (Atlas)

---

**Deploy separado completo e 100% gratuito!** 🇲🇿🚀✨

**Cada componente independente, profissional e monitorizado!** 🌍📊

## 🎯 PRÓXIMOS PASSOS

1. **MongoDB Atlas** - Criar cluster e obter connection string
2. **Render** - Deploy do backend com variáveis de ambiente  
3. **Vercel** - Deploy do frontend conectado ao backend
4. **Testar** - Verificar tudo funciona perfeitamente

**Vamos começar com MongoDB Atlas?** 🚀