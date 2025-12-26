
export enum AppMode {
  GENERAL = 'Conversa Geral',
  HISTORY = 'História de Moçambique',
  STORYTELLER = 'Contador de Histórias',
  STUDENT = 'Modo Estudante',
  PROGRAMMING = 'Programação'
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  mode: AppMode;
  messages: Message[];
  lastUpdate: number;
}

export interface Settings {
  // Aparência
  language: 'Portuguese' | 'Simple Portuguese';
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'default' | 'mozambique' | 'ocean' | 'forest' | 'sunset';
  
  // Comportamento da IA
  responseLength: 'short' | 'detailed' | 'adaptive';
  aiPersonality: 'formal' | 'casual' | 'technical' | 'friendly';
  responseSpeed: 'fast' | 'balanced' | 'thoughtful';
  
  // Interface
  showTimestamps: boolean;
  showWordCount: boolean;
  enableAnimations: boolean;
  compactMode: boolean;
  
  // Funcionalidades
  autoSave: boolean;
  soundEffects: boolean;
  notifications: boolean;
  offlineMode: boolean;
  
  // Privacidade
  saveHistory: boolean;
  shareUsageData: boolean;
  
  // Avançado
  developerMode: boolean;
  experimentalFeatures: boolean;
}

export interface ModeConfig {
  id: AppMode;
  icon: React.ReactNode;
  description: string;
  systemInstruction: string;
  suggestions: string[];
}
