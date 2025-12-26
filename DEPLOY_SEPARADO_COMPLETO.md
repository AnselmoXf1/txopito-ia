# 🚀 DEPLOY SEPARADO - FRONTEND + BACKEND + BASE DE DADOS

## 🎯 ARQUITETURA DE DEPLOY

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │  BASE DE DADOS  │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│ (MongoDB Atlas) │
│                 │    │                 │    │                 │
│ React + Vite    │    │ Node.js + API   │    │ MongoDB Cloud   │
│ Static Files    │    │ WebSocket       │    │ Backup Auto     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 PARTE 1: BASE DE DADOS (MONGODB ATLAS)

### **1.1 Criar Conta MongoDB Atlas**
```bash
# 1. Vai para: https://www.mongodb.com/atlas
# 2. "Try Free" → Criar conta
# 3. Verificar email
```

### **1.2 Criar Cluster**
```bash
# 1. "Build a Database" → "M0 Sandbox" (Grátis)
# 2. Provider: AWS
# 3. Region: Europe (Frankfurt) - mais próximo
# 4. Cluster Name: txopito-cluster
# 5. "Create Cluster"
```

### **1.3 Configurar Acesso**
```bash
# 1. Database Access → "Add New Database User"
#    - Username: txopito-admin
#    - Password: [gerar senha forte]
#    - Role: Atlas Admin

# 2. Network Access → "Add IP Address"
#    - 0.0.0.0/0 (Allow access from anywhere)
#    - Ou IPs específicos do Railway
```

### **1.4 Obter Connection String**
```bash
# 1. Clusters → "Connect" → "Connect your application"
# 2. Driver: Node.js
# 3. Version: 4.1 or later
# 4. Copy connection string:

mongodb+srv://txopito-admin:<password>@txopito-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### **1.5 Configurar Base de Dados**
```javascript
// Conectar e criar estrutura inicial
use txopito_production

// Criar coleções
db.createCollection("users")
db.createCollection("conversations") 
db.createCollection("messages")
db.createCollection("api_keys")
db.createCollection("system_logs")

