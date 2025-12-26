const Conversation = require('../models/Conversation');
const User = require('../models/User');

class SyncService {
  /**
   * Sincronizar conversas de um utilizador entre dispositivos
   */
  static async syncUserConversations(userId, deviceId, localConversations = []) {
    try {
      console.log(`🔄 Iniciando sincronização para utilizador ${userId}, dispositivo ${deviceId}`);
      
      // Obter conversas do servidor
      const serverConversations = await Conversation.findByUser(userId);
      
      // Atualizar dispositivo do utilizador
      const user = await User.findById(userId);
      if (user) {
        await user.addDevice(deviceId, 'Dispositivo Web');
      }
      
      const syncResult = {
        serverConversations: [],
        conflictsResolved: [],
        newConversations: [],
        updatedConversations: [],
        deletedConversations: []
      };
      
      // Mapear conversas do servidor por ID
      const serverMap = new Map();
      serverConversations.forEach(conv => {
        serverMap.set(conv.id, conv);
      });
      
      // Mapear conversas locais por ID
      const localMap = new Map();
      localConversations.forEach(conv => {
        localMap.set(conv.id, conv);
      });
      
      // Processar conversas locais
      for (const localConv of localConversations) {
        const serverConv = serverMap.get(localConv.id);
        
        if (!serverConv) {
          // Conversa nova no cliente - enviar para servidor
          const newConv = await this.createConversationOnServer(localConv, userId, deviceId);
          syncResult.newConversations.push(newConv);
        } else {
          // Conversa existe - verificar conflitos
          const conflict = this.detectConflict(localConv, serverConv);
          
          if (conflict) {
            const resolved = await this.resolveConflict(localConv, serverConv, deviceId);
            syncResult.conflictsResolved.push(resolved);
          } else if (localConv.lastUpdate > serverConv.lastUpdate) {
            // Cliente mais recente - atualizar servidor
            const updated = await this.updateConversationOnServer(localConv, serverConv, deviceId);
            syncResult.updatedConversations.push(updated);
          }
        }
      }
      
      // Processar conversas do servidor que não existem no cliente
      for (const serverConv of serverConversations) {
        if (!localMap.has(serverConv.id)) {
          // Conversa nova no servidor - enviar para cliente
          syncResult.serverConversations.push(serverConv.toObject());
        }
      }
      
      // Marcar todas as conversas como sincronizadas
      await Conversation.updateMany(
        { userId },
        { 
          $set: { 
            'syncStatus.lastSynced': new Date(),
            $push: {
              devices: {
                deviceId,
                lastAccessed: new Date()
              }
            }
          }
        }
      );
      
      console.log(`✅ Sincronização concluída para utilizador ${userId}`);
      console.log(`📊 Resultado: ${syncResult.newConversations.length} novas, ${syncResult.updatedConversations.length} atualizadas, ${syncResult.conflictsResolved.length} conflitos resolvidos`);
      
      return {
        success: true,
        data: syncResult,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      throw new Error(`Erro na sincronização: ${error.message}`);
    }
  }
  
  /**
   * Detectar conflitos entre versões local e servidor
   */
  static detectConflict(localConv, serverConv) {
    // Conflito se ambas foram modificadas após a última sincronização
    const lastSync = serverConv.syncStatus.lastSynced;
    
    const localModified = localConv.lastUpdate > lastSync.getTime();
    const serverModified = serverConv.lastUpdate > lastSync.getTime();
    
    return localModified && serverModified;
  }
  
  /**
   * Resolver conflitos de sincronização
   */
  static async resolveConflict(localConv, serverConv, deviceId) {
    console.log(`⚠️ Resolvendo conflito para conversa ${localConv.id}`);
    
    // Estratégia: Mesclar mensagens por timestamp
    const allMessages = [...localConv.messages, ...serverConv.messages];
    
    // Remover duplicatas e ordenar por timestamp
    const uniqueMessages = allMessages.reduce((acc, msg) => {
      const existing = acc.find(m => m.id === msg.id);
      if (!existing) {
        acc.push(msg);
      }
      return acc;
    }, []);
    
    uniqueMessages.sort((a, b) => a.timestamp - b.timestamp);
    
    // Atualizar conversa no servidor
    serverConv.messages = uniqueMessages;
    serverConv.lastUpdate = Math.max(localConv.lastUpdate, serverConv.lastUpdate);
    
    await serverConv.updateDeviceAccess(deviceId);
    await serverConv.resolveConflict(`Conflito resolvido mesclando ${allMessages.length} mensagens`);
    
    const saved = await serverConv.save();
    
    console.log(`✅ Conflito resolvido para conversa ${localConv.id}`);
    
    return saved.toObject();
  }
  
  /**
   * Criar nova conversa no servidor
   */
  static async createConversationOnServer(localConv, userId, deviceId) {
    const conversation = new Conversation({
      ...localConv,
      userId,
      syncStatus: {
        lastSynced: new Date(),
        version: 1
      },
      devices: [{
        deviceId,
        lastAccessed: new Date(),
        lastModified: new Date()
      }]
    });
    
    const saved = await conversation.save();
    console.log(`➕ Nova conversa criada no servidor: ${saved.id}`);
    
    return saved.toObject();
  }
  
  /**
   * Atualizar conversa existente no servidor
   */
  static async updateConversationOnServer(localConv, serverConv, deviceId) {
    // Atualizar campos da conversa
    serverConv.title = localConv.title;
    serverConv.messages = localConv.messages;
    serverConv.lastUpdate = localConv.lastUpdate;
    serverConv.mode = localConv.mode;
    
    await serverConv.updateDeviceAccess(deviceId);
    const saved = await serverConv.save();
    
    console.log(`🔄 Conversa atualizada no servidor: ${saved.id}`);
    
    return saved.toObject();
  }
  
  /**
   * Sincronização incremental (apenas mudanças recentes)
   */
  static async incrementalSync(userId, deviceId, lastSyncTimestamp) {
    try {
      const since = new Date(lastSyncTimestamp);
      
      // Buscar apenas conversas modificadas desde a última sincronização
      const modifiedConversations = await Conversation.find({
        userId,
        updatedAt: { $gt: since }
      }).sort({ updatedAt: -1 });
      
      // Atualizar acesso do dispositivo
      await Promise.all(
        modifiedConversations.map(conv => conv.updateDeviceAccess(deviceId))
      );
      
      return {
        success: true,
        conversations: modifiedConversations.map(conv => conv.toObject()),
        timestamp: new Date().toISOString(),
        count: modifiedConversations.length
      };
      
    } catch (error) {
      console.error('❌ Erro na sincronização incremental:', error);
      throw new Error(`Erro na sincronização incremental: ${error.message}`);
    }
  }
  
  /**
   * Obter estatísticas de sincronização
   */
  static async getSyncStats(userId) {
    try {
      const user = await User.findById(userId);
      const conversations = await Conversation.findByUser(userId);
      
      const stats = {
        totalConversations: conversations.length,
        devicesCount: user ? user.devices.length : 0,
        lastSync: user ? Math.max(...user.devices.map(d => d.lastSync.getTime())) : 0,
        conflictsCount: conversations.reduce((acc, conv) => 
          acc + conv.syncStatus.conflicts.length, 0
        ),
        needsSyncCount: conversations.filter(conv => conv.needsSync).length
      };
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de sincronização:', error);
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }
  
  /**
   * Limpar dados antigos de sincronização
   */
  static async cleanupOldSyncData(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      // Remover conflitos antigos resolvidos
      const result = await Conversation.updateMany(
        {},
        {
          $pull: {
            'syncStatus.conflicts': {
              timestamp: { $lt: cutoffDate },
              resolved: true
            }
          }
        }
      );
      
      console.log(`🧹 Limpeza de sincronização: ${result.modifiedCount} conversas limpas`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Erro na limpeza de sincronização:', error);
      throw error;
    }
  }
}

module.exports = SyncService;