const express = require('express');
const OTP = require('../models/OTP');
const User = require('../models/User');
const emailService = require('../services/EmailService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/otp/send
 * Enviar código OTP
 */
router.post('/send', async (req, res) => {
  try {
    const { email, type } = req.body;
    
    // Validações
    if (!email || !type) {
      return res.status(400).json({
        error: 'Email e tipo são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }
    
    if (!['email_verification', 'password_reset', 'login_verification'].includes(type)) {
      return res.status(400).json({
        error: 'Tipo de OTP inválido',
        code: 'INVALID_TYPE'
      });
    }
    
    const emailLower = email.toLowerCase().trim();
    
    // Verificar rate limiting
    const canSend = await OTP.checkRateLimit(emailLower, type, 5, 3); // 3 tentativas em 5 minutos
    if (!canSend) {
      return res.status(429).json({
        error: 'Muitas tentativas. Tenta novamente em 5 minutos.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
    
    // Verificar se utilizador existe (para password_reset e login_verification)
    let user = null;
    if (type === 'password_reset' || type === 'login_verification') {
      user = await User.findOne({ email: emailLower });
      if (!user) {
        return res.status(404).json({
          error: 'Utilizador não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }
    }
    
    // Para email_verification, verificar se email já não está verificado
    if (type === 'email_verification') {
      user = await User.findOne({ email: emailLower });
      if (user && user.emailVerified) {
        return res.status(400).json({
          error: 'Email já está verificado',
          code: 'EMAIL_ALREADY_VERIFIED'
        });
      }
    }
    
    // Obter IP e User-Agent para auditoria
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Criar OTP
    const otp = await OTP.createOTP(
      emailLower, 
      type, 
      user ? user._id : null, 
      ipAddress, 
      userAgent
    );
    
    // Enviar email
    try {
      await emailService.sendOTPEmail(
        emailLower, 
        otp.code, 
        type, 
        user ? user.name : 'Utilizador'
      );
      
      console.log(`📧 OTP enviado: ${emailLower} (${type}) - Código: ${otp.code}`);
      
      res.json({
        success: true,
        message: 'Código enviado com sucesso',
        data: {
          email: emailLower,
          type: type,
          expiresAt: otp.expiresAt,
          timeRemaining: otp.timeRemaining
        }
      });
      
    } catch (emailError) {
      console.error('❌ Erro ao enviar email OTP:', emailError);
      
      // Marcar OTP como usado se email falhou
      otp.isUsed = true;
      await otp.save();
      
      res.status(500).json({
        error: 'Erro ao enviar email. Tenta novamente.',
        code: 'EMAIL_SEND_ERROR'
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao enviar OTP:', error);
    res.status(500).json({
      error: 'Erro interno ao enviar código',
      code: 'SEND_OTP_ERROR'
    });
  }
});

/**
 * POST /api/otp/verify
 * Verificar código OTP
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, code, type } = req.body;
    
    // Validações
    if (!email || !code || !type) {
      return res.status(400).json({
        error: 'Email, código e tipo são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }
    
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        error: 'Código deve ter 6 dígitos',
        code: 'INVALID_CODE_FORMAT'
      });
    }
    
    const emailLower = email.toLowerCase().trim();
    
    // Verificar OTP
    const verification = await OTP.verifyOTP(emailLower, code, type);
    
    if (!verification.success) {
      return res.status(400).json({
        error: verification.error,
        code: 'OTP_VERIFICATION_FAILED'
      });
    }
    
    const otp = verification.otp;
    
    // Ações específicas por tipo
    let result = { success: true, message: 'Código verificado com sucesso' };
    
    if (type === 'email_verification') {
      // Marcar email como verificado
      if (otp.userId) {
        await User.findByIdAndUpdate(otp.userId, { 
          emailVerified: true,
          emailVerifiedAt: new Date()
        });
        result.message = 'Email verificado com sucesso';
      }
    }
    
    if (type === 'password_reset') {
      // Gerar token temporário para reset de senha
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      
      await User.findByIdAndUpdate(otp.userId, {
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
      });
      
      result.resetToken = resetToken;
      result.message = 'Código verificado. Podes agora redefinir a palavra-passe.';
    }
    
    console.log(`✅ OTP verificado: ${emailLower} (${type})`);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Erro ao verificar OTP:', error);
    res.status(500).json({
      error: 'Erro interno ao verificar código',
      code: 'VERIFY_OTP_ERROR'
    });
  }
});

/**
 * POST /api/otp/resend
 * Reenviar código OTP
 */
router.post('/resend', async (req, res) => {
  try {
    const { email, type } = req.body;
    
    if (!email || !type) {
      return res.status(400).json({
        error: 'Email e tipo são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }
    
    const emailLower = email.toLowerCase().trim();
    
    // Verificar se há OTP recente (menos de 1 minuto)
    const recentOTP = await OTP.findOne({
      email: emailLower,
      type: type,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) } // 1 minuto
    });
    
    if (recentOTP) {
      return res.status(429).json({
        error: 'Aguarda 1 minuto antes de solicitar novo código',
        code: 'TOO_SOON'
      });
    }
    
    // Redirecionar para o endpoint de envio
    req.body = { email: emailLower, type };
    return router.handle(req, res);
    
  } catch (error) {
    console.error('❌ Erro ao reenviar OTP:', error);
    res.status(500).json({
      error: 'Erro interno ao reenviar código',
      code: 'RESEND_OTP_ERROR'
    });
  }
});

/**
 * GET /api/otp/status/:email/:type
 * Verificar status de OTP
 */
router.get('/status/:email/:type', async (req, res) => {
  try {
    const { email, type } = req.params;
    const emailLower = email.toLowerCase().trim();
    
    const activeOTP = await OTP.findOne({
      email: emailLower,
      type: type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!activeOTP) {
      return res.json({
        hasActiveOTP: false,
        message: 'Nenhum código ativo encontrado'
      });
    }
    
    res.json({
      hasActiveOTP: true,
      data: activeOTP.toSafeJSON()
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar status OTP:', error);
    res.status(500).json({
      error: 'Erro interno ao verificar status',
      code: 'OTP_STATUS_ERROR'
    });
  }
});

/**
 * POST /api/otp/reset-password
 * Redefinir palavra-passe com token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        error: 'Email, token e nova palavra-passe são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Nova palavra-passe deve ter pelo menos 6 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    const emailLower = email.toLowerCase().trim();
    
    // Encontrar utilizador com token válido
    const user = await User.findOne({
      email: emailLower,
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({
        error: 'Token inválido ou expirado',
        code: 'INVALID_RESET_TOKEN'
      });
    }
    
    // Atualizar palavra-passe
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    
    await user.save();
    
    console.log(`🔑 Palavra-passe redefinida: ${emailLower}`);
    
    res.json({
      success: true,
      message: 'Palavra-passe redefinida com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao redefinir palavra-passe:', error);
    res.status(500).json({
      error: 'Erro interno ao redefinir palavra-passe',
      code: 'RESET_PASSWORD_ERROR'
    });
  }
});

/**
 * GET /api/otp/cleanup (Admin apenas)
 * Limpar OTPs expirados
 */
router.get('/cleanup', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Acesso negado',
        code: 'ACCESS_DENIED'
      });
    }
    
    const result = await OTP.cleanupExpired();
    
    res.json({
      success: true,
      message: `${result.deletedCount} códigos OTP removidos`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('❌ Erro na limpeza de OTP:', error);
    res.status(500).json({
      error: 'Erro na limpeza',
      code: 'CLEANUP_ERROR'
    });
  }
});

/**
 * GET /api/otp/stats (Admin apenas)
 * Estatísticas de OTP
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Acesso negado',
        code: 'ACCESS_DENIED'
      });
    }
    
    const stats = await OTP.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          used: { $sum: { $cond: ['$isUsed', 1, 0] } },
          expired: { $sum: { $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0] } }
        }
      }
    ]);
    
    const totalOTPs = await OTP.countDocuments();
    const activeOTPs = await OTP.countDocuments({ 
      isUsed: false, 
      expiresAt: { $gt: new Date() } 
    });
    
    res.json({
      success: true,
      stats: {
        total: totalOTPs,
        active: activeOTPs,
        byType: stats
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas OTP:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas',
      code: 'STATS_ERROR'
    });
  }
});

module.exports = router;