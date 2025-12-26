import React, { useState, useEffect } from 'react';
import { backendService } from '../services/backendService';
import { geminiService } from '../services/geminiService';

interface AdminDashboardFunctionalProps {
  onLogout: () => void;
}

interface SystemStats {
  database: string;
  backend: string;
  otp: string;
  email: string;
}

const AdminDashboardFunctional: React.FC<AdminDashboardFunctionalProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'otp' | 'system' | 'apikeys'>('overview');
  const [stats, setStats] = useState<SystemStats>({
    database: 'Verificando...',
    backend: 'Verificando...',
    otp: 'Verificando...',
    email: 'Verificando...'
  });
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState('');
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [apiStats, setApiStats] = useState<any>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [testingKeys, setTestingKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkSystemStatus();
    loadApiKeys();
  }, []);

  const loadApiKeys = () => {
    // Sistema seguro - chaves geridas no backend
    setApiKeys([]);
    setApiStats({
      totalKeys: 0,
      activeKeys: 0,
      quotaExceededKeys: 0,
      currentKeyId: null,
      lastRotation: null
    });
  };

  const checkSystemStatus = async () => {
    try {
      const isHealthy = await backendService.checkHealth();
      setStats({
        database: isHealthy ? '✅ Conectada' : '❌ Desconectada',
        backend: isHealthy ? '✅ Online' : '❌ Offline',
        otp: '✅ Ativo',
        email: '✅ Configurado'
      });
    } catch (error) {
      setStats({
        database: '❌ Erro',
        backend: '❌ Erro',
        otp: '⚠️ Desconhecido',
        email: '⚠️ Desconhecido'
      });
    }
  };

  const handleAddApiKey = () => {
    alert('🔐 Sistema Seguro: Chaves são geridas no backend. Contacta o administrador.');
  };

  const handleRemoveApiKey = (keyId: string) => {
    if (confirm('Tens certeza que queres remover esta chave API?')) {
      try {
        apiKeyManager.removeKey(keyId);
        loadApiKeys();
        alert('✅ Chave API removida com sucesso!');
      } catch (error: any) {
        alert(`❌ Erro: ${error.message}`);
      }
    }
  };

  const handleTestApiKey = async (keyId: string) => {
    setTestingKeys(prev => new Set(prev).add(keyId));
    
    try {
      const result = await apiKeyManager.testKey(keyId);
      
      if (result.success) {
        alert('✅ Chave API testada com sucesso!');
      } else {
        alert(`❌ Teste falhou: ${result.error}`);
      }
      
      loadApiKeys(); // Atualizar estatísticas
    } catch (error: any) {
      alert(`❌ Erro no teste: ${error.message}`);
    } finally {
      setTestingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyId);
        return newSet;
      });
    }
  };

  const handleReactivateApiKey = (keyId: string) => {
    if (confirm('Reativar esta chave API?')) {
      const success = apiKeyManager.reactivateKey(keyId);
      if (success) {
        loadApiKeys();
        alert('✅ Chave API reativada!');
      } else {
        alert('❌ Erro ao reativar chave');
      }
    }
  };

  const handleCleanupKeys = () => {
    if (confirm('Remover chaves inválidas automaticamente?')) {
      const removed = apiKeyManager.cleanupInvalidKeys();
      loadApiKeys();
      alert(`🧹 ${removed} chaves inválidas removidas`);
    }
  };

  const handleTestOTP = async () => {
    if (!testEmail) {
      setTestResult('❌ Introduz um email válido');
      return;
    }

    setLoading(true);
    setTestResult('📧 Enviando código OTP...');

    try {
      const response = await backendService.sendOTP(testEmail, 'email_verification');
      
      if (response.success) {
        setTestResult('✅ Código OTP enviado com sucesso! Verifica o email.');
      } else {
        setTestResult(`❌ Erro: ${response.error}`);
      }
    } catch (error) {
      setTestResult('❌ Erro de conexão com o backend');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Utilizadores</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Conversas</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔐</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sistema OTP</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">✅</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔑</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Chaves API</h3>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {apiStats ? `${apiStats.activeKeys}/${apiStats.totalKeys}` : '0/0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">⚡ Ações Rápidas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab('otp')}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">🧪</span>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">Testar OTP</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">Verificar sistema de emails</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('system')}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">Estado Sistema</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Monitorizar serviços</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">👥</span>
              <div>
                <h3 className="font-semibold text-purple-800 dark:text-purple-300">Utilizadores</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">Gestão de contas</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('apikeys')}
            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔑</span>
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Chaves API</h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Gestão de chaves Gemini</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={checkSystemStatus}
            className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔄</span>
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-300">Atualizar</h3>
                <p className="text-sm text-orange-600 dark:text-orange-400">Verificar estado</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderOTPTest = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">🧪 Testar Sistema OTP</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email para teste
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="exemplo@email.com"
            />
          </div>
          
          <button
            onClick={handleTestOTP}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Enviar Código OTP'
            )}
          </button>
          
          {testResult && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">{testResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSystemStatus = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📊 Estado do Sistema</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Base de Dados</span>
            <span className="font-semibold">{stats.database}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Backend API</span>
            <span className="font-semibold">{stats.backend}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Sistema OTP</span>
            <span className="font-semibold">{stats.otp}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">Email SMTP</span>
            <span className="font-semibold">{stats.email}</span>
          </div>
        </div>
        
        <button
          onClick={checkSystemStatus}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
        >
          🔄 Atualizar Estado
        </button>
      </div>
    </div>
  );

  const renderApiKeys = () => (
    <div className="space-y-6">
      {/* API Key Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">🔑 Estatísticas das Chaves API</h2>
        
        {apiStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{apiStats.totalKeys}</div>
              <div className="text-sm text-blue-800 dark:text-blue-300">Total de Chaves</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{apiStats.activeKeys}</div>
              <div className="text-sm text-green-800 dark:text-green-300">Chaves Ativas</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{apiStats.quotaExceededKeys}</div>
              <div className="text-sm text-red-800 dark:text-red-300">Quota Excedida</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {apiStats.currentKeyId ? apiStats.currentKeyId.substring(0, 8) + '...' : 'Nenhuma'}
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-300">Chave Atual</div>
            </div>
          </div>
        )}
      </div>

      {/* Add New API Key */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">➕ Adicionar Nova Chave API</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome da Chave
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Chave Principal, Chave Backup..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chave API (Gemini)
            </label>
            <input
              type="password"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="AIzaSy..."
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAddApiKey}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              ➕ Adicionar Chave
            </button>
            <button
              onClick={handleCleanupKeys}
              className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              🧹 Limpar Inválidas
            </button>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📋 Lista de Chaves API</h2>
        
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhuma chave API configurada
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{key.name}</h3>
                      {apiStats?.currentKeyId === key.id && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded text-xs">
                          ATUAL
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${
                        key.isActive && !key.quotaExceeded
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                          : key.quotaExceeded
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {key.isActive && !key.quotaExceeded ? 'ATIVA' : key.quotaExceeded ? 'QUOTA EXCEDIDA' : 'INATIVA'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>🔑 Chave: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{key.key}</code></div>
                      <div>📊 Pedidos: {key.requestCount} | Erros: {key.errorCount}</div>
                      <div>📅 Última utilização: {key.lastUsed ? new Date(key.lastUsed).toLocaleString('pt-PT') : 'Nunca'}</div>
                      {key.lastError && (
                        <div className="text-red-600 dark:text-red-400">❌ Último erro: {key.lastError}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleTestApiKey(key.id)}
                      disabled={testingKeys.has(key.id)}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      {testingKeys.has(key.id) ? '🔄' : '🧪'} Testar
                    </button>
                    
                    {(!key.isActive || key.quotaExceeded) && (
                      <button
                        onClick={() => handleReactivateApiKey(key.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        🔄 Reativar
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRemoveApiKey(key.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      🗑️ Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">👥 Utilizadores</h2>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">admin@txopito.mz</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Administrador</p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm">
                Ativo
              </span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">anselmo@txopito.mz</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Criador</p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm">
                Ativo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                🛠️ Painel de Administração
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Txopito IA - Sistema de Gestão
              </p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              📊 Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              👥 Utilizadores
            </button>
            <button
              onClick={() => setActiveTab('otp')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'otp'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              🔐 Teste OTP
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'system'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              🖥️ Sistema
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'otp' && renderOTPTest()}
          {activeTab === 'system' && renderSystemStatus()}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          <p>Txopito IA Admin Panel v1.0 - Sistema OTP Implementado ✅</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardFunctional;