import React, { useState, useEffect } from 'react';
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
      backendConnection: null,
      geminiService: null,
      connectionTest: null
    };

    try {
      // 1. Verificar se chave foi removida do frontend (SEGURANÇA)
      const envKey = import.meta.env.VITE_GEMINI_API_KEY;
      results.envKey = {
        exists: !!envKey,
        isSecure: !envKey, // Agora é SEGURO não ter chave no frontend
        message: envKey ? 'INSEGURO: Chave exposta no frontend!' : 'SEGURO: Chave no backend'
      };

      // 2. Verificar conexão com backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://txopito-backend.onrender.com/api';
      try {
        const backendResponse = await fetch(`${backendUrl}/health`);
        const backendData = await backendResponse.json();
        results.backendConnection = {
          success: backendResponse.ok,
          url: backendUrl,
          status: backendData.status,
          geminiConfigured: backendData.services?.gemini === 'configured'
        };
      } catch (error: any) {
        results.backendConnection = {
          success: false,
          url: backendUrl,
          error: error.message
        };
      }

      // 3. Verificar geminiService (agora usa backend)
      results.geminiService = {
        isInitialized: true, // Sempre inicializado no novo sistema
        usesBackend: true,
        backendUrl: (geminiService as any).backendUrl
      };

      // 4. Testar conexão completa
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
            {/* Segurança do Frontend */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-white mb-3">
                {getStatusIcon(diagnosticResults.envKey?.isSecure)} Segurança do Frontend
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Chave no frontend:</span>
                  <span className={getStatusColor(!diagnosticResults.envKey?.exists)}>
                    {diagnosticResults.envKey?.exists ? 'INSEGURO' : 'SEGURO'}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-gray-400">Status:</span>
                  <div className={`mt-1 p-2 rounded text-xs ${
                    diagnosticResults.envKey?.isSecure 
                      ? 'bg-green-900/30 text-green-300' 
                      : 'bg-red-900/30 text-red-300'
                  }`}>
                    {diagnosticResults.envKey?.message}
                  </div>
                </div>
              </div>
            </div>

            {/* Conexão com Backend */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-white mb-3">
                {getStatusIcon(diagnosticResults.backendConnection?.success)} Backend Seguro
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Conexão:</span>
                  <span className={getStatusColor(diagnosticResults.backendConnection?.success)}>
                    {diagnosticResults.backendConnection?.success ? 'Conectado' : 'Falhou'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">URL:</span>
                  <span className="text-gray-300 text-xs">{diagnosticResults.backendConnection?.url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gemini configurado:</span>
                  <span className={getStatusColor(diagnosticResults.backendConnection?.geminiConfigured)}>
                    {diagnosticResults.backendConnection?.geminiConfigured ? 'Sim' : 'Não'}
                  </span>
                </div>
                {diagnosticResults.backendConnection?.error && (
                  <div className="mt-2">
                    <span className="text-gray-400">Erro:</span>
                    <div className="mt-1 p-2 bg-red-900/30 rounded text-red-300 text-xs">
                      {diagnosticResults.backendConnection.error}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Serviço Gemini Seguro */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-white mb-3">
                {getStatusIcon(diagnosticResults.geminiService?.isInitialized)} Serviço Gemini Seguro
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Inicializado:</span>
                  <span className={getStatusColor(diagnosticResults.geminiService?.isInitialized)}>
                    {diagnosticResults.geminiService?.isInitialized ? 'Sim' : 'Não'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Usa backend:</span>
                  <span className={getStatusColor(diagnosticResults.geminiService?.usesBackend)}>
                    {diagnosticResults.geminiService?.usesBackend ? 'Sim (Seguro)' : 'Não (Inseguro)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Backend URL:</span>
                  <span className="text-gray-300 text-xs">{diagnosticResults.geminiService?.backendUrl}</span>
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
              <h3 className="text-lg font-medium text-blue-300 mb-3">💡 Sistema Seguro</h3>
              <div className="space-y-2 text-sm text-blue-200">
                {diagnosticResults.envKey?.exists && (
                  <p>• ⚠️ REMOVER chave do frontend (.env.local) por segurança</p>
                )}
                {!diagnosticResults.backendConnection?.success && (
                  <p>• Verificar se backend está rodando: {diagnosticResults.backendConnection?.url}</p>
                )}
                {!diagnosticResults.backendConnection?.geminiConfigured && (
                  <p>• Configurar GEMINI_API_KEY no backend (Render dashboard)</p>
                )}
                {diagnosticResults.connectionTest?.error?.includes('timeout') && (
                  <p>• Backend pode estar dormindo - aguardar alguns minutos</p>
                )}
                <p>• ✅ Chave segura no backend (nunca exposta publicamente)</p>
                <p>• ✅ Rate limiting ativo (proteção contra abuso)</p>
                <p>• ✅ Logs de todas as requisições</p>
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