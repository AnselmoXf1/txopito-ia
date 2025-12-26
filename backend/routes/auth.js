const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const authMiddleware = require('../middleware/auth');
const emailService = require('../services/EmailService');

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrar novo utilizador (com verificação de email)
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, skipEmailVerification = false } = req.body;
    
    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Nome, email e palavra-passe são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Palavra-passe deve ter pelo menos 6 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    // Verificar se email já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email já está em uso',
        code: 'EMAIL_EXISTS'
      });
    }
    
    // Criar utilizador
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user',
      emailVerified: skipEmailVerification, // Para admin/creator pode pular verificação
      emailVerifiedAt: skipEmailVerification ? new Date() : null
    });
    
    await user.save();
    
    // Se não pular verificação, enviar OTP
    if (!skipEmailVerification) {
      try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        
        const otp = await OTP.createOTP(
          user.email, 
          'email_verification', 
          user._id, 
          ipAddress, 
          userAgent
        );
        
        await emailService.sendOTPEmail(
          user.email, 
          otp.code, 
          'email_verification', 
          user.name
        );
        
        console.log(`👤 Novo utilizador registrado (verificação pendente): ${user.email}`);
        
        return res.status(201).json({
          success: true,
          message: 'Utilizador criado. Verifica o teu email para ativar a conta.',
          requiresEmailVerification: true,
          email: user.email,
          userId: user._id
        });
        
      } catch (emailError) {
        console.error('❌ Erro ao enviar email de verificação:', emailError);
        
        // Se falhar o email, ainda assim criar conta mas avisar
        return res.status(201).json({
          success: true,
          message: 'Utilizador criado, mas houve erro ao enviar email de verificação. Contacta o suporte.',
          requiresEmailVerification: true,
          email: user.email,
          userId: user._id,
          emailError: true
        });
      }
    }
    
    // Se pular verificação, fazer login direto
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    console.log(`👤 Novo utilizador registrado (verificado): ${user.email}`);
    
    res.status(201).json({
      success: true,
      message: 'Utilizador criado com sucesso',
      token,
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Erro no registo:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }
    
    res.status(500).json({
      error: 'Erro interno no registo',
      code: 'REGISTER_ERROR'
    });
  }
});

/**
 * POST /api/auth/verify-email
 * Verificar email com código OTP
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        error: 'Email e código são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Verificar OTP
    const verification = await OTP.verifyOTP(email.toLowerCase().trim(), code, 'email_verification');
    
    if (!verification.success) {
      return res.status(400).json({
        error: verification.error,
        code: 'EMAIL_VERIFICATION_FAILED'
      });
    }
    
    // Buscar utilizador e marcar email como verificado
    const user = await User.findById(verification.otp.userId);
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
    
    // Gerar token para login automático
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Enviar email de boas-vindas
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('❌ Erro ao enviar email de boas-vindas:', emailError);
    }
    
    console.log(`✅ Email verificado: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Email verificado com sucesso! Bem-vindo ao Txopito IA.',
      token,
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Erro na verificação de email:', error);
    res.status(500).json({
      error: 'Erro interno na verificação',
      code: 'EMAIL_VERIFICATION_ERROR'
    });
  }
});

/**
 * POST /api/auth/login
 * Fazer login (com verificação opcional de 2FA)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, skipTwoFactor = false } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e palavra-passe são obrigatórios',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    // Buscar utilizador com palavra-passe
    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Verificar palavra-passe
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Verificar status da conta
    if (user.status !== 'active') {
      return res.status(403).json({
        error: 'Conta suspensa ou inativa',
        code: 'ACCOUNT_SUSPENDED'
      });
    }
    
    // Verificar se email está verificado
    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Email não verificado. Verifica o teu email primeiro.',
        code: 'EMAIL_NOT_VERIFIED',
        requiresEmailVerification: true,
        email: user.email
      });
    }
    
    // Verificação 2FA para admins ou logins suspeitos (opcional)
    const requiresTwoFactor = user.role === 'admin' && !skipTwoFactor;
    
    if (requiresTwoFactor) {
      try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        
        const otp = await OTP.createOTP(
          user.email, 
          'login_verification', 
          user._id, 
          ipAddress, 
          userAgent
        );
        
        await emailService.sendOTPEmail(
          user.email, 
          otp.code, 
          'login_verification', 
          user.name
        );
        
        console.log(`🔐 Login 2FA solicitado: ${user.email}`);
        
        return res.json({
          success: true,
          message: 'Código de verificação enviado para o teu email.',
          requiresTwoFactor: true,
          email: user.email,
          userId: user._id
        });
        
      } catch (emailError) {
        console.error('❌ Erro ao enviar código 2FA:', emailError);
        // Continuar com login normal se falhar 2FA
      }
    }
    
    // Gerar token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Atualizar última atividade
    await user.updateLastActive();
    
    console.log(`🔐 Login realizado: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno no login',
      code: 'LOGIN_ERROR'
    });
  }
});

/**
 * POST /api/auth/verify-2fa
 * Verificar código 2FA para login
 */
