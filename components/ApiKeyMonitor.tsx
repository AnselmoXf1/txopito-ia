import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

interface ApiKeyMonitorProps {
  className?: string;
}

const ApiKeyMonitor: React.FC<ApiKeyMonitorProps> = ({ className = '' }) => {
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        // Testar conexão com backend
        const testResult = await geminiService.testConnection();
        setConnectionTest(testResult);
        
        // Obter estatísticas se disponível
        const stats = await geminiService.getStats();
        setBackendStatus(stats);
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    };

    updateStatus();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!connectionTest?.success) return 'text-red-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!connectionTest?.success) return '🔴';
    return '🟢';
  };

  const getStatusText = () => {
    if (!connectionTest) return 'Verificando...';
    if (connectionTest.success) return 'Sistema Seguro Ativo';
    return 'Sistema Offline';
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 ${className}`}>
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <p className="text-white font-medium">Status do Sistema</p>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/10">
          <div className="mt-4 space-y-3">
            {/* Status da Conexão */}
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <p className="text-white text-sm font-medium">🔐 Sistema Seguro</p>
              <p className="text-gray-300 text-xs">
                {connectionTest?.success ? 'Backend conectado e funcionando' : 'Backend offline ou com problemas'}
              </p>
            </div>

            {/* Informações de Segurança */}
            <div className="p-3 bg-green-500/20 rounded-lg">
              <p className="text-green-300 text-sm font-medium">✅ Chave Protegida</p>
              <p className="text-green-200 text-xs">
                Chave API segura no backend - nunca exposta publicamente
              </p>
            </div>

            {/* Rate Limiting */}
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm font-medium">🛡️ Rate Limiting</p>
              <p className="text-blue-200 text-xs">
                Proteção ativa: 10 requisições por minuto
              </p>
            </div>

            {/* Estatísticas do Backend */}
            {backendStatus && (
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <p className="text-purple-300 text-sm font-medium">📊 Estatísticas</p>
                <p className="text-purple-200 text-xs">
                  Modelo: {backendStatus.stats?.model || 'gemini-2.5-flash'}
                </p>
              </div>
            )}

            {/* Erro de Conexão */}
            {connectionTest && !connectionTest.success && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm font-medium">⚠️ Problema de Conexão</p>
                <p className="text-red-200 text-xs">
                  {connectionTest.error || 'Erro desconhecido'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyMonitor;