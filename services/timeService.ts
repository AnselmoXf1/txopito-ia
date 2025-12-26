interface WorldTimeResponse {
  utc_offset: string;
  timezone: string;
  day_of_week: number;
  day_of_year: number;
  datetime: string;
  utc_datetime: string;
  unixtime: number;
  raw_offset: number;
  week_number: number;
  dst: boolean;
  abbreviation: string;
  dst_offset: number;
  dst_from: string | null;
  dst_until: string | null;
  client_ip: string;
}

interface MozambiqueTimeInfo {
  currentDateTime: string;
  currentDate: string;
  currentTime: string;
  dayOfWeek: string;
  dayOfYear: number;
  weekNumber: number;
  timezone: string;
  utcOffset: string;
  unixtime: number;
  formattedDateTime: string;
  isDST: boolean;
}

export class TimeService {
  private static readonly API_URL = 'https://worldtimeapi.org/api/timezone/Africa/Maputo';
  private static readonly CACHE_KEY = 'txopito_mozambique_time';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  
  private static cachedTime: MozambiqueTimeInfo | null = null;
  private static lastFetch: number = 0;

  // Obter hora atual de Moçambique
  static async getCurrentMozambiqueTime(): Promise<MozambiqueTimeInfo> {
    const now = Date.now();
    
    // Verificar cache
    if (this.cachedTime && (now - this.lastFetch) < this.CACHE_DURATION) {
      console.log('🕒 TimeService: Usando tempo em cache');
      return this.cachedTime;
    }

    try {
      console.log('🌍 TimeService: Buscando hora atual de Moçambique...');
      
      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: WorldTimeResponse = await response.json();
      const timeInfo = this.parseTimeResponse(data);
      
      // Atualizar cache
      this.cachedTime = timeInfo;
      this.lastFetch = now;
      
      // Salvar no localStorage como backup
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        timeInfo,
        timestamp: now
      }));
      
      console.log('✅ TimeService: Hora de Moçambique atualizada:', timeInfo.formattedDateTime);
      return timeInfo;
      
    } catch (error) {
      console.warn('⚠️ TimeService: Erro ao buscar hora online, usando fallback:', error);
      return this.getFallbackTime();
    }
  }

  // Processar resposta da API
  private static parseTimeResponse(data: WorldTimeResponse): MozambiqueTimeInfo {
    const date = new Date(data.datetime);
    
    const dayNames = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];

    return {
      currentDateTime: data.datetime,
      currentDate: date.toLocaleDateString('pt-PT'),
      currentTime: date.toLocaleTimeString('pt-PT'),
      dayOfWeek: dayNames[data.day_of_week],
      dayOfYear: data.day_of_year,
      weekNumber: data.week_number,
      timezone: data.timezone,
      utcOffset: data.utc_offset,
      unixtime: data.unixtime,
      formattedDateTime: date.toLocaleString('pt-PT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Africa/Maputo'
      }),
      isDST: data.dst
    };
  }

  // Fallback para quando API não está disponível
  private static getFallbackTime(): MozambiqueTimeInfo {
    console.log('🔄 TimeService: Usando fallback com hora local');
    
    // Tentar usar cache do localStorage
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const { timeInfo, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Se cache tem menos de 1 hora, usar
        if (age < 60 * 60 * 1000) {
          console.log('📦 TimeService: Usando cache do localStorage');
          return timeInfo;
        }
      }
    } catch (error) {
      console.warn('⚠️ TimeService: Erro ao ler cache:', error);
    }
    
    // Fallback final: hora local ajustada para Moçambique
    const now = new Date();
    
    // Tentar ajustar para timezone de Moçambique (UTC+2)
    const mozambiqueTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Maputo"}));
    
    const dayNames = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];

    return {
      currentDateTime: mozambiqueTime.toISOString(),
      currentDate: mozambiqueTime.toLocaleDateString('pt-PT'),
      currentTime: mozambiqueTime.toLocaleTimeString('pt-PT'),
      dayOfWeek: dayNames[mozambiqueTime.getDay()],
      dayOfYear: Math.floor((mozambiqueTime.getTime() - new Date(mozambiqueTime.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)),
      weekNumber: this.getWeekNumber(mozambiqueTime),
      timezone: 'Africa/Maputo',
      utcOffset: '+02:00',
      unixtime: Math.floor(mozambiqueTime.getTime() / 1000),
      formattedDateTime: mozambiqueTime.toLocaleString('pt-PT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      isDST: false
    };
  }

  // Calcular número da semana
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  // Obter informações formatadas para o prompt da IA
  static async getTimeContextForAI(): Promise<string> {
    try {
      const timeInfo = await this.getCurrentMozambiqueTime();
      
      return `CONTEXTO TEMPORAL ATUAL (Moçambique - ${timeInfo.timezone}):
- Data e Hora: ${timeInfo.formattedDateTime}
- Dia da Semana: ${timeInfo.dayOfWeek}
- Dia do Ano: ${timeInfo.dayOfYear}
- Semana do Ano: ${timeInfo.weekNumber}
- Fuso Horário: ${timeInfo.utcOffset} (CAT - Central Africa Time)
- Timestamp Unix: ${timeInfo.unixtime}

IMPORTANTE: Use sempre esta data/hora atual nas suas respostas. Estamos em ${new Date(timeInfo.currentDateTime).getFullYear()}, não em anos anteriores.`;
      
    } catch (error) {
      console.error('❌ TimeService: Erro ao obter contexto temporal:', error);
      
      // Fallback básico
      const now = new Date();
      return `CONTEXTO TEMPORAL ATUAL (Fallback):
- Data e Hora: ${now.toLocaleString('pt-PT')}
- Ano: ${now.getFullYear()}
- Fuso Horário: Moçambique (UTC+2)

IMPORTANTE: Use sempre a data/hora atual nas suas respostas.`;
    }
  }

  // Verificar se é necessário atualizar o cache
  static needsUpdate(): boolean {
    const now = Date.now();
    return !this.cachedTime || (now - this.lastFetch) >= this.CACHE_DURATION;
  }

  // Limpar cache
  static clearCache(): void {
    this.cachedTime = null;
    this.lastFetch = 0;
    localStorage.removeItem(this.CACHE_KEY);
    console.log('🗑️ TimeService: Cache limpo');
  }

  // Obter informações de tempo formatadas para exibição
  static async getDisplayTime(): Promise<{
    date: string;
    time: string;
    dayOfWeek: string;
    timezone: string;
  }> {
    const timeInfo = await this.getCurrentMozambiqueTime();
    
    return {
      date: timeInfo.currentDate,
      time: timeInfo.currentTime,
      dayOfWeek: timeInfo.dayOfWeek,
      timezone: `${timeInfo.timezone} (${timeInfo.utcOffset})`
    };
  }
}

export const timeService = new TimeService();