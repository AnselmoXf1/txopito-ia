import React, { useState, useEffect } from 'react';
import { backendService } from '../services/backendService';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  type: 'email_verification' | 'password_reset' | 'login_verification';
  onSuccess: (data?: any) => void;
  title?: string;
  description?: string;
}

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  email,
  type,
  onSuccess,
  title,
  description
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setTimeRemaining(600); // 10 minutos
      setCanResend(false);
      
      // Timer para countdown
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Código deve ter 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (type === 'email_verification') {
        const response = await backendService.verifyEmail(email, code);
        if (response.success) {
          onSuccess(response.data);
          onClose();
        } else {
          setError(response.error || 'Erro ao verificar código');
        }
      } else if (type === 'login_verification') {
        const response = await backendService.verify2FA(email, code);
        if (response.success) {
          onSuccess(response.data);
          onClose();
        } else {
          setError(response.error || 'Erro ao verificar código');
        }
      } else if (type === 'password_reset') {
        const response = await backendService.verifyOTP(email, code, type);
        if (response.success) {
          onSuccess(response.data);
          onClose();
        } else {
          setError(response.error || 'Erro ao verificar código');
        }
      }
    } catch (error) {
      setError('Erro de conexão. Tenta novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await backendService.sendOTP(email, type);

      if (response.success) {
        setTimeRemaining(600);
        setCanResend(false);
        setCode('');
        
        // Reiniciar timer
        const timer = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.error || 'Erro ao reenviar código');
      }
    } catch (error) {
      setError('Erro de conexão. Tenta novamente.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Apenas números e máximo 6 dígitos
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    setError('');
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'email_verification':
        return 'Verificar Email';
      case 'password_reset':
        return 'Recuperar Palavra-passe';
      case 'login_verification':
        return 'Verificar Login';
      default:
        return 'Verificação';
    }
  };

  const getDescription = () => {
    if (description) return description;
    
    switch (type) {
      case 'email_verification':
        return `✅ Conta criada com sucesso! Enviámos um código de 6 dígitos para ${email}. Introduz o código para ativar a tua conta e fazer login automático.`;
      case 'password_reset':
        return `🔑 Enviámos um código de recuperação para ${email}. Introduz o código para redefinir a tua palavra-passe.`;
      case 'login_verification':
        return `🔐 Por segurança, enviámos um código de verificação para ${email}. Introduz o código para continuar o login.`;
      default:
        return `📧 Enviámos um código de verificação para ${email}.`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'email_verification':
        return '📧';
      case 'password_reset':
        return '🔑';
      case 'login_verification':
        return '🔐';
      default:
        return '🔢';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {getTitle()}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Código de verificação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {getDescription()}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código de 6 dígitos
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Timer */}
          <div className="text-center">
            {timeRemaining > 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Código expira em: <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-500 dark:text-red-400">
                Código expirado
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Verificar'
              )}
            </button>
          </div>

          {/* Resend */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || isResending}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isResending ? (
                'Reenviando...'
              ) : canResend ? (
                'Reenviar código'
              ) : (
                `Reenviar em ${formatTime(timeRemaining)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPModal;