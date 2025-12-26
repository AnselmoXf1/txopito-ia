import { Settings } from '../types';

export interface SettingsPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'user' | 'accessibility' | 'performance' | 'theme';
  settings: Settings;
  tags: string[];
}

export class SettingsPresets {
  static readonly PRESETS: SettingsPreset[] = [
    // Presets para Utilizadores
    {
      id: 'beginner',
      name: 'Iniciante',
      description: 'Configurações simples e intuitivas para novos utilizadores',
      icon: '🌱',
      category: 'user',
      tags: ['simples', 'básico', 'novo'],
      settings: {
        language: 'Simple Portuguese',
        theme: 'light',
        fontSize: 'large',
        colorScheme: 'default',
        responseLength: 'short',
        aiPersonality: 'friendly',
        responseSpeed: 'fast',
        showTimestamps: true,
        showWordCount: false,
        enableAnimations: true,
        compactMode: false,
        autoSave: true,
        soundEffects: true,
        notifications: true,
        offlineMode: true,
        saveHistory: true,
        shareUsageData: false,
        developerMode: false,
        experimentalFeatures: false
      }
    },
    {
      id: 'advanced',
      name: 'Avançado',
      description: 'Configurações completas para utilizadores experientes',
      icon: '🚀',
      category: 'user',
      tags: ['avançado', 'completo', 'experiente'],
      settings: {
        language: 'Portuguese',
        theme: 'auto',
        fontSize: 'medium',
        colorScheme: 'default',
        responseLength: 'adaptive',
        aiPersonality: 'technical',
        responseSpeed: 'balanced',
        showTimestamps: true,
        showWordCount: true,
        enableAnimations: true,
        compactMode: false,
        autoSave: true,
        soundEffects: false,
        notifications: true,
        offlineMode: true,
        saveHistory: true,
        shareUsageData: true,
        developerMode: true,
        experimentalFeatures: true
      }
    },
    {
      id: 'student',
      name: 'Estudante',
      description: 'Otimizado para estudos e aprendizagem',
      icon: '📚',
      category: 'user',
      tags: ['estudo', 'aprendizagem', 'educação'],
      settings: {
        language: 'Portuguese',
        theme: 'light',
        fontSize: 'medium',
        colorScheme: 'ocean',
        responseLength: 'detailed',
        aiPersonality: 'formal',
        responseSpeed: 'thoughtful',
        showTimestamps: false,
        showWordCount: true,
        enableAnimations: false,
        compactMode: true,
        autoSave: true,
        soundEffects: false,
        notifications: false,
        offlineMode: true,
        saveHistory: true,
        shareUsageData: false,
        developerMode: false,
        experimentalFeatures: false
      }
    },
    {
      id: 'professional',
      name: 'Profissional',
      description: 'Interface limpa e focada para ambiente de trabalho',
      icon: '💼',
      category: 'user',
      tags: ['trabalho', 'profissional', 'formal'],
      settings: {
        language: 'Portuguese',
        theme: 'light',
        fontSize: 'medium',
        colorScheme: 'default',
        responseLength: 'short',
        aiPersonality: 'formal',
        responseSpeed: 'fast',
        showTimestamps: false,
        showWordCount: false,
        enableAnimations: false,
        compactMode: true,
        autoSave: true,
        soundEffects: false,
        notifications: false,
        offlineMode: true,
        saveHistory: true,
        shareUsageData: false,
        developerMode: false,
        experimentalFeatures: false
      }
    },

    // Presets Temáticos
    {
      id: 'mozambique',
      name: 'Orgulho Moçambicano',
      description: 'Cores e estilo inspirados na bandeira de Moçambique',
      icon: '🇲🇿',
      category: 'theme',
      tags: ['moçambique', 'patriótico', 'nacional'],
      settings: {
        language: 'Portuguese',
        theme: 'light',
        fontSize: 'medium',
        colorScheme: 'mozambique',
        responseLength: 'short',
        aiPersonality: 'friendly',
        responseSpeed: 'balanced',
        showTimestamps: true,
        showWordCount: false,
        enableAnimations: true,
        compactMode: false,
        autoSave: true,
        soundEffects: true,
        notifications: true,
        offlineMode: true,
        saveHistory: true,
        shareUsageData: true,
        developerMode: false,
        experimentalFeatures: false
      }
    },
    {
      id: 'dark_mode',
      name: 'Modo Noturno',
      description: 'Tema escuro suave para uso noturno',
      icon: '🌙',
      category: 'theme',
      tags: ['escuro', 'noite', 'suave'],
      settings: {
        language: 'Portuguese',
        theme: 'dark',
        fontSize: 'medium',
        colorScheme: 'ocean',
        responseLength: 'short',
        aiPersonality: 'casual',
        responseSpeed: 'balanced',
        showTimestamps: false,
        showWordCount: false,
        enableAnimations: true,
        compactMode: false,
        autoSave: true,
        soundEffects: false,
        notifications: false,
        offlineMode: true,
        saveHistory: true,
        shareUsageData: false,
        developerMode: false,
        experimentalFeatures: false
      }
    },

    // Presets de Acessibilidade
    {
      id: 'accessibility',
      name: 'Acessibilidade',
      description: 'Otimizado para utilizadores com necessidades especiais',
      icon: '♿',
      category: 'accessibility',
      tags: ['acessibilidade', 'inclusão', 'especial'],
      settings: {
        language: 'Simple Portuguese',
        theme: 'light',
        fontSize: 'large',
        colorScheme: 'default',
        responseLength: 'short',
        aiPersonality: 'friendly',
        responseSpeed: 'balanced',
        showTimestamps: true,
        showWordCount: true,
        enableAnimations: false,
        compactMode: false,
        autoSave: true,
        soundEffects: true,
        notifications: true,
        offlineMode: true,
        saveHistory: true,
        shareUsageData: false,
        developerMode: false,
        experimentalFeatures: false
      }
    },
    {
      id: 'high_contrast',
      name: 'Alto Contraste',
      description: 'Cores de alto contraste para melhor visibilidade',
      icon: '🔳',
      category: 'accessibility',
      tags: ['contraste', 'visibilidade', 'visual'],
      settings: {
        language: 'Simple Portuguese',
        theme: 'light',
        fontSize: 'large',
        colorScheme: 'default',
        responseLength: 'short',
        aiPersonality: 'formal',
        responseSpeed: 'balanced',
        showTimestamps: true,
        showWordCount: true,
        enableAnimations: false,
        compactMode: false,
        autoSave: true,
        soundEffects: true,
        notifications: true,
        offlineMode: true,
        saveHistory: true,
        shareUsageData: false,
        developerMode: false,
        experimentalFeatures: false
      }
    },

    // Presets de Performance
    {
      id: 'performance',
      name: 'Performance',
      description: 'Configurações otimizadas para dispositivos mais lentos',
      icon: '⚡',
      category: 'performance',
      tags: ['rápido', 'otimizado', 'leve'],
      settings: {
        language: 'Simple Portuguese',
        theme: 'light',
        fontSize: 'small',
        colorScheme: 'default',
        responseLength: 'short',
        aiPersonality: 'casual',
        responseSpeed: 'fast',
        showTimestamps: false,
        showWordCount: false,
        enableAnimations: false,
        compactMode: true,
        autoSave: false,
        soundEffects: false,
        notifications: false,
        offlineMode: true,
        saveHistory: false,
        shareUsageData: false,
        developerMode: false,
        experimentalFeatures: false
      }
    },
    {
      id: 'battery_saver',
      name: 'Poupança de Bateria',
      description: 'Reduz consumo de bateria em dispositivos móveis',
      icon: '🔋',
      category: 'performance',
      tags: ['bateria', 'móvel', 'economia'],
      settings: {
        language: 'Simple Portuguese',
        theme: 'dark',
        fontSize: 'small',
        colorScheme: 'default',
        responseLength: 'short',
        aiPersonality: 'casual',
        responseSpeed: 'fast',
        showTimestamps: false,
        showWordCount: false,
        enableAnimations: false,
        compactMode: true,
        autoSave: false,
        soundEffects: false,
        notifications: false,
        offlineMode: true,
        saveHistory: false,
        shareUsageData: false,
        developerMode: false,
        experimentalFeatures: false
      }
    }
  ];

