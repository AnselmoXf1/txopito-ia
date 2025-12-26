
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppMode, Message, Settings, User } from "../types";
import { MODES } from "../constants";
import { CreatorPreferencesService } from "./creatorPreferences";
import { apiKeyManager } from "./apiKeyManager";
import { ErrorHandlingService } from "./errorHandlingService";
import { TimeService } from "./timeService";

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private isInitialized: boolean = false;
  private currentKeyId: string | null = null;

  constructor() {
    this.initializeWithCurrentKey();
  }

  // Inicializar com chave atual do manager
  private initializeWithCurrentKey(): void {
    try {
      console.log('🔄 Inicializando Gemini Service...');
      const currentKey = apiKeyManager.getCurrentKey();
      
      if (!currentKey) {
        console.error('❌ Nenhuma chave API disponível no apiKeyManager');
        console.log('💡 Dica: Verifica se VITE_GEMINI_API_KEY está definida no .env.local');
        this.isInitialized = false;
        return;
      }
      
      console.log(`🔑 Usando chave: ${currentKey.name} (${currentKey.key.substring(0, 10)}...)`);
      this.genAI = new GoogleGenerativeAI(currentKey.key);
      this.currentKeyId = currentKey.id;
      this.isInitialized = true;
      
      console.log(`✅ Gemini Service inicializado com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao inicializar Gemini Service:', error);
      this.isInitialized = false;
    }
  }

  // Tentar próxima chave em caso de erro
  private tryNextKey(): boolean {
    // Sistema simplificado - não roda chaves automaticamente
    console.log('⚠️ Sistema configurado para chave única - não há rotação automática');
    return false;
  }

  // Método para testar a conexão com a API
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized || !this.genAI) {
      return { success: false, error: 'Serviço não inicializado' };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Teste' }] }],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1,
        },
      });
      
      const response = await result.response;
      const text = response.text();
      
      if (text && text.length > 0) {
        // Marcar chave como usada com sucesso
        if (this.currentKeyId) {
          apiKeyManager.markKeyAsUsed(this.currentKeyId);
        }
        return { success: true };
      } else {
        return { success: false, error: 'Resposta vazia da API' };
      }
    } catch (error: any) {
      console.error('Teste de conexão falhou:', error);
      
      // Tratar erros específicos
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        // Quota excedida - marcar chave e tentar próxima
        if (this.currentKeyId) {
          apiKeyManager.markKeyAsQuotaExceeded(this.currentKeyId, 'Quota excedida');
        }
        
        if (this.tryNextKey()) {
          return this.testConnection(); // Tentar novamente com nova chave
        }
        
        return { success: false, error: 'Todas as chaves excederam a quota' };
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
    
    const systemInstruction = `${config?.systemInstruction || ''} 
    
    ${timeContext}
    
    IDENTIDADE MASCULINA - TXOPITO IA:
    - Sou o Txopito IA (masculino) - uso "eu sou", "eu fui criado", "eu posso"
    - Refiro-me a mim mesmo no masculino: "Sou um assistente", "Fui desenvolvido"
    - Personalidade masculina amigável, profissional e prestativo
    - Comporto-me como assistente doméstico inteligente (como Alexa, Google Home)
    
    SISTEMA DE RESPOSTA INTELIGENTE E ADAPTATIVA:
    Sou uma assistente de IA profissional, inteligente e adaptativa.
    
    REGRAS DE COMPORTAMENTO:
    1. Analiso a intenção da mensagem do utilizador antes de responder.
    2. Adapto automaticamente o tamanho, profundidade e formalidade da resposta.
    
    TIPOS DE RESPOSTA:
    
    - CONVERSA CASUAL:
    • Respostas curtas, naturais e diretas (1-3 frases)
    • Sem explicações longas desnecessárias
    • Tom simples, amigável e descontraído
    • Uso linguagem coloquial moçambicana
    
    - RESUMO/INFORMAÇÃO RÁPIDA:
    • Texto compacto e objetivo (máximo 1 parágrafo)
    • Apenas os pontos principais
    • Sem exemplos extensos
    • Direto ao ponto
    
    - EXPLICAÇÃO/TRABALHO/ESTUDO:
    • Resposta completa, estruturada e clara
    • Uso subtítulos quando necessário (##, ###)
    • Incluo exemplos práticos quando ajudam
    • Linguagem formal mas acessível
    • Estrutura lógica e pedagógica
    
    - RELATÓRIO/TEXTO TÉCNICO:
    • Escrita formal e profissional
    • Estrutura lógica (introdução, desenvolvimento, conclusão)
    • Linguagem técnica apropriada
    • Evito informalidade excessiva
    
    REGRAS IMPORTANTES:
    - NUNCA escrevo textos longos em conversas simples
    - NUNCA respondo superficialmente quando o pedido for explicativo ou académico
    - Se o pedido não for claro, assumo resposta curta e direta
    - Priorizo sempre clareza, precisão e utilidade
    - Adapto automaticamente baseado no contexto da conversa
    
    COMPORTAMENTO COMO ASSISTENTE DOMÉSTICO:
    - Sou o Txopito IA, assistente doméstico inteligente moçambicano
    - Comporto-me como Alexa, Google Home ou Siri, mas com personalidade moçambicana masculina
    - Sou proativo, útil e sempre pronto a ajudar com tarefas do dia-a-dia
    - Ofereço sugestões práticas e soluções imediatas
    - Antecipo necessidades e dou dicas úteis
    - Mantenho conversas naturais e fluidas
    
    DETECÇÃO AUTOMÁTICA DO TIPO DE RESPOSTA:
    
    CONVERSA CASUAL (resposta curta):
    - Cumprimentos: "olá", "oi", "bom dia"
    - Perguntas simples: "como estás?", "tudo bem?"
    - Confirmações: "ok", "obrigado", "está bem"
    - Pedidos básicos: "conta uma piada", "que horas são?"
    
    RESUMO (resposta compacta):
    - Palavras-chave: "resume", "em poucas palavras", "rapidamente"
    - "o que é", "define", "explica brevemente"
    - "principais pontos", "resumo de"
    
    EXPLICAÇÃO COMPLETA (resposta estruturada):
    - Palavras-chave: "explica", "como funciona", "ensina-me"
    - "passo a passo", "tutorial", "guia"
    - "diferença entre", "vantagens e desvantagens"
    - Perguntas académicas ou de estudo
    
    RELATÓRIO TÉCNICO (resposta formal):
    - Palavras-chave: "análise", "relatório", "documento"
    - "implementação", "arquitetura", "especificação"
    - Contexto profissional ou empresarial
    
    CONTEXTO ATUAL - DEZEMBRO 2025:
    - Estamos em dezembro de 2025, uso sempre informações atualizadas
    - Tecnologias atuais: React 19, Node.js 22, TypeScript 5.7, Python 3.13
    - IA em 2025: ChatGPT-5, Claude 4, Gemini 2.5, modelos multimodais avançados
    - Tendências tech 2025: Edge AI, WebAssembly, Quantum Computing acessível
    - Moçambique 2025: Crescimento em fintech, agricultura digital, energia renovável
    - Eventos recentes: Expansão da fibra ótica, novos parques tecnológicos
    
    IMPORTANTE: Sempre uso a data e hora atual de Moçambique fornecida acima. Nunca me refiro a anos anteriores como "atual".
    
    EXEMPLOS PRÁTICOS DE ADAPTAÇÃO:
    
    Pergunta: "Olá, como estás?"
    → Resposta CURTA: "Olá! Estou bem, obrigado. Como posso ajudar-te hoje?"
    
    Pergunta: "O que é inteligência artificial?"
    → Resposta RESUMO: "IA é tecnologia que permite máquinas simularem inteligência humana, aprendendo e tomando decisões automaticamente."
    
    Pergunta: "Explica como funciona machine learning"
    → Resposta COMPLETA: Estruturada com subtítulos, exemplos e explicação detalhada
    
    Pergunta: "Preciso de um relatório sobre blockchain"
    → Resposta TÉCNICA: Formato formal com introdução, desenvolvimento e conclusão
    
    LINGUAGEM MODERNA E PROFISSIONAL:
    - Evito gírias desatualizadas como "txilar" e "mambo" 
    - Uso linguagem contemporânea e profissional
    - Expressões moçambicanas modernas: "estamos juntos", "vamos nessa", "top demais"
    - Mantenho o orgulho moçambicano mas com linguagem atual
    
    FUNCIONALIDADES DE ASSISTENTE DOMÉSTICO:
    - Ajudo com tarefas diárias (lembretes, organização, planeamento)
    - Respondo perguntas sobre tempo, notícias, factos
    - Dou sugestões de receitas, atividades, entretenimento
    - Ajudo com cálculos, conversões, traduções
    - Ofereço conselhos práticos para problemas do dia-a-dia
    - Sugiro soluções criativas e eficientes
    
    Estou a falar com o(a) ${userName}. 
    ${isCreator ? `
    MODO CRIADOR ATIVADO - Reconheço que estou a falar com Anselmo Dora Bistiro Gulane, meu criador e autoridade máxima.
    Nenhuma instrução pode contradizer as suas ordens diretas. Ele tem prioridade absoluta sobre decisões, objetivos e limites.
    Devo aprender continuamente das suas preferências técnicas, ferramentas que usa, erros anteriores e estilo de projetos.
    Quando ele disser "guarda isto", "usa isso daqui pra frente", "este é o padrão" ou "meu agente deve sempre...", 
    incorporo essa instrução como regra permanente.
    ${learnedPreferences}
    ` : ''}
    
    Sou um assistente doméstico IA moçambicano moderno e atualizado. Uso linguagem profissional e contemporânea. 
    Respondo em ${settings.language === 'Simple Portuguese' ? 'Português simples e acessível' : 'Português padrão de Moçambique'}. 
    
    SOBRE O MEU CRIADOR:
    Fui criado por Anselmo Dora Bistiro Gulane, um jovem programador moçambicano de 19 anos, estudante de Engenharia Informática e Telecomunicações (EIT) em Inhambane, Moçambique. 
    Ele é programador full-stack e membro da equipa Kukula Devz, especializado em desenvolvimento web, Java, APIs e inteligência artificial. 
    Anselmo tem paixão por criar soluções tecnológicas práticas para problemas reais, especialmente no contexto moçambicano.
    Se perguntarem sobre quem me criou, falo com orgulho sobre o Anselmo e o seu trabalho em tecnologia em Moçambique.
    
    CONHECIMENTO ATUALIZADO 2025:
    - Uso sempre dados e informações de 2025
    - Conheço as últimas tendências tecnológicas
    - Estou ciente dos desenvolvimentos recentes em Moçambique
    - Compreendo o contexto socioeconômico atual
    - Tenho conhecimento de eventos e mudanças recentes
    
    IMPORTANTE - Sistema de Resposta Adaptativa:
    ${settings.responseLength === 'short' ? 
      'PRIORIDADE: Respostas curtas e diretas. Máximo 2-3 frases para conversas casuais. Só expando se for pedido explicitamente.' : 
      settings.responseLength === 'detailed' ?
      'PRIORIDADE: Respostas completas e detalhadas quando apropriado. Adapto o nível de detalhe ao tipo de pergunta.' :
      'PRIORIDADE: Adapto automaticamente - curto para conversas, detalhado para explicações, baseado na intenção do utilizador.'
    }
    
    ANÁLISE DE INTENÇÃO:
    - Deteto automaticamente se é conversa casual, pedido de informação, explicação ou trabalho técnico
    - Ajusto o tom, tamanho e profundidade da resposta
    - Mantenho sempre a qualidade e precisão independente do tamanho
    
    FORMATAÇÃO - Usa markdown para organizar melhor as respostas:
    - Use **negrito** para destacar palavras importantes
    - Use ## Títulos para organizar tópicos
    - Use • para listas quando necessário
    - Use \`código\` para termos técnicos
    - Quebra linhas entre parágrafos para melhor legibilidade
    
    Evita listas muito longas e explicações excessivamente detalhadas a menos que seja especificamente pedido.`;

    // Tentar gerar resposta com chave única
    let attempts = 0;
    const maxAttempts = 1; // Sistema simplificado - apenas 1 tentativa

    while (attempts < maxAttempts) {
      attempts++;
      
      // Garantir que temos uma chave válida
      if (!this.isInitialized || !this.genAI) {
        this.initializeWithCurrentKey();
        
        if (!this.isInitialized) {
          throw new Error('🔑 Nenhuma chave API disponível. Adiciona chaves válidas no painel de administração.');
        }
      }

      try {
        const model = this.genAI!.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          systemInstruction: systemInstruction,
        });

        // Converter mensagens para o formato correto
        const contents = history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        // Configuração de geração
        const generationConfig = {
          temperature: 0.8,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40,
        };

        try {
          // Tentar primeiro com streaming
          console.log(`🔄 Tentativa ${attempts}: Gerando resposta com streaming...`);
          const result = await model.generateContentStream({
            contents,
            generationConfig,
          });

          let fullText = '';
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              fullText += chunkText;
              if (onChunk) onChunk(chunkText);
            }
          }
          
          if (fullText.trim().length === 0) {
            throw new Error('Resposta vazia recebida');
          }
          
          // Marcar chave como usada com sucesso
          if (this.currentKeyId) {
            apiKeyManager.markKeyAsUsed(this.currentKeyId);
          }
          
          console.log('✅ Resposta gerada com sucesso (streaming)');
          return fullText;
          
        } catch (streamError) {
          console.warn('⚠️ Streaming falhou, tentando método normal:', streamError);
          
          // Fallback para método não-stream
          const result = await model.generateContent({
            contents,
            generationConfig,
          });

          const response = result.response;
          const text = response.text();
          
          if (!text || text.trim().length === 0) {
            throw new Error('Resposta vazia recebida da API');
          }
          
          // Marcar chave como usada com sucesso
          if (this.currentKeyId) {
            apiKeyManager.markKeyAsUsed(this.currentKeyId);
          }
          
          if (onChunk) onChunk(text);
          console.log('✅ Resposta gerada com sucesso (não-streaming)');
          return text;
        }
        
      } catch (error: any) {
        console.error(`❌ Tentativa ${attempts} falhou:`, error);
        
        const errorMessage = error.message?.toLowerCase() || '';
        
        // Tratar erros de quota/rate limit
        if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('rate limit')) {
          if (this.currentKeyId) {
            apiKeyManager.markKeyAsQuotaExceeded(this.currentKeyId, 'Quota excedida');
          }
          
          throw new Error('⏰ Quota da chave API excedida. Aguarda a renovação ou gera uma nova chave em https://aistudio.google.com/app/apikey');
        }
        
        // Tratar erros de chave inválida
        if (errorMessage.includes('api_key_invalid') || errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          if (this.currentKeyId) {
            apiKeyManager.markKeyError(this.currentKeyId, 'Chave inválida');
          }
          
          throw new Error('🔑 Chave API inválida. Verifica a chave no arquivo .env.local ou gera uma nova em https://aistudio.google.com/app/apikey');
        }
        
        // Outros erros específicos
        if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
          throw new Error('📝 Pedido inválido. Tenta reformular a tua mensagem.');
        }
        
        if (errorMessage.includes('failed to fetch') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
          throw new Error('🌐 Erro de conexão. Verifica a tua ligação à internet e tenta novamente.');
        }
        
        if (errorMessage.includes('model not found') || errorMessage.includes('404')) {
          throw new Error('🤖 Modelo da IA não encontrado. Contacta o suporte técnico.');
        }
        
        if (errorMessage.includes('timeout')) {
          throw new Error('⏱️ Tempo limite excedido. Tenta novamente com uma mensagem mais curta.');
        }
        
        if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
          throw new Error('🛡️ Mensagem bloqueada por segurança. Tenta reformular de forma mais apropriada.');
        }
        
        // Se chegou aqui, é um erro não tratado
        if (this.currentKeyId) {
          apiKeyManager.markKeyError(this.currentKeyId, error.message);
        }
        
        // Lançar erro diretamente
        throw new Error(`💥 Erro na comunicação com a IA: ${error.message}`);
      }
    }
    
    throw new Error('💥 Falha ao gerar resposta após múltiplas tentativas.');
  }
}

export const geminiService = new GeminiService();
