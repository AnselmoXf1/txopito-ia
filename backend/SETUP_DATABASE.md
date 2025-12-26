# 🗄️ Configuração da Base de Dados - Txopito IA Backend

## 📋 Opções de Base de Dados

### 1. 🌐 **MongoDB Atlas (Recomendado - Grátis na Nuvem)**

#### Passo 1: Criar Conta no MongoDB Atlas
1. Vai a https://www.mongodb.com/atlas
2. Clica em "Try Free"
3. Cria conta com email ou Google
4. Escolhe o plano **FREE** (M0 Sandbox)

#### Passo 2: Criar Cluster
1. Escolhe **AWS** como provider
2. Região: **Europe (Ireland)** ou mais próxima
3. Nome do cluster: `txopito-ia-cluster`
4. Clica em "Create Cluster" (demora 1-3 minutos)

#### Passo 3: Configurar Acesso
1. **Database Access**:
   - Clica em "Add New Database User"
   - Username: `txopito-admin`
   - Password: `TxopitoIA2024!` (ou gera uma automática)
   - Database User Privileges: **Read and write to any database**
   - Clica em "Add User"

2. **Network Access**:
   - Clica em "Add IP Address"
   - Escolhe **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Ou adiciona o teu IP específico
   - Clica em "Confirm"

#### Passo 4: Obter String de Conexão
1. Vai para **Clusters**
2. Clica em **"Connect"** no teu cluster
3. Escolhe **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copia a connection string:
```
mongodb+srv://txopito-admin:<TxopitoIA2024!>@txopito-ia-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
mongodb+srv://txopito-admin:<TxopitoIA2024!>@txopito-ia-cluster.nslcyy0.mongodb.net/?appName=txopito-ia-cluster
#### Passo 5: Configurar no Backend
Cria o arquivo `backend/.env`:
```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://txopito-admin:TxopitoIA2024!@txopito-ia-cluster.xxxxx.mongodb.net/txopito-ia?retryWrites=true&w=majority

# JWT
JWT_SECRET=txopito_jwt_secret_muito_seguro_2024_anselmo_bistiro
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Gemini AI
GEMINI_API_KEY=AIzaSyCGGZkDEXCphASjXLRhLx5mWNQ32rN394c
```

---
# Use Gmail SMTP ou outro provedor
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=deeppianovibes@gmail.com
MAIL_PASSWORD=hrgffnyfycnmqamo
MAIL_DEFAULT_SENDER=FambaGo <deeppianovibes@gmail.com>

### 2. 🏠 **MongoDB Local (Para Desenvolvimento)**

#### Passo 1: Instalar MongoDB
**Windows:**
1. Vai a https://www.mongodb.com/try/download/community
2. Baixa MongoDB Community Server
3. Instala com configurações padrão
4. MongoDB Compass (GUI) é opcional mas recomendado

**macOS (com Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Passo 2: Verificar Instalação
```bash
# Verificar se MongoDB está rodando
mongo --version

# Conectar ao MongoDB
mongo
```

#### Passo 3: Criar Base de Dados
```javascript
// No terminal do MongoDB
use txopito-ia

// Criar utilizador admin
db.createUser({
  user: "txopito-admin",
  pwd: "TxopitoIA2024!",
  roles: [
    { role: "readWrite", db: "txopito-ia" }
  ]
})
```

#### Passo 4: Configurar no Backend
Cria o arquivo `backend/.env`:
```env
NODE_ENV=development
PORT=5000

# MongoDB Local
MONGODB_URI=mongodb://txopito-admin:TxopitoIA2024!@localhost:27017/txopito-ia

# JWT
JWT_SECRET=txopito_jwt_secret_muito_seguro_2024_anselmo_bistiro
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Gemini AI
GEMINI_API_KEY=AIzaSyCGGZkDEXCphASjXLRhLx5mWNQ32rN394c
```

---

## 🚀 Executar o Backend

### Passo 1: Instalar Dependências
```bash
cd backend
npm install
```

### Passo 2: Executar em Desenvolvimento
```bash
npm run dev
```

### Passo 3: Verificar Conexão
O backend deve mostrar:
```
✅ Conectado à base de dados MongoDB
🚀 Servidor Txopito IA Backend rodando na porta 5000
🌐 Ambiente: development
📡 WebSocket ativo para sincronização em tempo real
🔄 Serviço de backup automático iniciado
```

### Passo 4: Testar API
Abre http://localhost:5000 no browser. Deve mostrar:
```json
{
  "message": "Txopito IA Backend API",
  "version": "1.0.0",
  "author": "Anselmo Dora Bistiro Gulane",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "users": "/api/users",
    "conversations": "/api/conversations",
    "sync": "/api/sync",
    "admin": "/api/admin",
    "backup": "/api/backup"
  }
}
```

---

## 🔧 Resolução de Problemas

### Erro: "MongoNetworkError"
- **Causa**: Não consegue conectar à base de dados
- **Solução**: 
  - Verifica se MongoDB está rodando
  - Confirma a string de conexão no `.env`
  - No Atlas, verifica Network Access (IP permitido)

### Erro: "Authentication failed"
- **Causa**: Credenciais incorretas
- **Solução**:
  - Verifica username/password no `.env`
  - No Atlas, confirma as credenciais do Database User

### Erro: "Cannot find module"
- **Causa**: Dependências não instaladas
- **Solução**: `npm install` na pasta backend

### Erro: "Port 5000 already in use"
- **Causa**: Porta ocupada
- **Solução**: Muda `PORT=5001` no `.env`

---

## 📊 Verificar Base de Dados

### MongoDB Compass (GUI)
1. Baixa em https://www.mongodb.com/products/compass
2. Conecta com a string de conexão
3. Explora as collections: `users`, `conversations`

### Linha de Comando
```bash
# Conectar
mongo "mongodb+srv://txopito-admin:password@cluster.mongodb.net/txopito-ia"

# Listar collections
show collections

# Ver utilizadores
db.users.find().pretty()

# Ver conversas
db.conversations.find().limit(5).pretty()
```

---

## 🎯 Próximos Passos

1. ✅ **Base de dados configurada**
2. ✅ **Backend rodando**
3. 🔄 **Testar sincronização no frontend**
4. 🔄 **Criar primeiro utilizador**
5. 🔄 **Testar conversas**

---

## 💡 Dicas Importantes

- **MongoDB Atlas** é grátis até 512MB (suficiente para desenvolvimento)
- **Backup automático** está configurado no backend
- **Logs** são salvos para debug
- **WebSocket** permite sincronização em tempo real
- **JWT** expira em 7 dias (configurável)

**🎉 Agora tens uma base de dados profissional para o Txopito IA!**