import React, { useState, useEffect } from 'react';
import { secretUrlService } from '../services/secretUrlService';
import { securityService } from '../services/securityService';

interface AdminLoginProps {
  onAdminLogin: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se URL é válida ao carregar componente
  useEffect(() => {
    console.log('🔍 AdminLogin: Verificando acesso...');
    
    // Verificar se acesso está bloqueado
    if (securityService.isBlocked()) {
      const timeRemaining = securityService.formatBlockTime();
      console.log('🔒 AdminLogin: Acesso bloqueado');
      setError(`Acesso bloqueado por segurança. Tenta novamente em ${timeRemaining}.`);
      setTimeout(() => {
        onBack();
      }, 5000);
      return;
    }

    const currentPath = window.location.pathname;
    const secretUrl = secretUrlService.getCurrentSecretUrl();
    
    console.log('🔍 AdminLogin: currentPath =', currentPath);
    console.log('🔍 AdminLogin: secretUrl =', secretUrl);
    
    // Verificação mais permissiva - apenas verificar se é uma URL de admin válida
    if (currentPath.startsWith('/admin-') && secretUrl) {
      console.log('✅ AdminLogin: Acesso permitido - URL de admin válida encontrada');
      return; // Permitir acesso
    }
    
    // Se não há URL secreta ou não é URL de admin, bloquear
    if (!secretUrl || !currentPath.startsWith('/admin-')) {
      console.warn('⚠️ AdminLogin: Acesso negado - URL inválida');
      setError('Acesso inválido. Use os cliques secretos no logo para acessar.');
      setTimeout(() => {
        onBack();
      }, 3000);
      return;
    }
  }, [onBack]);

  // Credenciais admin secretas (em produção, isso deveria vir de um backend seguro)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'TxopitoAdmin2024!',
    secretKey: 'anselmo_bistiro_admin'
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Salvar sessão admin no localStorage
      localStorage.setItem('txopito_admin_session', JSON.stringify({
        isAdmin: true,
        loginTime: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      }));
      
      onAdminLogin();
    } else if (username === ADMIN_CREDENTIALS.secretKey) {
      // Acesso direto com chave secreta
      localStorage.setItem('txopito_admin_session', JSON.stringify({
        isAdmin: true,
        loginTime: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      }));
      
      onAdminLogin();
    } else {
      setError('Credenciais inválidas. Acesso negado.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Acesso Administrativo</h1>
          <p className="text-gray-400">Dashboard Txopito IA</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Utilizador / Chave Secreta
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="admin ou chave secreta"
                required
              />
            </div>

            {username !== ADMIN_CREDENTIALS.secretKey && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Palavra-passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="••••••••"
                  required={username !== ADMIN_CREDENTIALS.secretKey}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          {/* Dicas de Acesso */}
          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
            <h4 className="text-blue-300 font-medium mb-2">🔐 Acesso Seguro</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• <strong>Utilizador:</strong> admin</li>
              <li>• <strong>Palavra-passe:</strong> TxopitoAdmin2024!</li>
              <li>• <strong>Chave Secreta:</strong> anselmo_bistiro_admin</li>
              <li>• <strong>Acesso:</strong> Apenas via cliques secretos no logo</li>
              <li>• <strong>Validade:</strong> URL expira em 10 minutos</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Acesso restrito apenas para administradores autorizados
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;