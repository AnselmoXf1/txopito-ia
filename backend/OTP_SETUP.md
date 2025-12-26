# 🔐 Sistema OTP - Guia de Configuração

## Visão Geral

O sistema OTP (One-Time Password) do Txopito IA fornece verificação segura por email para:

- **Verificação de Email** - Confirmar novos registos
- **Recuperação de Palavra-passe** - Reset seguro de senhas
- **Verificação de Login** - 2FA para administradores

## 🏗️ Arquitetura

### Componentes Backend
- **`models/OTP.js`** - Modelo de dados com validações e métodos
- **`services/EmailService.js`** - Serviço de envio de emails
- **`routes/otp.js`** - Endpoints da API OTP
- **`routes/auth.js`** - Integração com autenticação

### Componentes Frontend
- **`components/OTPModal.tsx`** - Modal de verificação
- **`components/AuthModal.tsx`** - Integração com login/registo
- **`services/backendService.ts`** - Cliente API

## 📧 Configuração de Email

### 1. Gmail (Recomendado)

1. **Ativar 2FA** na tua conta Google
2. **Gerar Senha de App**:
   - Vai a [myaccount.google.com](https://myaccount.google.com)
   - Segurança → Verificação em 2 etapas → Senhas de app
   - Gera uma senha para "Txopito IA"

3. **Configurar .env**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=teu_email@gmail.com
EMAIL_PASS=tua_senha_de_app_gerada
```
## 2. Outros Provedores

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=teu_email@outlook.com
EMAIL_PASS=tua_senha
```

#### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=teu_email@yahoo.com
EMAIL_PASS=tua_senha_de_app
```

### 3. Modo de Desenvolvimento

Se não configurares email, o sistema funciona em modo simulação:
- Códigos OTP são mostrados no console do servidor
- Emails são "enviados" mas apenas logados
- Funcionalidade completa mantida para testes

## 🚀 Instalação e Teste

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis
```bash
cp .env.example .env
# Editar .env com as tuas configurações
```

### 3. Testar Sistema
```bash
npm run otp:test
```

### 4. Iniciar Servidor
```bash
npm run dev
```

## 🔧 Endpoints da API

### Enviar OTP
```http
POST /api/otp/send
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "email_verification"
}
```

### Verificar OTP
```http
POST /api/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "type": "email_verification"
}
```

### Reenviar OTP
```http
POST /api/otp/resend
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "email_verification"
}
```

### Status do OTP
```http
GET /api/otp/status/user@example.com/email_verification
```

## 🔒 Segurança

### Rate Limiting
- **3 tentativas** por 5 minutos por email/tipo
- **5 verificações falhadas** invalidam o código
- **1 minuto** mínimo entre reenvios

### Expiração
- Códigos expiram em **10 minutos**
- Limpeza automática de códigos expirados
- Tokens de reset expiram em **15 minutos**

### Auditoria
- IP e User-Agent registados
- Logs de todas as operações
- Estatísticas para administradores

## 🎯 Fluxos de Uso

### 1. Registo com Verificação
```
1. Utilizador regista-se
2. Sistema cria conta (não verificada)
3. Envia OTP para email
4. Utilizador introduz código
5. Email verificado → Login automático
```

### 2. Login com 2FA (Admins)
```
1. Admin faz login
2. Sistema envia OTP
3. Admin introduz código
4. Login completado
```

### 3. Recuperação de Senha
```
1. Utilizador clica "Esqueci senha"
2. Sistema envia OTP
3. Utilizador introduz código
4. Sistema gera token de reset
5. Nova senha definida
```

## 🛠️ Personalização

### Templates de Email
Edita `services/EmailService.js` para personalizar:
- Assuntos dos emails
- Conteúdo HTML/texto
- Estilos e branding

### Configurações OTP
Ajusta em `models/OTP.js`:
- Tempo de expiração
- Número de tentativas
- Rate limiting

### Validações
Modifica validações em `routes/otp.js`:
- Formatos de email
- Comprimento de códigos
- Tipos permitidos

## 📊 Monitorização

### Logs do Sistema
```bash
# Ver logs em tempo real
tail -f logs/txopito-backend.log

# Filtrar logs OTP
grep "OTP" logs/txopito-backend.log
```

### Estatísticas (Admin)
```http
GET /api/otp/stats
Authorization: Bearer admin_token
```

### Limpeza Manual
```http
GET /api/otp/cleanup
Authorization: Bearer admin_token
```

## 🐛 Resolução de Problemas

### Email não enviado
1. Verificar configurações SMTP
2. Testar com `npm run otp:test`
3. Verificar logs do servidor
4. Confirmar senha de app (Gmail)

### Código inválido
1. Verificar se não expirou (10 min)
2. Confirmar email correto
3. Verificar tentativas restantes
4. Reenviar se necessário

### Rate limiting
1. Aguardar 5 minutos
2. Verificar IP do cliente
3. Limpar OTPs se necessário

## 📝 Notas de Desenvolvimento

- Sistema funciona offline (modo simulação)
- Códigos são sempre 6 dígitos numéricos
- Emails são enviados em HTML + texto
- Suporte completo para dark mode
- Responsivo para mobile

## 🔄 Próximas Melhorias

- [ ] SMS OTP como alternativa
- [ ] Códigos QR para 2FA
- [ ] Integração com authenticator apps
- [ ] Notificações push
- [ ] Análise de comportamento suspeito