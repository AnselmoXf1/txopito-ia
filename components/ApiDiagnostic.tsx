import React, { useState, useEffect } from 'react';
import { apiKeyManager } from '../services/apiKeyManager';
import { geminiService } from '../services/geminiService';

interface ApiDiagnosticProps {
  onClose: () => void;
}

const ApiDiagnostic: React.FC<ApiDiagnosticProps> = ({ onClose }) => {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const results: any = {
      timestamp: new Date().toLocaleString(),
      envKey: null,
      apiKeyManager: null,
      geminiService: null,
      connectionTest: null
    };

    try {
      // 1. Verificar chave do .env
      const envKey = import.meta.env.VITE_GEMINI_API_KEY;
      results.envKey = {
        exists: !!envKey,
        preview: envKey ? `${envKey.substring(0, 10)}...` : 'NÃO ENCONTRADA',
        length: envKey ? envKey.length : 0,
        startsWithAI: envKey ? envKey.startsWith('AIza') : false
      };

      // 2. Verificar apiKeyManager
      const stats = apiKeyManager.getStats();
      const currentKey = apiKeyManager.getCurrentKey();
      results.apiKeyManager = {
        totalKeys: stats.totalKeys,
        activeKeys: stats.activeKeys,
        currentKey: currentKey ? {
          name: currentKey.name,
          preview: `${currentKey.key.substring(0, 10)}...`,
          isActive: currentKey.isActive,
          quotaExceeded: currentKey.quotaExceeded
        } : null
      };

      // 3. Verificar geminiService
      results.geminiService = {
        isInitialized: (geminiService as any).isInitialized,
        currentKeyId: (geminiService as any).currentKeyId
      };

      // 4. Testar conexão
      try {
        const connectionResult = await geminiService.testConnection();
        results.connectionTest = connectionResult;
      } catch (error: any) {
        results.connectionTest = {
          success: false,
          error: error.message
        };
      }

    } catch (error: any) {
      results.error = error.message;
    }

    setDiagnosticResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusIcon = (success: boolean) => success ? '✅' : '❌';
  const getStatusColor = (success: boolean) => success ? 'text-green-400' : 'text-red-400';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🔍 Diagnóstico da API</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {isRunning ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Executando diagnóstico...</p>
          </div>
        ) : diagnosticResults ? (
          <div className="space-y-6">
            {/* Chave do .env */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-white mb-3">
                {getStatusIcon(diagnosticResults.envKey?.exists)} Chave do .env.local
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Existe:</span>
                  <span className={getStatusColor(diagnosticResults.envKey?.exists)}>
                    {diagnosticResults.envKey?.exists ? 'Sim' : 'Não'}
                  </span>
                </div>
                {diagnosticResults.envKey?.exists && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Preview:</span>
                      <span className="text-gray-300 font-mono">{diagnosticResults.envKey.preview}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Comprimento:</span>
                      <span className={getStatusColor(diagnosticResults.envKey.length >= 35)}>
                        {diagnosticResults.envKey.length} caracteres
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Formato válido:</span>
                      <span className={getStatusColor(diagnosticResults.envKey.startsWithAI)}>
                        {diagnosticResults.envKey.startsWithAI ? 'Sim (AIza...)' : 'Não'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* API Key Manager */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-white mb-3">
                {getStatusIcon(diagnosticResults.apiKeyManager?.totalKeys > 0)} Gestor de Chaves
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total de chaves:</span>
                  <span className="text-gray-300">{diagnosticResults.apiKeyManager?.totalKeys || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chaves ativas:</span>
                  <span className={getStatusColor(diagnosticResults.apiKeyManager?.activeKeys > 0)}>
                    {diagnosticResults.apiKeyManager?.activeKeys || 0}
                  </span>
                </div>
                {diagnosticResults.apiKeyManager?.currentKey && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Chave atual:</span>
                      <span className="text-gray-300">{diagnosticResults.apiKeyManager.currentKey.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={getStatusColor(!diagnosticResults.apiKeyManager.currentKey.quotaExceeded)}>
                        {diagnosticResults.apiKeyManager.currentKey.quotaExceeded ? 'Quota Excedida' : 'Ativa'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Gemini Service */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-white mb-3">
                {getStatusIcon(diagnosticResults.geminiService?.isInitialized)} Serviço Gemini
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Inicializado:</span>
                  <span className={getStatusColor(diagnosticResults.geminiService?.isInitialized)}>
                    {diagnosticResults.geminiService?.isInitialized ? 'Sim' : 'Não'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chave carregada:</span>
                  <span className={getStatusColor(!!diagnosticResults.geminiService?.currentKeyId)}>
                    {diagnosticResults.geminiService?.currentKeyId ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            </div>

            {/* Teste de Conexão */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-white mb-3">
                {getStatusIcon(diagnosticResults.connectionTest?.success)} Teste de Conexão
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={getStatusColor(diagnosticResults.connectionTest?.success)}>
                    {diagnosticResults.connectionTest?.success ? 'Sucesso' : 'Falhou'}
                  </span>
                </div>
                {diagnosticResults.connectionTest?.error && (
                  <div className="mt-2">
                    <span className="text-gray-400">Erro:</span>
                    <div className="mt-1 p-2 bg-red-900/30 rounded text-red-300 text-xs">
                      {diagnosticResults.connectionTest.error}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Soluções */}
            <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
              <h3 className="text-lg font-medium text-blue-300 mb-3">💡 Soluções</h3>
              <div className="space-y-2 text-sm text-blue-200">
                {!diagnosticResults.envKey?.exists && (
                  <p>• Adiciona VITE_GEMINI_API_KEY no arquivo .env.local</p>
                )}
                {diagnosticResults.envKey?.exists && !diagnosticResults.envKey?.startsWithAI && (
                  <p>• A chave deve começar com "AIza" - verifica se está correta</p>
                )}
                {diagnosticResults.apiKeyManager?.totalKeys === 0 && (
                  <p>• Nenhuma chave carregada - verifica o .env.local</p>
                )}
                {diagnosticResults.connectionTest?.error?.includes('401') && (
                  <p>• Chave inválida - gera uma nova em https://aistudio.google.com/app/apikey</p>
                )}
                {diagnosticResults.connectionTest?.error?.includes('quota') && (
                  <p>• Quota excedida - adiciona mais chaves ou aguarda renovação</p>
                )}
                <p>• Acede ao painel administrativo para gerir chaves</p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex space-x-4">
              <button
                onClick={runDiagnostic}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                🔄 Executar Novamente
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-400">Erro ao executar diagnóstico</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDiagnostic;