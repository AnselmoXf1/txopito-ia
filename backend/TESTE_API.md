# 🧪 Teste Completo da API - Txopito IA Backend

## 🎯 **Testes Básicos no Browser**

### **1. Teste de Saúde da API**
**URL:** http://localhost:5000
**Método:** GET
**Resultado esperado:**
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

### **2. Teste de Health Check**
**URL:** http://localhost:5000/api/health
**Método:** GET
**Resultado esperado:**
```json
{
  "status": "OK",
  "timestamp": "2024-12-24T...",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "backup": "active"
  }
}
```

---

## 🔐 **Testes de Autenticação (Postman/Insomnia)**

### **3. Registrar Novo Utilizador**
**URL:** http://localhost:5000/api/auth/register
**Método:** POST
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Teste Utilizador",
  "email": "teste@txopito.mz",
  "password": "123456"
}
```
**Resultado esperado:**
```json
{
  "success": true,
  "message": "Utilizador criado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Teste Utilizador",
    "email": "teste@txopito.mz",
    "role": "user"
  }
}
```

### **4. Login de Utilizador**
**URL:** http://localhost:5000/api/auth/login
**Método:** POST
**Headers:**
```
Content-Type: application/json
```
**Body:**
```json
{
  "email": "admin@txopito.mz",
  "password": "TxopitoAdmin2024!"
}
```
**Resultado esperado:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Administrador Txopito",
    "email": "admin@txopito.mz",
    "role": "admin"
  }
}
```

### **5. Obter Dados do Utilizador Atual**
**URL:** http://localhost:5000/api/auth/me
**Método:** GET
**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```
**Resultado esperado:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Administrador Txopito",
    "email": "admin@txopito.mz",
    "role": "admin",
    "preferences": {...},
    "usage": {...}
  }
}
```

---

## 💬 **Testes de Conversas**

### **6. Criar Nova Conversa**
**URL:** http://localhost:5000/api/conversations
**Método:** POST
**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```
**Body:**
```json
{
  "id": "conv_test_123",
  "title": "Conversa de Teste",
  "mode": "Conversa Geral",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "Olá, como estás?",
      "timestamp": 1703424000000
    }
  ]
}
```

### **7. Listar Conversas**
**URL:** http://localhost:5000/api/conversations
**Método:** GET
**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### **8. Atualizar Conversa**
**URL:** http://localhost:5000/api/conversations/conv_test_123
**Método:** PUT
**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```
**Body:**
```json
{
  "title": "Conversa Atualizada",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "Olá, como estás?",
      "timestamp": 1703424000000
    },
    {
      "id": "msg_2",
      "role": "assistant",
      "content": "Olá! Estou bem, obrigado. Como posso ajudar?",
      "timestamp": 1703424060000
    }
  ]
}
```

---

## 🔄 **Testes de Sincronização**

### **9. Sincronizar Conversas**
**URL:** http://localhost:5000/api/sync/conversations
**Método:** POST
**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```
**Body:**
```json
{
  "deviceId": "device_test_123",
  "conversations": [
    {
      "id": "conv_local_1",
      "title": "Conversa Local",
      "mode": "Conversa Geral",
      "messages": [],
      "lastUpdate": 1703424000000
    }
  ]
}
```

### **10. Estatísticas de Sincronização**
**URL:** http://localhost:5000/api/sync/stats
**Método:** GET
**Headers:**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 👑 **Testes Admin (Apenas com token de admin)**

### **11. Estatísticas Gerais**
**URL:** http://localhost:5000/api/admin/stats
**Método:** GET
**Headers:**
```
Authorization: Bearer TOKEN_DO_ADMIN
```

### **12. Listar Utilizadores**
**URL:** http://localhost:5000/api/admin/users
**Método:** GET
**Headers:**
```
Authorization: Bearer TOKEN_DO_ADMIN
```

### **13. Atualizar Utilizador**
**URL:** http://localhost:5000/api/admin/users/USER_ID
**Método:** PUT
**Headers:**
```
Authorization: Bearer TOKEN_DO_ADMIN
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Nome Atualizado",
  "status": "active",
  "role": "user"
}
```

---

## 🧪 **Script de Teste Automático**

Cria um arquivo `test-api.js` na pasta backend:

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';

async function testAPI() {
  console.log('🧪 Iniciando testes da API...\n');
  
  try {
    // 1. Teste de saúde
    console.log('1. Testando health check...');
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health:', health.data.status);
    
    // 2. Login admin
    console.log('\n2. Fazendo login como admin...');
    const login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@txopito.mz',
      password: 'TxopitoAdmin2024!'
    });
    authToken = login.data.token;
    console.log('✅ Login realizado, token obtido');
    
    // 3. Obter dados do utilizador
    console.log('\n3. Obtendo dados do utilizador...');
    const me = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Utilizador:', me.data.user.name);
    
    // 4. Listar conversas
    console.log('\n4. Listando conversas...');
    const conversations = await axios.get(`${BASE_URL}/api/conversations`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Conversas encontradas:', conversations.data.conversations.length);
    
    // 5. Estatísticas admin
    console.log('\n5. Obtendo estatísticas admin...');
    const stats = await axios.get(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Total de utilizadores:', stats.data.stats.users.total);
    
    console.log('\n🎉 Todos os testes passaram com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testAPI();
```

Para executar:
```bash
cd backend
npm install axios
node test-api.js
```

---

## 🌐 **Teste Manual no Browser**

### **URLs para testar diretamente:**

1. **API Root:** http://localhost:5000
2. **Health Check:** http://localhost:5000/api/health
3. **Documentação:** http://localhost:5000/api (mostra endpoints)

### **Para testes avançados, usa:**
- **Postman:** https://www.postman.com/downloads/
- **Insomnia:** https://insomnia.rest/download
- **Thunder Client** (extensão do VS Code)

---

## ✅ **Checklist de Testes**

- [ ] API responde em http://localhost:5000
- [ ] Health check retorna "OK"
- [ ] Login admin funciona
- [ ] Token JWT é gerado
- [ ] Endpoints protegidos exigem autenticação
- [ ] CRUD de conversas funciona
- [ ] Sincronização aceita dados
- [ ] Admin endpoints funcionam
- [ ] Erros retornam códigos HTTP corretos

---

**🚀 Agora testa estes endpoints e me diz quais funcionam!**