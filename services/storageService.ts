
import { Conversation } from '../types';

const CONVS_KEY = 'txopito_conversations';

export const storageService = {
  getConversations: (userId: string): Conversation[] => {
    const all = JSON.parse(localStorage.getItem(CONVS_KEY) || '[]');
    return all.filter((c: Conversation) => c.userId === userId)
              .sort((a: any, b: any) => b.lastUpdate - a.lastUpdate);
  },

  getAllConversations: (): Conversation[] => {
    const all = JSON.parse(localStorage.getItem(CONVS_KEY) || '[]');
    return all.sort((a: any, b: any) => b.lastUpdate - a.lastUpdate);
  },

  saveConversation: (conv: Conversation) => {
    const all = JSON.parse(localStorage.getItem(CONVS_KEY) || '[]');
    const index = all.findIndex((c: Conversation) => c.id === conv.id);
    if (index > -1) {
      all[index] = conv;
    } else {
      all.push(conv);
    }
    localStorage.setItem(CONVS_KEY, JSON.stringify(all));
  },

  deleteConversation: (id: string) => {
    const all = JSON.parse(localStorage.getItem(CONVS_KEY) || '[]');
    const filtered = all.filter((c: Conversation) => c.id !== id);
    localStorage.setItem(CONVS_KEY, JSON.stringify(filtered));
  }
};
