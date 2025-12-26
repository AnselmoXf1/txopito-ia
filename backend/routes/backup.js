const express = require('express');
const BackupService = require('../services/BackupService');

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
 * POST /api/backup/create
 * Criar backup manual
 */
router.post('/create', adminOnly, async (req, res) => {
  try {
    const { type = 'manual', description } = req.body;
    
    const backup = await BackupService.createBackup(type, description);
    
    res.json({
      success: true,
      message: 'Backup criado com sucesso',
      backup
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    res.status(500).json({
      error: 'Erro ao criar backup',
      code: 'CREATE_BACKUP_ERROR',
      details: error.message
    });
  }
});

/**
 * GET /api/backup/list
 * Listar backups disponíveis
 */
router.get('/list', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const backups = await BackupService.listBackups(parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      backups
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar backups:', error);
    res.status(500).json({
      error: 'Erro ao listar backups',
      code: 'LIST_BACKUPS_ERROR',
      details: error.message
    });
  }
});

/**
 * POST /api/backup/restore/:id
 * Restaurar backup
 */
router.post('/restore/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await BackupService.restoreBackup(id);
    
    res.json({
      success: true,
      message: 'Backup restaurado com sucesso',
      result
    });
    
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
    res.status(500).json({
      error: 'Erro ao restaurar backup',
      code: 'RESTORE_BACKUP_ERROR',
      details: error.message
    });
  }
});

/**
 * DELETE /api/backup/:id
 * Apagar backup
 */
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    await BackupService.deleteBackup(id);
    
    res.json({
      success: true,
      message: 'Backup apagado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao apagar backup:', error);
    res.status(500).json({
      error: 'Erro ao apagar backup',
      code: 'DELETE_BACKUP_ERROR',
      details: error.message
    });
  }
});

/**
 * GET /api/backup/status
 * Obter status do serviço de backup
 */
router.get('/status', adminOnly, async (req, res) => {
  try {
    const status = BackupService.getStatus();
    
    res.json({
      success: true,
      status
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter status do backup:', error);
    res.status(500).json({
      error: 'Erro ao obter status',
      code: 'BACKUP_STATUS_ERROR',
      details: error.message
    });
  }
});

/**
 * POST /api/backup/schedule
 * Configurar agendamento de backup
 */
router.post('/schedule', adminOnly, async (req, res) => {
  try {
    const { schedule, enabled = true } = req.body;
    
    if (!schedule) {
      return res.status(400).json({
        error: 'Agendamento é obrigatório',
        code: 'SCHEDULE_REQUIRED'
      });
    }
    
    BackupService.updateSchedule(schedule, enabled);
    
    res.json({
      success: true,
      message: 'Agendamento atualizado com sucesso',
      schedule: {
        cron: schedule,
        enabled
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao configurar agendamento:', error);
    res.status(500).json({
      error: 'Erro ao configurar agendamento',
      code: 'SCHEDULE_ERROR',
      details: error.message
    });
  }
});

module.exports = router;