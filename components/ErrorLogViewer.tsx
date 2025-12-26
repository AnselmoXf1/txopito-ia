import React, { useState, useEffect } from 'react';
import { ErrorHandlingService, ErrorInfo } from '../services/errorHandlingService';

interface ErrorLogViewerProps {
  onClose: () => void;
}

const ErrorLogViewer: React.FC<ErrorLogViewerProps> = ({ onClose }) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = () => {
    const errorLog = ErrorHandlingService.getErrorLog();
    const errorStats = ErrorHandlingService.getErrorStats();
    setErrors(errorLog);
    setStats(errorStats);
  };

  const clearLog = () => {
    if (confirm('Tens a certeza que queres limpar todo o log de erros?')) {
      ErrorHandlingService.clearErrorLog();
      loadErrors();
    }
  };

  const filteredErrors = errors.filter(error => {
    if (filter !== 'all' && error.severity !== filter) return false;
    if (typeFilter !== 'all' && error.type !== typeFilter) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return '🔧';
      case 'auth': return '🔑';
      case 'quota': return '⏰';
      case 'network': return '🌐';
      case 'validation': return '🛡️';
      case 'system': return '💥';
      default: return '❓';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 bg-gradient-to-r from-red-500 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">📊 Log de Erros do Sistema</h2>
              <p className="text-red-100 mt-1">Monitorização e análise de erros</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</div>
                <div className="text-sm text-gray-500">Total de Erros</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                <div className="text-2xl font-bold text-red-600">{stats.last24Hours}</div>
                <div className="text-sm text-gray-500">Últimas 24h</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                <div className="text-2xl font-bold text-orange-600">{stats.bySeverity.critical || 0}</div>
                <div className="text-sm text-gray-500">Críticos</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                <div className="text-2xl font-bold text-yellow-600">{stats.bySeverity.high || 0}</div>
                <div className="text-sm text-gray-500">Alta Prioridade</div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Severidade:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todas</option>
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos</option>
                <option value="api">API</option>
                <option value="auth">Autenticação</option>
                <option value="quota">Quota</option>
                <option value="network">Rede</option>
                <option value="validation">Validação</option>
                <option value="system">Sistema</option>
              </select>
            </div>

            <button
              onClick={clearLog}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors ml-auto"
            >
              🗑️ Limpar Log
            </button>
          </div>
        </div>

        {/* Lista de Erros */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
          {filteredErrors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Nenhum erro encontrado
              </h3>
              <p className="text-gray-500">
                {filter === 'all' && typeFilter === 'all' 
                  ? 'O sistema está funcionando sem erros!'
                  : 'Nenhum erro corresponde aos filtros selecionados.'
                }
              </p>
            </div>
          ) : (
            filteredErrors.map((error, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(error.type)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}>
                          {error.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {error.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(error.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mensagem para Utilizadores:
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      {error.userMessage}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Detalhes Técnicos (Admin):
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border-l-4 border-red-500">
                      {error.adminMessage}
                    </div>
                  </div>
                  
                  {error.context && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        Ver contexto adicional
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                        {JSON.stringify(error.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Mostrando {filteredErrors.length} de {errors.length} erros
            </span>
            <span>
              Sistema: {ErrorHandlingService.getSystemStatus().message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorLogViewer;