// Serviço para comunicação com o backend
export interface BackendConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: string[];
}

export interface SyncResult {
  serverConversations: any[];
  conflictsResolved: any[];
  newConversations: any[];
  updatedConversations: any[];
  deletedConversations: any[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'creator' | 'admin';
  preferences: {
    language: 'Portuguese' | 'Simple Portuguese';
    responseLength: 'short' | 'detailed';
    theme: 'light' | 'dark';
    favoriteMode: string;
    notifications: boolean;
    aiPersonality: 'formal' | 'casual' | 'technical';
  };
  usage: {
    totalMessages: number;
    messagesThisMonth: number;
    favoriteTopics: string[];
    timeSpent: number;
  };
  status: 'active' | 'suspended' | 'pending';
  devices: Array<{
    deviceId: string;
    deviceName: string;
    lastSync: string;
    isActive: boolean;
  }>;
  lastActive: string;
  createdAt: string;
}

class BackendService {
  private config: BackendConfig;
  private token: string | null = null;
  private deviceId: string;

  constructor(config?: Partial<BackendConfig>) {
    this.config = {
      baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
      timeout: 30000,
      retries: 3,
      ...config
    };
    
    // Gerar ou recuperar device ID único
    this.deviceId = this.getOrCreateDeviceId();
    
    // Recuperar token do localStorage
    this.token = localStorage.getItem('txopito_backend_token');
    
    console.log('🔧 Backend Service inicializado:', {
      baseURL: this.config.baseURL,
      deviceId: this.deviceId,
      hasToken: !!this.token
    });
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('txopito_device_id');
    
    if (!deviceId) {
      // Gerar ID único baseado em características do dispositivo
      const userAgent = navigator.userAgent;
      const screen = `${window.screen.width}x${window.screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timestamp = Date.now();
      
      deviceId = btoa(`${userAgent}-${screen}-${timezone}-${timestamp}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
      localStorage.setItem('txopito_device_id', deviceId);
    }
    
    return deviceId;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    const requestOptions: RequestInit = {
      ...options,
      headers,
      timeout: this.config.timeout
    };
    
    let lastError: Error;
    
    // Retry logic
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        console.log(`🌐 API Request (tentativa ${attempt}):`, {
          method: options.method || 'GET',
          url,
          hasAuth: !!this.token
        });
        
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        console.log('✅ API Response:', data);
        return data;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Tentativa ${attempt} falhou:`, error);
        
        // Se for erro de autenticação, não tentar novamente
        if (error instanceof Error && error.message.includes('401')) {
          this.clearAuth();
          throw error;
        }
        
        // Aguardar antes da próxima tentativa
        if (attempt < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError!;
  }

  // Autenticação
  async register(name: string, email: string, password: string): Promise<ApiResponse<{ token?: string; user?: UserProfile; requiresEmailVerification?: boolean; email?: string; userId?: string }>> {
    const response = await this.makeRequest<{ token?: string; user?: UserProfile; requiresEmailVerification?: boolean; email?: string; userId?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    
    if (response.success && response.data?.token) {
      this.setAuth(response.data.token);
      await this.registerDevice();
    }
    
    return response;
  }

  async verifyEmail(email: string, code: string): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
    const response = await this.makeRequest<{ token: string; user: UserProfile }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
    
    if (response.success && response.data) {
      this.setAuth(response.data.token);
      await this.registerDevice();
    }
    
    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse<{ token?: string; user?: UserProfile; requiresTwoFactor?: boolean; requiresEmailVerification?: boolean; email?: string; userId?: string }>> {
    const response = await this.makeRequest<{ token?: string; user?: UserProfile; requiresTwoFactor?: boolean; requiresEmailVerification?: boolean; email?: string; userId?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success && response.data?.token) {
      this.setAuth(response.data.token);
      await this.registerDevice();
    }
    
    return response;
  }

  async verify2FA(email: string, code: string): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
    const response = await this.makeRequest<{ token: string; user: UserProfile }>('/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
    
    if (response.success && response.data) {
      this.setAuth(response.data.token);
      await this.registerDevice();
    }
    
    return response;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // OTP Management
  async sendOTP(email: string, type: 'email_verification' | 'password_reset' | 'login_verification'): Promise<ApiResponse<{ email: string; type: string; expiresAt: string; timeRemaining: number }>> {
    return this.makeRequest<{ email: string; type: string; expiresAt: string; timeRemaining: number }>('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email, type })
    });
  }

  async verifyOTP(email: string, code: string, type: 'email_verification' | 'password_reset' | 'login_verification'): Promise<ApiResponse<{ resetToken?: string }>> {
    return this.makeRequest<{ resetToken?: string }>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code, type })
    });
  }

  async resendOTP(email: string, type: 'email_verification' | 'password_reset' | 'login_verification'): Promise<ApiResponse> {
    return this.makeRequest('/otp/resend', {
      method: 'POST',
      body: JSON.stringify({ email, type })
    });
  }

  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<ApiResponse> {
    return this.makeRequest('/otp/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetToken, newPassword })
    });
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Erro no logout:', error);
    } finally {
      this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest<UserProfile>('/auth/me');
  }

  private setAuth(token: string): void {
    this.token = token;
    localStorage.setItem('txopito_backend_token', token);
  }

  private clearAuth(): void {
    this.token = null;
    localStorage.removeItem('txopito_backend_token');
  }

  // Gestão de dispositivos
  async registerDevice(): Promise<ApiResponse> {
    const deviceName = this.getDeviceName();
    
    return this.makeRequest('/sync/device/register', {
      method: 'POST',
      body: JSON.stringify({
        deviceId: this.deviceId,
        deviceName,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      })
    });
  }

  private getDeviceName(): string {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Mobile')) {
      return `Mobile (${platform})`;
    } else if (userAgent.includes('Tablet')) {
      return `Tablet (${platform})`;
    } else {
      return `Desktop (${platform})`;
    }
  }

  // Sincronização de conversas
  async syncConversations(localConversations: any[]): Promise<ApiResponse<SyncResult>> {
    return this.makeRequest<SyncResult>('/sync/conversations', {
      method: 'POST',
      body: JSON.stringify({
        deviceId: this.deviceId,
        conversations: localConversations
      })
    });
  }

  async incrementalSync(since: string): Promise<ApiResponse<{ conversations: any[]; timestamp: string; count: number }>> {
    return this.makeRequest(`/sync/conversations/incremental?deviceId=${this.deviceId}&since=${since}`);
  }

  async getSyncStats(): Promise<ApiResponse<any>> {
    return this.makeRequest('/sync/stats');
  }

  // Gestão de conversas
  async getConversations(options: {
    archived?: boolean;
    mode?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<{ conversations: any[]; count: number }>> {
    const params = new URLSearchParams();
    
    if (options.archived !== undefined) params.set('archived', options.archived.toString());
    if (options.mode) params.set('mode', options.mode);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());
    
    return this.makeRequest(`/conversations?${params.toString()}`);
  }

  async createConversation(conversation: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify(conversation)
    });
  }

  async updateConversation(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteConversation(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/conversations/${id}`, {
      method: 'DELETE'
    });
  }

  async addMessage(conversationId: string, message: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  // Gestão de perfil
  async updateProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async getUsage(): Promise<ApiResponse<any>> {
    return this.makeRequest('/users/usage');
  }

  async incrementUsage(mode: string): Promise<ApiResponse> {
    return this.makeRequest('/users/usage/increment', {
      method: 'POST',
      body: JSON.stringify({ mode })
    });
  }

  async updateActivity(): Promise<ApiResponse> {
    return this.makeRequest('/users/activity', {
      method: 'POST'
    });
  }

  // Verificar conectividade
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL.replace('/api', '')}/api/health`);
      const data = await response.json();
      return data.status === 'OK';
    } catch (error) {
      console.warn('Backend não disponível:', error);
      return false;
    }
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Obter device ID
  getDeviceId(): string {
    return this.deviceId;
  }

  // Configurar URL do backend
  setBaseURL(url: string): void {
    this.config.baseURL = url;
  }
}

// Instância singleton
export const backendService = new BackendService();

// Hook para usar no React
export const useBackend = () => {
  return backendService;
};

export default BackendService;