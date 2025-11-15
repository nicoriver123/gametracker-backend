import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generar Access Token (corta duración)
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'access' }, 
    process.env.JWT_SECRET, 
    { expiresIn: "15m" } // 15 minutos
  );
};

// Generar Refresh Token (larga duración)
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: "7d" } // 7 días
  );
};

// Generar token de verificación de email
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generar token de reseteo de contraseña
export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Verificar Access Token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

// Verificar Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Refresh token inválido o expirado');
  }
};

// Generar par de tokens
export const generateTokenPair = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId)
  };
};

// Hashear token para almacenar en BD
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};