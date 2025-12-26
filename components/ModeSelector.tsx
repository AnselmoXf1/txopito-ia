
import React from 'react';
import { MODES } from '../constants';
import { AppMode } from '../types';

interface ModeSelectorProps {
  onSelect: (mode: AppMode) => void;
  selectedMode?: AppMode;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect, selectedMode }) => {
  return (
    <div className="flex-1 p-3 sm:p-6 overflow-y-auto animate-in slide-in-from-bottom duration-500">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-white">Escolhe o teu Modo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left transition-all hover:shadow-md active:scale-95 ${
              selectedMode === mode.id
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-transparent bg-white dark:bg-gray-800 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="text-2xl sm:text-4xl p-2 bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl flex-shrink-0">{mode.icon}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base sm:text-lg dark:text-white truncate">{mode.id}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{mode.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;