  // Obter preset por ID
  static getPreset(id: string): SettingsPreset | undefined {
    return this.PRESETS.find(preset => preset.id === id);
  }

  // Obter presets por categoria
  static getPresetsByCategory(category: SettingsPreset['category']): SettingsPreset[] {
    return this.PRESETS.filter(preset => preset.category === category);
  }

  // Procurar presets por tags
  static searchPresets(query: string): SettingsPreset[] {
    const lowerQuery = query.toLowerCase();
    return this.PRESETS.filter(preset => 
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.description.toLowerCase().includes(lowerQuery) ||
      preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Sugerir preset baseado no dispositivo
  static suggestPresetForDevice(): SettingsPreset {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSlowDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isSlowDevice || isMobile) {
      return this.getPreset('performance')!;
    }

    if (prefersReducedMotion) {
      return this.getPreset('accessibility')!;
    }

    if (prefersDark) {
      return this.getPreset('dark_mode')!;
    }

    return this.getPreset('beginner')!;
  }

  // Criar preset personalizado
  static createCustomPreset(
    name: string, 
    description: string, 
    settings: Settings,
    icon: string = '⚙️'
  ): SettingsPreset {
    return {
      id: `custom_${Date.now()}`,
      name,
      description,
      icon,
      category: 'user',
      tags: ['personalizado', 'custom'],
      settings
    };
  }

  // Comparar configurações com presets
  static findMatchingPreset(settings: Settings): SettingsPreset | null {
    for (const preset of this.PRESETS) {
      if (this.settingsMatch(settings, preset.settings)) {
        return preset;
      }
    }
    return null;
  }

  // Verificar se configurações coincidem
  private static settingsMatch(settings1: Settings, settings2: Settings): boolean {
    const keys = Object.keys(settings1) as (keyof Settings)[];
    return keys.every(key => settings1[key] === settings2[key]);
  }

  // Obter diferenças entre configurações
  static getSettingsDiff(current: Settings, preset: Settings): Partial<Settings> {
    const diff: Partial<Settings> = {};
    const keys = Object.keys(preset) as (keyof Settings)[];
    
    keys.forEach(key => {
      if (current[key] !== preset[key]) {
        diff[key] = preset[key];
      }
    });
    
    return diff;
  }

  // Aplicar preset com animação suave
  static async applyPresetGradually(
    preset: SettingsPreset,
    onUpdate: (settings: Settings) => void,
    currentSettings: Settings,
    delay: number = 100
  ): Promise<void> {
    const diff = this.getSettingsDiff(currentSettings, preset.settings);
    const keys = Object.keys(diff) as (keyof Settings)[];
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const newSettings = { ...currentSettings, [key]: diff[key] };
      onUpdate(newSettings);
      
      if (i < keys.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

export default SettingsPresets;