import React from 'react';
import { Settings } from '../types';

interface SettingsPreviewProps {
  settings: Settings;
  className?: string;
}

const SettingsPreview: React.FC<SettingsPreviewProps> = ({ settings, className = '' }) => {
  const getThemePreview = () => {
    switch (settings.theme) {
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'light':
        return 'bg-white text-gray-900';
      case 'auto':
        return 'bg-gradient-to-r from-white to-gray-900 from-50% to-50% text-gray-900';
      default:
        return 'bg-white text-gray-900';
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getColorSchemeColors = () => {
    switch (settings.colorScheme) {
      case 'mozambique':
        return ['bg-green-600', 'bg-yellow-500', 'bg-red-600'];
      case 'ocean':
        return ['bg-blue-600', 'bg-cyan-500', 'bg-teal-500'];
      case 'forest':
        return ['bg-green-700', 'bg-emerald-500', 'bg-lime-500'];
      case 'sunset':
        return ['bg-orange-500', 'bg-pink-500', 'bg-purple-500'];
      default:
        return ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
    }
  };

  const getPersonalityIcon = () => {
    switch (settings.aiPersonality) {
      case 'formal':
        return '🎩';
      case 'casual':
        return '😊';
      case 'technical':
        return '🔧';
      case 'friendly':
        return '🤗';
      default:
        return '😊';
    }
  };

  const colors = getColorSchemeColors();

  return (
    <div className={`p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
        Preview das Configurações
      </div>
      
      {/* Preview do Tema e Fonte */}
      <div className={`p-3 rounded-lg mb-3 ${getThemePreview()} border`}>
        <div className={`font-medium ${getFontSizeClass()}`}>
          Exemplo de Texto
        </div>
        <div className={`${getFontSizeClass()} opacity-75 mt-1`}>
          {settings.language === 'Simple Portuguese' ? 'Texto simples' : 'Texto em português padrão'}
        </div>
      </div>

      {/* Preview do Esquema de Cores */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Esquema de Cores</div>
        <div className="flex space-x-2">
          {colors.map((color, index) => (
            <div key={index} className={`w-6 h-6 rounded-full ${color}`} />
          ))}
        </div>
      </div>

      {/* Preview da Personalidade da IA */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Personalidade da IA</div>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getPersonalityIcon()}</span>
          <span className="text-sm capitalize">{settings.aiPersonality}</span>
        </div>
      </div>

      {/* Preview das Configurações de Interface */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">Interface</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`flex items-center space-x-1 ${settings.showTimestamps ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{settings.showTimestamps ? '✓' : '✗'}</span>
            <span>Horários</span>
          </div>
          <div className={`flex items-center space-x-1 ${settings.showWordCount ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{settings.showWordCount ? '✓' : '✗'}</span>
            <span>Contador</span>
          </div>
          <div className={`flex items-center space-x-1 ${settings.enableAnimations ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{settings.enableAnimations ? '✓' : '✗'}</span>
            <span>Animações</span>
          </div>
          <div className={`flex items-center space-x-1 ${settings.compactMode ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{settings.compactMode ? '✓' : '✗'}</span>
            <span>Compacto</span>
          </div>
        </div>
      </div>

      {/* Preview das Configurações de Recursos */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recursos Ativos</div>
        <div className="flex flex-wrap gap-1">
          {settings.autoSave && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs">
              Auto-save
            </span>
          )}
          {settings.soundEffects && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">
              Sons
            </span>
          )}
          {settings.notifications && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded text-xs">
              Notificações
            </span>
          )}
          {settings.offlineMode && (
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded text-xs">
              Offline
            </span>
          )}
          {settings.developerMode && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded text-xs">
              Dev
            </span>
          )}
          {settings.experimentalFeatures && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded text-xs">
              Beta
            </span>
          )}
        </div>
      </div>

      {/* Indicador de Performance */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Impacto na Performance</div>
        <div className="flex items-center space-x-2">
          {(() => {
            let score = 100;
            if (settings.enableAnimations) score -= 10;
            if (settings.soundEffects) score -= 5;
            if (settings.showWordCount) score -= 5;
            if (settings.fontSize === 'large') score -= 5;
            if (settings.experimentalFeatures) score -= 10;
            if (settings.developerMode) score -= 10;
            
            const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${color} transition-all duration-300`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{score}%</span>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPreview;