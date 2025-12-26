import React, { useState, useMemo } from 'react';
import { Settings } from '../types';
import { SettingsPresets, SettingsPreset } from '../services/settingsPresets';

interface SettingsPresetsProps {
  currentSettings: Settings;
  onApplyPreset: (preset: SettingsPreset) => void;
  onClose: () => void;
}

const SettingsPresetsComponent: React.FC<SettingsPresetsProps> = ({
  currentSettings,
  onApplyPreset,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'user' | 'accessibility' | 'performance' | 'theme'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplying, setIsApplying] = useState<string | null>(null);

  // Filtrar presets
  const filteredPresets = useMemo(() => {
    let presets = SettingsPresets.PRESETS;

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      presets = presets.filter(preset => preset.category === selectedCategory);
    }

    // Filtrar por pesquisa
    if (searchQuery.trim()) {
      presets = SettingsPresets.searchPresets(searchQuery);
    }

    return presets;
  }, [selectedCategory, searchQuery]);

  // Preset atual (se houver match)
  const currentPreset = useMemo(() => {
    return SettingsPresets.findMatchingPreset(currentSettings);
  }, [currentSettings]);

  // Preset sugerido
  const suggestedPreset = useMemo(() => {
    return SettingsPresets.suggestPresetForDevice();
  }, []);

  const handleApplyPreset = async (preset: SettingsPreset) => {
    setIsApplying(preset.id);
    
    try {
      // Aplicar preset gradualmente para efeito visual suave
      await SettingsPresets.applyPresetGradually(
        preset,
        (settings) => onApplyPreset({ ...preset, settings }),
        currentSettings,
        50
      );
    } finally {
      setIsApplying(null);
    }
  };

  const categories = [
    { id: 'all', name: 'Todos', icon: '🎯' },
    { id: 'user', name: 'Utilizador', icon: '👤' },
    { id: 'theme', name: 'Temas', icon: '🎨' },
    { id: 'accessibility', name: 'Acessibilidade', icon: '♿' },
    { id: 'performance', name: 'Performance', icon: '⚡' }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Presets de Configurações</h2>
              <p className="text-purple-100 text-sm">Configurações pré-definidas para diferentes necessidades</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Controles */}
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Pesquisa */}
          <div className="mb-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Procurar presets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Status Atual */}
        {currentPreset && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{currentPreset.icon}</span>
              <div>
                <div className="font-medium text-green-800 dark:text-green-200">
                  Preset Ativo: {currentPreset.name}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {currentPreset.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sugestão */}
        {!currentPreset && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💡</span>
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    Sugestão: {suggestedPreset.name}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Recomendado para o teu dispositivo
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleApplyPreset(suggestedPreset)}
                disabled={isApplying === suggestedPreset.id}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {isApplying === suggestedPreset.id ? 'Aplicando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de Presets */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresets.map((preset) => {
              const isActive = currentPreset?.id === preset.id;
              const isApplyingThis = isApplying === preset.id;
              
              return (
                <div
                  key={preset.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                    isActive
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 bg-white dark:bg-gray-800'
                  }`}
                  onClick={() => !isApplyingThis && handleApplyPreset(preset)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{preset.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {preset.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            preset.category === 'user' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            preset.category === 'theme' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                            preset.category === 'accessibility' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}>
                            {preset.category === 'user' ? 'Utilizador' :
                             preset.category === 'theme' ? 'Tema' :
                             preset.category === 'accessibility' ? 'Acessibilidade' :
                             'Performance'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <div className="text-green-600 dark:text-green-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {preset.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {preset.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    disabled={isActive || isApplyingThis}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                      isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 cursor-default'
                        : isApplyingThis
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 cursor-wait'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isActive ? '✓ Ativo' : isApplyingThis ? 'Aplicando...' : 'Aplicar Preset'}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredPresets.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                Nenhum preset encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tenta ajustar os filtros ou a pesquisa
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredPresets.length} preset{filteredPresets.length !== 1 ? 's' : ''} disponível{filteredPresets.length !== 1 ? 'is' : ''}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPresetsComponent;