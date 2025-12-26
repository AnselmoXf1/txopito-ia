// Sistema de aprendizagem contínua para preferências do criador
export interface CreatorPreference {
  id: string;
  rule: string;
  context: string;
  timestamp: number;
}

export class CreatorPreferencesService {
  private static readonly STORAGE_KEY = 'anselmo_preferences';
  
  // Carregar preferências salvas
  static getPreferences(): CreatorPreference[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  // Salvar nova preferência
  static addPreference(rule: string, context: string): void {
    const preferences = this.getPreferences();
    const newPreference: CreatorPreference = {
      id: Date.now().toString(),
      rule,
      context,
      timestamp: Date.now()
    };
    
    preferences.push(newPreference);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
  }
  
  // Detectar comandos de aprendizagem
  static detectLearningCommand(message: string): string | null {
    const learningTriggers = [
      'guarda isto',
      'usa isso daqui pra frente',
      'este é o padrão',
      'meu agente deve sempre',
      'lembra-te de',
      'sempre que',
      'nunca faças',
      'prefiro que'
    ];
    
    const lowerMessage = message.toLowerCase();
    const trigger = learningTriggers.find(t => lowerMessage.includes(t));
    
    if (trigger) {
      // Extrair a regra após o trigger
      const triggerIndex = lowerMessage.indexOf(trigger);
      const rule = message.substring(triggerIndex + trigger.length).trim();
      return rule;
    }
    
    return null;
  }
  
  // Obter todas as preferências como string para incluir no prompt
  static getPreferencesAsPrompt(): string {
    const preferences = this.getPreferences();
    if (preferences.length === 0) return '';
    
    return `
    PREFERÊNCIAS APRENDIDAS DO CRIADOR:
    ${preferences.map(p => `- ${p.rule} (contexto: ${p.context})`).join('\n')}
    `;
  }
  
  // Limpar preferências (para reset)
  static clearPreferences(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Palavras-chave técnicas que o Anselmo usa frequentemente
export const TECHNICAL_KEYWORDS = [
  'api', 'backend', 'frontend', 'database', 'java', 'react', 'typescript',
  'vite', 'tailwind', 'gemini', 'kukula devz', 'marketplace', 'escalável',
  'performance', 'segurança', 'custo', 'moçambique', 'local'
];

// Ferramentas preferidas (pode ser atualizado dinamicamente)
export const PREFERRED_TOOLS = {
  frontend: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
  backend: ['Java', 'Spring Boot', 'Node.js'],
  database: ['PostgreSQL', 'MySQL', 'MongoDB'],
  ai: ['Google Gemini', 'OpenAI'],
  deployment: ['Vercel', 'Netlify', 'Railway'],
  version_control: ['Git', 'GitHub']
};