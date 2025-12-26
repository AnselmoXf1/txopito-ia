#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando Txopito IA...\n');

// Verificar Node.js
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js 18+ é necessário. Versão atual:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js', nodeVersion, 'detectado');

// Função para executar comandos
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`🔄 Executando: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}`);
    return false;
  }
}

// Função para criar arquivo se não existir
function createFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Criado: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️ Já existe: ${filePath}`);
    return false;
  }
}

// 1. Instalar dependências do frontend
console.log('\n📦 Instalando dependências do frontend...');
if (!runCommand('npm install --legacy-peer-deps')) {
  console.error('❌ Falha ao instalar dependências do frontend');
  process.exit(1);
}

// 2. Configurar .env.local
console.log('\n⚙️ Configurando variáveis de ambiente do frontend...');
const frontendEnv = `# CONFIGURAÇÃO DA API DO GOOGLE GEMINI
# 
# PASSOS PARA OBTER UMA CHAVE VÁLIDA:
# 1. Vai a https://aistudio.google.com/app/apikey
# 2. Faz login com a tua conta Google
# 3. Clica em "Create API Key"
# 4. Copia a chave gerada
# 5. Substitui o valor abaixo pela tua chave real
#
# IMPORTANTE: A chave deve começar com "AIza" e ter cerca de 39 caracteres
#
VITE_GEMINI_API_KEY=AIzaSyCGGZkDEXCphASjXLRhLx5mWNQ32rN394c

# CONFIGURAÇÃO DO BACKEND
VITE_BACKEND_URL=http://localhost:5000/api
VITE_BACKEND_ENABLED=true

# CONFIGURAÇÕES DE SINCRONIZAÇÃO
VITE_SYNC_INTERVAL=300000
VITE_OFFLINE_MODE=true

# NOTA: Se continuares a ter problemas:
# - Verifica se a chave está ativa no Google AI Studio
# - Confirma que não há restrições de IP ou domínio
# - Tenta gerar uma nova chave se esta não funcionar
`;

createFileIfNotExists('.env.local', frontendEnv);

// 3. Configurar backend
console.log('\n🔧 Configurando backend...');

// Criar diretório backend se não existir
if (!fs.existsSync('backend')) {
  console.log('ℹ️ Diretório backend já existe');
} else {
  console.log('✅ Diretório backend encontrado');
}

// Instalar dependências do backend
console.log('\n📦 Instalando dependências do backend...');
if (!runCommand('npm install', 'backend')) {
  console.error('❌ Falha ao instalar dependências do backend');
  process.exit(1);
}

// 4. Configurar .env do backend
console.log('\n⚙️ Configurando variáveis de ambiente do backend...');
const backendEnv = `# Configuração do Servidor
NODE_ENV=development
PORT=5000

# Base de Dados
MONGODB_URI=mongodb://localhost:27017/txopito-ia
# Ou MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/txopito-ia

# JWT
JWT_SECRET=txopito_jwt_secret_muito_seguro_2024_anselmo_bistiro_gulane
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Gemini AI (opcional para backend)
GEMINI_API_KEY=AIzaSyCGGZkDEXCphASjXLRhLx5mWNQ32rN394c

# Cloudinary (para upload de imagens - opcional)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Email (para notificações - opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app

# Backup
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Logs
LOG_LEVEL=info
LOG_FILE=logs/txopito-backend.log
`;

createFileIfNotExists('backend/.env', backendEnv);

// 5. Criar diretórios necessários
console.log('\n📁 Criando diretórios necessários...');
const directories = [
  'backend/logs',
  'backend/backups',
  'backend/uploads'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Criado: ${dir}`);
  } else {
    console.log(`ℹ️ Já existe: ${dir}`);
  }
});

// 6. Criar scripts de desenvolvimento
console.log('\n📝 Criando scripts de desenvolvimento...');

const devScript = `#!/bin/bash

echo "🚀 Iniciando Txopito IA em modo desenvolvimento..."

# Verificar se MongoDB está rodando (opcional)
if command -v mongod &> /dev/null; then
    echo "📊 MongoDB detectado"
else
    echo "⚠️ MongoDB não detectado - certifica-te que está instalado e rodando"
fi

# Iniciar backend em background
echo "🔧 Iniciando backend..."
cd backend && npm run dev &
BACKEND_PID=$!

# Aguardar backend inicializar
sleep 3

# Iniciar frontend
echo "🎨 Iniciando frontend..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo "✅ Txopito IA iniciado!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo "🛑 Para parar: Ctrl+C"

# Aguardar interrupção
wait $FRONTEND_PID $BACKEND_PID
`;

createFileIfNotExists('scripts/dev.sh', devScript);

const prodScript = `#!/bin/bash

echo "🏭 Preparando Txopito IA para produção..."

# Build do frontend
echo "📦 Fazendo build do frontend..."
npm run build

# Verificar se build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build do frontend concluído"
else
    echo "❌ Erro no build do frontend"
    exit 1
fi

# Iniciar backend em produção
echo "🔧 Iniciando backend em produção..."
cd backend
NODE_ENV=production npm start

echo "✅ Txopito IA rodando em produção!"
`;

createFileIfNotExists('scripts/prod.sh', prodScript);

// Tornar scripts executáveis (Unix)
if (process.platform !== 'win32') {
  try {
    execSync('chmod +x scripts/dev.sh scripts/prod.sh');
    console.log('✅ Scripts tornados executáveis');
  } catch (error) {
    console.log('⚠️ Não foi possível tornar scripts executáveis');
  }
}

// 7. Verificar MongoDB
console.log('\n📊 Verificando MongoDB...');
try {
  execSync('mongod --version', { stdio: 'pipe' });
  console.log('✅ MongoDB detectado');
} catch (error) {
  console.log('⚠️ MongoDB não detectado');
  console.log('💡 Para instalar MongoDB:');
  console.log('   - Windows: https://www.mongodb.com/try/download/community');
  console.log('   - macOS: brew install mongodb-community');
  console.log('   - Ubuntu: sudo apt install mongodb');
  console.log('   - Ou usar MongoDB Atlas (nuvem): https://www.mongodb.com/atlas');
}

// 8. Resumo final
console.log('\n🎉 Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. 🔑 Obter chave do Gemini AI em: https://aistudio.google.com/app/apikey');
console.log('2. ✏️ Editar .env.local e backend/.env com as tuas chaves');
console.log('3. 📊 Iniciar MongoDB (se local)');
console.log('4. 🚀 Executar: npm run dev (ou ./scripts/dev.sh)');
console.log('\n🌐 URLs:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend: http://localhost:5000');
console.log('   Admin: http://localhost:3000/admin');
console.log('\n🔐 Credenciais Admin:');
console.log('   Utilizador: admin');
console.log('   Palavra-passe: TxopitoAdmin2024!');
console.log('   Chave secreta: anselmo_bistiro_admin');
console.log('\n📚 Documentação completa no README.md');
console.log('\n🇲🇿 Txopito IA - A tua IA moçambicana está pronta!');