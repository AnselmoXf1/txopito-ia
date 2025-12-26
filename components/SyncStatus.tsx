import React, { useState, useEffect } from 'react';
import { syncManager, SyncStatus as SyncStatusType } from '../services/syncManager';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ className = '', showDetails = false }) => {
  const [status, setStatus] = useState<SyncStatusType>(syncManager.getStatus());
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleStatusChange = (newStatus: SyncStatusType) => {
      setStatus(newStatus);
    };

    syncManager.addListener(handleStatusChange);

    return () => {
      syncManager.removeListener(handleStatusChange);
    };
  }, []);

  const getStatusIcon = () => {
    if (!status.syncEnabled) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
        </svg>
      );
    }

    if (status.pendingSync) {
      return (
        <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }

    if (!status.isOnline) {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
        </svg>
      );
    }

    if (status.conflictsCount > 0) {
      return (
        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const getStatusText = () => {
    if (!status.syncEnabled) return 'Sincronização desabilitada';
    if (status.pendingSync) return 'Sincronizando...';
    if (!status.isOnline) return 'Offline';
    if (status.conflictsCount > 0) return `${status.conflictsCount} conflitos`;
    return 'Sincronizado';
  };

  const getStatusColor = () => {
    if (!status.syncEnabled) return 'text-gray-400';
    if (status.pendingSync) return 'text-blue-500';
    if (!status.isOnline) return 'text-red-500';
    if (status.conflictsCount > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getLastSyncText = () => {
    if (status.lastSync === 0) return 'Nunca sincronizado';
    
    const now = Date.now();
    const diff = now - status.lastSync;
    
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return `${Math.floor(diff / 86400000)}d atrás`;
  };

  const handleForceSync = async () => {
    if (status.pendingSync) return;
    
    try {
      await syncManager.forceSync();
    } catch (error) {
      console.error('Erro ao forçar sincronização:', error);
    }
  };

  const toggleSync = () => {
    if (status.syncEnabled) {
      syncManager.disableSync();
    } else {
      syncManager.enableSync();
    }
  };

  if (!showDetails) {
    // Versão compacta - apenas ícone
    return (
      <div 
        className={`relative ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={handleForceSync}
          disabled={status.pendingSync}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title={getStatusText()}
        >
          {getStatusIcon()}
        </button>
        
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-50">
            {getStatusText()}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
          </div>
        )}
      </div>
    );
  }

  // Versão detalhada
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Status de Sincronização
        </h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Última sincronização:</span>
          <span>{getLastSyncText()}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Conectividade:</span>
          <span className={status.isOnline ? 'text-green-600' : 'text-red-600'}>
            {status.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {status.conflictsCount > 0 && (
          <div className="flex justify-between">
            <span>Conflitos resolvidos:</span>
            <span className="text-yellow-600">{status.conflictsCount}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleForceSync}
          disabled={status.pendingSync || !status.isOnline}
          className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
        >
          {status.pendingSync ? 'Sincronizando...' : 'Sincronizar Agora'}
        </button>
        
        <button
          onClick={toggleSync}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            status.syncEnabled
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {status.syncEnabled ? 'Desabilitar' : 'Habilitar'}
        </button>
      </div>
    </div>
  );
};

export default SyncStatus;