# ✅ CHECKLIST DEPLOY RENDER - PROGRESSO ATUAL

## 🎯 **PROGRESSO ATUAL**

### **📊 1. MONGODB ATLAS** ✅ **CONCLUÍDO**
- [x] Criar conta em `https://www.mongodb.com/atlas`
- [x] Criar cluster M0 (gratuito) - Region: Europe (Frankfurt)
- [x] Configurar Database User: `txopito-admin` + senha forte
- [x] Configurar Network Access: `0.0.0.0/0` (anywhere)
- [x] Copiar connection string
- [x] **GUARDADO**: Connection string com senha

### **🖥️ 2. RENDER BACKEND** ✅ **CONCLUÍDO**
- [x] Criar conta em `https://render.com`
- [x] New Web Service → GitHub: `AnselmoXf1/txopito-ia`
- [x] Configurar:
  - [x] Name: `txopito-backend`
  - [x] Root Directory: `backend`
  - [x] Build Command: `npm install`
  - [x] Start Command: `npm start`
  - [x] Plan: **Free**
- [x] Adicionar variáveis de ambiente (todas configuradas)
- [x] Deploy e aguardar conclusão
- [x] **URL ATIVO**: `https://txopito-ia.onrender.com`
- [x] **TESTADO**: `https://txopito-ia.onrender.com/api/health` ✅ OK

### **🌐 3. VERCEL FRONTEND** ❌ **PRÓXIMO PASSO**
- [ ] Criar conta em `https://vercel.com`
- [ ] New Project → Import: `AnselmoXf1/txopito-ia`
- [ ] Configurar build (Vite detectado automaticamente)
- [ ] Adicionar variáveis de ambiente:
  - [ ] `VITE_GEMINI_API_KEY=AIzaSyDst05_JK65CtieKNvqRZsWXv2kf9RVGQo`
  - [ ] `VITE_BACKEND_URL=https://txopito-ia.onrender.com/api`
  - [ ] `VITE_BACKEND_ENABLED=true`
  - [ ] `VITE_ENVIRONMENT=production`
- [ ] Deploy e aguardar conclusão
- [ ] **GUARDAR**: URL do frontend (ex: `https://txopito-ia.vercel.app`)

### **🔗 4. CONECTAR TUDO** ❌ **DEPOIS DO VERCEL**
- [ ] Atualizar CORS no Render:
  - [ ] `CORS_ORIGIN=https://txopito-ia.vercel.app,http://localhost:3000`
- [ ] Redeploy backend no Render
- [ ] Testar frontend carrega
- [ ] Testar conversa com IA funciona
- [ ] Testar acesso admin (7 cliques no logo)

---

## 🚨 **INFORMAÇÕES IMPORTANTES**

### **🔑 Dados para Guardar:**
```
MongoDB Connection String: mongodb+srv://txopito-admin:SENHA@txopito-cluster.xxxxx.mongodb.net/txopito_production
Render Backend URL: https://txopito-backend.onrender.com
Vercel Frontend URL: https://txopito-ia.vercel.app
```

### **⚠️ Problemas Comuns:**
- **Backend demora a responder**: Render dorme após 15min (normal no plano gratuito)
- **CORS Error**: Verificar se CORS_ORIGIN inclui URL do Vercel
- **Database Error**: Verificar connection string e IP autorizado
- **Build Error**: Verificar se todas as variáveis estão configuradas

### **🧪 Testes Finais:**
```bash
# 1. Backend Health
curl https://SEU_BACKEND_URL/api/health

# 2. Frontend carrega
Abrir: https://SEU_FRONTEND_URL

# 3. IA funciona
Fazer pergunta no chat

# 4. Admin funciona  
7 cliques no logo → dashboard
```

---

## 🎯 **TEMPO ESTIMADO TOTAL: 20-40 minutos**

### **Distribuição:**
- MongoDB Atlas: 5-10 min
- Render Backend: 10-15 min  
- Vercel Frontend: 5-10 min
- Testes e ajustes: 5-10 min

---

## 🚀 **RESULTADO FINAL**

Depois de completar todos os passos, terás:

✅ **Aplicação online** e funcional
✅ **IA respondendo** perfeitamente  
✅ **Admin dashboard** acessível
✅ **Sistema robusto** com 3 chaves API
✅ **Backup automático** no MongoDB Atlas
✅ **Deploy automático** (git push → deploy)
✅ **100% gratuito** para sempre

---

**Pronto para começar? Vamos ao MongoDB Atlas primeiro!** 🇲🇿🚀✨