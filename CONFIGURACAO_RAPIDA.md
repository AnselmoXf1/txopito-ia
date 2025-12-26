# ⚡ Configuração Rápida - Txopito IA

## 🎯 **Sem Instalar MongoDB Local - Usar MongoDB Atlas (Grátis)**

### **Passo 1: Criar Base de Dados na Nuvem (5 minutos)**

1. **Vai a:** https://www.mongodb.com/atlas
2. **Clica:** "Try Free"
3. **Cria conta** com email ou Google
4. **Escolhe:** FREE Tier (M0 Sandbox)
5. **Região:** Europe (Ireland) ou mais próxima
6. **Nome:** `txopito-ia-cluster`
7. **Clica:** "Create Cluster"

### **Passo 2: Configurar Acesso (2 minutos)**

1. **Database Access:**
   - Username: `txopito-admin`
   - Password: `TxopitoIA2024!`
   - Role: "Read and write to any database"

2. **Network Access:**
   - Clica "Add IP Address"
   - Escolhe "Allow Access from Anywhere"
   - IP: `0.0.0.0/0`

### **Passo 3: Obter String de Conexão (1 minuto)**

1. **Clusters** → **Connect** → **Connect your application**
2. **Copia a string** (algo como):
```
mongodb+srv://txopito-admin:<password>@txopito-ia-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### **Passo 4: Configurar Backend (1 minuto)**

Cria o arquivo `backend/.env`:
```env
NODE_ENV=development
PORT=5000

# Substitui pela tua string do MongoDB Atlas
MONGODB_URI=mongodb+srv://txopito-admin:TxopitoIA2024!@txopito-ia-cluster.xxxxx.mongodb.net/txopito-ia?retryWrites=true&w=majority

JWT_SECRET=txopito_jwt_secret_muito_seguro_2024_anselmo_bistiro
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=AIzaSyCGGZkDEXCphASjXLRhLx5mWNQ32rN394c
```

### **Passo 5: Testar Conexão (30 segundos)**

```bash
cd backend
npm install
npm run db:test
```

Deve mostrar:
```
✅ Conexão estabelecida com sucesso!
🎉 Base de dados está funcionando perfeitamente!
```

### **Passo 6: Inicializar Base de Dados (30 segundos)**

```bash
npm run db:init
```

Cria utilizadores admin e criador automaticamente.

### **Passo 7: Executar Backend (30 segundos)**

```bash
npm run dev
```

Deve mostrar:
```
✅ Conectado à base de dados MongoDB
🚀 Servidor Txopito IA Backend rodando na porta 5000
```

### **Passo 8: Executar Frontend**

**Novo terminal:**
```bash
npm run dev
```

---

## 🎉 **Pronto! Sistema Completo Funcionando**

### **URLs:**
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Admin:** http://localhost:3000/admin

### **Credenciais:**
- **Admin:** admin@txopito.mz / TxopitoAdmin2024!
- **Criador:** anselmo@txopito.mz / AnselmoCreator2024!

### **Verificar Sincronização:**
1. Abre o frontend
2. Vê o ícone de sincronização no header (deve estar verde)
3. Cria uma conversa
4. Verifica se sincroniza automaticamente

---

## 🔧 **Comandos Úteis**

```bash
# Testar conexão com base de dados
cd backend && npm run db:test

# Inicializar base de dados
cd backend && npm run db:init

# Ver logs do backend
cd backend && npm run dev

# Executar tudo junto
npm run dev:full
```

---

## 🐛 **Se Algo Não Funcionar**

### **Erro de Conexão:**
1. Verifica se copiaste a string correta do Atlas
2. Substitui `<password>` pela palavra-passe real
3. Confirma Network Access (0.0.0.0/0)

### **Backend não inicia:**
1. Verifica se a porta 5000 está livre
2. Confirma se o `.env` está na pasta `backend/`
3. Executa `npm install` na pasta backend

### **Frontend não conecta:**
1. Verifica se `VITE_BACKEND_ENABLED=true` em `.env.local`
2. Confirma se backend está rodando (http://localhost:5000)
3. Vê o console do browser para erros

---

## 💡 **Vantagens do MongoDB Atlas**

- ✅ **Grátis** até 512MB (suficiente para desenvolvimento)
- ✅ **Backup automático** incluído
- ✅ **Sem instalação** local necessária
- ✅ **Acesso de qualquer lugar**
- ✅ **Interface web** para ver dados
- ✅ **Escalável** quando precisares

---

**🇲🇿 Txopito IA com base de dados profissional em menos de 10 minutos!**