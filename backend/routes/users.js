const express = require('express');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /api/users/profile
 * Obter perfil do utilizador atual
 */
router.get('/profile', async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('❌ Erro ao obter perfil:', error);
    res.status(500).json({
      error: 'Erro ao obter perfil',
      code: 'GET_PROFILE_ERROR'
    });
  }
});

/**
 * PUT /api/users/profile
 * Atualizar perfil do utilizador
 */
router.put('/profile', async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Atualizar campos permitidos
    if (name && name.trim()) {
      user.name = name.trim();
    }
    
    if (preferences) {
      // Atualizar preferências válidas
      const validPreferences = ['language', 'responseLength', 'theme', 'favoriteMode', 'notifications', 'aiPersonality'];
      
      for (const key of validPreferences) {
        if (preferences[key] !== undefined) {
          user.preferences[key] = preferences[key];
        }
      }
    }
    
    await user.save();
    
    console.log(`👤 Perfil atualizado: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }
    
    res.status(500).json({
      error: 'Erro ao atualizar perfil',
      code: 'UPDATE_PROFILE_ERROR'
    });
  }
});

/**
 * GET /api/users/usage
 * Obter estatísticas de uso do utilizador
 */
router.get('/usage', async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      usage: {
        totalMessages: user.usage.totalMessages,
        messagesThisMonth: user.usage.messagesThisMonth,
        favoriteTopics: user.usage.favoriteTopics,
        timeSpent: user.usage.timeSpent,
        lastResetDate: user.usage.lastResetDate,
        devicesCount: user.devices.length,
        lastActive: user.lastActive
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas de uso:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas',
      code: 'GET_USAGE_ERROR'
    });
  }
});

/**
 * POST /api/users/usage/increment
 * Incrementar uso (chamado quando utilizador envia mensagem)
 */
router.post('/usage/increment', async (req, res) => {
  try {
    const { mode } = req.body;
    const user = req.user;
    
    await user.incrementUsage(mode);
    
    res.json({
      success: true,
      message: 'Uso incrementado com sucesso',
      usage: {
        totalMessages: user.usage.totalMessages,
        messagesThisMonth: user.usage.messagesThisMonth
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao incrementar uso:', error);
    res.status(500).json({
      error: 'Erro ao incrementar uso',
      code: 'INCREMENT_USAGE_ERROR'
    });
  }
});

/**
 * DELETE /api/users/account
 * Apagar conta do utilizador
 */
router.delete('/account', async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;
    
    if (!password) {
      return res.status(400).json({
        error: 'Palavra-passe é obrigatória para apagar conta',
        code: 'PASSWORD_REQUIRED'
      });
    }
    
    // Buscar utilizador com palavra-passe
    const user = await User.findById(userId).select('+password');
    
    // Verificar palavra-passe
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Palavra-passe incorreta',
        code: 'INVALID_PASSWORD'
      });
    }
    
    // Não permitir apagar conta de admin ou criador
    if (user.role === 'admin' || user.isCreator) {
      return res.status(403).json({
        error: 'Não é possível apagar conta de administrador ou criador',
        code: 'CANNOT_DELETE_ADMIN'
      });
    }
    
    // Apagar utilizador
    await User.findByIdAndDelete(userId);
    
    // Também apagar conversas do utilizador
    const Conversation = require('../models/Conversation');
    await Conversation.deleteMany({ userId });
    
    console.log(`🗑️ Conta apagada: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Conta apagada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao apagar conta:', error);
    res.status(500).json({
      error: 'Erro ao apagar conta',
      code: 'DELETE_ACCOUNT_ERROR'
    });
  }
});

/**
 * GET /api/users/devices
 * Listar dispositivos do utilizador
 */
router.get('/devices', async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      devices: user.devices.map(device => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        lastSync: device.lastSync,
        isActive: device.isActive
      }))
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar dispositivos:', error);
    res.status(500).json({
      error: 'Erro ao listar dispositivos',
      code: 'GET_DEVICES_ERROR'
    });
  }
});

/**
 * POST /api/users/activity
 * Atualizar última atividade
 */
router.post('/activity', async (req, res) => {
  try {
    await req.user.updateLastActive();
    
    res.json({
      success: true,
      message: 'Atividade atualizada',
      lastActive: req.user.lastActive
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar atividade:', error);
    res.status(500).json({
      error: 'Erro ao atualizar atividade',
      code: 'UPDATE_ACTIVITY_ERROR'
    });
  }
});

module.exports = router;