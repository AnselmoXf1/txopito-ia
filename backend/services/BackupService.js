const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

class BackupService {
  static isBackupRunning = false;
  static backupSchedule = null;
  
  /**
   * Iniciar backup automático
   */
  static startAutomaticBackup() {
    // Backup diário às 2:00 AM
    this.backupSchedule = cron.schedule('0 2 * * *', async () => {
      console.log('🔄 Iniciando backup automático diário...');
      await this.createFullBackup();
    }, {
      scheduled: true,
      timezone: "Africa/Maputo"
    });
    
    // Backup incremental a cada 6 horas
    cron.schedule('0 */6 * * *', async () => {
      console.log('🔄 Iniciando backup incremental...');
      await this.createIncrementalBackup();
    }, {
      scheduled: true,
      timezone: "Africa/Maputo"
    });
    
    console.log('✅ Backup automático configurado');
  }
  
  /**
   * Parar backup automático
   */
  static stopAutomaticBackup() {
    if (this.backupSchedule) {
      this.backupSchedule.destroy();
      this.backupSchedule = null;
    }
    console.log('🛑 Backup automático parado');
  }
  
  /**
   * Verificar se backup está rodando
   */
  static isRunning() {
    return this.isBackupRunning;
  }
  
  /**
   * Criar backup completo
   */
  static async createFullBackup() {
    if (this.isBackupRunning) {
      console.log('⚠️ Backup já está em execução');
      return;
    }
    
    this.isBackupRunning = true;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(__dirname, '../backups', `full-${timestamp}`);
      
      // Criar diretório de backup
      await fs.mkdir(backupDir, { recursive: true });
      
      console.log(`📦 Criando backup completo em: ${backupDir}`);
      
      // Backup de utilizadores
      const users = await User.find({}).lean();
      await fs.writeFile(
        path.join(backupDir, 'users.json'),
        JSON.stringify(users, null, 2)
      );
      
      // Backup de conversas
      const conversations = await Conversation.find({}).lean();
      await fs.writeFile(
        path.join(backupDir, 'conversations.json'),
        JSON.stringify(conversations, null, 2)
      );
      
      // Metadados do backup
      const metadata = {
        type: 'full',
        timestamp: new Date().toISOString(),
        counts: {
          users: users.length,
          conversations: conversations.length
        },
        version: '1.0.0'
      };
      
      await fs.writeFile(
        path.join(backupDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );
      
      // Comprimir backup (opcional)
      await this.compressBackup(backupDir);
      
      console.log(`✅ Backup completo criado: ${users.length} utilizadores, ${conversations.length} conversas`);
      
      // Limpar backups antigos
      await this.cleanupOldBackups();
      
      return {
        success: true,
        path: backupDir,
        metadata
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar backup completo:', error);
      throw error;
    } finally {
      this.isBackupRunning = false;
    }
  }
  
  /**
   * Criar backup incremental (apenas mudanças recentes)
   */
  static async createIncrementalBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(__dirname, '../backups', `incremental-${timestamp}`);
      
      // Criar diretório de backup
      await fs.mkdir(backupDir, { recursive: true });
      
      // Buscar dados modificados nas últimas 6 horas
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      
      const recentUsers = await User.find({
        updatedAt: { $gte: sixHoursAgo }
      }).lean();
      
      const recentConversations = await Conversation.find({
        updatedAt: { $gte: sixHoursAgo }
      }).lean();
      
      // Só criar backup se houver mudanças
      if (recentUsers.length === 0 && recentConversations.length === 0) {
        console.log('ℹ️ Nenhuma mudança recente, backup incremental cancelado');
        return;
      }
      
      console.log(`📦 Criando backup incremental: ${recentUsers.length} utilizadores, ${recentConversations.length} conversas`);
      
      // Salvar dados
      if (recentUsers.length > 0) {
        await fs.writeFile(
          path.join(backupDir, 'users.json'),
          JSON.stringify(recentUsers, null, 2)
        );
      }
      
      if (recentConversations.length > 0) {
        await fs.writeFile(
          path.join(backupDir, 'conversations.json'),
          JSON.stringify(recentConversations, null, 2)
        );
      }
      
      // Metadados
      const metadata = {
        type: 'incremental',
        timestamp: new Date().toISOString(),
        since: sixHoursAgo.toISOString(),
        counts: {
          users: recentUsers.length,
          conversations: recentConversations.length
        },
        version: '1.0.0'
      };
      
      await fs.writeFile(
        path.join(backupDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );
      
      console.log(`✅ Backup incremental criado`);
      
      return {
        success: true,
        path: backupDir,
        metadata
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar backup incremental:', error);
      throw error;
    }
  }
  
  /**
   * Restaurar backup
   */
  static async restoreBackup(backupPath) {
    try {
      console.log(`🔄 Restaurando backup de: ${backupPath}`);
      
      // Ler metadados
      const metadataPath = path.join(backupPath, 'metadata.json');
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      
      console.log(`📋 Tipo de backup: ${metadata.type}, Data: ${metadata.timestamp}`);
      
      // Restaurar utilizadores
      const usersPath = path.join(backupPath, 'users.json');
      try {
        const usersData = JSON.parse(await fs.readFile(usersPath, 'utf8'));
        
        for (const userData of usersData) {
          await User.findOneAndUpdate(
            { _id: userData._id },
            userData,
            { upsert: true, new: true }
          );
        }
        
        console.log(`👥 ${usersData.length} utilizadores restaurados`);
      } catch (error) {
        console.log('ℹ️ Nenhum arquivo de utilizadores encontrado');
      }
      
      // Restaurar conversas
      const conversationsPath = path.join(backupPath, 'conversations.json');
      try {
        const conversationsData = JSON.parse(await fs.readFile(conversationsPath, 'utf8'));
        
        for (const convData of conversationsData) {
          await Conversation.findOneAndUpdate(
            { id: convData.id },
            convData,
            { upsert: true, new: true }
          );
        }
        
        console.log(`💬 ${conversationsData.length} conversas restauradas`);
      } catch (error) {
        console.log('ℹ️ Nenhum arquivo de conversas encontrado');
      }
      
      console.log('✅ Backup restaurado com sucesso');
      
      return {
        success: true,
        metadata,
        restoredAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      throw error;
    }
  }
  
  /**
   * Listar backups disponíveis
   */
  static async listBackups() {
    try {
      const backupsDir = path.join(__dirname, '../backups');
      
      // Criar diretório se não existir
      try {
        await fs.access(backupsDir);
      } catch {
        await fs.mkdir(backupsDir, { recursive: true });
        return [];
      }
      
      const entries = await fs.readdir(backupsDir, { withFileTypes: true });
      const backups = [];
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const metadataPath = path.join(backupsDir, entry.name, 'metadata.json');
          
          try {
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            
            // Obter tamanho do diretório
            const size = await this.getDirectorySize(path.join(backupsDir, entry.name));
            
            backups.push({
              name: entry.name,
              path: path.join(backupsDir, entry.name),
              metadata,
              size,
              sizeFormatted: this.formatBytes(size)
            });
          } catch (error) {
            console.warn(`⚠️ Backup inválido ignorado: ${entry.name}`);
          }
        }
      }
      
      // Ordenar por data (mais recente primeiro)
      backups.sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp));
      
