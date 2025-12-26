const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email inválido']
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  },
  password: {
    type: String,
    required: [true, 'Palavra-passe é obrigatória'],
    minlength: [6, 'Palavra-passe deve ter pelo menos 6 caracteres'],
    select: false // Não incluir por padrão nas consultas
  },
  passwordChangedAt: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  preferences: {
    language: {
      type: String,
      enum: ['Portuguese', 'Simple Portuguese'],
      default: 'Portuguese'
    },
    responseLength: {
      type: String,
      enum: ['short', 'detailed'],
      default: 'short'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    favoriteMode: {
      type: String,
      default: 'general'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    aiPersonality: {
      type: String,
      enum: ['formal', 'casual', 'technical'],
      default: 'casual'
    }
  },
  usage: {
    totalMessages: {
      type: Number,
      default: 0
    },
    messagesThisMonth: {
      type: Number,
      default: 0
    },
    favoriteTopics: [{
      type: String
    }],
    timeSpent: {
      type: Number,
      default: 0 // em minutos
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active'
  },
  devices: [{
    deviceId: String,
    deviceName: String,
    lastSync: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
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
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'devices.deviceId': 1 });

// Virtual para verificar se é criador
userSchema.virtual('isCreator').get(function() {
  return this.role === 'creator' || 
         this.name.toLowerCase().includes('anselmo') ||
         this.name.toLowerCase().includes('bistiro') ||
         this.name.toLowerCase().includes('gulane');
});

// Middleware para hash da palavra-passe
userSchema.pre('save', async function(next) {
  // Só fazer hash se a palavra-passe foi modificada
  if (!this.isModified('password')) return next();
  
  try {
    // Hash da palavra-passe com salt de 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware para atualizar updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para verificar palavra-passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para adicionar/atualizar dispositivo
userSchema.methods.addDevice = function(deviceId, deviceName) {
  const existingDevice = this.devices.find(d => d.deviceId === deviceId);
  
  if (existingDevice) {
    existingDevice.lastSync = new Date();
    existingDevice.isActive = true;
    existingDevice.deviceName = deviceName || existingDevice.deviceName;
  } else {
    this.devices.push({
      deviceId,
      deviceName: deviceName || 'Dispositivo Desconhecido',
      lastSync: new Date(),
      isActive: true
    });
  }
  
  return this.save();
};

// Método para remover dispositivo
userSchema.methods.removeDevice = function(deviceId) {
  this.devices = this.devices.filter(d => d.deviceId !== deviceId);
  return this.save();
};

// Método para atualizar última atividade
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Método para incrementar uso
userSchema.methods.incrementUsage = function(mode) {
  this.usage.totalMessages += 1;
  this.usage.messagesThisMonth += 1;
  
  // Adicionar tópico favorito se não existir
  if (mode && !this.usage.favoriteTopics.includes(mode)) {
    this.usage.favoriteTopics.push(mode);
  }
  
  return this.save();
};

// Método para resetar uso mensal
userSchema.methods.resetMonthlyUsage = function() {
  this.usage.messagesThisMonth = 0;
  this.usage.lastResetDate = new Date();
  return this.save();
};

// Método para obter dados públicos (sem informações sensíveis)
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Método estático para encontrar por email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Método estático para encontrar utilizadores ativos
userSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Middleware para resetar uso mensal automaticamente
userSchema.pre('find', function() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Reset automático se passou do mês
  this.updateMany(
    { 'usage.lastResetDate': { $lt: startOfMonth } },
    { 
      $set: { 
        'usage.messagesThisMonth': 0,
        'usage.lastResetDate': now
      }
    }
  );
});

module.exports = mongoose.model('User', userSchema);