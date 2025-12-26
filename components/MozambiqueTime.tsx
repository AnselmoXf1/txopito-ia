import React, { useState, useEffect } from 'react';
import { TimeService } from '../services/timeService';

interface MozambiqueTimeProps {
  className?: string;
  showSeconds?: boolean;
  compact?: boolean;
}

const MozambiqueTime: React.FC<MozambiqueTimeProps> = ({ 
  className = '', 
  showSeconds = false,
  compact = false 
}) => {
  const [timeInfo, setTimeInfo] = useState<{
    date: string;
    time: string;
    dayOfWeek: string;
    timezone: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateTime = async () => {
    try {
      setError(null);
      const info = await TimeService.getDisplayTime();
      setTimeInfo(info);
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao obter hora de Moçambique:', err);
      setError('Erro ao carregar hora');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Carregar hora inicial
    updateTime();

    // Atualizar a cada minuto
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Carregando hora...</span>
      </div>
    );
  }

  if (error || !timeInfo) {
    return (
      <div className={`text-sm text-red-500 ${className}`}>
        {error || 'Erro ao carregar hora'}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        <span className="text-green-600 font-medium">🇲🇿</span>
        <span className="text-gray-700 dark:text-gray-300">
          {timeInfo.time}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">🇲🇿</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              {timeInfo.time}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              CAT
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {timeInfo.dayOfWeek}, {timeInfo.date}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MozambiqueTime;