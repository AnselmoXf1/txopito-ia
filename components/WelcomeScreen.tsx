
import React, { useState } from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
  onLogin: () => void;
  onAdminAccess?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onLogin, onAdminAccess }) => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);

  const handleLogoClick = () => {
    const now = Date.now();
    
    console.log('🖱️ Logo clicado! Clique atual:', clickCount + 1);
    
    // Reset se passou mais de 2 segundos desde o último clique
    if (now - lastClickTime > 2000) {
      console.log('🔄 Reset contador de cliques (timeout)');
      setClickCount(1);
    } else {
      setClickCount(prev => {
        const newCount = prev + 1;
        console.log('📈 Incrementando contador:', newCount);
        return newCount;
      });
    }
    
    setLastClickTime(now);
    
    // Feedback visual sutil - flash rápido
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
    
    // Acesso admin secreto: 7 cliques consecutivos no logo
    if (clickCount + 1 === 7) {
      console.log('🎉 7 cliques atingidos! Ativando acesso admin...');
      if (onAdminAccess) {
        onAdminAccess();
      }
      setClickCount(0);
    } else {
      console.log(`🔢 Cliques restantes: ${7 - (clickCount + 1)}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <div 
        className={`w-48 h-48 sm:w-72 sm:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 bg-green-600 rounded-full flex items-center justify-center shadow-xl border-4 border-yellow-400 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 overflow-hidden ${
          isFlashing ? 'brightness-125 scale-105' : ''
        }`}
        onClick={handleLogoClick}
      >
        <img 
          src="/logo.png" 
          alt="Txopito IA" 
          className="w-[120%] h-[120%] object-cover rounded-full scale-125"
          onError={(e) => {
            // Fallback para SVG placeholder se logo.png não existir
            e.currentTarget.src = '/logo-placeholder.svg';
          }}
        />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-green-700 dark:text-green-500">Txopito IA</h1>
        <p className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-300">O teu assistente IA moçambicano</p>
      </div>

      <p className="max-w-md text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">
        Assistente IA moçambicano moderno e atualizado (2025). Especialista em história, educação, tecnologia e desenvolvimento atual de Moçambique.
      </p>

      <div className="flex flex-col w-full max-w-xs space-y-3 sm:space-y-4">
        <button
          onClick={onStart}
          className="w-full py-3 sm:py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-sm sm:text-base"
        >
          Começar Agora
        </button>
        
        <button
          onClick={onLogin}
          className="w-full py-2.5 sm:py-3 px-6 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-xl transition-all text-sm sm:text-base"
        >
          Já tenho conta
        </button>
      </div>
      
      <div className="flex space-x-2">
        <div className="w-6 sm:w-8 h-1 bg-green-600"></div>
        <div className="w-6 sm:w-8 h-1 bg-yellow-400"></div>
        <div className="w-6 sm:w-8 h-1 bg-red-600"></div>
      </div>

      {/* Debug info apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && clickCount > 0 && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
          <div>Cliques: {clickCount}/7</div>
          <div>Último: {new Date(lastClickTime).toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
