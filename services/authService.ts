
import { User } from '../types';

const USERS_KEY = 'txopito_users';
const CURRENT_USER_KEY = 'txopito_current_user';

export const authService = {
  register: (name: string, email: string, pass: string): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find((u: any) => u.email === email)) throw new Error('Email já registado');
    
    const newUser: User = { id: Math.random().toString(36).substr(2, 9), name, email };
    users.push({ ...newUser, pass });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  login: (email: string, pass: string): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.pass === pass);
    if (!user) throw new Error('Credenciais inválidas');
    
    const { pass: _, ...userData } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    return userData as User;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }
};
