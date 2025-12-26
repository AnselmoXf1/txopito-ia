
import React from 'react';
import { Conversation, AppMode, User } from '../types';
import { MODES } from '../constants';

interface SidebarProps {
  user: User;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onNewChatWithModeSelector: () => void;
  onLogout: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, conversations, activeId, onSelectConversation, onNewChat, onNewChatWithModeSelector, onLogout, onDeleteChat, isOpen, onClose 
}) => {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 sm:w-72 bg-white dark:bg-gray-900 border-r dark:border-gray-800 
        transform transition-transform duration-300 ease-in-out flex flex-col h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-green-600/10 to-transparent">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
            <span className="font-bold text-lg dark:text-white">Txopito IA</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 space-y-2">
          <button 
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>Novo Chat</span>
          </button>
          
          <button 
            onClick={() => { onNewChatWithModeSelector(); onClose(); }}
            className="w-full py-2 px-4 border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-medium rounded-xl flex items-center justify-center space-x-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span className="text-sm">Escolher Modo</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Histórico</p>
          {conversations.length === 0 ? (
            <p className="px-4 py-8 text-sm text-center text-gray-400 italic">Sem conversas ainda...</p>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                className={`group relative flex items-center rounded-xl transition-all cursor-pointer ${activeId === conv.id ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              >
                <button 
                  onClick={() => { onSelectConversation(conv.id); onClose(); }}
                  className="flex-1 p-3 text-left overflow-hidden"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl shrink-0">{MODES.find(m => m.id === conv.mode)?.icon || '💬'}</span>
                    <span className="truncate text-sm font-medium">{conv.title}</span>
                  </div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 mr-1 hover:text-red-500 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full mt-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Sair da Conta
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
