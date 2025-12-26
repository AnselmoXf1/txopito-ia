# Script PowerShell para testar a API do Google Gemini
# Execute: powershell -ExecutionPolicy Bypass -File test-gemini-curl.ps1

Write-Host "🧪 Testando API do Google Gemini com PowerShell..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Chave API (substitua pela sua chave real)
$API_KEY = "AIzaSyCGGZkDEXCphASjXLRhLx5mWNQ32rN394c"

# URL da API
$API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$API_KEY"

# Dados do teste
$JSON_DATA = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Diz apenas 'Olá, estou funcionando!'"
                }
            )
        }
    )
    generationConfig = @{
        temperature = 0.1
        maxOutputTokens = 50
    }
} | ConvertTo-Json -Depth 10

Write-Host "🔑 Chave API: $($API_KEY.Substring(0,10))..." -ForegroundColor Yellow
Write-Host "🌐 URL: $API_URL" -ForegroundColor Yellow
Write-Host "📝 Enviando pedido..." -ForegroundColor Yellow
Write-Host ""

try {
    # Fazer o pedido
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $response = Invoke-RestMethod -Uri $API_URL -Method Post -Body $JSON_DATA -ContentType "application/json" -ErrorAction Stop
    
    $stopwatch.Stop()
    
    Write-Host "✅ SUCESSO! A API está funcionando." -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 RESULTADOS DO TESTE:" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    Write-Host "⏱️  Tempo de resposta: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor White
    Write-Host "🔢 Código HTTP: 200" -ForegroundColor Green
    Write-Host ""
    
    # Extrair texto da resposta
    if ($response.candidates -and $response.candidates[0].content.parts[0].text) {
        $generatedText = $response.candidates[0].content.parts[0].text
        Write-Host "🤖 Texto gerado: $generatedText" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "📄 Resposta completa da API:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    Write-Host "❌ ERRO $statusCode" -ForegroundColor Red
    Write-Host ""
    
    switch ($statusCode) {
        400 {
            Write-Host "💡 ERRO 400: Pedido inválido" -ForegroundColor Yellow
            Write-Host "Possíveis causas:" -ForegroundColor Yellow
            Write-Host "   - Formato JSON incorreto" -ForegroundColor White
            Write-Host "   - Parâmetros inválidos" -ForegroundColor White
            Write-Host "   - Modelo não suportado" -ForegroundColor White
        }
        401 {
            Write-Host "💡 ERRO 401: Não autorizado" -ForegroundColor Yellow
            Write-Host "Possíveis causas:" -ForegroundColor Yellow
            Write-Host "   - Chave API inválida ou expirada" -ForegroundColor White
            Write-Host "   - Chave não tem permissões necessárias" -ForegroundColor White
            Write-Host "   - Formato da chave incorreto" -ForegroundColor White
            Write-Host ""
            Write-Host "🔧 Soluções:" -ForegroundColor Green
            Write-Host "   1. Verifica se a chave está correta" -ForegroundColor White
            Write-Host "   2. Gera uma nova chave em https://aistudio.google.com/app/apikey" -ForegroundColor White
            Write-Host "   3. Confirma que a chave está ativa" -ForegroundColor White
        }
        403 {
            Write-Host "💡 ERRO 403: Acesso negado" -ForegroundColor Yellow
            Write-Host "Possíveis causas:" -ForegroundColor Yellow
            Write-Host "   - Restrições de IP ou domínio" -ForegroundColor White
            Write-Host "   - Chave sem permissões para este modelo" -ForegroundColor White
        }
        429 {
            Write-Host "💡 ERRO 429: Muitos pedidos" -ForegroundColor Yellow
            Write-Host "Possíveis causas:" -ForegroundColor Yellow
            Write-Host "   - Quota de pedidos excedida" -ForegroundColor White
            Write-Host "   - Rate limit atingido" -ForegroundColor White
            Write-Host ""
            Write-Host "🔧 Soluções:" -ForegroundColor Green
            Write-Host "   1. Aguarda alguns minutos e tenta novamente" -ForegroundColor White
            Write-Host "   2. Verifica os limites da tua conta" -ForegroundColor White
        }
        default {
            Write-Host "💡 Erro desconhecido: $errorMessage" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🔗 Links úteis:" -ForegroundColor Cyan
Write-Host "   - Google AI Studio: https://aistudio.google.com/" -ForegroundColor White
Write-Host "   - Documentação: https://ai.google.dev/docs" -ForegroundColor White
Write-Host "   - Gerar chave: https://aistudio.google.com/app/apikey" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para usar uma chave diferente, edita a variável `$API_KEY no script" -ForegroundColor Yellow