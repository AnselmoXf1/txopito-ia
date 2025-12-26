
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
  onBack: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const user = authService.login(email, password);
        onAuthSuccess(user);
      } else {
        const user = authService.register(name, email, password);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="self-start mb-8 p-2 hover:bg-gray-100 rounded-full">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-black text-green-700 dark:text-green-500">
            {isLogin ? 'Bem-vindo de volta!' : 'Cria a tua conta'}
          </h2>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Entra para continuar a tua jornada' : 'Junta-te à primeira IA de Moçambique'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600">Nome Completo</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-green-600 outline-none transition-all"
                placeholder="Ex: Albino Mateus"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-green-600 outline-none transition-all"
              placeholder="exemplo@email.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Palavra-passe</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-green-600 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            {isLogin ? 'Entrar' : 'Registar Conta'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-700 dark:text-green-500 font-bold hover:underline"
          >
            {isLogin ? 'Não tens conta? Regista-te aqui' : 'Já tens conta? Faz login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
