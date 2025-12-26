import React, { useState, useEffect } from 'react';
import { securityService } from '../services/securityService';

const SecurityWarning: React.FC = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const checkBlockStatus = () => {
      const blocked = securityService.isBlocked();
      setIsBlocked(blocked);
      
      if (blocked) {
        setTimeRemaining(securityService.formatBlockTime());
      }
    };

    checkBlockStatus();
    
    // Verificar a cada minuto
    const interval = setInterval(checkBlockStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-red-900/90 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-red-500/50 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-red-300 mb-4">Acesso Bloqueado</h2>
        
        <p className="text-red-200 mb-6">
          O acesso administrativo foi temporariamente bloqueado devido a múltiplas tentativas de acesso inválido.
        </p>
        
        <div className="bg-red-800/50 rounded-xl p-4 mb-6">
          <p className="text-red-300 font-medium">Tempo restante:</p>
          <p className="text-2xl font-bold text-red-100">{timeRemaining}</p>
        </div>
        
        <div className="text-sm text-red-300 space-y-2">
          <p>• O acesso será desbloqueado automaticamente</p>
          <p>• Não tentes aceder durante o bloqueio</p>
          <p>• Contacta o administrador se necessário</p>
        </div>
        
        <button
          onClick={() => window.location.href = '/'}
          className="mt-6 w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default SecurityWarning;