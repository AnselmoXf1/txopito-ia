
import React from 'react';
import { Settings } from '../types';

interface SettingsModalProps {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
  onClose: () => void;
  onLogout: () => void;
  onAdvancedSettings?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  settings, 
  onUpdate, 
  onClose, 
  onLogout, 
  onAdvancedSettings 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">Definições</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <section className="space-y-3">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Idioma de Resposta</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onUpdate({...settings, language: 'Portuguese'})}
                className={`py-3 px-4 rounded-xl border-2 transition-all ${settings.language === 'Portuguese' ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}
              >
                Português
              </button>
              <button 
                onClick={() => onUpdate({...settings, language: 'Simple Portuguese'})}
                className={`py-3 px-4 rounded-xl border-2 transition-all ${settings.language === 'Simple Portuguese' ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}
              >
                Simplificado
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tema Visual</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onUpdate({...settings, theme: 'light'})}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 transition-all ${settings.theme === 'light' ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}
              >
                <span>☀️</span> <span>Claro</span>
              </button>
              <button 
                onClick={() => onUpdate({...settings, theme: 'dark'})}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 transition-all ${settings.theme === 'dark' ? 'border-red-600 bg-red-900/40 text-red-400' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}
              >
                <span>🌙</span> <span>Escuro</span>
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Comprimento das Respostas</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onUpdate({...settings, responseLength: 'short'})}
                className={`py-3 px-4 rounded-xl border-2 transition-all ${settings.responseLength === 'short' ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}
              >
                Curtas
              </button>
              <button 
                onClick={() => onUpdate({...settings, responseLength: 'detailed'})}
                className={`py-3 px-4 rounded-xl border-2 transition-all ${settings.responseLength === 'detailed' ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}
              >
                Detalhadas
              </button>
            </div>
          </section>

          {onAdvancedSettings && (
            <button 
              onClick={onAdvancedSettings}
              className="w-full py-3 text-purple-600 font-bold border-2 border-purple-100 dark:border-purple-900/30 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
              </svg>
              <span>Configurações Avançadas</span>
            </button>
          )}

          <button 
            onClick={onLogout}
            className="w-full py-3 text-red-600 font-bold border-2 border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            Sair da Conta
          </button>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
