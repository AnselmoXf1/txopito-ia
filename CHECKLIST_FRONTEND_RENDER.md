# ✅ CHECKLIST DEPLOY FRONTEND - RENDER STATIC SITE

## 🎯 **PRÉ-REQUISITOS (CONFIRMADOS)**
- ✅ **Backend funcionando**: `https://txopito-ia.onrender.com/api/health`
- ✅ **Nova chave API**: `AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ`
- ✅ **Repositório GitHub**: `AnselmoXf1/txopito-ia`
- ✅ **Conta Render**: Já tens acesso

---

## 🚀 **PASSO A PASSO DETALHADO**

### **PASSO 1: ACESSAR RENDER**
- [ ] Ir para: `https://render.com`
- [ ] Fazer login na conta
- [ ] Verificar dashboard carrega

### **PASSO 2: CRIAR STATIC SITE**
- [ ] Clicar: **"New +"** (botão verde)
- [ ] Selecionar: **"Static Site"**
- [ ] Escolher: **"Build and deploy from a Git repository"**

### **PASSO 3: CONECTAR REPOSITÓRIO**
- [ ] Conectar conta GitHub (se não estiver)
- [ ] Procurar: **"txopito-ia"**
- [ ] Selecionar: **"AnselmoXf1/txopito-ia"**
- [ ] Clicar: **"Connect"**

### **PASSO 4: CONFIGURAR BUILD**
```
Name: txopito-frontend
Branch: main
Root Directory: (deixar vazio)
Build Command: npm install && npm run build
Publish Directory: dist
Auto-Deploy: Yes
```
- [ ] **Name**: `txopito-frontend`
- [ ] **Branch**: `main`
- [ ] **Root Directory**: (vazio)
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Publish Directory**: `dist`
- [ ] **Auto-Deploy**: `Yes`

### **PASSO 5: ENVIRONMENT VARIABLES**
Clicar **"Advanced"** → **"Add Environment Variable"**:

```
VITE_GEMINI_API_KEY=AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ
VITE_BACKEND_URL=https://txopito-ia.onrender.com/api
VITE_BACKEND_ENABLED=true
VITE_ENVIRONMENT=production
VITE_SYNC_INTERVAL=300000
VITE_OFFLINE_MODE=false
VITE_TIMEZONE=Africa/Maputo
VITE_APP_NAME=Txopito IA
VITE_APP_VERSION=2.0.0
```

- [ ] **VITE_GEMINI_API_KEY**: `AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ`
- [ ] **VITE_BACKEND_URL**: `https://txopito-ia.onrender.com/api`
- [ ] **VITE_BACKEND_ENABLED**: `true`
- [ ] **VITE_ENVIRONMENT**: `production`
- [ ] **VITE_SYNC_INTERVAL**: `300000`
- [ ] **VITE_OFFLINE_MODE**: `false`
- [ ] **VITE_TIMEZONE**: `Africa/Maputo`
- [ ] **VITE_APP_NAME**: `Txopito IA`
- [ ] **VITE_APP_VERSION**: `2.0.0`

### **PASSO 6: CRIAR SITE**
- [ ] Clicar: **"Create Static Site"**
- [ ] Aguardar início do deploy
- [ ] Verificar logs aparecem

---

## 📊 **MONITORIZAR DEPLOY**

### **LOGS ESPERADOS:**
```
✅ "Cloning repository..."
✅ "Installing dependencies..."
✅ "Running build command..."
✅ "Build completed successfully"
✅ "Site deployed successfully"
```

### **TEMPO ESTIMADO:**
- **Cloning**: 30 segundos
- **Installing**: 2-3 minutos
- **Building**: 1-2 minutos
- **Deploying**: 30 segundos
- **Total**: 5-7 minutos

### **SE HOUVER ERROS:**
- [ ] Verificar logs detalhados
- [ ] Problemas comuns:
  - Dependências: Node.js version
  - Build: Vite configuration
  - Environment: Variables missing

---

## 🔗 **APÓS DEPLOY CONCLUÍDO**

### **PASSO 7: OBTER URL**
- [ ] Copiar URL gerada: `https://txopito-frontend.onrender.com`
- [ ] Testar se site carrega
- [ ] Verificar interface aparece

### **PASSO 8: ATUALIZAR CORS BACKEND**
- [ ] Ir para backend: `txopito-ia`
- [ ] **Environment Variables**
- [ ] Atualizar **CORS_ORIGIN**:
```
CORS_ORIGIN=https://txopito-frontend.onrender.com,http://localhost:3000
```
- [ ] **Save**
- [ ] **Manual Deploy** do backend

### **PASSO 9: AGUARDAR BACKEND REDEPLOY**
- [ ] Aguardar 2-3 minutos
- [ ] Verificar backend: `https://txopito-ia.onrender.com/api/health`
- [ ] Deve continuar funcionando

---

## 🧪 **TESTES FINAIS**

### **TESTE 1: FRONTEND CARREGA**
- [ ] Abrir: `https://txopito-frontend.onrender.com`
- [ ] Interface do Txopito IA aparece
- [ ] Logo e design corretos

### **TESTE 2: IA FUNCIONA**
- [ ] Fazer pergunta: "Olá, como estás?"
- [ ] IA responde normalmente
- [ ] Sem erros de conexão

### **TESTE 3: ADMIN FUNCIONA**
- [ ] 7 cliques consecutivos no logo
- [ ] URL secreta é gerada
- [ ] Dashboard admin abre
- [ ] Chaves API aparecem

### **TESTE 4: BACKEND CONECTA**
- [ ] Verificar console (F12)
- [ ] Sem erros de CORS
- [ ] Requests para backend funcionam

---

## 🎉 **RESULTADO FINAL**

### **URLs COMPLETAS:**
```
✅ Frontend:  https://txopito-frontend.onrender.com
✅ Backend:   https://txopito-ia.onrender.com
✅ Database:  MongoDB Atlas (conectada)
✅ Admin:     https://txopito-frontend.onrender.com/admin-[url-secreta]
```

### **SISTEMA COMPLETO:**
- ✅ **Frontend** online e responsivo
- ✅ **Backend** online e funcional
- ✅ **Database** conectada e operacional
- ✅ **IA** respondendo com nova chave
- ✅ **Admin** acessível e seguro
- ✅ **Deploy automático** configurado

---

## 🚨 **TROUBLESHOOTING**

### **Build Falha:**
```
Erro comum: Node.js version
Solução: Render usa Node 18 automaticamente
```

### **Site não carrega:**
```
Verificar:
1. Build concluído com sucesso
2. Publish directory: dist
3. Environment variables corretas
```

### **IA não responde:**
```
Verificar:
1. VITE_GEMINI_API_KEY correta
2. VITE_BACKEND_URL correta
3. CORS atualizado no backend
```

### **Admin não funciona:**
```
Verificar:
1. 7 cliques consecutivos (máx 2s entre cliques)
2. JavaScript habilitado
3. Console sem erros
```

---

## ⏱️ **CRONOGRAMA**

### **Agora (5-10 min):**
- Configurar Static Site
- Aguardar deploy

### **Depois (5 min):**
- Atualizar CORS
- Testes finais

### **Total: 10-15 minutos**

---

**PRONTO PARA COMEÇAR!** 🚀🇲🇿

**Vai para https://render.com e segue o checklist!** ✨