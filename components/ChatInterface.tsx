
import React, { useState, useRef, useEffect } from 'react';
import { Message, AppMode, Settings, User, Conversation } from '../types';
import { MODES } from '../constants';
import { geminiService } from '../services/geminiService';
import { ErrorHandlingService } from '../services/errorHandlingService';
import MessageRenderer from './MessageRenderer';
import ApiDiagnostic from './ApiDiagnostic';

interface ChatInterfaceProps {
  mode: AppMode;
  settings: Settings;
  user: User | null;
  conversation: Conversation;
  onUpdateConversation: (conv: Conversation) => void;
  onOpenSettings: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  mode, settings, user, conversation, onUpdateConversation, onOpenSettings 
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const currentMode = MODES.find(m => m.id === mode);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...conversation.messages, userMessage];
    let newTitle = conversation.title;
    
    // Se for a primeira mensagem, tentar criar um título melhor
    if (conversation.messages.length === 0) {
      newTitle = text.length > 30 ? text.substring(0, 30) + '...' : text;
    }

    onUpdateConversation({
      ...conversation,
      title: newTitle,
      messages: updatedMessages,
      lastUpdate: Date.now()
    });

    setInputText('');
    setIsTyping(true);

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    // Adiciona o placeholder da mensagem do assistente
    onUpdateConversation({
      ...conversation,
      messages: [...updatedMessages, assistantMessage],
      lastUpdate: Date.now()
    });

    try {
      let fullContent = '';
      await geminiService.generateResponse(
        mode,
        updatedMessages,
        settings,
        user,
        (chunk) => {
          fullContent += chunk;
          // Não podemos usar a prop diretamente aqui pois ela pode estar desatualizada no fecho, 
          // mas como estamos num ambiente React controlado, o onUpdateConversation lidará com o estado global.
          // Para uma UI fluída, o ideal é ter um estado local também se necessário, mas vamos confiar na propagação de props.
          onUpdateConversation({
            ...conversation,
            messages: [...updatedMessages, { ...assistantMessage, content: fullContent }],
            lastUpdate: Date.now()
          });
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      
      // Usar o sistema inteligente de tratamento de erros
      const errorMessage = ErrorHandlingService.processError(error, {
        mode,
        userId: user?.id,
        messageCount: updatedMessages.length,
        timestamp: Date.now()
      });
      
      onUpdateConversation({
        ...conversation,
        messages: [...updatedMessages, { ...assistantMessage, content: errorMessage }],
        lastUpdate: Date.now()
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
      {/* Header Desktop */}
      <header className="hidden lg:flex p-4 border-b dark:border-gray-800 items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <span className="text-2xl p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">{currentMode?.icon}</span>
          <div>
            <h1 className="font-bold leading-none dark:text-white">{conversation.title}</h1>
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">{mode}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onOpenSettings} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <svg className="w-5 h-5 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 sm:space-y-6 scroll-smooth bg-gray-50/20 dark:bg-gray-900/10 custom-scrollbar"
      >
        {conversation.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in zoom-in-95 duration-700">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-3xl flex items-center justify-center text-5xl shadow-2xl animate-bounce">
                {currentMode?.icon}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center p-1">
                <img 
                  src="/logo.png" 
                  alt="Txopito IA" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/logo-placeholder.svg';
                  }}
                />
              </div>
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-black text-gray-800 dark:text-white">Estou pronta!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentMode?.description}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {currentMode?.suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => handleSendMessage(s)}
                  className="p-3 text-sm font-medium bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl hover:border-green-500 hover:text-green-600 transition-all text-gray-600 dark:text-gray-300 shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {conversation.messages.map((msg, idx) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex flex-col max-w-[95%] sm:max-w-[85%] lg:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Avatar para mensagens da IA */}
              {msg.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 ai-avatar rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
                    🤖
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Txopito IA</span>
                </div>
              )}
              
              <div 
                className={`p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg transition-all hover:shadow-xl message-hover ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-red-500 to-red-700 text-white rounded-tr-none border-2 border-red-600' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700 rounded-tl-none'
                }`}
              >
                <MessageRenderer 
                  content={msg.content}
                  isUser={msg.role === 'user'}
                  onShowDiagnostic={() => setShowDiagnostic(true)}
                  isStreaming={isTyping && idx === conversation.messages.length - 1 && msg.role === 'assistant'}
                />
              </div>
              
              <span className="text-[10px] text-gray-400 mt-2 px-2 font-medium">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col items-start">
              {/* Avatar da IA */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 ai-avatar rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  🤖
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Txopito IA está a escrever...</span>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 px-6 py-4 rounded-3xl rounded-tl-none shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">A pensar...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2 sm:p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          className="w-full max-w-4xl mx-auto flex items-end space-x-2"
        >
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }
              }}
              placeholder="Pergunta algo sobre a nossa terra..."
              className="w-full p-3 sm:p-4 pr-12 bg-gray-100 dark:bg-gray-800 dark:text-white rounded-2xl sm:rounded-3xl outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-inner resize-none overflow-hidden text-sm sm:text-base"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`p-3 sm:p-4 rounded-full text-white transition-all shadow-xl flex items-center justify-center shrink-0 ${
              !inputText.trim() || isTyping 
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50' 
                : 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/20 active:scale-90'
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 mt-2 font-medium px-2">
          A Txopito IA pode cometer erros. Verifica sempre factos importantes de Moçambique.
        </p>
      </div>

      {/* Diagnóstico da API */}
      {showDiagnostic && (
        <ApiDiagnostic onClose={() => setShowDiagnostic(false)} />
      )}
    </div>
  );
};

export default ChatInterface;
