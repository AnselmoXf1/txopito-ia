const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Código OTP é obrigatório'],
    length: 6
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset', 'login_verification'],
    required: [true, 'Tipo de OTP é obrigatório']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  usedAt: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Índices para performance e segurança
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ code: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs
otpSchema.index({ createdAt: 1 });

// Método para gerar código OTP
otpSchema.statics.generateCode = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Método para criar novo OTP
otpSchema.statics.createOTP = async function(email, type, userId = null, ipAddress = null, userAgent = null) {
  // Invalidar OTPs anteriores do mesmo tipo para o mesmo email
  await this.updateMany(
    { email, type, isUsed: false },
    { isUsed: true, usedAt: new Date() }
  );
  
  const code = this.generateCode();
  
  const otp = new this({
    email,
    code,
    type,
    userId,
    ipAddress,
    userAgent
  });
  
  await otp.save();
  return otp;
};

// Método para verificar OTP
otpSchema.statics.verifyOTP = async function(email, code, type) {
  const otp = await this.findOne({
    email,
    code,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otp) {
    // Incrementar tentativas falhadas para todos os OTPs válidos deste email/tipo
    await this.updateMany(
      { email, type, isUsed: false, expiresAt: { $gt: new Date() } },
      { $inc: { attempts: 1 } }
    );
    
    return { success: false, error: 'Código inválido ou expirado' };
  }
  
  // Verificar se excedeu tentativas
  if (otp.attempts >= 5) {
    otp.isUsed = true;
    otp.usedAt = new Date();
    await otp.save();
    
    return { success: false, error: 'Muitas tentativas. Solicita um novo código.' };
  }
  
  // Marcar como usado
  otp.isUsed = true;
  otp.usedAt = new Date();
  await otp.save();
  
  return { success: true, otp };
};

// Método para verificar rate limiting
otpSchema.statics.checkRateLimit = async function(email, type, windowMinutes = 5, maxAttempts = 3) {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const recentOTPs = await this.countDocuments({
    email,
    type,
    createdAt: { $gte: windowStart }
  });
  
  return recentOTPs < maxAttempts;
};

// Método para limpar OTPs expirados (executado periodicamente)
otpSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true, usedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Remove used OTPs older than 24h
    ]
  });
  
  console.log(`🧹 OTP Cleanup: ${result.deletedCount} códigos removidos`);
  return result;
};

// Virtual para verificar se está expirado
otpSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual para tempo restante
otpSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const remaining = this.expiresAt - now;
  return Math.max(0, Math.floor(remaining / 1000)); // segundos
});

// Método de instância para formatar para resposta
otpSchema.methods.toSafeJSON = function() {
  return {
    id: this._id,
    email: this.email,
    type: this.type,
    expiresAt: this.expiresAt,
    timeRemaining: this.timeRemaining,
    attempts: this.attempts,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('OTP', otpSchema);