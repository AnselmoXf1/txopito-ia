# 📋 IMPORTAR VARIÁVEIS NO VERCEL - SUPER FÁCIL

## 🎯 **MÉTODO 1: COPIAR E COLAR (RECOMENDADO)**

### **1. Abrir .env.production**
```bash
# Abrir o arquivo .env.production que criei
# Copiar TODAS as linhas (Ctrl+A, Ctrl+C)
```

### **2. No Vercel Dashboard**
```bash
# 1. Vercel.com → Teu projeto → Settings → Environment Variables
# 2. "Add New" → "Bulk Edit"
# 3. Colar tudo (Ctrl+V)
# 4. "Save"
```

---

## 🎯 **MÉTODO 2: UMA POR UMA**

No **Vercel** → **Environment Variables** → **Add New**:

### **🔑 Chaves API:**
```
Name: VITE_GEMINI_API_KEY
Value: AIzaSyDst05_JK65CtieKNvqRZsWXv2kf9RVGQo
Environment: Production, Preview, Development
```

### **🖥️ Backend:**
```
Name: VITE_BACKEND_URL
Value: https://txopito-ia.onrender.com/api
Environment: Production, Preview, Development
```

```
Name: VITE_BACKEND_ENABLED
Value: true
Environment: Production, Preview, Development
```

### **🌍 Produção:**
```
Name: VITE_ENVIRONMENT
Value: production
Environment: Production, Preview, Development
```

```
Name: VITE_SYNC_INTERVAL
Value: 300000
Environment: Production, Preview, Development
```

```
Name: VITE_OFFLINE_MODE
Value: false
Environment: Production, Preview, Development
```

### **🕒 Timezone:**
```
Name: VITE_TIMEZONE
Value: Africa/Maputo
Environment: Production, Preview, Development
```

---

## 🚀 **DEPOIS DE CONFIGURAR**

### **1. Redeploy**
```bash
# Vercel → Deployments → "Redeploy"
# Ou fazer novo commit no GitHub (deploy automático)
```

### **2. Testar**
```bash
# Abrir: https://txopito-ia.vercel.app
# Verificar se conecta ao backend
# Testar conversa com IA
```

---

## ✅ **CHECKLIST RÁPIDO**

- [ ] Copiar conteúdo de `.env.production`
- [ ] Vercel → Settings → Environment Variables
- [ ] "Bulk Edit" → Colar → Save
- [ ] Redeploy
- [ ] Testar aplicação

---

## 🎉 **RESULTADO**

Depois disto, o **Txopito IA** estará:

✅ **Frontend online** (Vercel)
✅ **Backend conectado** (Render)  
✅ **Database funcionando** (MongoDB Atlas)
✅ **IA respondendo** (Gemini API)
✅ **Admin acessível** (7 cliques no logo)

**Tempo total: 2-5 minutos!** 🇲🇿🚀✨