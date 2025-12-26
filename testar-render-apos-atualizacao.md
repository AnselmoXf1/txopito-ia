# 🧪 TESTAR RENDER APÓS ATUALIZAÇÃO

## 📋 COMANDOS DE TESTE

### 1. Health Check (deve mostrar gemini: "configured")
```bash
curl https://txopito-backend.onrender.com/api/health
```

### 2. Teste Gemini (deve retornar success: true)
```bash
curl https://txopito-backend.onrender.com/api/gemini/test
```

### 3. Geração de Resposta (deve funcionar)
```bash
curl -X POST https://txopito-backend.onrender.com/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, como estás?"}'
```

## ✅ RESULTADOS ESPERADOS

### Health Check:
```json
{
  "status": "OK",
  "services": {
    "database": "connected",
    "backup": "inactive",
    "gemini": "configured"
  }
}
```

### Teste Gemini:
```json
{
  "success": true,
  "message": "Conexão com Gemini funcionando",
  "testResponse": "Teste"
}
```

### Geração:
```json
{
  "success": true,
  "response": "Olá! Como posso ajudar-te hoje?",
  "model": "gemini-2.5-flash"
}
```

## 🚨 SE AINDA DER ERRO

Se ainda mostrar "API key not valid", significa que:
1. A chave não foi salva corretamente no Render
2. O redeploy não aconteceu
3. Há cache no Render

**Solução:** Força um redeploy manual no dashboard do Render.