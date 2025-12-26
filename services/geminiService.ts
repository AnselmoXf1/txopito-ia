
import { AppMode, Message, Settings, User } from "../types";
import { MODES } from "../constants";
import { CreatorPreferencesService } from "./creatorPreferences";
import { ErrorHandlingService } from "./errorHandlingService";
import { TimeService } from "./timeService";

export class GeminiService {
  private backendUrl: string;
  private isInitialized: boolean = false;

  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://txopito-backend.onrender.com/api';
    this.isInitialized = true;
    console.log('🔄 Gemini Service inicializado com backend seguro:', this.backendUrl);
  }

  // Método para testar a conexão com o backend
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    try {
      console.log('🧪 Testando conexão com backend Gemini...');
      
      const response = await fetch(`${this.backendUrl}/gemini/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Conexão com backend Gemini funcionando');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Teste falhou' };
      }
      
    } catch (error: any) {
      console.error('❌ Teste de conexão falhou:', error);
      
      if (error.name === 'TimeoutError') {
        return { success: false, error: 'Timeout - backend pode estar dormindo' };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  async generateResponse(
    mode: AppMode,
    history: Message[],
    settings: Settings,
    user: User | null,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // Validar entrada
    if (!history || history.length === 0) {
      throw new Error('Histórico de mensagens vazio');
    }

    if (!this.isInitialized) {
      throw new Error('Serviço Gemini não inicializado');
    }

    const config = MODES.find(m => m.id === mode);
    const userName = user ? user.name : 'Amigo(a)';
    
    // Detectar se é o Anselmo (criador) para ativar modo técnico avançado
    const isCreator = user?.name?.toLowerCase().includes('anselmo') || 
                     user?.name?.toLowerCase().includes('bistiro') ||
                     user?.name?.toLowerCase().includes('gulane');
    
    // Verificar se há comandos de aprendizagem na última mensagem
    const lastMessage = history[history.length - 1];
    if (isCreator && lastMessage?.role === 'user') {
      const learningRule = CreatorPreferencesService.detectLearningCommand(lastMessage.content);
      if (learningRule) {
        CreatorPreferencesService.addPreference(learningRule, mode);
      }
    }
    
    // Obter preferências aprendidas
    const learnedPreferences = isCreator ? CreatorPreferencesService.getPreferencesAsPrompt() : '';
    
    // Obter contexto temporal atual de Moçambique
    const timeContext = await TimeService.getTimeContextForAI();

    // Preparar dados para enviar ao backend
    const requestData = {
      message: lastMessage.content,
      history: history.slice(0, -1), // Histórico sem a última mensagem
      settings: {
        temperature: 0.8,
        maxTokens: 2048,
        topP: 0.95,
        topK: 40,
        responseLength: settings.responseLength || 'auto'
      },
      user: user ? {
        id: user.id,
        name: user.name,
        isCreator: isCreator
      } : null,
      context: {
        mode: mode,
        systemInstruction: config?.systemInstruction || '',
        timeContext: timeContext,
        learnedPreferences: learnedPreferences,
        userName: userName
      }
    };

    try {
      console.log(`🤖 Enviando requisição para backend: ${lastMessage.content.substring(0, 50)}...`);
      
      const response = await fetch(`${this.backendUrl}/gemini/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(30000) // 30 segundos timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Resposta inválida do backend');
      }

      const responseText = data.response;
      
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Resposta vazia recebida do backend');
      }

      // Simular streaming se callback fornecido
      if (onChunk) {
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
          onChunk(chunk);
          // Pequena pausa para simular streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      console.log(`✅ Resposta recebida do backend: ${responseText.substring(0, 100)}...`);
      
      return responseText;

    } catch (error: any) {
      console.error('❌ Erro na comunicação com backend:', error);
      
      // Tratar erros específicos
      if (error.name === 'TimeoutError') {
        throw new Error('⏱️ Tempo limite excedido. O backend pode estar sobrecarregado.');
      }
      
      if (error.message?.includes('429')) {
        throw new Error('⏰ Muitas requisições. Aguarda um momento antes de tentar novamente.');
      }
      
      if (error.message?.includes('quota')) {
        throw new Error('⏰ Quota da IA excedida. Tenta novamente mais tarde.');
      }
      
      if (error.message?.includes('safety') || error.message?.includes('blocked')) {
        throw new Error('🛡️ Mensagem bloqueada por segurança. Reformula a pergunta de forma mais apropriada.');
      }
      
      if (error.message?.includes('fetch')) {
        throw new Error('🌐 Erro de conexão com o servidor. Verifica a tua ligação à internet.');
      }
      
      // Erro genérico
      throw new Error(`💥 Erro na comunicação com a IA: ${error.message}`);
    }
  }

  // Método para obter estatísticas (se disponível)
  async getStats(): Promise<any> {
    try {
      const response = await fetch(`${this.backendUrl}/gemini/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ Não foi possível obter estatísticas:', error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
