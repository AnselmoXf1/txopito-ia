const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const conversationRoutes = require('./routes/conversations');
const syncRoutes = require('./routes/sync');
const adminRoutes = require('./routes/admin');
const backupRoutes = require('./routes/backup');
const otpRoutes = require('./routes/otp');
const geminiRoutes = require('./routes/gemini');

// Importar middlewares
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Importar serviços
const BackupService = require('./services/BackupService');
const SyncService = require('./services/SyncService');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Configurações de segurança
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tenta novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 tentativas de login por IP
  message: {
    error: 'Muitas tentativas de login. Tenta novamente em 15 minutos.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

// Middlewares globais
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Conectar à base de dados
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/txopito-ia', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado à base de dados MongoDB');
  
  // Iniciar serviços automáticos
  BackupService.startAutomaticBackup();
  console.log('🔄 Serviço de backup automático iniciado');
})
.catch(err => {
  console.error('❌ Erro ao conectar à base de dados:', err);
  process.exit(1);
});

// Rotas da API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/conversations', authMiddleware, conversationRoutes);
app.use('/api/sync', authMiddleware, syncRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/backup', authMiddleware, backupRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/gemini', geminiRoutes); // Endpoint público com rate limiting próprio

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      backup: BackupService.isRunning() ? 'active' : 'inactive',
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not configured'
    }
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Txopito IA Backend API',
    version: '1.0.0',
    author: 'Anselmo Dora Bistiro Gulane',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      conversations: '/api/conversations',
      sync: '/api/sync',
      admin: '/api/admin',
      backup: '/api/backup',
      gemini: '/api/gemini'
    }
  });
});

// WebSocket para sincronização em tempo real
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);
  
  // Juntar-se a sala do utilizador para sincronização
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 Utilizador ${userId} juntou-se à sala`);
  });
  
  // Sincronizar conversa em tempo real
  socket.on('sync-conversation', (data) => {
    socket.to(`user-${data.userId}`).emit('conversation-updated', data);
  });
  
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor Txopito IA Backend rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 WebSocket ativo para sincronização em tempo real`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    mongoose.connection.close();
    console.log('✅ Servidor encerrado graciosamente');
  });
});

module.exports = { app, server, io };