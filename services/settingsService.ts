import { Settings } from '../types';

export class SettingsService {
  private static readonly STORAGE_KEY = 'txopito_settings';
  
  // Configurações padrão
  static getDefaultSettings(): Settings {
    return {
      // Aparência
      language: 'Portuguese',
      theme: 'light',
      fontSize: 'medium',
      colorScheme: 'default',
      
      // Comportamento da IA
      responseLength: 'short',
      aiPersonality: 'casual',
      responseSpeed: 'balanced',
      
      // Interface
      showTimestamps: true,
      showWordCount: false,
      enableAnimations: true,
      compactMode: false,
      
      // Funcionalidades
      autoSave: true,
      soundEffects: false,
      notifications: true,
      offlineMode: true,
      
      // Privacidade
      saveHistory: true,
      shareUsageData: false,
      
      // Avançado
      developerMode: false,
      experimentalFeatures: false
    };
  }

  // Carregar configurações do localStorage
  static loadSettings(): Settings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Mesclar com configurações padrão para garantir que todas as propriedades existam
        return { ...this.getDefaultSettings(), ...parsed };
      }
    } catch (error) {
      console.warn('Erro ao carregar configurações:', error);
    }
    
    return this.getDefaultSettings();
  }

  // Salvar configurações no localStorage
  static saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      console.log('✅ Configurações salvas');
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
    }
  }

  // Aplicar configurações de tema
  static applyThemeSettings(settings: Settings): void {
    const { theme, fontSize, colorScheme } = settings;
    
    // Aplicar tema
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'auto') {
      // Seguir preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Aplicar tamanho da fonte
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
    document.documentElement.classList.add(`font-${fontSize}`);

    // Aplicar esquema de cores
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
  }

  // Aplicar configurações de interface
  static applyInterfaceSettings(settings: Settings): void {
    const { enableAnimations, compactMode } = settings;
    
    // Aplicar animações
    if (enableAnimations) {
      document.documentElement.classList.remove('no-animations');
    } else {
      document.documentElement.classList.add('no-animations');
    }

    // Aplicar modo compacto
    if (compactMode) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
  }

  // Aplicar todas as configurações
  static applyAllSettings(settings: Settings): void {
    this.applyThemeSettings(settings);
    this.applyInterfaceSettings(settings);
    
    // Salvar configurações
    this.saveSettings(settings);
  }

  // Verificar se recurso experimental está habilitado
  static isExperimentalFeatureEnabled(settings: Settings, feature: string): boolean {
    return settings.experimentalFeatures && settings.developerMode;
  }

  // Obter configurações de IA para o geminiService
  static getAISettings(settings: Settings) {
    return {
      language: settings.language,
      responseLength: settings.responseLength,
      personality: settings.aiPersonality,
      speed: settings.responseSpeed
    };
  }

  // Migrar configurações antigas (compatibilidade)
  static migrateOldSettings(): void {
    try {
      // Verificar se há configurações antigas
      const oldSettings = localStorage.getItem('txopito_old_settings');
      if (oldSettings) {
        const parsed = JSON.parse(oldSettings);
        const newSettings = {
          ...this.getDefaultSettings(),
          language: parsed.language || 'Portuguese',
          theme: parsed.theme || 'light',
          responseLength: parsed.responseLength || 'short'
        };
        
        this.saveSettings(newSettings);
        localStorage.removeItem('txopito_old_settings');
        console.log('✅ Configurações migradas com sucesso');
      }
    } catch (error) {
      console.warn('⚠️ Erro na migração de configurações:', error);
    }
  }

  // Exportar configurações
  static exportSettings(settings: Settings): string {
    return JSON.stringify(settings, null, 2);
  }

  // Importar configurações
  static importSettings(settingsJson: string): Settings {
    try {
      const imported = JSON.parse(settingsJson);
      const merged = { ...this.getDefaultSettings(), ...imported };
      this.saveSettings(merged);
      return merged;
    } catch (error) {
      console.error('❌ Erro ao importar configurações:', error);
      throw new Error('Formato de configurações inválido');
    }
  }

  // Resetar para configurações padrão
  static resetToDefault(): Settings {
    const defaultSettings = this.getDefaultSettings();
    this.saveSettings(defaultSettings);
    this.applyAllSettings(defaultSettings);
    return defaultSettings;
  }

  // Validar configurações
  static validateSettings(settings: Partial<Settings>): boolean {
    const validLanguages = ['Portuguese', 'Simple Portuguese'];
    const validThemes = ['light', 'dark', 'auto'];
    const validFontSizes = ['small', 'medium', 'large'];
    const validColorSchemes = ['default', 'mozambique', 'ocean', 'forest', 'sunset'];
    const validResponseLengths = ['short', 'detailed', 'adaptive'];
    const validPersonalities = ['formal', 'casual', 'technical', 'friendly'];
    const validSpeeds = ['fast', 'balanced', 'thoughtful'];

    return (
      (!settings.language || validLanguages.includes(settings.language)) &&
      (!settings.theme || validThemes.includes(settings.theme)) &&
      (!settings.fontSize || validFontSizes.includes(settings.fontSize)) &&
      (!settings.colorScheme || validColorSchemes.includes(settings.colorScheme)) &&
      (!settings.responseLength || validResponseLengths.includes(settings.responseLength)) &&
      (!settings.aiPersonality || validPersonalities.includes(settings.aiPersonality)) &&
      (!settings.responseSpeed || validSpeeds.includes(settings.responseSpeed))
    );
  }

  // Obter estatísticas de uso das configurações
  static getUsageStats(): any {
    const settings = this.loadSettings();
    return {
      theme: settings.theme,
      language: settings.language,
      aiPersonality: settings.aiPersonality,
      experimentalEnabled: settings.experimentalFeatures,
      developerMode: settings.developerMode,
      timestamp: Date.now()
    };
  }
}

export default SettingsService;