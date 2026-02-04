import nodemailer from 'nodemailer'

// Configurar transporter de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password de Gmail
  },
})

// Generar código OTP de 6 dígitos
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Enviar OTP por email
export async function sendOTPEmail(email: string, otp: string, userName?: string): Promise<void> {
  const mailOptions = {
    from: `"Sistema Verano 🚗" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Tu código de verificación',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .otp-box {
            background: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            font-family: monospace;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
            border-radius: 5px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Código de Verificación</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 18px; color: #333;">
              ${userName ? `Hola <strong>${userName}</strong>,` : 'Hola,'}
            </p>
            
            <p style="color: #666;">
              Has solicitado iniciar sesión en tu cuenta. Usa el siguiente código de verificación:
            </p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Tu código es:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                ⏱️ Válido por 5 minutos
              </p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>No compartas este código con nadie</li>
                <li>Nuestro equipo nunca te pedirá este código</li>
                <li>Si no solicitaste este código, ignora este mensaje</li>
              </ul>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Este código expirará en <strong>5 minutos</strong>
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              © 2026 Sistema Verano. Todos los derechos reservados.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              Este es un mensaje automático, por favor no respondas.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Tu código de verificación es: ${otp}

Este código expirará en 5 minutos.

Si no solicitaste este código, ignora este mensaje.

© 2026 Sistema Verano
    `.trim(),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error al enviar email:', error)
    throw new Error('No se pudo enviar el código de verificación')
  }
}

// Verificar configuración de email
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    return true
  } catch (error) {
    console.error('Error en configuración de email:', error)
    return false
  }
}

// Enviar email de recuperación de contraseña
export async function sendPasswordResetEmail(email: string, code: string, userName?: string): Promise<void> {
  const mailOptions = {
    from: `"Sistema Verano 🚗" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔑 Recuperación de Contraseña',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .code-box {
            background: #f8f9fa;
            border: 2px dashed #f5576c;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
          }
          .reset-code {
            font-size: 48px;
            font-weight: bold;
            color: #f5576c;
            letter-spacing: 8px;
            font-family: monospace;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
            border-radius: 5px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Recuperar Contraseña</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 18px; color: #333;">
              ${userName ? `Hola <strong>${userName}</strong>,` : 'Hola,'}
            </p>
            
            <p style="color: #666;">
              Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código:
            </p>
            
            <div class="code-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Código de recuperación:</p>
              <div class="reset-code">${code}</div>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                ⏱️ Válido por 15 minutos
              </p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Seguridad:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>No compartas este código con nadie</li>
                <li>Si no solicitaste restablecer tu contraseña, ignora este mensaje</li>
                <li>Tu contraseña actual seguirá siendo válida hasta que la cambies</li>
              </ul>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Este código expirará en <strong>15 minutos</strong>
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              © 2026 Sistema Verano. Todos los derechos reservados.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              Este es un mensaje automático, por favor no respondas.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Recuperación de Contraseña

${userName ? `Hola ${userName},` : 'Hola,'}

Recibimos una solicitud para restablecer tu contraseña.

Tu código de recuperación es: ${code}

Este código expirará en 15 minutos.

Si no solicitaste restablecer tu contraseña, ignora este mensaje.
Tu contraseña actual seguirá siendo válida hasta que la cambies.

© 2026 Sistema Verano
    `.trim(),
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error)
    throw new Error('No se pudo enviar el código de recuperación')
  }
}

