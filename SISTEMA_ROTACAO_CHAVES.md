# 🔄 Sistema de Rotação Automática de Chaves API

## Visão Geral

O Txopito IA implementa um sistema avançado de rotação automática de chaves API do Google Gemini que garante alta disponibilidade e gestão inteligente de quotas.

## 🚀 Funcionalidades Principais

### ✅ Rotação Automática
- **Detecção de Quota**: Quando uma chave excede a quota, o sistema automaticamente muda para a próxima
- **Remoção Inteligente**: Chaves inválidas são removidas automaticamente após múltiplos erros
- **Priorização**: Sistema prioriza chaves com menos uso e melhor performance
- **Fallback**: Se todas as chaves falharem, o sistema tenta recuperar automaticamente

### 📊 Monitorização em Tempo Real
- **Dashboard Administrativo**: Interface completa para gestão de chaves
- **Estatísticas Detalhadas**: Acompanha uso, erros e performance de cada chave
- **Eventos de Rotação**: Log completo de todas as rotações e eventos
- **Notificações**: Alertas automáticos quando há problemas com as chaves

### 🔧 Gestão Avançada
- **Teste Automático**: Verifica periodicamente a saúde das chaves
- **Backup e Recuperação**: Sistema mantém histórico e permite recuperação
- **Limpeza Automática**: Remove chaves inválidas e eventos antigos
- **API de Gestão**: Interface programática para adicionar/remover chaves

## 🏗️ Arquitetura do Sistema

### Componentes Principais

1. **ApiKeyManager** (`services/apiKeyManager.ts`)
   - Gestão central de todas as chaves API
   - Rotação automática e detecção de problemas
   - Persistência no localStorage
   - Testes de conectividade

2. **KeyRotationService** (`services/keyRotationService.ts`)
   - Monitorização contínua das chaves
   - Sistema de eventos e notificações
   - Estatísticas e relatórios
   - Integração com notificações do browser

3. **GeminiService** (`services/geminiService.ts`)
   - Integração com API do Google Gemini
   - Retry automático com rotação de chaves
   - Tratamento inteligente de erros
   - Streaming e fallback

4. **AdminDashboard** (`components/AdminDashboard.tsx`)
   - Interface administrativa completa
   - Gestão visual de chaves
   - Monitorização em tempo real
   - Controles de teste e manutenção

## 📱 Como Usar

### Para Administradores

1. **Acesso ao Dashboard**
   ```
   URL: /admin ou #admin
   Credenciais: admin / TxopitoAdmin2024!
   Chave Secreta: anselmo_bistiro_admin
   ```

2. **Adicionar Novas Chaves**
   - Aceda ao dashboard administrativo
   - Use o formulário "Adicionar Nova Chave API"
   - Insira nome descritivo e chave do Gemini
   - O sistema testará automaticamente a chave

3. **Monitorizar Status**
   - Veja estatísticas em tempo real
   - Acompanhe eventos de rotação
   - Receba notificações de problemas
   - Teste chaves individualmente

### Para Utilizadores

1. **Monitor de Chaves**
   - Ícone de status visível na interface
   - Clique para ver detalhes das chaves
   - Indicadores de saúde do sistema

2. **Notificações Automáticas**
   - Alertas quando poucas chaves ativas
   - Notificação de rotações automáticas
   - Avisos de problemas críticos

## 🔧 Configuração Técnica

### Variáveis de Ambiente
```env
VITE_GEMINI_API_KEY=sua_chave_principal_aqui
```

### Estrutura de Dados
```typescript
interface ApiKeyInfo {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  quotaExceeded: boolean;
  lastUsed: Date | null;
  requestCount: number;
  errorCount: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Eventos de Rotação
```typescript
interface RotationEvent {
  type: 'rotation' | 'quota_exceeded' | 'key_failed' | 'key_added' | 'key_removed';
  keyId: string;
  keyName: string;
  timestamp: Date;
  details?: string;
}
```

## 🚨 Tratamento de Erros

### Tipos de Erro Detectados
- **Quota Excedida** (429): Rotação automática para próxima chave
- **Chave Inválida** (401): Marca chave como inválida e roda
- **Rate Limit**: Aguarda e tenta novamente
- **Erro de Rede**: Retry com backoff exponencial
- **Modelo Não Encontrado**: Erro crítico reportado

### Estratégias de Recuperação
1. **Rotação Imediata**: Para erros de quota/auth
2. **Retry com Delay**: Para erros temporários
3. **Fallback**: Tenta todas as chaves disponíveis
4. **Notificação**: Alerta administrador se todas falharem

## 📈 Monitorização e Métricas

### Métricas Coletadas
- Total de chaves configuradas
- Chaves ativas vs inativas
- Número de rotações por período
- Taxa de erro por chave
- Tempo de resposta médio
- Uso de quota por chave

### Alertas Configurados
- ⚠️ Menos de 2 chaves ativas
- 🔴 Nenhuma chave ativa
- 📊 Alta taxa de erro em chave específica
- 🔄 Rotações frequentes (possível problema)

## 🧪 Testes e Debugging

### Script de Teste
```javascript
// Execute no console do browser
fetch('/scripts/test-key-rotation.js')
  .then(r => r.text())
  .then(eval);
```

### Comandos de Debug
```javascript
// Ver status atual
console.table(apiKeyManager.getStats());

// Ver eventos recentes
console.table(keyRotationService.getRecentEvents());

// Forçar rotação
apiKeyManager.rotateToNextKey();

// Limpar dados de teste
window.cleanupTestData();
```

## 🔒 Segurança

### Proteções Implementadas
- Chaves mascaradas na interface (apenas primeiros/últimos 4 caracteres)
- Acesso administrativo protegido por autenticação
- Logs não contêm chaves completas
- Limpeza automática de dados sensíveis

### Boas Práticas
- Use nomes descritivos para chaves
- Monitore regularmente o dashboard
- Mantenha pelo menos 3-5 chaves ativas
- Remova chaves antigas/não utilizadas
- Configure notificações do browser

## 🚀 Melhorias Futuras

### Roadmap
- [ ] Integração com backend para sincronização
- [ ] Métricas avançadas e dashboards
- [ ] Alertas por email/SMS
- [ ] Rotação baseada em horários
- [ ] Integração com outros provedores de IA
- [ ] API REST para gestão externa
- [ ] Backup automático de configurações

### Contribuições
Para contribuir com melhorias:
1. Fork o repositório
2. Crie branch para feature
3. Implemente testes
4. Submeta pull request

## 📞 Suporte

Para problemas ou dúvidas:
- **Desenvolvedor**: Anselmo Dora Bistiro Gulane
- **Email**: [seu-email]
- **GitHub**: [seu-github]

---

**Nota**: Este sistema foi desenvolvido especificamente para o Txopito IA e pode ser adaptado para outras aplicações que usem APIs com limites de quota.