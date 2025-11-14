import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../Models/User.js";
import {
  generateTokenPair,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyRefreshToken,
  hashToken
} from "../utils/tokenUtils.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
} from "../services/emailService.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================================
// REGISTRO CON EMAIL
// ============================================
export const register = async (req, res) => {
  try {
    const { username, nombre, email, contraseña, confirmarContraseña } = req.body;

    // Validaciones
    if (!username || !nombre || !email || !contraseña || !confirmarContraseña) {
      return res.status(400).json({ 
        message: "Todos los campos son requeridos" 
      });
    }

    // Validar formato de email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    // Validar longitud de username
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ 
        message: "El username debe tener entre 3 y 30 caracteres" 
      });
    }

    // Validar que las contraseñas coincidan
    if (contraseña !== confirmarContraseña) {
      return res.status(400).json({ 
        message: "Las contraseñas no coinciden" 
      });
    }

    // Validar fortaleza de contraseña
    if (contraseña.length < 6) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }

    // Verificar si el email ya existe
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ 
        message: "Este email ya está registrado" 
      });
    }

    // Verificar si el username ya existe
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        message: "Este username ya está en uso" 
      });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    // Generar token de verificación
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear usuario
    const user = await User.create({
      username,
      nombre,
      email: email.toLowerCase(),
      contraseña: hashedPassword,
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });

    // Enviar email de verificación
    try {
      await sendVerificationEmail(user.email, user.nombre, verificationToken);
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
      // No fallar el registro si el email falla
    }

    res.status(201).json({
      success: true,
      message: "Registro exitoso. Por favor verifica tu email para activar tu cuenta.",
      user: {
        id: user._id,
        username: user.username,
        nombre: user.nombre,
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ 
      message: "Error en el servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// VERIFICAR EMAIL
// ============================================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar usuario con el token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Token de verificación inválido o expirado" 
      });
    }

    // Verificar cuenta
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(user.email, user.nombre);
    } catch (emailError) {
      console.error("Error al enviar email de bienvenida:", emailError);
    }

    res.json({
      success: true,
      message: "Email verificado exitosamente. Ya puedes iniciar sesión."
    });

  } catch (error) {
    console.error("Error en verificación:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// ============================================
// REENVIAR EMAIL DE VERIFICACIÓN
// ============================================
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Esta cuenta ya está verificada" });
    }

    // Generar nuevo token
    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Enviar email
    await sendVerificationEmail(user.email, user.nombre, verificationToken);

    res.json({
      success: true,
      message: "Email de verificación reenviado"
    });

  } catch (error) {
    console.error("Error al reenviar verificación:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// ============================================
// LOGIN CON EMAIL
// ============================================
export const login = async (req, res) => {
  try {
    const { username, contraseña } = req.body;

    if (!username || !contraseña) {
      return res.status(400).json({ 
        message: "Username y contraseña son requeridos" 
      });
    }

    // Buscar usuario por username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ 
        message: "Credenciales inválidas" 
      });
    }

    // Verificar si la cuenta está bloqueada
    if (user.isLocked) {
      return res.status(423).json({ 
        message: "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta más tarde." 
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(contraseña);

    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(400).json({ 
        message: "Credenciales inválidas" 
      });
    }

    // Verificar si el email está verificado
    if (!user.isVerified) {
  return res.status(403).json({ 
    message: "Por favor verifica tu email antes de iniciar sesión",
    needsVerification: true,
    email: user.email // 👈 Esta línea es clave
  });
}


    // Resetear intentos de login y actualizar último login
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = null;
    }
    user.lastLogin = Date.now();

    // Generar tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id);

    // Guardar refresh token hasheado en BD
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    res.json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user._id,
        username: user.username,
        nombre: user.nombre,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// ============================================
// LOGIN CON GOOGLE
// ============================================
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body; // Token de Google

    if (!credential) {
      return res.status(400).json({ message: "Token de Google requerido" });
    }

    // Verificar token de Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Buscar usuario existente por googleId o email
    let user = await User.findOne({ 
      $or: [{ googleId }, { email: email.toLowerCase() }] 
    });

    if (user) {
      // Usuario existe
      if (!user.googleId) {
        // Vincular cuenta existente con Google
        user.googleId = googleId;
        user.avatar = picture;
        user.isVerified = true; // Google ya verificó el email
        await user.save();
      }
    } else {
      // Crear nuevo usuario
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      user = await User.create({
        username,
        nombre: name,
        email: email.toLowerCase(),
        googleId,
        avatar: picture,
        isVerified: true // Google ya verificó el email
      });

      // Enviar email de bienvenida
      try {
        await sendWelcomeEmail(user.email, user.nombre);
      } catch (emailError) {
        console.error("Error al enviar email de bienvenida:", emailError);
      }
    }

    // Actualizar último login
    user.lastLogin = Date.now();
    
    // Generar tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id);
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    res.json({
      success: true,
      message: "Login con Google exitoso",
      user: {
        id: user._id,
        username: user.username,
        nombre: user.nombre,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error("Error en Google auth:", error);
    res.status(500).json({ 
      message: "Error al autenticar con Google",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// REFRESH TOKEN
// ============================================
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token requerido" });
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Buscar usuario
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar que el refresh token coincida con el guardado
    const hashedToken = hashToken(refreshToken);
    if (user.refreshToken !== hashedToken) {
      return res.status(401).json({ message: "Refresh token inválido" });
    }

    // Generar nuevo par de tokens
    const tokens = generateTokenPair(user._id);
    user.refreshToken = hashToken(tokens.refreshToken);
    await user.save();

    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });

  } catch (error) {
    console.error("Error al refrescar token:", error);
    res.status(401).json({ message: "Refresh token inválido o expirado" });
  }
};

// ============================================
// LOGOUT
// ============================================
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.json({
      success: true,
      message: "Logout exitoso"
    });

  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// ============================================
// SOLICITAR RESETEO DE CONTRASEÑA
// ============================================
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // No revelar si el usuario existe o no (seguridad)
    if (!user) {
      return res.json({
        success: true,
        message: "Si el email existe, recibirás instrucciones para resetear tu contraseña"
      });
    }

    // No permitir reset si es cuenta de Google
    if (user.googleId && !user.contraseña) {
      return res.status(400).json({
        message: "Esta cuenta usa Google. Por favor inicia sesión con Google."
      });
    }

    // Generar token de reseteo
    const resetToken = generatePasswordResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await user.save();

    // Enviar email
    await sendPasswordResetEmail(user.email, user.nombre, resetToken);

    res.json({
      success: true,
      message: "Si el email existe, recibirás instrucciones para resetear tu contraseña"
    });

  } catch (error) {
    console.error("Error al solicitar reseteo:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// ============================================
// RESETEAR CONTRASEÑA
// ============================================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { contraseña, confirmarContraseña } = req.body;

    if (!contraseña || !confirmarContraseña) {
      return res.status(400).json({ 
        message: "Contraseña y confirmación son requeridas" 
      });
    }

    if (contraseña !== confirmarContraseña) {
      return res.status(400).json({ 
        message: "Las contraseñas no coinciden" 
      });
    }

    if (contraseña.length < 6) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }

    // Buscar usuario con el token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Token de reseteo inválido o expirado" 
      });
    }

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.contraseña = await bcrypt.hash(contraseña, salt);
    
    // Limpiar tokens
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.refreshToken = null; // Invalidar sesiones activas
    
    await user.save();

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión."
    });

  } catch (error) {
    console.error("Error al resetear contraseña:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// ============================================
// OBTENER PERFIL DEL USUARIO
// ============================================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-contraseña');
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
