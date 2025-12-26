# 🔧 ATUALIZAR BACKEND NO RENDER - CHAVES COMPROMETIDAS

## 🚨 **PROBLEMA IDENTIFICADO:**
- ✅ **Local funciona** (nova chave configurada)
- ❌ **Render não aceita** (chaves antigas comprometidas no backend)

## 🔍 **CAUSA:**
O backend no Render ainda tem as **chaves antigas bloqueadas** nas environment variables!

---

## ✅ **SOLUÇÃO PASSO A PASSO:**

### **1. 🔑 ATUALIZAR ENVIRONMENT VARIABLES NO RENDER**

#### **Ir para Render Dashboard:**
```
https://render.com → Teu backend: txopito-ia
```

#### **Environment Variables:**
```
Dashboard → Environment → Edit
```

#### **Atualizar estas variáveis:**
```env
# ❌ REMOVER/ATUALIZAR (se existirem):
GEMINI_API_KEY=NOVA_CHAVE_AQUI
GEMINI_API_KEY_1=NOVA_CHAVE_AQUI
GEMINI_API_KEY_2=NOVA_CHAVE_2_AQUI
GEMINI_API_KEY_3=NOVA_CHAVE_3_AQUI

# ✅ MANTER (já corretas):
MONGODB_URI=mongodb+srv://txopito-admin:...
JWT_SECRET=txopito_jwt_secret_muito_seguro_2024...
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://txopito-ia.vercel.app,http://localhost:3000
```

### **2. 🔄 REDEPLOY BACKEND**

#### **Manual Deploy:**
```
Render Dashboard → Manual Deploy → "Deploy latest commit"
Aguardar 3-5 minutos
```

#### **Verificar Logs:**
```
Render Dashboard → Logs
Procurar por:
✅ "Servidor Txopito IA Backend rodando na porta 10000"
✅ "Conectado à base de dados MongoDB"
❌ Erros de API key
```

### **3. 🧪 TESTAR BACKEND ATUALIZADO**

#### **Health Check:**
```bash
curl https://txopito-ia.onrender.com/api/health
```

#### **Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-12-26T...",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "backup": "inactive"
  }
}
```

#### **Testar IA (se backend tem endpoint):**
```bash
curl -X POST https://txopito-ia.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "teste"}'
```

---

## 🔧 **SE AINDA NÃO FUNCIONAR:**

### **Verificar Logs Detalhados:**
```
Render → Logs → Filtrar por "error" ou "gemini"
```

### **Problemas Comuns:**
```
❌ "API key invalid" → Chave ainda antiga
❌ "Quota exceeded" → Chave comprometida
❌ "403 Forbidden" → Chave bloqueada
✅ "Connected successfully" → Funcionando
```

### **Limpar Cache (se necessário):**
```
Render → Settings → Clear build cache
Manual Deploy novamente
```

---

## 🎯 **CHECKLIST RENDER:**

- [ ] **Ir para**: `https://render.com`
- [ ] **Abrir**: Backend txopito-ia
- [ ] **Environment**: Verificar variáveis
- [ ] **Atualizar**: Chaves antigas por novas
- [ ] **Save**: Environment variables
- [ ] **Deploy**: Manual deploy
- [ ] **Aguardar**: 3-5 minutos
- [ ] **Testar**: Health endpoint
- [ ] **Verificar**: Logs sem erros

---

## 🚀 **DEPOIS DE ATUALIZAR:**

### **Frontend vai conectar:**
- Local: ✅ Já funciona
- Deploy: ✅ Vai funcionar com backend atualizado

### **Sistema completo:**
- ✅ **Novas chaves** válidas
- ✅ **Backend** atualizado
- ✅ **Frontend** conectado
- ✅ **IA** funcionando

---

## 📞 **SE PRECISARES DE AJUDA:**

### **Verificar:**
1. **Chaves novas** foram geradas corretamente
2. **Environment variables** foram salvas
3. **Deploy** foi concluído sem erros
4. **Logs** não mostram erros de API

### **Contactar:**
- Render Support (se problemas de plataforma)
- Google AI Studio (se problemas com chaves)

**Vamos resolver isso rapidamente!** 🇲🇿💪