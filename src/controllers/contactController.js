
import { sendContactEmail as sendMail } from "../services/emailService.js";

export const handleContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validación
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      success: false,
      message: "Por favor completa todos los campos" 
    });
  }

  // Email mejorado (hermoso y limpio)
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; color: #333; }
        .email-body { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
        .header { background: #4361ee; color: white; padding: 25px; text-align: center; }
        .header h1 { margin: 0; font-size: 1.8rem; }
        .content { padding: 30px; }
        .field { margin: 18px 0; }
        .label { font-weight: 600; color: #4361ee; display: block; margin-bottom: 6px; }
        .value { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #4361ee; word-wrap: break-word; }
        .message { background: #e0f2fe; padding: 18px; border-radius: 10px; margin-top: 20px; font-style: italic; }
        .footer { text-align: center; padding: 20px; background: #f1f5f9; color: #666; font-size: 0.9rem; }
        .btn { display: inline-block; background: #4361ee; color: white; padding: 12px 28px; text-decoration: none; border-radius: 50px; margin: 15px 0; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="email-body">
        <div class="header">
          <h1>Nuevo Mensaje</h1>
        </div>
        <div class="content">
          <p><strong>¡Hola equipo GameTracker!</strong></p>
          <p>Acabas de recibir un mensaje desde el formulario de contacto:</p>

          <div class="field">
            <span class="label">De</span>
            <div class="value">${name} &lt;${email}&gt;</div>
          </div>

          <div class="field">
            <span class="label">Asunto</span>
            <div class="value">${subject}</div>
          </div>

          <div class="field">
            <span class="label">Mensaje</span>
            <div class="message">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="mailto:${email}?subject=RE: ${encodeURIComponent(subject)}" class="btn">
              Responder ahora
            </a>
          </div>

          <p><small>Enviado el ${new Date().toLocaleString('es-CO')}</small></p>
        </div>
        <div class="footer">
          GameTracker • Bogotá, Colombia<br>
          Formulario de contacto automático
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendMail("technicolas26@gmail.com", `Contacto: ${subject}`, html);
    
    res.json({ 
      success: true, 
      message: "¡Mensaje enviado! Te responderemos en menos de 24h" 
    });
  } catch (error) {
    console.error("Error enviando email de contacto:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al enviar. Intenta más tarde." 
    });
  }
};