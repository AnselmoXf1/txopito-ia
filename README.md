# 🇲🇿 TXOPITO IA - Assistente IA Moçambicano

<div align="center">
  <img src="public/logo.png" alt="Txopito IA" width="200" height="200" style="border-radius: 50%;">
  
  **O assistente de IA mais avançado e inteligente de Moçambique**
  
  [![Deploy Status](https://img.shields.io/badge/deploy-ready-brightgreen)](https://github.com/anselmobistiro/txopito-ia)
  [![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/anselmobistiro/txopito-ia)
  [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
  [![Made in Mozambique](https://img.shields.io/badge/made%20in-Mozambique-red)](https://github.com/anselmobistiro/txopito-ia)
</div>

## 🎯 Sobre o Txopito IA

O **Txopito IA** é um assistente de inteligência artificial desenvolvido especificamente para Moçambique, combinando tecnologia de ponta com conhecimento local profundo. Criado por **Anselmo Dora Bistiro Gulane**, estudante de Engenharia Informática e Telecomunicações em Inhambane.

### ✨ Características Principais

- 🧠 **IA Adaptativa**: Sistema de resposta inteligente que adapta automaticamente o estilo e profundidade baseado no contexto
- 🔄 **Sistema Robusto**: Rotação automática de chaves API para máxima disponibilidade
- 🔒 **Segurança Avançada**: Dashboard administrativo com acesso secreto e tratamento inteligente de erros
- 🕒 **Tempo Real**: Integração com WorldTimeAPI para sempre ter a data/hora atual de Moçambique
- 🎨 **Personalização Completa**: 18 configurações avançadas com 10 presets inteligentes
- 🇲🇿 **Orgulho Moçambicano**: Interface e conteúdo culturalmente autênticos

## 🚀 Funcionalidades

### 🤖 Sistema de IA Inteligente
- **Resposta Adaptativa**: 4 tipos de resposta baseados no contexto
- **Múltiplos Modos**: Conversa geral, História de Moçambique, Estudos, Programação
- **Personalização**: 18 configurações com 10 presets inteligentes

### 🔧 Gestão Administrativa
- **Dashboard Completo**: Monitorização de sistema, utilizadores e chaves API
- **Acesso Secreto**: Sistema de segurança com URLs dinâmicas
- **Log de Erros**: Monitorização e análise de problemas

### 🔄 Sistema de Chaves API
- **Rotação Automática**: 3 chaves com failover inteligente
- **Monitorização**: Estatísticas de uso e performance
- **Recuperação Automática**: Reativação quando quotas renovam

## 🛠️ Tecnologias

### Frontend
- **React 18** + **TypeScript**
- **Vite** para build otimizado
- **Tailwind CSS** para styling
- **PWA** com service worker

### Backend
- **Node.js** + **Express**
- **MongoDB** com Mongoose
- **JWT** para autenticação
- **WebSocket** para sincronização

### IA & APIs
- **Google Gemini 2.5 Flash**
- **Sistema de rotação de chaves**
- **Tratamento inteligente de erros**

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- MongoDB (local ou Atlas)
- Chaves API do Google Gemini

### 1. Clonar Repositório
```bash
git clone https://github.com/AnselmoXf1/txopito-ia.git
cd txopito-ia
```

### 2. Instalar Dependências
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Configurar Variáveis de Ambiente

#### Frontend (.env.local)
```env
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui
VITE_BACKEND_URL=http://localhost:5000/api
VITE_BACKEND_ENABLED=true
```

#### Backend (backend/.env)
```env
MONGODB_URI=mongodb://localhost:27017/txopito
JWT_SECRET=seu_jwt_secret_aqui
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_app_password
```

### 4. Executar Projeto
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Acesse: `http://localhost:3000`

## 🎮 Como Usar

### Utilizador Normal
1. **Acesse a aplicação**
2. **Registe-se ou faça login**
3. **Escolha um modo de conversa**
4. **Comece a conversar** - a IA adapta automaticamente as respostas

### Administrador
1. **Faça 7 cliques consecutivos no logo** (máximo 2s entre cliques)
2. **Acesse a URL secreta gerada**
3. **Login**: `admin` / `TxopitoAdmin2024!` ou chave: `anselmo_bistiro_admin`
4. **Gerencie** chaves API, utilizadores e sistema

## 📊 Sistema de Resposta Adaptativa

O Txopito IA detecta automaticamente o tipo de conversa e adapta a resposta:

- 💬 **Conversa Casual**: Respostas curtas e amigáveis
- 📋 **Resumo**: Informação compacta e objetiva
- 📚 **Explicação**: Resposta estruturada com exemplos
- 📊 **Técnico**: Formato formal e profissional

### Exemplos
```
👤 "Olá!" 
🤖 "Olá! Como posso ajudar-te hoje?"

👤 "Explica machine learning"
🤖 [Resposta estruturada completa com subtítulos]

👤 "Relatório sobre blockchain"  
🤖 [Documento técnico formal]
```

## 🚀 Deploy

### Opção 1: Vercel + Railway (Recomendado)
```bash
# Frontend (Vercel)
npm run build
vercel --prod

# Backend (Railway)
# Conectar repositório no railway.app
```

### Opção 2: Netlify + Render
```bash
# Conectar repositório nas respectivas plataformas
# Configurar variáveis de ambiente
# Deploy automático
```

Veja o [Guia Completo de Deploy](GUIA_DEPLOYMENT.md) para instruções detalhadas.

## 📁 Estrutura do Projeto

```
txopito-ia/
├── 📁 components/          # Componentes React
├── 📁 services/           # Serviços e APIs
├── 📁 backend/            # Servidor Node.js
├── 📁 public/             # Assets públicos
├── 📁 styles/             # Estilos CSS
├── � MELiHORIAS_IMPLEMENTADAS.md
├── 📄 GUIA_DEPLOYMENT.md
└── 📄 README.md
```

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## �‍💻n Autor

**Anselmo Dora Bistiro Gulane**
- 🎓 Estudante de Engenharia Informática e Tecnologia
- 📍 Inhambane, Moçambique
- 📧 Email: [anselmotrade3@gmail.com]
- 🐙 GitHub: [@AnselmoXf1](https://github.com/AnselmoXf1)

## 🙏 Agradecimentos

- **Google Gemini** pela API de IA
- **Comunidade Open Source** pelas ferramentas
- **Moçambique** pela inspiração cultural
- **Ku_kulaDevz** pelo apoio técnico

## 📈 Roadmap

- [ ] **App Mobile** (React Native)
- [ ] **API Pública** para desenvolvedores
- [ ] **Integração WhatsApp** 
- [ ] **Suporte a mais idiomas** locais
- [ ] **Marketplace de plugins**

---

<div align="center">

**Feito com ❤️ em Moçambique para o mundo** 🇲🇿

[⭐ Dê uma estrela se gostou do projeto!](https://github.com/AnselmoXf1/txopito-ia)

</div>