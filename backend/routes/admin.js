const express = require('express');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

const router = express.Router();

// Middleware para verificar se é admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acesso negado. Apenas administradores.',
      code: 'ACCESS_DENIED'
    });
  }
  next();
};

/**
 * GET /api/admin/stats
 * Obter estatísticas gerais do sistema
 */
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const totalConversations = await Conversation.countDocuments();
    const conversationsThisMonth = await Conversation.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    
    const messageStats = await Conversation.aggregate([
      { $group: { 
        _id: null, 
        totalMessages: { $sum: '$messageCount' },
        avgMessagesPerConv: { $avg: '$messageCount' }
      }}
    ]);
    
    const conversationsByMode = await Conversation.aggregate([
      { $group: { _id: '$mode', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          pending: pendingUsers,
          byRole: usersByRole
        },
        conversations: {
          total: totalConversations,
          thisMonth: conversationsThisMonth,
          byMode: conversationsByMode
        },
        messages: messageStats[0] || { totalMessages: 0, avgMessagesPerConv: 0 }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas admin:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas',
      code: 'ADMIN_STATS_ERROR'
    });
  }
});

/**
 * GET /api/admin/users
 * Listar todos os utilizadores
 */
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }
    
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users: users.map(user => user.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar utilizadores:', error);
    res.status(500).json({
      error: 'Erro ao listar utilizadores',
      code: 'LIST_USERS_ERROR'
    });
  }
});

/**
 * GET /api/admin/users/:id
 * Obter detalhes de um utilizador específico
 */
router.get('/users/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Obter estatísticas do utilizador
    const conversationCount = await Conversation.countDocuments({ userId: id });
    const conversationStats = await Conversation.getStats(id);
    
    res.json({
      success: true,
      user: user.toPublicJSON(),
      stats: {
        conversations: conversationCount,
        conversationsByMode: conversationStats
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter utilizador:', error);
    res.status(500).json({
      error: 'Erro ao obter utilizador',
      code: 'GET_USER_ERROR'
    });
  }
});

/**
 * PUT /api/admin/users/:id
 * Atualizar utilizador (admin)
 */
router.put('/users/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, preferences } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Não permitir alterar o próprio role de admin
    if (user._id.toString() === req.user.id && role && role !== 'admin') {
      return res.status(403).json({
        error: 'Não podes alterar o teu próprio role de admin',
        code: 'CANNOT_CHANGE_OWN_ROLE'
      });
    }
    
    // Atualizar campos
    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role) user.role = role;
    if (status) user.status = status;
    
    if (preferences) {
      Object.assign(user.preferences, preferences);
    }
    
    await user.save();
    
    console.log(`👤 Utilizador atualizado pelo admin: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Utilizador atualizado com sucesso',
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar utilizador:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Email já está em uso',
        code: 'EMAIL_EXISTS'
      });
    }
    
    res.status(500).json({
      error: 'Erro ao atualizar utilizador',
      code: 'UPDATE_USER_ERROR'
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Apagar utilizador (admin)
 */
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Não permitir apagar o próprio utilizador
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        error: 'Não podes apagar a tua própria conta',
        code: 'CANNOT_DELETE_SELF'
      });
    }
    
    // Não permitir apagar outros admins
    if (user.role === 'admin') {
      return res.status(403).json({
        error: 'Não é possível apagar outros administradores',
        code: 'CANNOT_DELETE_ADMIN'
      });
    }
    
    // Apagar utilizador e suas conversas
    await User.findByIdAndDelete(id);
    await Conversation.deleteMany({ userId: id });
    
    console.log(`🗑️ Utilizador apagado pelo admin: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Utilizador apagado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao apagar utilizador:', error);
    res.status(500).json({
      error: 'Erro ao apagar utilizador',
      code: 'DELETE_USER_ERROR'
    });
  }
});

/**
 * POST /api/admin/users/:id/suspend
 * Suspender utilizador
 */
router.post('/users/:id/suspend', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        error: 'Não podes suspender a tua própria conta',
        code: 'CANNOT_SUSPEND_SELF'
      });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({
        error: 'Não é possível suspender administradores',
        code: 'CANNOT_SUSPEND_ADMIN'
      });
    }
    
    user.status = 'suspended';
    await user.save();
    
    console.log(`⛔ Utilizador suspenso: ${user.email} - Razão: ${reason || 'Não especificada'}`);
    
    res.json({
      success: true,
      message: 'Utilizador suspenso com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao suspender utilizador:', error);
    res.status(500).json({
      error: 'Erro ao suspender utilizador',
      code: 'SUSPEND_USER_ERROR'
    });
  }
});

/**
 * POST /api/admin/users/:id/activate
 * Ativar utilizador suspenso
 */
router.post('/users/:id/activate', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    user.status = 'active';
    await user.save();
    
    console.log(`✅ Utilizador ativado: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Utilizador ativado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao ativar utilizador:', error);
    res.status(500).json({
      error: 'Erro ao ativar utilizador',
      code: 'ACTIVATE_USER_ERROR'
    });
  }
});

/**
 * GET /api/admin/conversations
 * Listar todas as conversas (admin)
 */
router.get('/conversations', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, mode, userId } = req.query;
    
    let query = {};
    
    if (mode) {
      query.mode = mode;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    const conversations = await Conversation.find(query)
      .populate('userId', 'name email')
      .sort({ lastUpdate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Conversation.countDocuments(query);
    
    res.json({
      success: true,
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar conversas:', error);
    res.status(500).json({
      error: 'Erro ao listar conversas',
      code: 'LIST_CONVERSATIONS_ERROR'
    });
  }
});

/**
 * DELETE /api/admin/conversations/:id
 * Apagar conversa (admin)
 */
router.delete('/conversations/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findOneAndDelete({ id });
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }
    
    console.log(`🗑️ Conversa apagada pelo admin: ${id}`);
    
    res.json({
      success: true,
      message: 'Conversa apagada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao apagar conversa:', error);
    res.status(500).json({
      error: 'Erro ao apagar conversa',
      code: 'DELETE_CONVERSATION_ERROR'
    });
  }
});

module.exports = router;