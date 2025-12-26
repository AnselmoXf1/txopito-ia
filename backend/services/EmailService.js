const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      console.log('🔧 Inicializando transporter de email...');
      console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
      console.log('EMAIL_USER:', process.env.EMAIL_USER);
      console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : 'undefined');
      
      // Configuração para Gmail (pode ser adaptada para outros provedores)
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false, // true para 465, false para outras portas
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        
        this.isConfigured = true;
        console.log('✅ Serviço de email configurado');
      } else {
        console.log('⚠️ Serviço de email não configurado (variáveis de ambiente em falta)');
        this.setupFallbackService();
      }
    } catch (error) {
      console.error('❌ Erro ao configurar serviço de email:', error);
      this.setupFallbackService();
    }
  }

  setupFallbackService() {
    // Fallback: simular envio de email (para desenvolvimento)
    this.transporter = {
      sendMail: async (mailOptions) => {
        console.log('📧 [SIMULAÇÃO] Email enviado:');
        console.log(`   Para: ${mailOptions.to}`);
        console.log(`   Assunto: ${mailOptions.subject}`);
        console.log(`   Conteúdo: ${mailOptions.text || mailOptions.html}`);
        return { messageId: 'simulated_' + Date.now() };
      }
    };
    this.isConfigured = true;
  }

  async sendOTPEmail(email, code, type, userName = 'Utilizador') {
    if (!this.isConfigured) {
      throw new Error('Serviço de email não configurado');
    }

    const templates = this.getEmailTemplates();
    const template = templates[type];
    
    if (!template) {
      throw new Error(`Template não encontrado para tipo: ${type}`);
    }

    const subject = template.subject;
    const html = template.html
      .replace(/{{userName}}/g, userName)
      .replace(/{{code}}/g, code)
      .replace(/{{email}}/g, email);
    
    const text = template.text
      .replace(/{{userName}}/g, userName)
      .replace(/{{code}}/g, code)
      .replace(/{{email}}/g, email);

    const mailOptions = {
      from: `"Txopito IA" <${process.env.EMAIL_USER || 'noreply@txopito.mz'}>`,
      to: email,
      subject: subject,
      text: text,
      html: html
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email OTP enviado para ${email} (${type})`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw new Error(`Falha ao enviar email: ${error.message}`);
    }
  }

  getEmailTemplates() {
    return {
      email_verification: {
        subject: '🔐 Txopito IA - Confirma a tua conta',
        text: `
Olá {{userName}},

Bem-vindo à Txopito IA! 🎉

Para ativar a tua conta, usa este código de verificação:

{{code}}

Este código expira em 10 minutos.

Após confirmar, terás acesso completo à tua IA moçambicana.

Se não criaste esta conta, ignora este email.

Obrigado,
Equipa Txopito IA
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code { background: #fff; border: 2px solid #16a34a; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #16a34a; margin: 20px 0; border-radius: 10px; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .welcome { background: #e7f5e7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .flag { font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="flag">🇲🇿</span> Txopito IA</h1>
            <p>A tua IA moçambicana</p>
        </div>
        <div class="content">
            <h2>🎉 Bem-vindo, {{userName}}!</h2>
            <div class="welcome">
                <strong>Conta criada com sucesso!</strong> Agora só precisas confirmar o teu email para começar a usar a Txopito IA.
            </div>
            
            <p>Para <strong>ativar a tua conta</strong>, usa este código de verificação:</p>
            <div class="code">{{code}}</div>
            <p><strong>⏰ Este código expira em 10 minutos.</strong></p>
            
            <p>Após confirmar, terás acesso completo à:</p>
            <ul>
                <li>💬 Conversas inteligentes</li>
                <li>📚 Ajuda com estudos</li>
                <li>🏛️ História de Moçambique</li>
                <li>📱 Sincronização multi-dispositivo</li>
            </ul>
            
            <p><small>Se não criaste esta conta, ignora este email.</small></p>
        </div>
        <div class="footer">
            <p>Obrigado por escolheres a Txopito IA!<br><strong>Equipa Txopito IA</strong></p>
            <p>🇲🇿 A primeira IA feita a pensar em Moçambique</p>
        </div>
    </div>
</body>
</html>
        `
      },
      
      password_reset: {
        subject: '🔑 Txopito IA - Recuperação de Palavra-passe',
        text: `
Olá {{userName}},

Recebemos um pedido para recuperar a palavra-passe da tua conta Txopito IA.

O teu código de recuperação é:

{{code}}

Este código expira em 10 minutos.

Se não solicitaste esta recuperação, ignora este email e a tua conta permanecerá segura.

Obrigado,
Equipa Txopito IA
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code { background: #fff; border: 2px solid #dc2626; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #dc2626; margin: 20px 0; border-radius: 10px; letter-spacing: 5px; }
        .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .flag { font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="flag">🇲🇿</span> Txopito IA</h1>
            <p>A tua IA moçambicana</p>
        </div>
        <div class="content">
            <h2>🔑 Recuperação de Palavra-passe</h2>
            <p>Olá <strong>{{userName}}</strong>,</p>
            <p>Recebemos um pedido para recuperar a palavra-passe da tua conta Txopito IA.</p>
            <p>O teu código de recuperação é:</p>
            <div class="code">{{code}}</div>
            <p><strong>⏰ Este código expira em 10 minutos.</strong></p>
            <div class="warning">
                <strong>🛡️ Segurança:</strong> Se não solicitaste esta recuperação, ignora este email e a tua conta permanecerá segura.
            </div>
        </div>
        <div class="footer">
            <p>Obrigado,<br><strong>Equipa Txopito IA</strong></p>
            <p>🇲🇿 Levando a inteligência artificial para Moçambique</p>
        </div>
    </div>
</body>
</html>
        `
      },
      
      login_verification: {
        subject: '🔐 Txopito IA - Verificação de Login',
        text: `
Olá {{userName}},

Detectámos um novo login na tua conta Txopito IA.

Para confirmar que és tu, usa este código:

{{code}}

Este código expira em 10 minutos.

Se não foste tu, muda a tua palavra-passe imediatamente.

Obrigado,
Equipa Txopito IA
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code { background: #fff; border: 2px solid #2563eb; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #2563eb; margin: 20px 0; border-radius: 10px; letter-spacing: 5px; }
        .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .flag { font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="flag">🇲🇿</span> Txopito IA</h1>
            <p>A tua IA moçambicana</p>
        </div>
        <div class="content">
            <h2>🔐 Verificação de Login</h2>
            <p>Olá <strong>{{userName}}</strong>,</p>
            <p>Detectámos um novo login na tua conta Txopito IA.</p>
            <p>Para confirmar que és tu, usa este código:</p>
            <div class="code">{{code}}</div>
            <p><strong>⏰ Este código expira em 10 minutos.</strong></p>
            <div class="alert">
                <strong>⚠️ Atenção:</strong> Se não foste tu, muda a tua palavra-passe imediatamente.
            </div>
        </div>
        <div class="footer">
            <p>Obrigado,<br><strong>Equipa Txopito IA</strong></p>
            <p>🇲🇿 Levando a inteligência artificial para Moçambique</p>
        </div>
    </div>
</body>
</html>
        `
      }
    };
  }

  async sendWelcomeEmail(email, userName) {
    if (!this.isConfigured) {
      console.log('⚠️ Email de boas-vindas não enviado (serviço não configurado)');
      return;
    }

    const mailOptions = {
      from: `"Txopito IA" <${process.env.EMAIL_USER || 'noreply@txopito.mz'}>`,
      to: email,
      subject: '🎉 Bem-vindo ao Txopito IA!',
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #16a34a; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .flag { font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><span class="flag">🇲🇿</span> Txopito IA</h1>
            <p>A tua IA moçambicana</p>
        </div>
        <div class="content">
            <h2>🎉 Bem-vindo, ${userName}!</h2>
            <p>Parabéns! A tua conta no Txopito IA foi criada com sucesso.</p>
            
            <h3>🚀 O que podes fazer:</h3>
            <div class="feature">
                <strong>💬 Conversa Geral</strong> - Chat livre sobre qualquer tópico
            </div>
            <div class="feature">
                <strong>📚 Ajuda com Estudos</strong> - Assistência educacional personalizada
            </div>
            <div class="feature">
                <strong>🏛️ História de Moçambique</strong> - Conhecimento especializado sobre o país
            </div>
            <div class="feature">
                <strong>📱 Sincronização</strong> - Acede às tuas conversas em qualquer dispositivo
            </div>
            
            <p><strong>Começa agora:</strong> <a href="http://localhost:3000" style="color: #16a34a;">http://localhost:3000</a></p>
        </div>
        <div class="footer">
            <p>Obrigado por escolheres o Txopito IA!<br><strong>Equipa Txopito IA</strong></p>
            <p>🇲🇿 Levando a inteligência artificial para Moçambique</p>
        </div>
    </div>
</body>
</html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email de boas-vindas enviado para ${email}`);
    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error);
    }
  }

  // Verificar se o serviço está configurado
  isReady() {
    return this.isConfigured;
  }

  // Testar configuração de email
  async testConfiguration() {
    if (!this.isConfigured) {
      return { success: false, error: 'Serviço não configurado' };
    }

    try {
      if (this.transporter.verify) {
        await this.transporter.verify();
      }
      return { success: true, message: 'Configuração de email válida' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Instância singleton
const emailService = new EmailService();

module.exports = emailService;