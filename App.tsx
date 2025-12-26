
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import WelcomeScreen from './components/WelcomeScreen';
import ModeSelector from './components/ModeSelector';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import AdvancedSettingsModal from './components/AdvancedSettingsModal';
import AuthScreen from './components/AuthScreen';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import Sidebar from './components/Sidebar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import SyncStatus from './components/SyncStatus';
import ApiKeyMonitor from './components/ApiKeyMonitor';
import { AppMode, Settings, User, Conversation } from './types';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { UserService, UserProfile as UserProfileType } from './services/userService';
import { AdminService } from './services/adminService';
import { backendService } from './services/backendService';
import { syncManager } from './services/syncManager';
import { secretUrlService } from './services/secretUrlService';
import SettingsService from './services/settingsService';
import SecurityWarning from './components/SecurityWarning';
import { ChatIcon, StudentIcon, HistoryIcon } from './components/Icons';

type Screen = 'welcome' | 'auth' | 'app' | 'admin-login' | 'admin-dashboard';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [backendEnabled, setBackendEnabled] = useState(false);
  const [settings, setSettings] = useState<Settings>(SettingsService.loadSettings());

  useEffect(() => {
    // Verificar se backend está habilitado
    const backendEnabledEnv = import.meta.env.VITE_BACKEND_ENABLED === 'true';
    setBackendEnabled(backendEnabledEnv);
    
    // Migrar configurações antigas se necessário
    SettingsService.migrateOldSettings();
    
    // Aplicar configurações carregadas
    SettingsService.applyAllSettings(settings);
    
    if (backendEnabledEnv) {
      console.log('🌐 Backend habilitado - modo híbrido ativo');
      initializeWithBackend();
    } else {
      console.log('💾 Modo offline - usando apenas localStorage');
      initializeOfflineMode();
    }
  }, []);

  const initializeWithBackend = async () => {
    try {
      // Verificar se há token de autenticação do backend
      if (backendService.isAuthenticated()) {
        const response = await backendService.getCurrentUser();
        
        if (response.success && response.data) {
          setUserFromBackend(response.data);
          await syncManager.onUserLogin();
          setCurrentScreen('app');
          return;
        } else {
          // Token inválido, limpar
          await backendService.logout();
        }
      }
      
      // Fallback para modo offline
      initializeOfflineMode();
      
    } catch (error) {
      console.warn('⚠️ Erro ao conectar com backend, usando modo offline:', error);
      initializeOfflineMode();
    }
  };

  const initializeOfflineMode = () => {
    // Verificar e bloquear acessos diretos ao admin
    if (secretUrlService.redirectIfInvalidAccess()) {
      setCurrentScreen('welcome');
      return;
    }
    
    // Verificar URL secreta para acesso ao admin
    const currentPath = window.location.pathname;
    const secretUrl = secretUrlService.getCurrentSecretUrl();
    
    if (secretUrl && currentPath === secretUrl) {
      if (AdminService.isAdminLoggedIn()) {
        setCurrentScreen('admin-dashboard');
      } else {
        setCurrentScreen('admin-login');
      }
      return;
    }
    
    // Verificar se há sessão admin ativa (mas sem URL secreta válida)
    if (AdminService.isAdminLoggedIn() && !secretUrl) {
      // Logout automático se não há URL secreta válida
      AdminService.logoutAdmin();
      setCurrentScreen('welcome');
      window.history.replaceState({}, '', '/');
      return;
    }
    
    // Verificar utilizador logado (sistema local)
    const savedUserProfile = UserService.getCurrentUser();
    if (savedUserProfile) {
      setUserProfile(savedUserProfile);
      const legacyUser: User = {
        id: savedUserProfile.id,
        name: savedUserProfile.name,
        email: savedUserProfile.email
      };
      setUser(legacyUser);
      setSettings({
        ...settings,
        ...savedUserProfile.preferences
      });
      setConversations(storageService.getConversations(savedUserProfile.id));
      setCurrentScreen('app');
    } else {
      // Verificar sistema antigo
      const savedUser = authService.getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
        setConversations(storageService.getConversations(savedUser.id));
        setCurrentScreen('app');
      }
    }
  };

  const setUserFromBackend = (backendUser: any) => {
    // Converter dados do backend para formato local
    const userProfile: UserProfileType = {
      id: backendUser.id || backendUser._id,
      name: backendUser.name,
      email: backendUser.email,
      role: backendUser.role,
      preferences: backendUser.preferences,
      createdAt: backendUser.createdAt,
      lastActive: backendUser.lastActive,
      usage: backendUser.usage,
      status: backendUser.status
    };
    
    setUserProfile(userProfile);
    
    const legacyUser: User = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email
    };
    setUser(legacyUser);
    
    setSettings({
      ...settings,
      ...userProfile.preferences
    });
    
    // Carregar conversas (serão sincronizadas automaticamente)
    setConversations(storageService.getConversations(userProfile.id));
  };

  // Listener para mudanças na URL (botão voltar do browser)
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const secretUrl = secretUrlService.getCurrentSecretUrl();
      
      // Verificar se é tentativa de acesso direto bloqueado
      if (secretUrlService.redirectIfInvalidAccess()) {
        setCurrentScreen('welcome');
        return;
      }
      
      // Verificar URL secreta
      if (secretUrl && currentPath === secretUrl) {
        if (AdminService.isAdminLoggedIn()) {
          setCurrentScreen('admin-dashboard');
        } else {
          setCurrentScreen('admin-login');
        }
      } else {
        // Se não estiver na URL admin, voltar para tela inicial
        if (currentScreen === 'admin-login' || currentScreen === 'admin-dashboard') {
          setCurrentScreen('welcome');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen]);

  useEffect(() => {
    // Aplicar configurações de tema sempre que mudarem
    SettingsService.applyAllSettings(settings);
  }, [settings]);

  const handleUpdateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    SettingsService.applyAllSettings(newSettings);
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setConversations(storageService.getConversations(authenticatedUser.id));
    setCurrentScreen('app');
  };

  const handleUserLogin = async (profile: UserProfileType) => {
    if (backendEnabled) {
      // Tentar fazer login no backend
      try {
        const response = await backendService.login(profile.email, 'temp_password');
        
        if (response.success && response.data) {
          setUserFromBackend(response.data.user);
          await syncManager.onUserLogin();
          setCurrentScreen('app');
          setIsAuthModalOpen(false);
          return;
        }
      } catch (error) {
        console.warn('⚠️ Login no backend falhou, usando modo offline:', error);
      }
    }
    
    // Fallback para modo offline
    setUserProfile(profile);
    const legacyUser: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email
    };
    setUser(legacyUser);
    setSettings({
      ...settings,
      ...profile.preferences
    });
    SettingsService.applyAllSettings({
      ...settings,
      ...profile.preferences
    });
    setConversations(storageService.getConversations(profile.id));
    setCurrentScreen('app');
    setIsAuthModalOpen(false);
  };

  const handleUserLogout = async () => {
    if (backendEnabled && backendService.isAuthenticated()) {
      try {
        await backendService.logout();
        await syncManager.onUserLogout();
      } catch (error) {
        console.warn('⚠️ Erro no logout do backend:', error);
      }
    }
    
    UserService.logoutUser();
    authService.logout();
    setUserProfile(null);
    setUser(null);
    setConversations([]);
    setActiveConvId(null);
    setCurrentScreen('welcome');
    setIsProfileOpen(false);
  };

  const handleUpdateUserProfile = (updatedProfile: UserProfileType) => {
    UserService.updateUser(updatedProfile);
    setUserProfile(updatedProfile);
    const newSettings = {
      ...settings,
      ...updatedProfile.preferences
    };
    setSettings(newSettings);
    SettingsService.applyAllSettings(newSettings);
  };

  const handleNewChat = () => {
    // Verificar limites se for utilizador com perfil
    if (userProfile) {
      const usageCheck = UserService.checkUsageLimits(userProfile);
      if (!usageCheck.canUse) {
        alert(usageCheck.reason);
        return;
      }
    }
    
    // Criar nova conversa diretamente no modo Conversa Geral
    if (user) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        userId: user.id,
        title: 'Nova conversa',
        mode: AppMode.GENERAL,
        messages: [],
        lastUpdate: Date.now()
      };
      storageService.saveConversation(newConv);
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setShowModeSelector(false);
    }
  };

  const handleNewChatWithModeSelector = () => {
    // Verificar limites se for utilizador com perfil
    if (userProfile) {
      const usageCheck = UserService.checkUsageLimits(userProfile);
      if (!usageCheck.canUse) {
        alert(usageCheck.reason);
        return;
      }
    }
    
    setActiveConvId(null);
    setShowModeSelector(true);
  };

  const handleSelectMode = (mode: AppMode) => {
    if (!user) return;
    
    const newConv: Conversation = {
      id: Date.now().toString(),
      userId: user.id,
      title: `Novo chat de ${mode.split(' ')[0]}`,
      mode: mode,
      messages: [],
      lastUpdate: Date.now()
    };
    storageService.saveConversation(newConv);
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setShowModeSelector(false);
  };

  const handleDeleteChat = (id: string) => {
    storageService.deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) setActiveConvId(null);
  };

  const handleUpdateConversation = async (conv: Conversation) => {
    // Incrementar estatísticas de uso quando uma nova mensagem é adicionada
    if (userProfile && conv.messages.length > 0) {
      const lastMessage = conv.messages[conv.messages.length - 1];
      if (lastMessage.role === 'user') {
        UserService.incrementUsage(userProfile.id, conv.mode);
        
        // Incrementar no backend se disponível
        if (backendEnabled && backendService.isAuthenticated()) {
          try {
            await backendService.incrementUsage(conv.mode);
          } catch (error) {
            console.warn('⚠️ Erro ao incrementar uso no backend:', error);
          }
        }
        
        // Atualizar perfil local
        const updatedProfile = UserService.getCurrentUser();
        if (updatedProfile) {
          setUserProfile(updatedProfile);
        }
      }
    }
    
    // Salvar localmente
    storageService.saveConversation(conv);
    setConversations(prev => prev.map(c => c.id === conv.id ? conv : c));
    
    // Sincronizar com backend se disponível
    if (backendEnabled && backendService.isAuthenticated()) {
      try {
        await syncManager.syncConversation(conv);
      } catch (error) {
        console.warn('⚠️ Erro ao sincronizar conversa:', error);
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setConversations([]);
    setActiveConvId(null);
    setCurrentScreen('welcome');
    setIsSettingsOpen(false);
  };

  const handleAdminLogin = () => {
    setCurrentScreen('admin-dashboard');
    // Manter a URL secreta atual
    const secretUrl = secretUrlService.getCurrentSecretUrl();
    if (secretUrl) {
      window.history.pushState({}, '', secretUrl);
    }
  };

  const handleAdminLogout = () => {
    AdminService.logoutAdmin();
    secretUrlService.clearSecretUrl();
    setCurrentScreen('welcome');
    // Voltar para URL raiz
    window.history.pushState({}, '', '/');
  };

  const handleSecretAdminAccess = () => {
    console.log('🎯 handleSecretAdminAccess: Iniciando acesso secreto...');
    
    // Gerar nova URL secreta e navegar para ela
    const secretUrl = secretUrlService.generateSecretUrl();
    console.log('🎯 handleSecretAdminAccess: URL gerada =', secretUrl);
    
    window.history.pushState({}, '', secretUrl);
    console.log('🎯 handleSecretAdminAccess: Navegando para URL secreta');
    
    if (AdminService.isAdminLoggedIn()) {
      console.log('🎯 handleSecretAdminAccess: Admin já logado, indo para dashboard');
      setCurrentScreen('admin-dashboard');
    } else {
      console.log('🎯 handleSecretAdminAccess: Admin não logado, indo para login');
      setCurrentScreen('admin-login');
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConvId);

  return (
    <Layout theme={settings.theme}>
      {/* Aviso de Segurança */}
      <SecurityWarning />
      
      {currentScreen === 'welcome' && (
        <WelcomeScreen 
          onStart={() => setCurrentScreen('auth')} 
          onLogin={() => setIsAuthModalOpen(true)}
          onAdminAccess={handleSecretAdminAccess}
        />
      )}
      
      {currentScreen === 'auth' && (
        <AuthScreen onAuthSuccess={handleAuthSuccess} onBack={() => setCurrentScreen('welcome')} />
      )}

      {currentScreen === 'admin-login' && (
        <AdminLogin 
          onAdminLogin={handleAdminLogin}
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'admin-dashboard' && (
        <AdminDashboard onLogout={handleAdminLogout} />
      )}

      {currentScreen === 'app' && user && (
        <div className="flex h-full w-full overflow-hidden bg-white dark:bg-gray-900">
          <Sidebar 
            user={user}
            conversations={conversations}
            activeId={activeConvId}
            onSelectConversation={(id) => { setActiveConvId(id); setShowModeSelector(false); }}
            onNewChat={handleNewChat}
            onNewChatWithModeSelector={handleNewChatWithModeSelector}
            onLogout={handleLogout}
            onDeleteChat={handleDeleteChat}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          
          <main className="flex-1 flex flex-col min-w-0 bg-gray-50/30 dark:bg-gray-900/30 relative">
            <header className="lg:hidden p-4 flex items-center justify-between border-b dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h1 className="font-bold dark:text-white">Txopito IA</h1>
              <div className="flex items-center space-x-2">
                {backendEnabled && <SyncStatus />}
                <ApiKeyMonitor className="hidden sm:block" />
                {userProfile && (
                  <button 
                    onClick={() => setIsProfileOpen(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                )}
                <button onClick={() => setIsAdvancedSettingsOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                  <svg className="w-6 h-6 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
              </div>
            </header>

            {(showModeSelector || conversations.length === 0) && !activeConvId ? (
              <div className="flex-1 flex flex-col p-6 animate-in fade-in duration-500 overflow-y-auto">
                <div className="max-w-2xl mx-auto w-full">
                  <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 p-2">
                      <img 
                        src="/logo.png" 
                        alt="Txopito IA" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback para SVG placeholder se logo.png não existir
                          e.currentTarget.src = '/logo-placeholder.svg';
                        }}
                      />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2">Como posso ajudar hoje?</h2>
                    <p className="text-gray-500 dark:text-gray-400">Pergunta sobre qualquer tema - estou atualizada com 2025!</p>
                  </div>
                  <ModeSelector onSelect={handleSelectMode} />
                </div>
              </div>
            ) : activeConversation ? (
              <ChatInterface 
                key={activeConversation.id}
                mode={activeConversation.mode} 
                settings={settings} 
                user={user}
                conversation={activeConversation}
                onUpdateConversation={handleUpdateConversation}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto">
                    <ChatIcon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      Como posso ajudar hoje?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Pergunta sobre qualquer tema - estou atualizada com 2025!
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full">
                    <button 
                      onClick={() => handleSelectMode(AppMode.GENERAL)}
                      className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <ChatIcon className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400">
                          Conversa geral
                        </span>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleSelectMode(AppMode.STUDENT)}
                      className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <StudentIcon className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                          Ajuda com estudos
                        </span>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleSelectMode(AppMode.HISTORY)}
                      className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <HistoryIcon className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-red-700 dark:group-hover:text-red-400">
                          História de Moçambique
                        </span>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleNewChatWithModeSelector()}
                      className="p-4 text-left bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-transparent rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        <span className="font-medium">
                          Ver todos os modos
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {isSettingsOpen && (
        <SettingsModal 
          settings={settings} 
          onUpdate={handleUpdateSettings} 
          onClose={() => setIsSettingsOpen(false)}
          onLogout={userProfile ? handleUserLogout : handleLogout}
          onAdvancedSettings={() => {
            setIsSettingsOpen(false);
            setIsAdvancedSettingsOpen(true);
          }}
        />
      )}

      {isAdvancedSettingsOpen && (
        <AdvancedSettingsModal 
          settings={settings} 
          onUpdate={handleUpdateSettings} 
          onClose={() => setIsAdvancedSettingsOpen(false)}
          onLogout={userProfile ? handleUserLogout : handleLogout}
        />
      )}

      {/* Modais do Sistema de Utilizadores */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserLogin={handleUserLogin}
      />

      {isProfileOpen && userProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Perfil</h2>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl"
              >
                ×
              </button>
            </div>
            <UserProfile 
              user={userProfile}
              onUpdateUser={handleUpdateUserProfile}
              onLogout={handleUserLogout}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
