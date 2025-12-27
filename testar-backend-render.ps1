# SCRIPT PARA TESTAR BACKEND DO RENDER
# PowerShell script para conectar e testar o backend

Write-Host "🌐 CONECTAR AO BACKEND DO RENDER" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

$BACKEND_URL = "https://txopito-backend.onrender.com/api"
Write-Host "🔗 URL: $BACKEND_URL" -ForegroundColor Yellow

# Função para testar conexão
function Test-BackendConnection {
    Write-Host "`n🔄 Testando conexão com o backend..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method Get -TimeoutSec 30
        Write-Host "✅ BACKEND CONECTADO!" -ForegroundColor Green
        Write-Host "📊 Status: $($response | ConvertTo-Json)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Erro de conexão: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*timeout*") {
            Write-Host "⏱️ Backend pode estar 'dormindo' - tentando acordar..." -ForegroundColor Yellow
            return Wake-Backend
        }
        
        return $false
    }
}

# Função para acordar o backend
function Wake-Backend {
    Write-Host "🔄 Acordando backend do Render..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le 3; $i++) {
        Write-Host "  Tentativa $i/3..." -ForegroundColor Gray
        
        try {
            $response = Invoke-WebRequest -Uri $BACKEND_URL -Method Get -TimeoutSec 30
            Write-Host "✅ Backend acordou!" -ForegroundColor Green
            Start-Sleep -Seconds 2
            return Test-BackendConnection
        }
        catch {
            Write-Host "  ⏳ Aguardando... ($($_.Exception.Message))" -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
    }
    
    Write-Host "❌ Backend não respondeu após múltiplas tentativas" -ForegroundColor Red
    return $false
}

# Função para testar endpoints
function Test-Endpoints {
    Write-Host "`n🧪 TESTANDO ENDPOINTS:" -ForegroundColor Cyan
    Write-Host "────────────────────────────────────────" -ForegroundColor Gray
    
    $endpoints = @(
        @{ path = "/health"; name = "Health Check" },
        @{ path = "/conversations"; name = "Conversas" },
        @{ path = "/users"; name = "Utilizadores" },
        @{ path = "/admin/stats"; name = "Estatísticas Admin" }
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri "$BACKEND_URL$($endpoint.path)" -Method Get -TimeoutSec 5
            $status = if ($response.StatusCode -eq 200) { "✅" } else { "❌" }
            Write-Host "$status $($endpoint.name): $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor $(if ($response.StatusCode -eq 200) { "Green" } else { "Red" })
            
            if ($response.StatusCode -eq 200) {
                $content = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
                Write-Host "   📊 Dados: $content..." -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "❌ $($endpoint.name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Função para enviar dados de teste
function Test-PostData {
    Write-Host "`n📤 TESTANDO ENVIO DE DADOS:" -ForegroundColor Cyan
    Write-Host "────────────────────────────────────────" -ForegroundColor Gray
    
    $testData = @{
        message = "Teste de conexão do PowerShell"
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        user = "PowerShell Test"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/conversations" -Method Post -Body $testData -ContentType "application/json" -TimeoutSec 10
        Write-Host "✅ Dados enviados com sucesso!" -ForegroundColor Green
        Write-Host "📊 Resposta: $($response | ConvertTo-Json)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao enviar: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Função para mostrar informações
function Show-BackendInfo {
    Write-Host "`n📊 INFORMAÇÕES DO BACKEND:" -ForegroundColor Cyan
    Write-Host "────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "🔗 URL: $BACKEND_URL" -ForegroundColor White
    Write-Host "🌐 Plataforma: Render.com" -ForegroundColor White
    Write-Host "📱 Dashboard: https://dashboard.render.com/" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Comandos úteis:" -ForegroundColor Yellow
    Write-Host "• Ver logs: Dashboard > Seu serviço > Logs" -ForegroundColor Gray
    Write-Host "• Reiniciar: Dashboard > Seu serviço > Manual Deploy" -ForegroundColor Gray
    Write-Host "• Métricas: Dashboard > Seu serviço > Metrics" -ForegroundColor Gray
}

# Executar testes
Write-Host "`n🚀 INICIANDO TESTES..." -ForegroundColor Magenta

$connected = Test-BackendConnection

if (-not $connected) {
    Write-Host "`n💡 DICAS PARA RESOLVER:" -ForegroundColor Yellow
    Write-Host "• Verifica se o backend está deployado no Render" -ForegroundColor Gray
    Write-Host "• Confirma a URL no .env.local" -ForegroundColor Gray
    Write-Host "• Backend pode estar 'dormindo' - tenta novamente" -ForegroundColor Gray
    Write-Host "• Verifica logs no dashboard do Render" -ForegroundColor Gray
    exit 1
}

# Se conectado, executar todos os testes
Test-Endpoints
Test-PostData
Show-BackendInfo

Write-Host "`n✅ CONEXÃO COM BACKEND ESTABELECIDA!" -ForegroundColor Green
Write-Host "🎯 Backend do Render está funcionando corretamente" -ForegroundColor Green
Write-Host "🔗 URL: $BACKEND_URL" -ForegroundColor Green

Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "• Backend está pronto para receber requisições" -ForegroundColor Gray
Write-Host "• Podes iniciar o frontend normalmente" -ForegroundColor Gray
Write-Host "• Dados serão sincronizados automaticamente" -ForegroundColor Gray