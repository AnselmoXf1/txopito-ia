#!/bin/bash

# Script para testar a API do Google Gemini usando curl
# Execute: bash test-gemini-curl.sh

echo "🧪 Testando API do Google Gemini com curl..."
echo "================================================"

# Chave API (substitua pela sua chave real)
API_KEY="AIzaSyCGGZkDEXCphASjXLRhLx5mWNQ32rN394c"

# URL da API
API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}"

# Dados do teste
JSON_DATA='{
  "contents": [{
    "parts": [{
      "text": "Diz apenas \"Olá, estou funcionando!\""
    }]
  }],
  "generationConfig": {
    "temperature": 0.1,
    "maxOutputTokens": 50
  }
}'

echo "🔑 Chave API: ${API_KEY:0:10}..."
echo "🌐 URL: $API_URL"
echo "📝 Enviando pedido..."
echo ""

# Fazer o pedido curl
response=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME_TOTAL:%{time_total}" \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA" \
  "$API_URL")

# Extrair código HTTP e tempo
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
time_total=$(echo "$response" | grep "TIME_TOTAL:" | cut -d: -f2)
json_response=$(echo "$response" | sed '/HTTP_CODE:/d' | sed '/TIME_TOTAL:/d')

echo "📊 RESULTADOS DO TESTE:"
echo "======================"
echo "⏱️  Tempo de resposta: ${time_total}s"
echo "🔢 Código HTTP: $http_code"
echo ""

# Analisar resultado
case $http_code in
  200)
    echo "✅ SUCESSO! A API está funcionando."
    echo ""
    echo "📄 Resposta da API:"
    echo "$json_response" | python3 -m json.tool 2>/dev/null || echo "$json_response"
    
    # Tentar extrair o texto da resposta
    text_response=$(echo "$json_response" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    text = data['candidates'][0]['content']['parts'][0]['text']
    print('🤖 Texto gerado:', text.strip())
except:
    print('❓ Não foi possível extrair o texto da resposta')
" 2>/dev/null)
    echo "$text_response"
    ;;
    
  400)
    echo "❌ ERRO 400: Pedido inválido"
    echo "💡 Possíveis causas:"
    echo "   - Formato JSON incorreto"
    echo "   - Parâmetros inválidos"
    echo "   - Modelo não suportado"
    echo ""
    echo "📄 Resposta de erro:"
    echo "$json_response" | python3 -m json.tool 2>/dev/null || echo "$json_response"
    ;;
    
  401)
    echo "❌ ERRO 401: Não autorizado"
    echo "💡 Possíveis causas:"
    echo "   - Chave API inválida ou expirada"
    echo "   - Chave não tem permissões necessárias"
    echo "   - Formato da chave incorreto"
    echo ""
    echo "🔧 Soluções:"
    echo "   1. Verifica se a chave está correta"
    echo "   2. Gera uma nova chave em https://aistudio.google.com/app/apikey"
    echo "   3. Confirma que a chave está ativa"
    ;;
    
  403)
    echo "❌ ERRO 403: Acesso negado"
    echo "💡 Possíveis causas:"
    echo "   - Restrições de IP ou domínio"
    echo "   - Chave sem permissões para este modelo"
    echo "   - Política de uso violada"
    ;;
    
  429)
    echo "❌ ERRO 429: Muitos pedidos"
    echo "💡 Possíveis causas:"
    echo "   - Quota de pedidos excedida"
    echo "   - Rate limit atingido"
    echo "   - Limite de tokens excedido"
    echo ""
    echo "🔧 Soluções:"
    echo "   1. Aguarda alguns minutos e tenta novamente"
    echo "   2. Verifica os limites da tua conta"
    echo "   3. Considera usar múltiplas chaves"
    ;;
    
  500|502|503)
    echo "❌ ERRO $http_code: Problema no servidor"
    echo "💡 Causa: Erro interno do Google"
    echo "🔧 Solução: Aguarda e tenta novamente"
    ;;
    
  *)
    echo "❌ ERRO $http_code: Código desconhecido"
    echo "📄 Resposta completa:"
    echo "$json_response"
    ;;
esac

echo ""
echo "🔗 Links úteis:"
echo "   - Google AI Studio: https://aistudio.google.com/"
echo "   - Documentação: https://ai.google.dev/docs"
echo "   - Gerar chave: https://aistudio.google.com/app/apikey"
echo ""
echo "💡 Para usar uma chave diferente, edita a variável API_KEY no script"