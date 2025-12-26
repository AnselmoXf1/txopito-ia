# 🚀 DEPLOY FRONTEND NO RENDER - GUIA COMPLETO

## 🎯 **OBJETIVO:**
Deploy do frontend Txopito IA no Render Static Site com integração completa ao backend.

---

## 📋 **PRÉ-REQUISITOS:**

### **✅ Backend Funcionando:**
- Backend: `https://txopito-ia.onrender.com` ✅
- Health check: `https://txopito-ia.onrender.com/api/health` ✅
- 4 chaves Gemini configuradas ✅

### **✅ Código Atualizado:**
- PWA simplificado ✅
- Bootstrap removido ✅
- Sistema de rotação de chaves ✅
- Error handling inteligente ✅

---

## 🚀 **PASSO A PASSO DEPLOY:**

### **1. 📤 COMMIT E PUSH ATUALIZAÇÕES**

```bash
# Adicionar mudanças
git add .

# Commit com as melhorias
git commit -m "🔧 Sistema 4 chaves Gemini + Deploy ready"

# Push para GitHub
git push origin main
```

### **2. 🌐 CRIAR STATIC SITE NO RENDER**

#### **Acessar Render:**
```
https://render.com → Dashboard
```

#### **Criar Novo Serviço:**
```
1. "New +" → "Static Site"
2. "Connect a repository"
3. Selecionar: "AnselmoXf1/txopito-ia"
4. Autorizar acesso se necessário
```

#### **Configurações do Static Site:**
```
Name: txopito-frontend
Branch: main
Root Directory: (deixar vazio)
Build Command: npm run build
Publish Directory: dist
```

### **3. 🔧 ENVIRONMENT VARIABLES**

#### **Adicionar Variáveis de Ambiente:**
```env
# API Gemini
VITE_GEMINI_API_KEY=AIzaSyDU7M_mNqPV6qitOs9DEvNG9vsAwwSeSMQ

# Backend URL
VITE_BACKEND_URL=https://txopito-ia.onrender.com/api
VITE_BACKEND_ENABLED=true

# Configurações de Produção
VITE_ENVIRONMENT=production
VITE_SYNC_INTERVAL=300000
VITE_OFFLINE_MODE=false

# Timezone Moçambique
VITE_TIMEZONE=Africa/Maputo

# App Info
VITE_APP_NAME=Txopito IA
VITE_APP_VERSION=2.0.0
VITE_APP_DESCRIPTION=Assistente IA Moçambicano

# Admin Access
VITE_ADMIN_ACCESS_METHOD=secret_clicks
VITE_ADMIN_CLICKS_REQUIRED=7
VITE_ADMIN_CLICK_TIMEOUT=2000

# Performance
VITE_ENABLE_ANALYTICS=true
VITE_API_TIMEOUT=30000
VITE_RETRY_ATTEMPTS=3
```

### **4. 🚀 INICIAR DEPLOY**

```
1. "Create Static Site"
2. Aguardar build (5-10 minutos)
3. Verificar logs de build
4. Obter URL do frontend
```

---

## 🔧 **CONFIGURAR CORS NO BACKEND:**

### **Após obter URL do frontend:**

#### **1. Atualizar CORS_ORIGIN no Backend:**
```env
# No Render Backend → Environment Variables
CORS_ORIGIN=https://txopito-frontend.onrender.com,http://localhost:3000
```

#### **2. Redeploy Backend:**
```
Render Backend → Manual Deploy → "Deploy latest commit"
```

---

## 🧪 **TESTES COMPLETOS:**

### **1. 🌐 Testar Frontend:**
```
URL: https://txopito-frontend.onrender.com
✅ Página carrega
✅ Interface responsiva
✅ PWA funciona
✅ Sem erros no console
```

### **2. 🤖 Testar IA:**
```
1. Fazer pergunta simples: "Olá"
2. Verificar resposta da IA
3. Testar conversa longa
4. Verificar rotação de chaves (se necessário)
```

### **3. 🔐 Testar Admin:**
```
1. 7 cliques no logo (máx 2s entre cliques)
2. Acesso ao painel admin
3. Verificar estatísticas
4. Testar gestão de chaves
```

### **4. 📱 Testar PWA:**
```
1. Chrome → Menu → "Install Txopito IA"
2. Verificar ícone na área de trabalho
3. Testar funcionamento offline básico
```

---

## 🚨 **RESOLUÇÃO DE PROBLEMAS:**

### **❌ Build Falha:**
```bash
# Verificar package.json
# Remover node_modules e reinstalar
npm ci
npm run build

# Se falhar localmente, corrigir antes do deploy
```

### **❌ CORS Error:**
```
1. Verificar CORS_ORIGIN no backend
2. Incluir URL exata do frontend
3. Redeploy backend
4. Aguardar 2-3 minutos
```

### **❌ IA Não Responde:**
```
1. Verificar chaves Gemini no backend
2. Testar health check: /api/health
3. Verificar logs do backend
4. Testar rotação de chaves
```

### **❌ "Txopito está com problemas":**
```
1. Verificar se é utilizador normal (mensagem correta)
2. Fazer login como admin para ver erro técnico
3. Verificar chaves API no painel admin
4. Testar conexão backend
```

---

## 📊 **MONITORIZAÇÃO:**

### **URLs Importantes:**
```
Frontend: https://txopito-frontend.onrender.com
Backend: https://txopito-ia.onrender.com
Health: https://txopito-ia.onrender.com/api/health
Admin: https://txopito-frontend.onrender.com (7 cliques no logo)
```

### **Logs para Monitorizar:**
```
Frontend Render → Logs:
✅ Build successful
✅ Deploy successful
✅ No runtime errors

Backend Render → Logs:
✅ "Sistema inicializado com 4 chave(s) API"
✅ "Rotação automática ativada"
✅ Requests do frontend sem CORS errors
```

---

## 🎯 **RESULTADO ESPERADO:**

### **Sistema Completo Online:**
- ✅ **Frontend**: Render Static Site
- ✅ **Backend**: Render Web Service  
- ✅ **Database**: MongoDB Atlas
- ✅ **IA**: 4 chaves Gemini com rotação
- ✅ **PWA**: Instalável e funcional
- ✅ **Admin**: Acesso secreto por cliques
- ✅ **Error Handling**: Mensagens inteligentes

### **Funcionalidades Ativas:**
- 🤖 **IA Conversacional** com rotação automática
- 🔐 **Sistema Admin** com URLs secretas
- 📱 **PWA** instalável
- 🌍 **Tempo Moçambique** sempre atualizado
- 🛡️ **Error Handling** diferenciado por utilizador
- 📊 **Dashboard Admin** completo
- ⚙️ **18 Configurações** avançadas

---

## 🚀 **PRÓXIMOS PASSOS:**

1. **Deploy Frontend** (seguir este guia)
2. **Configurar CORS** (incluir URL frontend)
3. **Testes Completos** (IA, Admin, PWA)
4. **Monitorização** (verificar logs)
5. **Otimizações** (performance, SEO)

**Vamos colocar o Txopito IA online!** 🇲🇿🚀