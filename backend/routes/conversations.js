const express = require('express');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /api/conversations
 * Obter todas as conversas do utilizador
 */
router.get('/', async (req, res) => {
  try {
    const { archived, mode, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;
    
    const options = {
      archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
    
    let query = { userId };
    
    if (options.archived !== undefined) {
      query.isArchived = options.archived;
    }
    
    if (mode) {
      query.mode = mode;
    }
    
    const conversations = await Conversation.find(query)
      .sort({ lastUpdate: -1 })
      .limit(options.limit)
      .skip(options.offset);
    
    res.json({
      success: true,
      conversations: conversations.map(conv => conv.toObject()),
      count: conversations.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter conversas:', error);
    res.status(500).json({
      error: 'Erro ao obter conversas',
      code: 'GET_CONVERSATIONS_ERROR'
    });
  }
});

/**
 * GET /api/conversations/:id
 * Obter conversa específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const conversation = await Conversation.findOne({ id, userId });
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      conversation: conversation.toObject()
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter conversa:', error);
    res.status(500).json({
      error: 'Erro ao obter conversa',
      code: 'GET_CONVERSATION_ERROR'
    });
  }
});

/**
 * POST /api/conversations
 * Criar nova conversa
 */
router.post('/', async (req, res) => {
  try {
    const { id, title, mode, messages = [] } = req.body;
    const userId = req.user.id;
    
    if (!id || !title || !mode) {
      return res.status(400).json({
        error: 'ID, título e modo são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Verificar se conversa já existe
    const existingConv = await Conversation.findOne({ id });
    if (existingConv) {
      return res.status(409).json({
        error: 'Conversa com este ID já existe',
        code: 'CONVERSATION_EXISTS'
      });
    }
    
    const conversation = new Conversation({
      id,
      userId,
      title,
      mode,
      messages,
      lastUpdate: Date.now()
    });
    
    await conversation.save();
    
    // Incrementar uso do utilizador
    await req.user.incrementUsage(mode);
    
    console.log(`💬 Nova conversa criada: ${id} - ${title}`);
    
    res.status(201).json({
      success: true,
      message: 'Conversa criada com sucesso',
      conversation: conversation.toObject()
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar conversa:', error);
    res.status(500).json({
      error: 'Erro ao criar conversa',
      code: 'CREATE_CONVERSATION_ERROR'
    });
  }
});

/**
 * PUT /api/conversations/:id
 * Atualizar conversa
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, messages, mode } = req.body;
    const userId = req.user.id;
    
    const conversation = await Conversation.findOne({ id, userId });
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }
    
    // Atualizar campos
    if (title) conversation.title = title;
    if (messages) conversation.messages = messages;
    if (mode) conversation.mode = mode;
    
    conversation.lastUpdate = Date.now();
    
    await conversation.save();
    
    console.log(`💬 Conversa atualizada: ${id}`);
    
    res.json({
      success: true,
      message: 'Conversa atualizada com sucesso',
      conversation: conversation.toObject()
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar conversa:', error);
    res.status(500).json({
      error: 'Erro ao atualizar conversa',
      code: 'UPDATE_CONVERSATION_ERROR'
    });
  }
});

/**
 * DELETE /api/conversations/:id
 * Apagar conversa
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const conversation = await Conversation.findOneAndDelete({ id, userId });
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }
    
    console.log(`🗑️ Conversa apagada: ${id}`);
    
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

/**
 * POST /api/conversations/:id/messages
 * Adicionar mensagem à conversa
 */
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    
    if (!message || !message.id || !message.role || !message.content) {
      return res.status(400).json({
        error: 'Mensagem inválida',
        code: 'INVALID_MESSAGE'
      });
    }
    
    const conversation = await Conversation.findOne({ id, userId });
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }
    
    await conversation.addMessage(message);
    
    // Incrementar uso se for mensagem do utilizador
    if (message.role === 'user') {
      await req.user.incrementUsage(conversation.mode);
    }
    
    res.json({
      success: true,
      message: 'Mensagem adicionada com sucesso',
      conversation: conversation.toObject()
    });
    
  } catch (error) {
    console.error('❌ Erro ao adicionar mensagem:', error);
    res.status(500).json({
      error: 'Erro ao adicionar mensagem',
      code: 'ADD_MESSAGE_ERROR'
    });
  }
});

/**
 * POST /api/conversations/:id/archive
 * Arquivar conversa
 */
router.post('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const conversation = await Conversation.findOne({ id, userId });
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }
    
    await conversation.archive();
    
    res.json({
      success: true,
      message: 'Conversa arquivada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao arquivar conversa:', error);
    res.status(500).json({
      error: 'Erro ao arquivar conversa',
      code: 'ARCHIVE_CONVERSATION_ERROR'
    });
  }
});

/**
 * POST /api/conversations/:id/unarchive
 * Desarquivar conversa
 */
router.post('/:id/unarchive', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const conversation = await Conversation.findOne({ id, userId });
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversa não encontrada',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }
    
    await conversation.unarchive();
    
    res.json({
      success: true,
      message: 'Conversa desarquivada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao desarquivar conversa:', error);
    res.status(500).json({
      error: 'Erro ao desarquivar conversa',
      code: 'UNARCHIVE_CONVERSATION_ERROR'
    });
  }
});

/**
 * GET /api/conversations/stats/summary
 * Obter estatísticas das conversas
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await Conversation.getStats(userId);
    
    const totalConversations = await Conversation.countDocuments({ userId });
    const archivedConversations = await Conversation.countDocuments({ userId, isArchived: true });
    
    res.json({
      success: true,
      stats: {
        total: totalConversations,
        archived: archivedConversations,
        active: totalConversations - archivedConversations,
        byMode: stats
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas',
      code: 'STATS_ERROR'
    });
  }
});

module.exports = router;