const express = require('express');
const SyncService = require('../services/SyncService');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const router = express.Router();

/**
 * POST /api/sync/conversations
 * Sincronizar conversas do utilizador
 */
router.post('/conversations', async (req, res) => {
  try {
    const { deviceId, conversations = [] } = req.body;
    const userId = req.user.id;
    
    if (!deviceId) {
      return res.status(400).json({
        error: 'Device ID é obrigatório',
        code: 'DEVICE_ID_REQUIRED'
      });
    }
    
    console.log(`🔄 Sincronização solicitada - Utilizador: ${userId}, Dispositivo: ${deviceId}`);
    
    const result = await SyncService.syncUserConversations(userId, deviceId, conversations);
    
    res.json({
      success: true,
      message: 'Sincronização concluída com sucesso',
      data: result.data,
      timestamp: result.timestamp
    });
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    res.status(500).json({
      error: 'Erro interno na sincronização',
      code: 'SYNC_ERROR',
      details: error.message
    });
  }
});

/**
 * GET /api/sync/conversations/incremental
 * Sincronização incremental (apenas mudanças recentes)
 */
router.get('/conversations/incremental', async (req, res) => {
  try {
    const { deviceId, since } = req.query;
    const userId = req.user.id;
    
    if (!deviceId) {
      return res.status(400).json({
        error: 'Device ID é obrigatório',
        code: 'DEVICE_ID_REQUIRED'
      });
    }
    
    if (!since) {
      return res.status(400).json({
        error: 'Timestamp "since" é obrigatório',
        code: 'SINCE_REQUIRED'
      });
    }
    
    const result = await SyncService.incrementalSync(userId, deviceId, since);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Erro na sincronização incremental:', error);
    res.status(500).json({
      error: 'Erro na sincronização incremental',
      code: 'INCREMENTAL_SYNC_ERROR',
      details: error.message
    });
  }
});

/**
 * GET /api/sync/stats
 * Obter estatísticas de sincronização
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await SyncService.getSyncStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas de sincronização:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas',
      code: 'STATS_ERROR',
      details: error.message
    });
  }
});

/**
 * POST /api/sync/device/register
 * Registrar novo dispositivo
 */
router.post('/device/register', async (req, res) => {
  try {
    const { deviceId, deviceName, deviceInfo } = req.body;
    const userId = req.user.id;
    
    if (!deviceId) {
      return res.status(400).json({
        error: 'Device ID é obrigatório',
        code: 'DEVICE_ID_REQUIRED'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    await user.addDevice(deviceId, deviceName || 'Dispositivo Desconhecido');
    
    console.log(`📱 Dispositivo registrado - Utilizador: ${userId}, Dispositivo: ${deviceId}`);
    
    res.json({
      success: true,
      message: 'Dispositivo registrado com sucesso',
      device: {
        deviceId,
        deviceName: deviceName || 'Dispositivo Desconhecido',
        registeredAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao registrar dispositivo:', error);
    res.status(500).json({
      error: 'Erro ao registrar dispositivo',
      code: 'DEVICE_REGISTER_ERROR',
      details: error.message
    });
  }
});

/**
 * DELETE /api/sync/device/:deviceId
 * Remover dispositivo
 */
router.delete('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    await user.removeDevice(deviceId);
    
    console.log(`📱 Dispositivo removido - Utilizador: ${userId}, Dispositivo: ${deviceId}`);
    
    res.json({
      success: true,
      message: 'Dispositivo removido com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao remover dispositivo:', error);
    res.status(500).json({
      error: 'Erro ao remover dispositivo',
      code: 'DEVICE_REMOVE_ERROR',
      details: error.message
    });
  }
});

/**
 * GET /api/sync/devices
 * Listar dispositivos do utilizador
 */
router.get('/devices', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Utilizador não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      devices: user.devices
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar dispositivos:', error);
    res.status(500).json({
      error: 'Erro ao listar dispositivos',
      code: 'DEVICES_LIST_ERROR',
      details: error.message
    });
  }
});

/**
 * POST /api/sync/force-sync
 * Forçar sincronização completa
 */
router.post('/force-sync', async (req, res) => {
  try {
    const { deviceId } = req.body;
    const userId = req.user.id;
    
    if (!deviceId) {
      return res.status(400).json({
        error: 'Device ID é obrigatório',
        code: 'DEVICE_ID_REQUIRED'
      });
    }
    
    // Resetar status de sincronização
    await Conversation.updateMany(
      { userId },
      { 
        $set: { 
          'syncStatus.lastSynced': new Date(0), // Forçar re-sincronização
          'syncStatus.version': 1
        }
      }
    );
    
    // Executar sincronização completa
    const result = await SyncService.syncUserConversations(userId, deviceId, []);
    
    console.log(`🔄 Sincronização forçada - Utilizador: ${userId}, Dispositivo: ${deviceId}`);
    
    res.json({
      success: true,
      message: 'Sincronização forçada concluída',
      data: result.data
    });
    
  } catch (error) {
    console.error('❌ Erro na sincronização forçada:', error);
    res.status(500).json({
      error: 'Erro na sincronização forçada',
      code: 'FORCE_SYNC_ERROR',
      details: error.message
    });
  }
});

/**
 * POST /api/sync/cleanup
 * Limpar dados antigos de sincronização
 */
router.post('/cleanup', async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    
    // Verificar se é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores podem executar limpeza.',
        code: 'ACCESS_DENIED'
      });
    }
    
    const result = await SyncService.cleanupOldSyncData(daysOld);
    
    res.json({
      success: true,
      message: `Limpeza concluída. ${result.modifiedCount} conversas limpas.`,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Erro na limpeza de sincronização:', error);
    res.status(500).json({
      error: 'Erro na limpeza',
      code: 'CLEANUP_ERROR',
      details: error.message
    });
  }
});

module.exports = router;