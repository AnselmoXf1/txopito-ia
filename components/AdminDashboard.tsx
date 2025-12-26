import React, { useState, useEffect } from 'react';
import { apiKeyManager } from '../services/apiKeyManager';
import { keyRotationService } from '../services/keyRotationService';
import { UserService } from '../services/userService';
import { storageService } from '../services/storageService';
import { ErrorHandlingService } from '../services/errorHandlingService';
import ApiKeyMonitor from './ApiKeyMonitor';
import ErrorLogViewer from './ErrorLogViewer';
import MozambiqueTime from './MozambiqueTime';

interface ApiKeyInfo {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  quotaExceeded: boolean;
  lastUsed: Date | null;
  requestCount: number;
  errorCount: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  quotaExceededKeys: number;
  currentKeyId: string | null;
  lastRotation: Date | null;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminTab = 'overview' | 'keys' | 'users' | 'errors' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  console.log('🎯 AdminDashboard: Componente sendo renderizado');
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [stats, setStats] = useState<ApiKeyStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [testingKeys, setTestingKeys] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [rotationStats, setRotationStats] = useState<any>(null);
  const [showErrorLog, setShowErrorLog] = useState(false);
  const [errorStats, setErrorStats] = useState<any>(null);

  // Carregar dados
  const loadData = () => {
    try {
      console.log('🎯 AdminDashboard: Carregando dados...');
      
      // Carregar dados de forma segura
      try {
        const allKeys = apiKeyManager.getAllKeys();
        setKeys(allKeys);
        console.log('✅ AdminDashboard: Chaves carregadas:', allKeys.length);
      } catch (error) {
        console.error('❌ AdminDashboard: Erro ao carregar chaves:', error);
        setKeys([]);
      }

      try {
        const keyStats = apiKeyManager.getStats();
        setStats(keyStats);
        console.log('✅ AdminDashboard: Stats carregadas:', keyStats);
      } catch (error) {
        console.error('❌ AdminDashboard: Erro ao carregar stats:', error);
        setStats(null);
      }

      try {
        const events = keyRotationService.getRecentEvents(10);
        setRecentEvents(events);
        console.log('✅ AdminDashboard: Eventos carregados:', events.length);
      } catch (error) {
        console.error('❌ AdminDashboard: Erro ao carregar eventos:', error);
        setRecentEvents([]);
      }

      try {
        const rotation = keyRotationService.getRotationStats();
        setRotationStats(rotation);
        console.log('✅ AdminDashboard: Rotação carregada:', rotation);
      } catch (error) {
        console.error('❌ AdminDashboard: Erro ao carregar rotação:', error);
        setRotationStats(null);
      }

      try {
        const errorStatsData = ErrorHandlingService.getErrorStats();
        setErrorStats(errorStatsData);
        console.log('✅ AdminDashboard: Error stats carregadas:', errorStatsData);
      } catch (error) {
        console.error('❌ AdminDashboard: Erro ao carregar error stats:', error);
        setErrorStats(null);
      }
      
      // Carregar dados de utilizadores
      try {
        const allUsers = UserService.getAllUsers();
        setUsers(allUsers);
        console.log('✅ AdminDashboard: Utilizadores carregados:', allUsers.length);
      } catch (error) {
        console.error('❌ AdminDashboard: Erro ao carregar utilizadores:', error);
        setUsers([]);
      }
      
      // Carregar todas as conversas
      try {
        const allConversations = storageService.getAllConversations();
        setConversations(allConversations);
        console.log('✅ AdminDashboard: Conversas carregadas:', allConversations.length);
      } catch (error) {
        console.error('❌ AdminDashboard: Erro ao carregar conversas:', error);
        setConversations([]);
      }
      
      console.log('✅ AdminDashboard: Todos os dados carregados com sucesso');
    } catch (error) {
      console.error('❌ AdminDashboard: Erro geral ao carregar dados:', error);
    }
  };

  useEffect(() => {
    console.log('🎯 AdminDashboard: useEffect executado');
    
    try {
      loadData();
      
      // Solicitar permissão para notificações
      keyRotationService.requestNotificationPermission();
      
      // Listener para eventos de rotação
      const removeListener = keyRotationService.addListener((event) => {
        loadData(); // Recarregar dados quando houver eventos
        
        // Mostrar mensagem baseada no tipo de evento
        switch (event.type) {
          case 'rotation':
            showMessage('success', `Rotação automática para chave: ${event.keyName}`);
            break;
          case 'quota_exceeded':
            showMessage('error', `Quota excedida na chave: ${event.keyName}`);
            break;
          case 'key_failed':
            showMessage('error', `Falha na chave: ${event.keyName}`);
            break;
        }
      });
      
      // Atualizar dados a cada 30 segundos
      const interval = setInterval(loadData, 30000);
      
      return () => {
        clearInterval(interval);
        removeListener();
      };
    } catch (error) {
      console.error('❌ AdminDashboard: Erro no useEffect:', error);
    }
  }, []);

