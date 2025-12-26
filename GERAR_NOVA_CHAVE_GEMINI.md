# 🔑 GERAR NOVA CHAVE DO GEMINI - URGENTE

## ⚠️ SITUAÇÃO ATUAL
Todas as chaves API do Gemini foram **comprometidas** e reportadas como "leaked" pelo Google.

**Erro recebido:**
```
[403 Forbidden] Your API key was reported as leaked. Please use another API key.
```

## 🚨 AÇÃO NECESSÁRIA
Precisas de gerar uma **nova chave API** imediatamente.

## 📋 PASSOS PARA GERAR NOVA CHAVE

### 1. Aceder ao Google AI Studio
🔗 **Link:** https://aistudio.google.com/app/apikey

### 2. Fazer Login
- Usa a tua conta Google
- Aceita os termos de serviço se necessário

### 3. Criar Nova Chave API
1. Clica em **"Create API Key"**
2. Seleciona um projeto existente ou cria novo
3. Copia a chave gerada (formato: `AIzaSy...`)

### 4. Atualizar o Sistema
Substitui a chave no arquivo `.env.local`:

```bash
# CHAVE PRINCIPAL (NOVA - DEZEMBRO 2025)
VITE_GEMINI_API_KEY=SUA_NOVA_CHAVE_AQUI
```

### 5. Testar a Nova Chave
```bash
node test-single-key.js
```

## ✅ SISTEMA SIMPLIFICADO CONFIGURADO

O sistema foi **simplificado** para usar apenas **uma chave única**:

- ❌ **Removido:** Sistema de rotação automática com 4 chaves
- ✅ **Implementado:** Sistema simples com 1 chave
- ✅ **Benefícios:** Menos complexidade, mais fácil de gerir

## 🔧 ALTERAÇÕES FEITAS

### 1. ApiKeyManager Simplificado
- Remove chaves de backup automáticas
- Usa apenas a chave do `.env.local`
- Sem rotação automática

### 2. GeminiService Simplificado  
- Apenas 1 tentativa por requisição
- Erros diretos sem rotação
- Mensagens de erro mais claras

### 3. Configuração Limpa
- `.env.local` com apenas 1 chave
- Comentários atualizados
- Sistema mais direto

## 🎯 PRÓXIMOS PASSOS

1. **Gera nova chave** no link acima
2. **Substitui** no `.env.local`
3. **Testa** com `node test-single-key.js`
4. **Inicia** a aplicação normalmente

## 💡 DICAS DE SEGURANÇA

- **Nunca** partilhes a chave API publicamente
- **Não** commits a chave para repositórios públicos
- **Usa** variáveis de ambiente sempre
- **Regenera** chaves periodicamente

## 🚀 DEPOIS DE CONFIGURAR

O sistema estará pronto com:
- ✅ Chave única funcionando
- ✅ Sistema simplificado
- ✅ Menos pontos de falha
- ✅ Mais fácil de manter

---

**Status:** 🔴 **URGENTE - CHAVES COMPROMETIDAS**  
**Ação:** Gerar nova chave imediatamente  
**Tempo estimado:** 5 minutos