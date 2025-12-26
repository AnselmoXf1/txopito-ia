# 🚨 CHAVES API COMPROMETIDAS - AÇÃO URGENTE!

## ❌ **PROBLEMA CRÍTICO:**
```
[GoogleGenerativeAI Error]: Your API key was reported as leaked. 
Please use another API key.
```

**A chave `AIzaSyDst05_JK65CtieKNvqRZsWXv2kf9RVGQo` foi BLOQUEADA pelo Google!**

## 🔍 **CAUSA:**
- ✅ **Chave exposta** no GitHub (repositório público)
- ✅ **Google detectou** automaticamente
- ✅ **Sistema de segurança** bloqueou a chave
- ✅ **Todas as 3 chaves** provavelmente comprometidas

---

## 🚀 **SOLUÇÃO IMEDIATA (15 minutos)**

### **1. 🔑 GERAR NOVAS CHAVES API**

#### **Ir para Google AI Studio:**
```
https://aistudio.google.com/app/apikey
```

#### **Revogar Chaves Antigas:**
```
1. Encontrar chaves comprometidas
2. Clicar "Delete" em cada uma
3. Confirmar revogação
```

#### **Criar 3 Novas Chaves:**
```
1. "Create API Key"
2. Nome: "Txopito IA - Chave Principal"
3. Copiar chave gerada
4. Repetir para "Chave Reserva #1" e "Chave Reserva #2"
```

### **2. 🔒 ATUALIZAR CONFIGURAÇÕES LOCAIS**

#### **Atualizar .env.local:**
```env
VITE_GEMINI_API_KEY=SUA_NOVA_CHAVE_PRINCIPAL_AQUI
VITE_BACKEND_URL=https://txopito-ia.onrender.com/api
VITE_BACKEND_ENABLED=true
```

#### **Testar Localmente:**
```bash
npm run dev
# Testar conversa com IA
# Verificar se funciona
```

### **3. 🖥️ ATUALIZAR BACKEND (RENDER)**

#### **Render Dashboard → Environment Variables:**
```env
# Substituir todas as chaves antigas por novas:
GEMINI_API_KEY_1=SUA_NOVA_CHAVE_1
GEMINI_API_KEY_2=SUA_NOVA_CHAVE_2  
GEMINI_API_KEY_3=SUA_NOVA_CHAVE_3
```

#### **Redeploy Backend:**
```
Manual Deploy → "Deploy latest commit"
Aguardar 2-3 minutos
```

### **4. 🌐 ATUALIZAR FRONTEND (QUANDO FIZER DEPLOY)**

#### **Para Render Static Site:**
```env
VITE_GEMINI_API_KEY=SUA_NOVA_CHAVE_PRINCIPAL
```

#### **Para Vercel/Netlify:**
```env
VITE_GEMINI_API_KEY=SUA_NOVA_CHAVE_PRINCIPAL
```

---

## 🛡️ **MEDIDAS DE SEGURANÇA FUTURAS**

### **1. 🔐 NUNCA MAIS EXPOR CHAVES**
```
❌ Não commitar .env files
❌ Não colocar chaves em código
❌ Não partilhar chaves publicamente
✅ Usar apenas environment variables
✅ Adicionar .env* ao .gitignore
```

### **2. 📊 MONITORIZAR CHAVES**
```
✅ Verificar uso no Google AI Studio
✅ Configurar alertas de quota
✅ Rodar chaves regularmente
✅ Usar diferentes chaves para dev/prod
```

### **3. 🔄 SISTEMA DE ROTAÇÃO ROBUSTO**
```
✅ 3+ chaves sempre ativas
✅ Failover automático
✅ Logs de uso por chave
✅ Alertas quando chave falha
```

---

## ⚡ **CHECKLIST URGENTE**

- [ ] **Ir para**: `https://aistudio.google.com/app/apikey`
- [ ] **Revogar** chaves antigas (todas as 3)
- [ ] **Criar** 3 novas chaves
- [ ] **Guardar** chaves em local seguro
- [ ] **Atualizar** .env.local
- [ ] **Testar** localmente
- [ ] **Atualizar** backend no Render
- [ ] **Redeploy** backend
- [ ] **Testar** backend: `https://txopito-ia.onrender.com/api/health`
- [ ] **Atualizar** frontend quando fizer deploy

---

## 🎯 **PRIORIDADES**

### **AGORA (Urgente):**
1. **Gerar novas chaves** (5 min)
2. **Atualizar .env.local** (1 min)
3. **Testar localmente** (2 min)

### **DEPOIS (Importante):**
4. **Atualizar backend** (5 min)
5. **Deploy frontend** (10 min)
6. **Testes completos** (5 min)

---

## 🚨 **NOTA IMPORTANTE**

**Enquanto não atualizares as chaves, o Txopito IA NÃO VAI FUNCIONAR!**

A IA vai retornar erro 403 em todas as tentativas.

**Prioridade máxima: GERAR NOVAS CHAVES AGORA!** 🔑🚀

---

## 📞 **SUPORTE**

Se tiveres problemas:
1. **Verificar** se chaves foram criadas corretamente
2. **Testar** chaves individualmente
3. **Verificar** quotas no Google AI Studio
4. **Confirmar** que chaves não têm restrições

**Vamos resolver isso rapidamente!** 🇲🇿💪