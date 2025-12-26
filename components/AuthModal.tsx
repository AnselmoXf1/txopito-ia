import React, { useState } from 'react';
import { backendService } from '../services/backendService';
import OTPModal from './OTPModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserLogin: (user: any) => void;
}

interface AuthState {
  step: 'auth' | 'email_verification' | 'two_factor' | 'forgot_password';
  email: string;
  userId?: string;
  resetToken?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onUserLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    step: 'auth',
    email: ''
  });
  const [showOTP, setShowOTP] = useState(false);
  const [otpType, setOtpType] = useState<'email_verification' | 'password_reset' | 'login_verification'>('email_verification');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const response = await backendService.login(formData.email, formData.password);
        
        if (response.success && response.data?.token) {
          // Login bem-sucedido
          onUserLogin(response.data.user);
          onClose();
        } else if (response.data?.requiresEmailVerification) {
          // Precisa verificar email
          setAuthState({
            step: 'email_verification',
            email: response.data.email || formData.email,
            userId: response.data.userId
          });
          setOtpType('email_verification');
          setShowOTP(true);
        } else if (response.data?.requiresTwoFactor) {
          // Precisa verificar 2FA
          setAuthState({
            step: 'two_factor',
            email: response.data.email || formData.email,
            userId: response.data.userId
          });
          setOtpType('login_verification');
          setShowOTP(true);
        } else {
          setError(response.error || 'Erro no login');
        }
      } else {
        // Registo
        if (!formData.name || !formData.email || !formData.password) {
          setError('Todos os campos são obrigatórios');
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError('As palavras-passe não coincidem');
          return;
        }
        
        if (formData.password.length < 6) {
          setError('A palavra-passe deve ter pelo menos 6 caracteres');
          return;
        }
        
        const response = await backendService.register(formData.name, formData.email, formData.password);
        
        if (response.success && response.data?.token) {
          // Registo bem-sucedido com login automático
          onUserLogin(response.data.user);
          onClose();
        } else if (response.data?.requiresEmailVerification) {
          // Precisa verificar email
          console.log('📧 Registo bem-sucedido! Código OTP enviado para:', response.data.email);
          setAuthState({
            step: 'email_verification',
            email: response.data.email || formData.email,
            userId: response.data.userId
          });
          setOtpType('email_verification');
          setShowOTP(true);
          // Limpar formulário para evitar confusão
          setFormData({ name: '', email: formData.email, password: '', confirmPassword: '' });
        } else {
          setError(response.error || 'Erro no registo');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Introduz o teu email primeiro');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await backendService.forgotPassword(formData.email);
      
      if (response.success) {
        setAuthState({
          step: 'forgot_password',
          email: formData.email
        });
        setOtpType('password_reset');
        setShowOTP(true);
      } else {
        setError(response.error || 'Erro ao enviar email de recuperação');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSuccess = async (data?: any) => {
    setShowOTP(false);
    
    if (authState.step === 'email_verification') {
      // Email verificado, fazer login automático
      if (data?.token && data?.user) {
        console.log('✅ Email verificado com sucesso, fazendo login automático...');
        onUserLogin(data.user);
        onClose();
      } else {
        setError('Erro na verificação. Tenta fazer login manualmente.');
      }
    } else if (authState.step === 'two_factor') {
      // 2FA verificado, fazer login
      if (data?.token && data?.user) {
        console.log('✅ 2FA verificado com sucesso, fazendo login...');
        onUserLogin(data.user);
        onClose();
      } else {
        setError('Erro na verificação 2FA. Tenta novamente.');
      }
    } else if (authState.step === 'forgot_password') {
      // Código de recuperação verificado
      if (data?.resetToken) {
        setAuthState(prev => ({ ...prev, resetToken: data.resetToken }));
        alert('✅ Código verificado! Podes agora redefinir a palavra-passe.');
        onClose();
      } else {
        setError('Erro na verificação do código de recuperação.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setAuthState({ step: 'auth', email: '' });
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 p-2">
              <img 
                src="/logo.png" 
                alt="Txopito IA" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/logo-placeholder.svg';
                }}
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              {isLogin ? 'Bem-vindo de volta!' : 'Junta-te à Txopito IA'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              {isLogin ? 'Faz login para continuar' : 'Cria a tua conta gratuita'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  placeholder="Ex: João Silva"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                placeholder="teu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Palavra-passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Palavra-passe
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  placeholder="••••••••"
                  required={!isLogin}
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm disabled:opacity-50"
              >
                Esqueceste a palavra-passe?
              </button>
            </div>
          )}

          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm sm:text-base"
            >
              {isLogin ? 'Não tens conta? Regista-te' : 'Já tens conta? Faz login'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl sm:text-2xl"
          >
            ×
          </button>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        email={authState.email}
        type={otpType}
        onSuccess={handleOTPSuccess}
        title={
          authState.step === 'email_verification' ? 'Verificar Email' :
          authState.step === 'two_factor' ? 'Verificação de Segurança' :
          authState.step === 'forgot_password' ? 'Recuperar Palavra-passe' :
          'Verificação'
        }
        description={
          authState.step === 'email_verification' ? 
            `Enviámos um código de verificação para ${authState.email}. Introduz o código para ativar a tua conta.` :
          authState.step === 'two_factor' ? 
            `Por segurança, enviámos um código de verificação para ${authState.email}.` :
          authState.step === 'forgot_password' ? 
            `Enviámos um código de recuperação para ${authState.email}. Introduz o código para redefinir a tua palavra-passe.` :
            undefined
        }
      />
    </>
  );
};

export default AuthModal;