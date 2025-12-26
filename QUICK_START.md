# 🚀 Txopito IA - Início Rápido

## ⚡ Setup Automático (Recomendado)

```bash
# 1. Clonar repositório
git clone [url-do-repositorio]
cd txopito-ia

# 2. Executar setup automático
npm run setup

# 3. Editar chaves da API
# Editar .env.local - adicionar VITE_GEMINI_API_KEY
# Editar backend/.env - configurar MONGODB_URI se necessário

# 4. Iniciar aplicação completa
npm run dev:full
```

## 🌐 URLs de Acesso

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Admin Dashboard:** http://localhost:3000/admin
- **API Health:** http://localhost:5000/api/health

## 🔐 Credenciais Admin

- **Utilizador:** `admin`
- **Palavra-passe:** `TxopitoAdmin2024!`
- **Chave Secreta:** `anselmo_bistiro_admin`

## 📋 Checklist Rápido

### ✅ Pré-requisitos
- [ ] Node.js 18+ instalado
- [ ] MongoDB instalado/configurado (ou MongoDB Atlas)
- [ ] Chave do Gemini AI obtida

### ✅ Configuração
- [ ] Dependências instaladas (`npm run setup`)
- [ ] `.env.local` configurado com `VITE_GEMINI_API_KEY`
- [ ] `backend/.env` configurado com `MONGODB_URI`
- [ ] MongoDB rodando (se local)

### ✅ Teste
- [ ] Frontend carrega em http://localhost:3000
- [ ] Backend responde em http://localhost:5000/api/health
- [ ] Admin acessível em http://localhost:3000/admin
- [ ] Sincronização funcionando (ícone no header)

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Apenas frontend
npm run dev:full         # Frontend + Backend
cd backend && npm run dev # Apenas backend

# Produção
npm run build:full       # Build completo
npm run start:prod       # Iniciar em produção

# Utilitários
npm run setup           # Configuração inicial
npm run preview         # Preview do build
```

## 🐛 Resolução de Problemas

### Backend não inicia
```bash
# Verificar MongoDB
mongod --version

# Verificar porta 5000
netstat -an | grep 5000

# Ver logs do backend
cd backend && npm run dev
```

### Frontend não conecta ao backend
```bash
# Verificar .env.local
cat .env.local | grep BACKEND

# Verificar se backend está rodando
curl http://localhost:5000/api/health
```

### Sincronização não funciona
1. Verificar se `VITE_BACKEND_ENABLED=true` em `.env.local`
2. Verificar se backend está acessível
3. Verificar ícone de sincronização no header
4. Abrir DevTools > Console para ver logs

### Gemini AI não responde
1. Verificar chave em `.env.local`
2. Testar chave em https://aistudio.google.com/app/apikey
3. Verificar se não há restrições de IP/domínio

## 📚 Documentação Completa

- **README.md** - Documentação completa
- **Backend API** - Endpoints em `backend/routes/`
- **Componentes** - Código em `components/`
- **Serviços** - Lógica em `services/`

## 🆘 Suporte

1. **Verificar logs** no console do browser e terminal
2. **Consultar README.md** para documentação detalhada
3. **Abrir issue** no GitHub se problema persistir

---

**Txopito IA** - A tua IA moçambicana está pronta! 🇲🇿✨