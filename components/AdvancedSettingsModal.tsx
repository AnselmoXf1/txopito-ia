import React, { useState } from 'react';
import { Settings } from '../types';
import SettingsPresetsComponent from './SettingsPresets';
import SettingsPreview from './SettingsPreview';
import { SettingsPreset } from '../services/settingsPresets';

interface AdvancedSettingsModalProps {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
  onClose: () => void;
  onLogout: () => void;
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({ 
  settings, 
  onUpdate, 
  onClose, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'appearance' | 'behavior' | 'interface' | 'features' | 'privacy' | 'advanced'>('presets');
  const [showPresets, setShowPresets] = useState(false);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  const tabs = [
    { id: 'presets', label: 'Presets', icon: '�' },
    { id: 'appearance', label: 'Aparência', icon: '🎨' },
    { id: 'behavior', label: 'IA', icon: '🤖' },
    { id: 'interface', label: 'Interface', icon: '📱' },
    { id: 'features', label: 'Recursos', icon: '⚡' },
    { id: 'privacy', label: 'Privacidade', icon: '🔒' },
    { id: 'advanced', label: 'Avançado', icon: '⚙️' }
  ] as const;

  const colorSchemes = [
    { id: 'default', name: 'Padrão', colors: ['bg-blue-500', 'bg-green-500', 'bg-purple-500'] },
    { id: 'mozambique', name: 'Moçambique', colors: ['bg-green-600', 'bg-yellow-500', 'bg-red-600'] },
    { id: 'ocean', name: 'Oceano', colors: ['bg-blue-600', 'bg-cyan-500', 'bg-teal-500'] },
    { id: 'forest', name: 'Floresta', colors: ['bg-green-700', 'bg-emerald-500', 'bg-lime-500'] },
    { id: 'sunset', name: 'Pôr do Sol', colors: ['bg-orange-500', 'bg-pink-500', 'bg-purple-500'] }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Configurações Avançadas</h2>
            <p className="text-green-100 text-sm">Personaliza a tua experiência com o Txopito IA</p>
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

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar com Tabs */}
          <div className="w-48 sm:w-56 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700 overflow-y-auto">
            <div className="p-2 sm:p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center space-x-3 ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Preview das Configurações */}
            <div className="p-2 sm:p-4 border-t dark:border-gray-700">
              <SettingsPreview settings={settings} />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-6">

              {/* Presets */}
              {activeTab === 'presets' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🎯 Presets de Configurações</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Configurações pré-definidas para diferentes necessidades e tipos de utilizador.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setShowPresets(true)}
                      className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                    >
                      <div className="text-3xl mb-3">🎯</div>
                      <div className="font-bold text-lg mb-2">Explorar Presets</div>
                      <div className="text-purple-100 text-sm">
                        Configurações otimizadas para diferentes utilizadores
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        const defaultSettings: Settings = {
                          language: 'Portuguese',
                          theme: 'light',
                          fontSize: 'medium',
                          colorScheme: 'default',
                          responseLength: 'short',
                          aiPersonality: 'casual',
                          responseSpeed: 'balanced',
                          showTimestamps: true,
                          showWordCount: false,
                          enableAnimations: true,
                          compactMode: false,
                          autoSave: true,
                          soundEffects: false,
                          notifications: true,
                          offlineMode: true,
                          saveHistory: true,
                          shareUsageData: false,
                          developerMode: false,
                          experimentalFeatures: false
                        };
                        onUpdate(defaultSettings);
                      }}
                      className="p-6 bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                    >
                      <div className="text-3xl mb-3">🔄</div>
                      <div className="font-bold text-lg mb-2">Restaurar Padrão</div>
                      <div className="text-gray-100 text-sm">
                        Voltar às configurações originais
                      </div>
                    </button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-600 text-xl">💡</span>
                      <div>
                        <div className="font-medium text-blue-800 dark:text-blue-200">Dica</div>
                        <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                          Os presets são configurações otimizadas para diferentes cenários: iniciantes, 
                          estudantes, profissionais, acessibilidade e performance. Experimenta diferentes 
                          presets para encontrar o que melhor se adequa ao teu uso.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aparência */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🎨 Aparência</h3>
                  </div>

