import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/adminService';
import { UserService } from '../services/userService';

interface MessageRendererProps {
  content: string;
  isStreaming?: boolean;
  isUser?: boolean;
  onShowDiagnostic?: () => void;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  content, 
  isStreaming = false, 
  isUser = false,
  onShowDiagnostic
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animação de escrita para mensagens da IA
  useEffect(() => {
    if (!isUser && isStreaming && currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 20); // Velocidade da animação

      return () => clearTimeout(timer);
    } else if (!isStreaming) {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
    }
  }, [content, currentIndex, isStreaming, isUser]);

  // Função para formatar o texto com markdown simples
  const formatText = (text: string) => {
    if (isUser) return text;

    // Dividir em parágrafos
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Verificar se é um título (começa com #)
      if (paragraph.startsWith('#')) {
        const level = paragraph.match(/^#+/)?.[0].length || 1;
        const title = paragraph.replace(/^#+\s*/, '');
        
        const titleClasses = {
          1: 'text-xl font-bold text-green-700 dark:text-green-400 mb-3 mt-4',
          2: 'text-lg font-semibold text-green-600 dark:text-green-300 mb-2 mt-3',
          3: 'text-base font-medium text-green-600 dark:text-green-300 mb-2 mt-2'
        };
        
        return (
          <h3 key={index} className={titleClasses[level as keyof typeof titleClasses] || titleClasses[3]}>
            {title}
          </h3>
        );
      }
      
      // Verificar se é uma lista
      if (paragraph.includes('•') || paragraph.includes('-') || /^\d+\./.test(paragraph)) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-none space-y-2 mb-4">
            {items.map((item, itemIndex) => {
              const cleanItem = item.replace(/^[•\-\d+\.]\s*/, '').trim();
              return (
                <li key={itemIndex} className="flex items-start space-x-2">
                  <span className="text-green-500 font-bold mt-1">•</span>
                  <span className="flex-1">{formatInlineText(cleanItem)}</span>
                </li>
              );
            })}
          </ul>
        );
      }
      
      // Parágrafo normal
      return (
        <p key={index} className="mb-3 leading-relaxed text-justify">
          {formatInlineText(paragraph)}
        </p>
      );
    });
  };

  // Função para formatar texto inline (negrito, itálico, código)
  const formatInlineText = (text: string) => {
    // Negrito **texto**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-green-700 dark:text-green-300">$1</strong>');
    
    // Itálico *texto*
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-gray-600 dark:text-gray-300">$1</em>');
    
    // Código `texto`
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-red-600 dark:text-red-400">$1</code>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  // Verificar se é uma mensagem de erro e se o utilizador é admin
  const isApiError = !isUser && (
    content.includes('🔑') || 
    content.includes('⏰') || 
    content.includes('💳') || 
    content.includes('🌐') || 
    content.includes('💥') ||
    content.includes('🔧') ||
    content.includes('⏱️') ||
    content.includes('🤖') ||
    content.includes('Nenhuma chave API') ||
    content.includes('Quota') ||
    content.includes('API') ||
    content.includes('Erro técnico') ||
    content.includes('Maximum call stack') ||
    content.includes('Txopito está com problemas')
  );

  // Verificar se é admin ou criador
  const isAdmin = AdminService.isAdminLoggedIn();
  const currentUser = UserService.getCurrentUser();
  const isCreator = currentUser?.role === 'creator';
  const canSeeDiagnostic = isAdmin || isCreator;

  return (
    <div className="message-content">
      {isUser ? (
        <div className="text-white font-medium">
          {content}
        </div>
      ) : (
        <div className="text-gray-800 dark:text-gray-100">
          {formatText(displayedContent)}
          {isStreaming && currentIndex < content.length && (
            <span className="inline-block w-2 h-5 bg-green-500 ml-1 animate-pulse"></span>
          )}
          
          {/* Botão de diagnóstico apenas para admins e criadores */}
          {isApiError && onShowDiagnostic && canSeeDiagnostic && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm mb-2">
                Parece que há um problema com a configuração da API.
              </p>
              <button
                onClick={onShowDiagnostic}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center"
              >
                🔍 Executar Diagnóstico
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageRenderer;