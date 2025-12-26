# 🎯 Instruções para o Anselmo - Txopito IA Backend

## 📋 **O que já está pronto:**

### ✅ **Sistema Completo Implementado**
- **Frontend** com sincronização inteligente
- **Backend** com API REST completa
- **Base de dados** MongoDB (modelos prontos)
- **Autenticação** JWT com segurança
- **Admin Dashboard** funcional
- **Backup automático** configurado
- **WebSocket** para tempo real

### ✅ **Arquivos Criados**
```
backend/
├── server.js              # Servidor principal
├── package.json           # Dependências
├── .env.example           # Template de configuração
├── models/
│   ├── User.js            # Modelo de utilizador
│   └── Conversation.js    # Modelo de conversa
├── routes/
│   ├── auth.js           # Autenticação
│   ├── users.js          # Gestão de utilizadores
│   ├── conversations.js  # Gestão de conversas
│   ├── sync.js           # Sincronização
│   ├── admin.js          # Dashboard admin
│   └── backup.js         # Sistema de backup
├── services/
│   ├── SyncService.js    # Lógica de sincronização
│   └── BackupService.js  # Lógica de backup
├── middleware/
│   ├── auth.js           # Middleware de autenticação
│   └── errorHandler.js   # Tratamento de erros
├── scripts/
│   ├── init-database.js  # Inicializar BD
│   └── test-connection.js # Testar conexão
└── SETUP_DATABASE.md     # Guia completo
```

---

## 🚀 **Como Executar (Passo a Passo)**

### **1. Configurar Base de Dados (MongoDB Atlas - Grátis)**

**Opção A: MongoDB Atlas (Recomendado)**
1. Vai a https://www.mongodb.com/atlas
2. Cria conta grátis
3. Cria cluster (FREE tier)
4. Configura acesso (username/password)
5. Permite acesso de qualquer IP (0.0.0.0/0)
6. Copia string de conexão

**Opção B: MongoDB Local**
- Instala MongoDB Community
- Usa: `mongodb://localhost:27017/txopito-ia`

### **2. Configurar Backend**

```bash
cd backend

# Criar arquivo .env
cp .env.example .env

# Editar .env com as tuas configurações
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/txopito-ia
# JWT_SECRET=teu_secret_muito_seguro
# GEMINI_API_KEY=tua_chave_gemini
```

### **3. Instalar e Testar**

```bash
# Instalar dependências
npm install

# Testar conexão com BD
npm run db:test

# Inicializar BD (criar admin/criador)
npm run db:init

# Executar backend
npm run dev
```

### **4. Executar Frontend**

```bash
# Novo terminal, na pasta raiz
npm run dev
```

---

## 🔧 **Configurações Importantes**

### **Frontend (.env.local)**
```env
VITE_GEMINI_API_KEY=AIzaSyCGGZkDEXCphASjXLRhLx5mWNQ32rN394c
VITE_BACKEND_URL=http://localhost:5000/api
VITE_BACKEND_ENABLED=true
VITE_SYNC_INTERVAL=300000
VITE_OFFLINE_MODE=true
```

### **Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/txopito-ia
JWT_SECRET=txopito_jwt_secret_muito_seguro_2024
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=AIzaSyCGGZkDEXCphASjXLRhLx5mWNQ32rN394c
```

---

## 🎯 **URLs de Acesso**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health
- **Admin Dashboard:** http://localhost:3000/admin

---

## 🔐 **Credenciais Padrão**

### **Admin Dashboard**
- **Email:** admin@txopito.mz
- **Password:** TxopitoAdmin2024!
- **Chave Secreta:** anselmo_bistiro_admin

### **Criador (Anselmo)**
- **Email:** anselmo@txopito.mz
- **Password:** AnselmoCreator2024!

---

## 📊 **Funcionalidades Implementadas**

### **API Endpoints**
- `POST /api/auth/register` - Registrar utilizador
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do utilizador
- `GET /api/conversations` - Listar conversas
- `POST /api/conversations` - Criar conversa
- `POST /api/sync/conversations` - Sincronizar
- `GET /api/admin/stats` - Estatísticas admin

### **Funcionalidades Frontend**
- ✅ Sincronização automática a cada 5 minutos
- ✅ Indicador visual de sincronização
- ✅ Modo híbrido (online/offline)
- ✅ Resolução automática de conflitos
- ✅ Backup automático diário
- ✅ Dashboard admin completo

---

## 🔧 **Comandos Úteis**

```bash
# Backend
cd backend
npm run dev          # Executar em desenvolvimento
npm run db:test      # Testar conexão BD
npm run db:init      # Inicializar BD
npm start            # Executar em produção

# Frontend
npm run dev          # Executar frontend
npm run dev:full     # Frontend + Backend
npm run build        # Build para produção
```

---

## 🐛 **Resolução de Problemas**

### **Backend não conecta à BD**
1. Verifica string de conexão no `.env`
2. Confirma credenciais do MongoDB Atlas
3. Verifica Network Access (IP permitido)
4. Executa `npm run db:test`

### **Frontend não sincroniza**
1. Verifica se `VITE_BACKEND_ENABLED=true`
2. Confirma se backend está rodando
3. Vê console do browser para erros
4. Verifica ícone de sincronização no header

### **Erro de autenticação**
1. Verifica `JWT_SECRET` no backend
2. Confirma se utilizador existe na BD
3. Testa login via API diretamente

---

## 🎉 **Próximos Passos**

1. ✅ **Testar sistema completo**
2. 🔄 **Adicionar logos reais** (pasta public/)
3. 🔄 **Configurar domínio** para produção
4. 🔄 **Deploy** (Vercel + Railway/Heroku)
5. 🔄 **Monitorização** e logs

---

## 💡 **Dicas Importantes**

- **MongoDB Atlas** é grátis até 512MB
- **JWT tokens** expiram em 7 dias
- **Backup automático** roda às 2:00 AM
- **Sincronização** funciona mesmo offline
- **Admin dashboard** tem logs completos
- **WebSocket** permite tempo real

---

**🇲🇿 Anselmo, o teu Txopito IA está pronto para conquistar Moçambique! 🚀**

**Qualquer dúvida, verifica os arquivos de documentação ou os logs no console.**