router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        error: 'Email e código são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Verificar OTP
    const verification = await OTP.verifyOTP(email.toLowerCase().trim(), code, 'login_verification');
    
    if (!verification.success) {
      return res.status(400).json({
        error: verification.error,
        code: 'TWO_FACTOR_VERIFICATION_FAILED'
      });
    }
    
    // Buscar utilizador
    const user = await User.findById(verification.otp.userId);
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Gerar token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Atualizar última atividade
    await user.updateLastActive();
    
    console.log(`✅ Login 2FA verificado: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Erro na verificação 2FA:', error);
    res.status(500).json({
      error: 'Erro interno na verificação',
      code: 'TWO_FACTOR_ERROR'
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Solicitar recuperação de palavra-passe
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email é obrigatório',
        code: 'MISSING_EMAIL'
      });
    }
    
    const emailLower = email.toLowerCase().trim();
    
    // Buscar utilizador
    const user = await User.findByEmail(emailLower);
    if (!user) {
      // Por segurança, não revelar se email existe ou não
      return res.json({
        success: true,
        message: 'Se o email existir, receberás instruções para recuperar a palavra-passe.'
      });
    }
    
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      
      const otp = await OTP.createOTP(
        user.email, 
        'password_reset', 
        user._id, 
        ipAddress, 
        userAgent
      );
      
      await emailService.sendOTPEmail(
        user.email, 
        otp.code, 
        'password_reset', 
        user.name
      );
      
      console.log(`🔑 Recuperação de palavra-passe solicitada: ${user.email}`);
      
    } catch (emailError) {
      console.error('❌ Erro ao enviar email de recuperação:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Se o email existir, receberás instruções para recuperar a palavra-passe.'
    });
    
  } catch (error) {
    console.error('❌ Erro na recuperação de palavra-passe:', error);
    res.status(500).json({
      error: 'Erro interno na recuperação',
      code: 'FORGOT_PASSWORD_ERROR'
    });
  }
});

/**
 * GET /api/auth/me
 * Obter dados do utilizador atual
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('❌ Erro ao obter dados do utilizador:', error);
    res.status(500).json({
      error: 'Erro interno',
      code: 'USER_DATA_ERROR'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Renovar token
 */
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    // Gerar novo token
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      token
    });
    
  } catch (error) {
    console.error('❌ Erro ao renovar token:', error);
    res.status(500).json({
      error: 'Erro ao renovar token',
      code: 'TOKEN_REFRESH_ERROR'
    });
  }
});

/**
 * POST /api/auth/logout
 * Fazer logout (invalidar token no cliente)
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // No JWT, o logout é feito no cliente removendo o token
    // Aqui podemos registrar o logout para auditoria
    
    console.log(`🚪 Logout realizado: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro no logout:', error);
    res.status(500).json({
      error: 'Erro no logout',
      code: 'LOGOUT_ERROR'
    });
  }
});

/**
 * POST /api/auth/change-password
 * Alterar palavra-passe
 */
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Palavra-passe atual e nova são obrigatórias',
        code: 'MISSING_PASSWORDS'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Nova palavra-passe deve ter pelo menos 6 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    // Buscar utilizador com palavra-passe
    const user = await User.findById(req.user._id).select('+password');
    
    // Verificar palavra-passe atual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Palavra-passe atual incorreta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }
    
    // Atualizar palavra-passe
    user.password = newPassword;
    await user.save();
    
    console.log(`🔑 Palavra-passe alterada: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Palavra-passe alterada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao alterar palavra-passe:', error);
    res.status(500).json({
      error: 'Erro ao alterar palavra-passe',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

module.exports = router;