  // Mostrar mensagem temporária
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Adicionar nova chave
  const handleAddKey = async () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) {
      showMessage('error', 'Nome e chave são obrigatórios');
      return;
    }

    try {
      setIsAddingKey(true);
      const keyId = apiKeyManager.addKey(newKeyValue, newKeyName);
      setNewKeyName('');
      setNewKeyValue('');
      loadData();
      showMessage('success', `Chave "${newKeyName}" adicionada com sucesso`);
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao adicionar chave');
    } finally {
      setIsAddingKey(false);
    }
  };

  // Remover chave
  const handleRemoveKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Tens certeza que queres remover a chave "${keyName}"?`)) {
      return;
    }

    try {
      const success = apiKeyManager.removeKey(keyId);
      if (success) {
        loadData();
        showMessage('success', `Chave "${keyName}" removida`);
      } else {
        showMessage('error', 'Erro ao remover chave');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao remover chave');
    }
  };

  // Testar chave
  const handleTestKey = async (keyId: string, keyName: string) => {
    setTestingKeys(prev => new Set(prev).add(keyId));
    
    try {
      const result = await apiKeyManager.testKey(keyId);
      if (result.success) {
        showMessage('success', `Chave "${keyName}" está funcionando`);
      } else {
        showMessage('error', `Chave "${keyName}" falhou: ${result.error}`);
      }
      loadData();
    } catch (error: any) {
      showMessage('error', `Erro ao testar chave: ${error.message}`);
    } finally {
      setTestingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyId);
        return newSet;
      });
    }
  };

  // Reativar chave
  const handleReactivateKey = (keyId: string, keyName: string) => {
    const success = apiKeyManager.reactivateKey(keyId);
    if (success) {
      loadData();
      showMessage('success', `Chave "${keyName}" reativada`);
    } else {
      showMessage('error', 'Erro ao reativar chave');
    }
  };

  // Limpar chaves inválidas
  const handleCleanupKeys = () => {
    if (!confirm('Remover todas as chaves inválidas e com muitos erros?')) {
      return;
    }

    const removedCount = apiKeyManager.cleanupInvalidKeys();
    loadData();
    showMessage('success', `${removedCount} chaves inválidas removidas`);
  };

  // Formatar data
  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString('pt-PT');
  };

  // Obter status da chave
  const getKeyStatus = (key: ApiKeyInfo) => {
    if (!key.isActive) return { text: 'Inativa', color: 'text-gray-500', bg: 'bg-gray-500/20' };
    if (key.quotaExceeded) return { text: 'Quota Excedida', color: 'text-red-500', bg: 'bg-red-500/20' };
    if (key.errorCount >= 3) return { text: 'Com Erros', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    return { text: 'Ativa', color: 'text-green-500', bg: 'bg-green-500/20' };
  };

  // Renderizar conteúdo da aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'keys':
        return renderKeysTab();
      case 'users':
        return renderUsersTab();
      case 'errors':
        return renderErrorsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };

  // Aba Visão Geral
  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Monitor de Chaves */}
      <ApiKeyMonitor />

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Utilizadores</p>
              <p className="text-2xl font-bold text-blue-400">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Conversas</p>
              <p className="text-2xl font-bold text-green-400">{conversations.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Chaves API</p>
              <p className="text-2xl font-bold text-purple-400">{stats?.totalKeys || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2h-6m6 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h2M7 7a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2V7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Erros (24h)</p>
              <p className="text-2xl font-bold text-red-400">{errorStats?.last24Hours || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Eventos Recentes */}
      {recentEvents.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-white">Atividade Recente</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentEvents.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-lg">
                    {event.type === 'rotation' ? '🔄' : 
                     event.type === 'quota_exceeded' ? '⚠️' : 
                     event.type === 'key_failed' ? '❌' : 
                     event.type === 'key_added' ? '➕' : '➖'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{event.keyName}</p>
                      <span className="text-xs text-gray-400">
                        {formatDate(new Date(event.timestamp))}
                      </span>
                    </div>
                    {event.details && (
                      <p className="text-sm text-gray-300 mt-1">{event.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Aba Chaves API (conteúdo existente)
  const renderKeysTab = () => (
    <div className="space-y-8">
      {/* Adicionar Nova Chave */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Adicionar Nova Chave API</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome da chave (ex: Chave Principal)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Chave API do Gemini"
            value={newKeyValue}
            onChange={(e) => setNewKeyValue(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddKey}
            disabled={isAddingKey || !newKeyName.trim() || !newKeyValue.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center"
          >
            {isAddingKey ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              '+ Adicionar Chave'
            )}
          </button>
        </div>
      </div>

      {/* Lista de Chaves */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Chaves API ({keys.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Uso</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Erros</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {keys.map((key) => {
                const status = getKeyStatus(key);
                const isCurrentKey = stats?.currentKeyId === key.id;
                const isTesting = testingKeys.has(key.id);
                
                return (
                  <tr key={key.id} className={`hover:bg-white/5 ${isCurrentKey ? 'bg-blue-500/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-white font-medium">{key.name}</span>
                        {isCurrentKey && (
                          <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            ATUAL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{key.requestCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${key.errorCount > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                        {key.errorCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTestKey(key.id, key.name)}
                          disabled={isTesting}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                        >
                          {isTesting ? 'Testando...' : 'Testar'}
                        </button>
                        
                        {(!key.isActive || key.quotaExceeded) && (
                          <button
                            onClick={() => handleReactivateKey(key.id, key.name)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Reativar
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleRemoveKey(key.id, key.name)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Aba Utilizadores
  const renderUsersTab = () => (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Utilizadores Registados ({users.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Conversas</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Último Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => {
                const userConversations = conversations.filter(c => c.userId === user.id);
                return (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{user.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                        user.role === 'creator' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{userConversations.length}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">
                        {user.lastActive ? formatDate(new Date(user.lastActive)) : 'Nunca'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-400">Nenhum utilizador registado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Aba Erros
  const renderErrorsTab = () => {
    const systemStatus = ErrorHandlingService.getSystemStatus();
    
    return (
      <div className="space-y-8">
        {/* Status do Sistema */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Status do Sistema</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              systemStatus.status === 'healthy' ? 'bg-green-500/20 text-green-300' :
              systemStatus.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {systemStatus.status === 'healthy' ? '✅ Saudável' :
               systemStatus.status === 'warning' ? '⚠️ Atenção' :
               '🚨 Crítico'}
            </div>
          </div>
          <p className="text-gray-300">{systemStatus.message}</p>
        </div>

        {/* Estatísticas de Erros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Erros</p>
                <p className="text-2xl font-bold text-red-400">{errorStats?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Últimas 24h</p>
                <p className="text-2xl font-bold text-orange-400">{errorStats?.last24Hours || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Erros Críticos</p>
                <p className="text-2xl font-bold text-red-500">{errorStats?.bySeverity?.critical || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Erros de API</p>
                <p className="text-2xl font-bold text-yellow-400">{errorStats?.byType?.api || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Ações de Monitorização</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowErrorLog(true)}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <span className="text-xl">📋</span>
              <span>Ver Log Completo</span>
            </button>
            
            <button
              onClick={() => {
                if (confirm('Limpar todo o log de erros?')) {
                  ErrorHandlingService.clearErrorLog();
                  loadData();
                  showMessage('success', 'Log de erros limpo com sucesso');
                }
              }}
              className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <span className="text-xl">🗑️</span>
              <span>Limpar Log</span>
            </button>
            
            <button
              onClick={() => {
                loadData();
                showMessage('success', 'Dados atualizados');
              }}
              className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <span className="text-xl">🔄</span>
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Distribuição de Erros por Tipo */}
        {errorStats && Object.keys(errorStats.byType).length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Distribuição por Tipo</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(errorStats.byType).map(([type, count]) => (
                <div key={type} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{type}</span>
                    <span className="text-white font-bold">{count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  const renderSettingsTab = () => (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Configurações do Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Gestão de Dados</h3>
            
            <button
              onClick={handleCleanupKeys}
              className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors"
            >
              🧹 Limpar Chaves Inválidas
            </button>
            
            <button
              onClick={() => {
                if (confirm('Limpar todos os eventos de rotação?')) {
                  keyRotationService.clearOldEvents(0);
                  loadData();
                  showMessage('success', 'Eventos limpos com sucesso');
                }
              }}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
            >
              🗑️ Limpar Eventos de Rotação
            </button>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Informações do Sistema</h3>
            
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Versão:</span>
                <span className="text-white">2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Última Atualização:</span>
                <span className="text-white">Dezembro 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Desenvolvedor:</span>
                <span className="text-white">Anselmo Bistiro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
            <p className="text-gray-400">Gestão Completa do Txopito IA</p>
          </div>
          <div className="flex items-center space-x-4">
            <MozambiqueTime compact className="hidden md:block" />
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
            >
              🚪 Sair do Admin
            </button>
          </div>
        </div>

        {/* Navegação por Abas */}
        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            📊 Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'keys'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            🔑 Chaves API
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            👥 Utilizadores
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'errors'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            🚨 Erros
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            ⚙️ Configurações
          </button>
        </div>

        {/* Mensagem */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/50 text-green-300' 
              : 'bg-red-500/20 border-red-500/50 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Conteúdo da Aba Ativa */}
        {renderTabContent()}
      </div>

      {/* Modal do Log de Erros */}
      {showErrorLog && (
        <ErrorLogViewer onClose={() => setShowErrorLog(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;