                  {/* Idioma */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Idioma de Resposta
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'Portuguese', label: 'Português Padrão', desc: 'Linguagem formal e completa' },
                        { value: 'Simple Portuguese', label: 'Português Simples', desc: 'Linguagem acessível e clara' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateSetting('language', option.value as any)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            settings.language === option.value
                              ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                          }`}
                        >
                          <div className="font-medium text-gray-800 dark:text-white">{option.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tema */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Tema Visual
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Claro', icon: '☀️', desc: 'Fundo branco' },
                        { value: 'dark', label: 'Escuro', icon: '🌙', desc: 'Fundo preto' },
                        { value: 'auto', label: 'Automático', icon: '🔄', desc: 'Segue o sistema' }
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => updateSetting('theme', theme.value as any)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            settings.theme === theme.value
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{theme.icon}</div>
                          <div className="font-medium text-gray-800 dark:text-white text-sm">{theme.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{theme.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tamanho da Fonte */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Tamanho da Fonte
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'small', label: 'Pequena', size: 'text-sm' },
                        { value: 'medium', label: 'Média', size: 'text-base' },
                        { value: 'large', label: 'Grande', size: 'text-lg' }
                      ].map((size) => (
                        <button
                          key={size.value}
                          onClick={() => updateSetting('fontSize', size.value as any)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            settings.fontSize === size.value
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <div className={`font-medium text-gray-800 dark:text-white ${size.size}`}>
                            {size.label}
                          </div>
                          <div className={`text-gray-500 dark:text-gray-400 mt-1 ${size.size}`}>
                            Exemplo de texto
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Esquema de Cores */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Esquema de Cores
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {colorSchemes.map((scheme) => (
                        <button
                          key={scheme.id}
                          onClick={() => updateSetting('colorScheme', scheme.id as any)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            settings.colorScheme === scheme.id
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex space-x-1 mb-2 justify-center">
                            {scheme.colors.map((color, i) => (
                              <div key={i} className={`w-4 h-4 rounded-full ${color}`} />
                            ))}
                          </div>
                          <div className="font-medium text-gray-800 dark:text-white text-sm">
                            {scheme.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Comportamento da IA */}
              {activeTab === 'behavior' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🤖 Comportamento da IA</h3>
                  </div>

                  {/* Comprimento das Respostas */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Comprimento das Respostas
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'short', label: 'Curtas', desc: 'Respostas diretas e concisas' },
                        { value: 'detailed', label: 'Detalhadas', desc: 'Explicações completas' },
                        { value: 'adaptive', label: 'Adaptativo', desc: 'Ajusta conforme o contexto' }
                      ].map((length) => (
                        <button
                          key={length.value}
                          onClick={() => updateSetting('responseLength', length.value as any)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            settings.responseLength === length.value
                              ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                          }`}
                        >
                          <div className="font-medium text-gray-800 dark:text-white">{length.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{length.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personalidade da IA */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Personalidade da IA
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'formal', label: 'Formal', icon: '🎩', desc: 'Linguagem profissional' },
                        { value: 'casual', label: 'Casual', icon: '😊', desc: 'Conversa descontraída' },
                        { value: 'technical', label: 'Técnica', icon: '🔧', desc: 'Foco em detalhes técnicos' },
                        { value: 'friendly', label: 'Amigável', icon: '🤗', desc: 'Tom caloroso e acolhedor' }
                      ].map((personality) => (
                        <button
                          key={personality.value}
                          onClick={() => updateSetting('aiPersonality', personality.value as any)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            settings.aiPersonality === personality.value
                              ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{personality.icon}</span>
                            <span className="font-medium text-gray-800 dark:text-white">{personality.label}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{personality.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Velocidade de Resposta */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Velocidade de Resposta
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'fast', label: 'Rápida', icon: '⚡', desc: 'Respostas imediatas' },
                        { value: 'balanced', label: 'Equilibrada', icon: '⚖️', desc: 'Velocidade vs qualidade' },
                        { value: 'thoughtful', label: 'Reflexiva', icon: '🤔', desc: 'Respostas mais elaboradas' }
                      ].map((speed) => (
                        <button
                          key={speed.value}
                          onClick={() => updateSetting('responseSpeed', speed.value as any)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            settings.responseSpeed === speed.value
                              ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{speed.icon}</div>
                          <div className="font-medium text-gray-800 dark:text-white text-sm">{speed.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{speed.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Interface */}
              {activeTab === 'interface' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📱 Interface</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'showTimestamps', label: 'Mostrar Horários', desc: 'Exibir hora das mensagens', icon: '🕐' },
                      { key: 'showWordCount', label: 'Contador de Palavras', desc: 'Mostrar número de palavras', icon: '📊' },
                      { key: 'enableAnimations', label: 'Animações', desc: 'Efeitos visuais e transições', icon: '✨' },
                      { key: 'compactMode', label: 'Modo Compacto', desc: 'Interface mais densa', icon: '📏' }
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{setting.icon}</span>
                            <div>
                              <div className="font-medium text-gray-800 dark:text-white">{setting.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{setting.desc}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => updateSetting(setting.key as keyof Settings, !settings[setting.key as keyof Settings])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings[setting.key as keyof Settings] ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings[setting.key as keyof Settings] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recursos */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">⚡ Recursos</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'autoSave', label: 'Salvamento Automático', desc: 'Salvar conversas automaticamente', icon: '💾' },
                      { key: 'soundEffects', label: 'Efeitos Sonoros', desc: 'Sons de notificação e feedback', icon: '🔊' },
                      { key: 'notifications', label: 'Notificações', desc: 'Alertas e lembretes', icon: '🔔' },
                      { key: 'offlineMode', label: 'Modo Offline', desc: 'Funcionar sem internet', icon: '📴' }
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{setting.icon}</span>
                            <div>
                              <div className="font-medium text-gray-800 dark:text-white">{setting.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{setting.desc}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => updateSetting(setting.key as keyof Settings, !settings[setting.key as keyof Settings])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings[setting.key as keyof Settings] ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings[setting.key as keyof Settings] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacidade */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🔒 Privacidade</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'saveHistory', label: 'Salvar Histórico', desc: 'Manter conversas no dispositivo', icon: '📚', warning: false },
                      { key: 'shareUsageData', label: 'Partilhar Dados de Uso', desc: 'Ajudar a melhorar o serviço', icon: '📊', warning: true }
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          setting.warning 
                            ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{setting.icon}</span>
                            <div>
                              <div className="font-medium text-gray-800 dark:text-white">{setting.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{setting.desc}</div>
                              {setting.warning && (
                                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  ⚠️ Dados anónimos apenas para melhorias
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => updateSetting(setting.key as keyof Settings, !settings[setting.key as keyof Settings])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings[setting.key as keyof Settings] ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings[setting.key as keyof Settings] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-600 text-xl">ℹ️</span>
                      <div>
                        <div className="font-medium text-blue-800 dark:text-blue-200">Sobre a Privacidade</div>
                        <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                          O Txopito IA respeita a tua privacidade. As conversas são guardadas localmente no teu dispositivo 
                          e apenas sincronizadas se escolheres fazer login.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Avançado */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">⚙️ Configurações Avançadas</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'developerMode', label: 'Modo Desenvolvedor', desc: 'Mostrar informações técnicas', icon: '👨‍💻', warning: true },
                      { key: 'experimentalFeatures', label: 'Recursos Experimentais', desc: 'Testar funcionalidades beta', icon: '🧪', warning: true }
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="p-4 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{setting.icon}</span>
                            <div>
                              <div className="font-medium text-gray-800 dark:text-white">{setting.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{setting.desc}</div>
                              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                ⚠️ Apenas para utilizadores avançados
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => updateSetting(setting.key as keyof Settings, !settings[setting.key as keyof Settings])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings[setting.key as keyof Settings] ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings[setting.key as keyof Settings] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-start space-x-3">
                      <span className="text-red-600 text-xl">⚠️</span>
                      <div>
                        <div className="font-medium text-red-800 dark:text-red-200">Zona de Perigo</div>
                        <div className="text-sm text-red-600 dark:text-red-300 mt-1 mb-3">
                          Estas ações podem afetar o funcionamento da aplicação.
                        </div>
                        <button 
                          onClick={onLogout}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                          🚪 Sair da Conta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              ✅ Guardar Configurações
            </button>
            <button 
              onClick={() => {
                // Reset para configurações padrão
                const defaultSettings: Settings = {
                  language: 'Portuguese',
                  theme: 'light',
                  fontSize: 'medium',
                  colorScheme: 'default',
                  responseLength: 'short',
                  aiPersonality: 'casual',
                  responseSpeed: 'balanced',
                  showTimestamps: true,
                  showWordCount: false,
                  enableAnimations: true,
                  compactMode: false,
                  autoSave: true,
                  soundEffects: false,
                  notifications: true,
                  offlineMode: true,
                  saveHistory: true,
                  shareUsageData: false,
                  developerMode: false,
                  experimentalFeatures: false
                };
                onUpdate(defaultSettings);
              }}
              className="py-3 px-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              🔄 Restaurar Padrão
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Presets */}
      {showPresets && (
        <SettingsPresetsComponent
          currentSettings={settings}
          onApplyPreset={(preset: SettingsPreset) => {
            onUpdate(preset.settings);
            setShowPresets(false);
          }}
          onClose={() => setShowPresets(false)}
        />
      )}
    </div>
  );
};

export default AdvancedSettingsModal;