import React from 'react';

interface AdminDashboardSimpleProps {
  onLogout: () => void;
}

const AdminDashboardSimple: React.FC<AdminDashboardSimpleProps> = ({ onLogout }) => {
  console.log('🎯 AdminDashboardSimple: Renderizando componente simples');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
            <p className="text-gray-400">Gestão Completa do Txopito IA</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
            >
              🚪 Sair do Admin
            </button>
          </div>
        </div>

        {/* Conteúdo de Teste */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Dashboard Funcionando!</h2>
          <p className="text-gray-300 mb-4">
            Se consegues ver esta mensagem, o dashboard administrativo está a funcionar corretamente.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-2xl font-bold text-green-400">Online</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Sistema</p>
                  <p className="text-2xl font-bold text-blue-400">Ativo</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Acesso</p>
                  <p className="text-2xl font-bold text-purple-400">Seguro</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Admin</p>
                  <p className="text-2xl font-bold text-orange-400">Logado</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
            <h4 className="text-green-300 font-medium mb-2">✅ Teste de Funcionalidade</h4>
            <p className="text-green-200 text-sm">
              O dashboard administrativo está funcionando corretamente. Podes agora implementar as funcionalidades completas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSimple;