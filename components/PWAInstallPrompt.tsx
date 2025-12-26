import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      return isStandalone || isInWebAppiOS || isInWebAppChrome;
    };

    if (checkIfInstalled()) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt após um delay para não ser intrusivo
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('✅ PWA instalada com sucesso');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ Utilizador aceitou instalar PWA');
      } else {
        console.log('❌ Utilizador rejeitou instalar PWA');
      }
    } catch (error) {
      console.error('❌ Erro ao instalar PWA:', error);
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
    
    // Não mostrar novamente por 24 horas
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Não mostrar se foi dispensado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      if (now - dismissedTime < dayInMs) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt || !deferredPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="pwa-install-prompt animate-in">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0 p-2 shadow-lg">
          <img 
            src="/logo.png" 
            alt="Txopito IA" 
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = '/logo-placeholder.svg';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
            Instalar Txopito IA
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
            Instala a app no teu dispositivo para acesso rápido e funcionalidades offline!
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={handleInstall}
              className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              📱 Instalar App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 text-gray-600 dark:text-gray-300 text-sm font-medium hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;