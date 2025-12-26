import React from 'react';
import { UserProfile as UserProfileType, UserService } from '../services/userService';

interface UserProfileProps {
  user: UserProfileType;
  onUpdateUser: (user: UserProfileType) => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser, onLogout }) => {
  const availableFeatures = UserService.getAvailableFeatures(user);
  const usageCheck = UserService.checkUsageLimits(user);

  const getRoleColor = (role: string) => {
    const colors = {
      creator: 'bg-gradient-to-r from-purple-500 to-pink-500',
      admin: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      user: 'bg-gradient-to-r from-gray-500 to-gray-600'
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  const getRoleName = (role: string) => {
    const names = {
      creator: 'Criador',
      admin: 'Administrador',
      user: 'Utilizador'
    };
    return names[role as keyof typeof names] || 'Utilizador';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg">
      {/* Header do Perfil */}
      <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">{user.name}</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
          <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-medium mt-1 sm:mt-2 ${getRoleColor(user.role)}`}>
            {getRoleName(user.role)}
          </div>
        </div>
      </div>

      {/* Estatísticas de Uso */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{user.usage.totalMessages}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mensagens Totais</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{user.usage.messagesThisMonth}</div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Este Mês</div>
        </div>
      </div>

      {/* Status da Conta */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Status da Conta</h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Tipo de Conta</span>
            <span className="text-green-600 font-bold">{getRoleName(user.role)}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Acesso completo a todos os modos</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Sem limites de uso</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Suporte técnico</span>
            </div>
          </div>
        </div>
      </div>

      {/* Limite de Uso */}
      {!usageCheck.canUse && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
          <div className="font-medium">Conta Suspensa</div>
          <div className="text-sm">{usageCheck.reason}</div>
        </div>
      )}

      {/* Funcionalidades Disponíveis */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Modos Disponíveis</h4>
        <div className="flex flex-wrap gap-2">
          {availableFeatures.map((feature) => (
            <span
              key={feature}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Informações da Conta */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Informações da Conta</h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Membro desde:</span>
            <span>{new Date(user.createdAt).toLocaleDateString('pt-PT')}</span>
          </div>
          <div className="flex justify-between">
            <span>Última atividade:</span>
            <span>{new Date(user.lastActive).toLocaleDateString('pt-PT')}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={user.status === 'active' ? 'text-green-600' : 'text-red-600'}>
              {user.status === 'active' ? 'Ativo' : 'Suspenso'}
            </span>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex space-x-3">
        <button
          onClick={onLogout}
          className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          Sair
        </button>
        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors">
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

export default UserProfile;