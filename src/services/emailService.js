import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configurar transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verificar conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error al conectar con el servidor de email:", error);
  } else {
    console.log("✅ Servidor de email listo para enviar mensajes");
  }
});

// Template para email de verificación
const getVerificationEmailTemplate = (username, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎮 GameTracker</h1>
        </div>
        <div class="content">
          <h2>¡Bienvenido, ${username}!</h2>
          <p>Gracias por registrarte en GameTracker. Para comenzar a usar tu cuenta, necesitamos verificar tu dirección de correo electrónico.</p>
          <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
          </div>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          <p><strong>Este enlace expirará en 24 horas.</strong></p>
          <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} GameTracker. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template para email de bienvenida
const getWelcomeEmailTemplate = (username) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎮 ¡Cuenta verificada!</h1>
        </div>
        <div class="content">
          <h2>¡Hola, ${username}!</h2>
          <p>Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funcionalidades de GameTracker:</p>
          <ul>
            <li>✅ Crear y gestionar tu biblioteca de juegos</li>
            <li>✅ Escribir reseñas y calificaciones</li>
            <li>✅ Descubrir nuevos juegos</li>
            <li>✅ Conectar con otros jugadores</li>
          </ul>
          <p>¡Disfruta de la experiencia!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template para reseteo de contraseña
const getPasswordResetTemplate = (username, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reseteo de Contraseña</h1>
        </div>
        <div class="content">
          <h2>Hola, ${username}</h2>
          <p>Recibimos una solicitud para resetear tu contraseña.</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Resetear Contraseña</a>
          </div>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Este enlace expirará en 1 hora.</strong>
          </div>
          <p>Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Función para enviar email de verificación
export const sendVerificationEmail = async (email, username, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verifica tu cuenta de GameTracker",
    html: getVerificationEmailTemplate(username, verificationUrl)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de verificación enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar email de verificación:", error);
    throw new Error("Error al enviar email de verificación");
  }
};

// Función para enviar email de bienvenida
export const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "¡Bienvenido a GameTracker!",
    html: getWelcomeEmailTemplate(username)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenida enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar email de bienvenida:", error);
    return false;
  }
};

// Función para enviar email de reseteo de contraseña
export const sendPasswordResetEmail = async (email, username, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reseteo de contraseña - GameTracker",
    html: getPasswordResetTemplate(username, resetUrl)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de reseteo enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar email de reseteo:", error);
    throw new Error("Error al enviar email de reseteo");
  }
};
export const sendContactEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `[Contacto] ${subject}`,
    html,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email de contacto enviado a ${to}`);
};

export default transporter;