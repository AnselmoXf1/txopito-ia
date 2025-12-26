# 🧪 Teste do Fluxo Completo de Registo com OTP

## ✅ Pré-requisitos

1. **Backend rodando**: `npm run dev` na pasta `backend`
2. **Frontend rodando**: `npm run dev` na pasta raiz
3. **Email configurado**: SMTP do Gmail ativo

## 🔄 Fluxo de Teste Completo

### 1. Aceder à Aplicação
```
http://localhost:3000
```

### 2. Iniciar Registo
1. Clica em **"Começar Agora"** ou **"Já tenho conta"**
2. No modal, clica em **"Não tens conta? Regista-te"**
3. Preenche o formulário:
   - **Nome**: Teu nome completo
   - **Email**: Um email válido (receberás OTP)
   - **Palavra-passe**: Mínimo 6 caracteres
   - **Confirmar Palavra-passe**: Mesma senha

### 3. Submeter Registo
1. Clica **"Criar Conta"**
2. Se tudo correr bem, verás:
   - ✅ Modal de registo fecha
   - 📧 Modal OTP abre automaticamente
   - 📱 Mensagem: "Conta criada com sucesso! Enviámos um código..."

### 4. Verificar Email
1. **Verifica a tua caixa de entrada** (pode demorar 1-2 minutos)
2. Procura email de **"Txopito IA - Código de Verificação"**
3. **Copia o código de 6 dígitos** do email

### 5. Confirmar Conta
1. No modal OTP, **introduz o código de 6 dígitos**
2. Clica **"Verificar"**
3. Se correto:
   - ✅ Modal OTP fecha
   - 🎉 Login automático
   - 🏠 Acesso à aplicação principal

### 6. Verificar Acesso
1. Deves ver a **interface principal** da Txopito IA
2. Podes **iniciar conversas** normalmente
3. Tua conta está **ativa e verificada**

## 🚨 Possíveis Problemas

### Email não chega
- Verifica **spam/lixo**
- Aguarda **2-3 minutos**
- Clica **"Reenviar código"** no modal OTP

### Código inválido
- Verifica se **copiaste corretamente**
- Código **expira em 10 minutos**
- Solicita **novo código** se expirou

### Modal não abre
- Verifica **console do browser** (F12)
- Backend deve estar **rodando na porta 5000**
- Verifica **conexão com internet**

## 📊 Estados Esperados

### Após Registo (antes OTP)
```json
{
  "success": true,
  "message": "Utilizador criado. Verifica o teu email para ativar a conta.",
  "requiresEmailVerification": true,
  "email": "teu@email.com",
  "userId": "..."
}
```

### Após Verificação OTP
```json
{
  "success": true,
  "message": "Email verificado com sucesso! Bem-vindo ao Txopito IA.",
  "token": "jwt_token...",
  "user": { ... }
}
```

## 🔧 Teste Manual via API

### 1. Registo
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Manual",
    "email": "teste@exemplo.com",
    "password": "senha123"
  }'
```

### 2. Verificação
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "code": "123456"
  }'
```

## ✅ Checklist de Verificação

- [ ] Backend rodando (porta 5000)
- [ ] Frontend rodando (porta 3000)
- [ ] Email SMTP configurado
- [ ] Registo cria conta não verificada
- [ ] OTP enviado por email
- [ ] Modal OTP abre automaticamente
- [ ] Código válido ativa conta
- [ ] Login automático após verificação
- [ ] Acesso à aplicação principal

## 🎯 Resultado Final

Após completar o fluxo:
1. ✅ Conta criada e verificada
2. ✅ Email confirmado
3. ✅ Login automático realizado
4. ✅ Acesso total à Txopito IA
5. ✅ Conversas podem ser iniciadas

O utilizador está agora **totalmente registado e verificado**! 🚀