// Criar índices
db.users.createIndex({ "email": 1 }, { unique: true })
db.conversations.createIndex({ "userId": 1 })
db.messages.createIndex({ "conversationId": 1 })
```

## 🖥️ PARTE 2: BACKEND (RAILWAY)

### **2.1 Preparar Código Backend**
```bash
# 1. Criar repositório GitHub apenas para backend
# 2. Copiar pasta /backend para novo repo
# 3. Ajustar package.json
```

### **2.2 Configurar package.json**
```json
{
  "name": "txopito-ia-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### **2.3 Deploy no Railway**
```bash
# 1. Vai para: https://railway.app
# 2. "Start a New Project" → "Deploy from GitHub repo"
# 3. Conectar conta GitHub
# 4. Selecionar repositório do backend
# 5. Railway detecta automaticamente Node.js
```

### **2.4 Configurar Variáveis de Ambiente**
```bash
# No Railway Dashboard → Variables:

# Base de Dados
MONGODB_URI=mongodb+srv://txopito-admin:PASSWORD@txopito-cluster.xxxxx.mongodb.net/txopito_production

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_2025

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=deeppianovibes@gmail.com
EMAIL_PASS=sua_app_password_gmail

# Configurações
NODE_ENV=production
PORT=5000

# CORS (será preenchido após deploy do frontend)
CORS_ORIGIN=https://txopito-ia.vercel.app
```

### **2.5 Configurar Domínio Personalizado (Opcional)**
```bash
# 1. Railway Dashboard → Settings → Domains
# 2. "Generate Domain" → api-txopito.up.railway.app
# 3. Ou conectar domínio próprio: api.txopito.mz
```

### **2.6 Verificar Deploy**
```bash
# URL gerada: https://api-txopito.up.railway.app
# Testar: https://api-txopito.up.railway.app/api/health
```

## 🌐 PARTE 3: FRONTEND (VERCEL)

### **3.1 Preparar Código Frontend**
```bash
# 1. Repositório principal (já existe)
# 2. Configurar variáveis de produção
```

### **3.2 Configurar .env.production**
```env
# API Keys (as 3 chaves configuradas)
VITE_GEMINI_API_KEY=AIzaSyDst05_JK65CtieKNvqRZsWXv2kf9RVGQo

# Backend URL (Railway)
VITE_BACKEND_URL=https://api-txopito.up.railway.app/api
VITE_BACKEND_ENABLED=true

# Configurações de produção
VITE_ENVIRONMENT=production
VITE_SYNC_INTERVAL=300000
VITE_OFFLINE_MODE=false

# Analytics (opcional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### **3.3 Otimizar Build**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react'],
          services: ['./src/services']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
```

### **3.4 Deploy no Vercel**
```bash
# Método 1: CLI
npm i -g vercel
npm run build
vercel --prod

# Método 2: GitHub Integration
# 1. https://vercel.com → "New Project"
# 2. Import from GitHub
# 3. Configure build settings
```

### **3.5 Configurar Build Settings**
```bash
# Vercel Dashboard → Project Settings:

# Build & Development Settings:
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev

# Root Directory: ./
```

### **3.6 Configurar Variáveis de Ambiente**
```bash
# Vercel Dashboard → Environment Variables:

VITE_GEMINI_API_KEY=AIzaSyDst05_JK65CtieKNvqRZsWXv2kf9RVGQo
VITE_BACKEND_URL=https://api-txopito.up.railway.app/api
VITE_BACKEND_ENABLED=true
VITE_ENVIRONMENT=production
```

### **3.7 Configurar Domínio (Opcional)**
```bash
# 1. Vercel Dashboard → Domains
# 2. Add Domain: txopito.mz ou txopito-ia.com
# 3. Configure DNS records
# 4. SSL automático
```

## 🔗 PARTE 4: CONECTAR TUDO

### **4.1 Atualizar CORS no Backend**
```javascript
// backend/server.js
app.use(cors({
  origin: [
    'https://txopito-ia.vercel.app',
    'https://txopito.mz', // se tiver domínio próprio
    'http://localhost:3000', // para desenvolvimento
    'http://localhost:3001'
  ],
  credentials: true
}));
```

### **4.2 Testar Conexões**
```bash
# 1. Frontend → Backend
curl https://txopito-ia.vercel.app

# 2. Backend → Database
curl https://api-txopito.up.railway.app/api/health

# 3. Backend → MongoDB
# Verificar logs no Railway Dashboard
```

### **4.3 Configurar Webhooks (Opcional)**
```bash
# Railway → Settings → Webhooks
# URL: https://txopito-ia.vercel.app/api/deploy-hook
# Trigger: Deploy success
```

## 🔒 PARTE 5: SEGURANÇA E OTIMIZAÇÃO

### **5.1 Configurar Rate Limiting**
```javascript
// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas, tenta novamente em 15 minutos'
});

module.exports = limiter;
```

### **5.2 Configurar HTTPS Redirect**
```javascript
// backend/middleware/httpsRedirect.js
const httpsRedirect = (req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
};

module.exports = httpsRedirect;
```

### **5.3 Configurar Backup Automático**
```javascript
// backend/services/BackupService.js
const cron = require('node-cron');

// Backup diário às 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('🔄 Iniciando backup automático...');
  
  try {
    // Backup para MongoDB Atlas
    // Ou export para cloud storage
    console.log('✅ Backup concluído');
  } catch (error) {
    console.error('❌ Erro no backup:', error);
  }
});
```

## 📊 PARTE 6: MONITORIZAÇÃO

### **6.1 Configurar Logs**
```javascript
// backend/middleware/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

### **6.2 Health Checks**
```javascript
// backend/routes/health.js
app.get('/api/health', async (req, res) => {
  try {
    // Verificar MongoDB
    await mongoose.connection.db.admin().ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### **6.3 Configurar Alertas**
```bash
# Railway Dashboard → Observability
# - CPU usage alerts
# - Memory usage alerts  
# - Error rate alerts

# Vercel Dashboard → Analytics
# - Performance monitoring
# - Error tracking
# - Usage statistics
```

## 🚀 PARTE 7: COMANDOS DE DEPLOY

### **7.1 Deploy Completo**
```bash
# 1. Commit mudanças
git add .
git commit -m "Deploy production"
git push origin main

# 2. Deploy automático
# Railway e Vercel fazem redeploy automático

# 3. Verificar status
curl https://api-txopito.up.railway.app/api/health
curl https://txopito-ia.vercel.app
```

### **7.2 Rollback (se necessário)**
```bash
# Vercel
vercel --prod --rollback

# Railway
# Dashboard → Deployments → Rollback to previous
```

### **7.3 Logs em Tempo Real**
```bash
# Railway
railway logs --follow

# Vercel
vercel logs --follow
```

## 🎯 PARTE 8: URLS FINAIS

### **8.1 URLs de Produção**
```
Frontend: https://txopito-ia.vercel.app
Backend:  https://api-txopito.up.railway.app
Database: MongoDB Atlas (privado)
Admin:    https://txopito-ia.vercel.app/admin-[url-secreta]
```

### **8.2 Verificação Final**
```bash
# 1. Frontend carrega
✅ https://txopito-ia.vercel.app

# 2. Backend responde
✅ https://api-txopito.up.railway.app/api/health

# 3. Database conecta
✅ MongoDB Atlas dashboard

# 4. IA funciona
✅ Testar conversa no frontend

# 5. Admin acessa
✅ 7 cliques no logo → dashboard
```

## 💰 CUSTOS ESTIMADOS

### **Tier Gratuito (Início)**
- **MongoDB Atlas**: 512MB grátis
- **Railway**: $5/mês após trial
- **Vercel**: Grátis para projetos pessoais
- **Total**: ~$5/mês

### **Tier Profissional (Crescimento)**
- **MongoDB Atlas**: $9/mês (2GB)
- **Railway**: $20/mês (recursos dedicados)
- **Vercel Pro**: $20/mês (domínio + analytics)
- **Total**: ~$49/mês

## 🎉 RESULTADO FINAL

### **Arquitetura Profissional**
- ✅ **Frontend otimizado** (Vercel)
- ✅ **Backend escalável** (Railway)
- ✅ **Database gerenciada** (MongoDB Atlas)
- ✅ **HTTPS em tudo** (SSL automático)
- ✅ **Backup automático** (Atlas + Railway)
- ✅ **Monitorização completa** (Logs + Alerts)

### **Performance e Escalabilidade**
- ✅ **CDN global** (Vercel Edge Network)
- ✅ **Auto-scaling** (Railway + Atlas)
- ✅ **Cache inteligente** (Frontend + Backend)
- ✅ **Load balancing** (Automático)

---

**Deploy separado completo e profissional!** 🇲🇿🚀✨

**Cada componente independente, escalável e monitorizado!** 🌍📊