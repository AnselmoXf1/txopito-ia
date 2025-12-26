import React, { useState, useEffect } from 'react';
import { apiKeyManager } from '../services/apiKeyManager';

interface ApiKeyMonitorProps {
  className?: string;
}

const ApiKeyMonitor: React.FC<ApiKeyMonitorProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<any>(null);
  const [currentKey, setCurrentKey] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(apiKeyManager.getStats());
      setCurrentKey(apiKeyManager.getCurrentKey());
    };

    updateStats();
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(updateStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const getStatusColor = () => {
    if (stats.activeKeys === 0) return 'text-red-500';
    if (stats.activeKeys <= 2) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (stats.activeKeys === 0) return '🔴';
    if (stats.activeKeys <= 2) return '🟡';
    return '🟢';
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
            <p className="text-white font-medium">Status das Chaves API</p>
            <p className={`text-sm ${getStatusColor()}`}>
              {stats.activeKeys} de {stats.totalKeys} ativas
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
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.totalKeys}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{stats.activeKeys}</p>
              <p className="text-xs text-gray-400">Ativas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{stats.quotaExceededKeys}</p>
              <p className="text-xs text-gray-400">Quota Excedida</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {stats.totalKeys - stats.activeKeys - stats.quotaExceededKeys}
              </p>
              <p className="text-xs text-gray-400">Inativas</p>
            </div>
          </div>

          {currentKey && (
            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm font-medium">Chave Atual:</p>
              <p className="text-white text-sm">{currentKey.name}</p>
              <p className="text-gray-400 text-xs">
                {currentKey.requestCount} pedidos • {currentKey.errorCount} erros
              </p>
            </div>
          )}

          {stats.activeKeys === 0 && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm font-medium">⚠️ Atenção!</p>
              <p className="text-red-200 text-xs">
                Nenhuma chave API ativa. Adiciona novas chaves no painel administrativo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiKeyMonitor;