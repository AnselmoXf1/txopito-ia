const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [10000, 'Mensagem muito longa']
  },
  timestamp: {
    type: Number,
    required: true,
    default: Date.now
  },
  metadata: {
    tokens: Number,
    processingTime: Number,
    model: String,
    error: String
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Título muito longo']
  },
  mode: {
    type: String,
    enum: ['Conversa Geral', 'História de Moçambique', 'Contador de Histórias', 'Modo Estudante', 'Programação'],
    required: true
  },
  messages: [messageSchema],
  lastUpdate: {
    type: Number,
    required: true,
    default: Date.now
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  summary: {
    type: String,
    maxlength: 500
  },
  messageCount: {
    type: Number,
    default: 0
  },
  syncStatus: {
    lastSynced: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    },
    conflicts: [{
      timestamp: Date,
      resolved: Boolean,
      description: String
    }]
  },
  devices: [{
    deviceId: String,
    lastAccessed: Date,
    lastModified: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para performance
conversationSchema.index({ userId: 1, lastUpdate: -1 });
conversationSchema.index({ id: 1 });
conversationSchema.index({ mode: 1 });
conversationSchema.index({ isArchived: 1 });
conversationSchema.index({ 'syncStatus.lastSynced': 1 });

// Virtual para duração da conversa
conversationSchema.virtual('duration').get(function() {
  if (this.messages.length < 2) return 0;
  
  const firstMessage = this.messages[0];
  const lastMessage = this.messages[this.messages.length - 1];
  
  return lastMessage.timestamp - firstMessage.timestamp;
});

// Virtual para verificar se precisa de sincronização
conversationSchema.virtual('needsSync').get(function() {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  return this.syncStatus.lastSynced < fiveMinutesAgo;
});

// Middleware para atualizar contadores
conversationSchema.pre('save', function(next) {
  this.messageCount = this.messages.length;
  this.lastUpdate = Date.now();
  this.updatedAt = new Date();
  
  // Atualizar versão para sincronização
  if (this.isModified('messages')) {
    this.syncStatus.version += 1;
  }
  
  next();
});

// Método para adicionar mensagem
conversationSchema.methods.addMessage = function(message) {
  // Validar mensagem
  if (!message.id || !message.role || !message.content) {
    throw new Error('Mensagem inválida: id, role e content são obrigatórios');
  }
  
  // Adicionar timestamp se não existir
  if (!message.timestamp) {
    message.timestamp = Date.now();
  }
  
  this.messages.push(message);
  this.lastUpdate = Date.now();
  
  // Gerar título automático se for a primeira mensagem do utilizador
  if (this.messages.length === 1 && message.role === 'user') {
    this.title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
  }
  
  return this.save();
};

// Método para atualizar dispositivo de acesso
conversationSchema.methods.updateDeviceAccess = function(deviceId) {
  const device = this.devices.find(d => d.deviceId === deviceId);
  
  if (device) {
    device.lastAccessed = new Date();
  } else {
    this.devices.push({
      deviceId,
      lastAccessed: new Date(),
      lastModified: new Date()
    });
  }
  
  return this.save();
};

// Método para marcar como sincronizada
conversationSchema.methods.markSynced = function() {
  this.syncStatus.lastSynced = new Date();
  return this.save();
};

// Método para resolver conflito de sincronização
conversationSchema.methods.resolveConflict = function(description) {
  this.syncStatus.conflicts.push({
    timestamp: new Date(),
    resolved: true,
    description
  });
  
  return this.save();
};

// Método para arquivar conversa
conversationSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Método para desarquivar conversa
conversationSchema.methods.unarchive = function() {
  this.isArchived = false;
  return this.save();
};

// Método para gerar resumo automático
conversationSchema.methods.generateSummary = function() {
  if (this.messages.length === 0) return '';
  
  const userMessages = this.messages.filter(m => m.role === 'user');
  const topics = userMessages.map(m => m.content.substring(0, 30)).join(', ');
  
  this.summary = `Conversa sobre: ${topics}`;
  return this.save();
};

// Método estático para encontrar por utilizador
conversationSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.archived !== undefined) {
    query.isArchived = options.archived;
  }
  
  return this.find(query)
    .sort({ lastUpdate: -1 })
    .limit(options.limit || 50);
};

// Método estático para encontrar por modo
conversationSchema.statics.findByMode = function(mode, userId) {
  return this.find({ mode, userId, isArchived: false })
    .sort({ lastUpdate: -1 });
};

// Método estático para estatísticas
conversationSchema.statics.getStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$mode',
        count: { $sum: 1 },
        totalMessages: { $sum: '$messageCount' },
        avgMessages: { $avg: '$messageCount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Conversation', conversationSchema);