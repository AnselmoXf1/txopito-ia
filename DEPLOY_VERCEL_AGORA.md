# 🚀 DEPLOY VERCEL - BACKEND JÁ PRONTO!

## ✅ **STATUS ATUAL**
- ✅ **Backend Render**: `https://txopito-ia.onrender.com/` (FUNCIONANDO!)
- ✅ **Database**: MongoDB conectada
- ✅ **API Health**: OK
- ❌ **Frontend**: Precisa deploy no Vercel

---

## 🌐 **DEPLOY FRONTEND NO VERCEL**

### **1. Preparar Vercel**
```bash
# 1. Vai para: https://vercel.com
# 2. "Sign up" → "Continue with GitHub"
# 3. Autorizar acesso à conta GitHub
```

### **2. Importar Projeto**
```bash
# 1. "New Project"
# 2. "Import Git Repository" 
# 3. Procurar: AnselmoXf1/txopito-ia
# 4. "Import"
```

### **3. Configurar Build (Automático)**
```bash
# Vercel detecta automaticamente:
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **4. Configurar Variáveis de Ambiente**

No **Vercel Dashboard** → **Settings** → **Environment Variables**:

```env
# Chave API Gemini (principal)
VITE_GEMINI_API_KEY=AIzaSyDst05_JK65CtieKNvqRZsWXv2kf9RVGQo

# Backend URL (teu Render)
VITE_BACKEND_URL=https://txopito-ia.onrender.com/api
VITE_BACKEND_ENABLED=true

# Configurações de Produção
VITE_ENVIRONMENT=production
VITE_SYNC_INTERVAL=300000
VITE_OFFLINE_MODE=false

# Timezone Moçambique
VITE_TIMEZONE=Africa/Maputo
```

### **5. Deploy**
```bash
# 1. "Deploy"
# 2. Aguardar build (2-5 minutos)
# 3. URL gerada: https://txopito-ia.vercel.app
```

---

## 🔗 **CONECTAR FRONTEND ↔ BACKEND**

### **6. Atualizar CORS no Render**

No **Render Dashboard** → **Environment Variables**:

```env
# Adicionar/Atualizar:
CORS_ORIGIN=https://txopito-ia.vercel.app,https://txopito-ia-git-main-anselmoxf1.vercel.app,http://localhost:3000
```

### **7. Redeploy Backend**
```bash
# Render → Manual Deploy → "Deploy latest commit"
# Aguardar 2-3 minutos
```

---

## 🧪 **TESTES FINAIS**

### **8. Verificar Tudo Funciona**

#### **Frontend:**
```bash
# Abrir: https://txopito-ia.vercel.app
# Deve carregar a interface do Txopito IA
```

#### **Backend Connection:**
```bash
# No frontend, fazer uma pergunta à IA
# Deve responder normalmente
```

#### **Admin Dashboard:**
```bash
# 7 cliques consecutivos no logo
# Deve gerar URL secreta e abrir dashboard
```

#### **Sistema Completo:**
```bash
# Testar:
1. Registo de utilizador
2. Login
3. Conversa com IA
4. Configurações avançadas
5. Acesso administrativo
```

---

## 🎯 **URLS FINAIS**

```
Frontend:  https://txopito-ia.vercel.app
Backend:   https://txopito-ia.onrender.com
API:       https://txopito-ia.onrender.com/api
Health:    https://txopito-ia.onrender.com/api/health
Admin:     https://txopito-ia.vercel.app/admin-[url-secreta]
```

---

## 🚨 **TROUBLESHOOTING**

### **Se Frontend não conecta ao Backend:**
```bash
# 1. Verificar VITE_BACKEND_URL correto
# 2. Verificar CORS_ORIGIN no Render inclui URL do Vercel
# 3. Aguardar backend "acordar" (pode demorar 30-60s primeira vez)
# 4. Verificar logs no Vercel e Render
```

### **Se IA não responde:**
```bash
# 1. Verificar VITE_GEMINI_API_KEY configurado
# 2. Verificar backend conecta à database
# 3. Testar API health endpoint
```

---

## ⏱️ **TEMPO ESTIMADO: 10-15 minutos**

### **Passos:**
1. **Vercel setup**: 3-5 min
2. **Deploy**: 2-5 min  
3. **CORS update**: 2-3 min
4. **Testes**: 3-5 min

---

## 🎉 **RESULTADO FINAL**

Depois destes passos terás:

✅ **Aplicação completa online**
✅ **Frontend + Backend conectados**
✅ **IA funcionando perfeitamente**
✅ **Admin dashboard acessível**
✅ **Sistema robusto com 3 chaves API**
✅ **Deploy automático** (git push → online)
✅ **100% gratuito** para sempre

---

**Pronto para fazer o deploy no Vercel?** 🚀🇲🇿✨

**O backend já está perfeito, só falta o frontend!** 🌍