      return backups;
      
    } catch (error) {
      console.error('❌ Erro ao listar backups:', error);
      throw error;
    }
  }
  
  /**
   * Limpar backups antigos (manter apenas os últimos 30 dias)
   */
  static async cleanupOldBackups(daysToKeep = 30) {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      let deletedCount = 0;
      
      for (const backup of backups) {
        const backupDate = new Date(backup.metadata.timestamp);
        
        if (backupDate < cutoffDate) {
          await fs.rmdir(backup.path, { recursive: true });
          deletedCount++;
          console.log(`🗑️ Backup antigo removido: ${backup.name}`);
        }
      }
      
      console.log(`🧹 Limpeza concluída: ${deletedCount} backups antigos removidos`);
      
      return { deletedCount };
      
    } catch (error) {
      console.error('❌ Erro na limpeza de backups:', error);
      throw error;
    }
  }
  
  /**
   * Comprimir backup (implementação básica)
   */
  static async compressBackup(backupDir) {
    // Implementação futura: usar tar/zip para comprimir
    console.log(`📦 Compressão de backup: ${backupDir} (não implementado)`);
  }
  
  /**
   * Obter tamanho de diretório
   */
  static async getDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          totalSize += await this.getDirectorySize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao calcular tamanho de ${dirPath}:`, error.message);
    }
    
    return totalSize;
  }
  
  /**
   * Formatar bytes em formato legível
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Obter estatísticas de backup
   */
  static async getBackupStats() {
    try {
      const backups = await this.listBackups();
      
      const stats = {
        totalBackups: backups.length,
        totalSize: backups.reduce((acc, backup) => acc + backup.size, 0),
        lastBackup: backups.length > 0 ? backups[0].metadata.timestamp : null,
        backupTypes: {
          full: backups.filter(b => b.metadata.type === 'full').length,
          incremental: backups.filter(b => b.metadata.type === 'incremental').length
        },
        isRunning: this.isBackupRunning
      };
      
      stats.totalSizeFormatted = this.formatBytes(stats.totalSize);
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de backup:', error);
      throw error;
    }
  }
}

module.exports = BackupService;