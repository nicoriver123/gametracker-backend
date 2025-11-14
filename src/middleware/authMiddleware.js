import jwt from "jsonwebtoken";
import User from "../Models/User.js";

// Middleware de protección principal
export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ 
      message: "No autorizado, token faltante" 
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que sea un access token
    if (decoded.type !== 'access') {
      return res.status(401).json({ 
        message: "Tipo de token inválido" 
      });
    }

    // Buscar usuario
    const user = await User.findById(decoded.id).select('-contraseña -refreshToken');
    
    if (!user) {
      return res.status(401).json({ 
        message: "Usuario no encontrado" 
      });
    }

    // Verificar que la cuenta esté verificada
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: "Por favor verifica tu email",
        needsVerification: true
      });
    }

    // Verificar si la cuenta está bloqueada
    if (user.isLocked) {
      return res.status(423).json({ 
        message: "Cuenta bloqueada temporalmente" 
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();

  } catch (error) {
    console.error("Error en autenticación:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expirado",
        expired: true
      });
    }
    
    res.status(401).json({ 
      message: "Token inválido" 
    });
  }
};

// Middleware opcional (no falla si no hay token)
export const optionalAuth = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-contraseña -refreshToken');
    
    if (user && user.isVerified && !user.isLocked) {
      req.user = user;
    }
  } catch (error) {
    // Continuar sin usuario autenticado
    console.log("Token inválido en optionalAuth");
  }

  next();
};

// Middleware para verificar roles (futuro)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "No autorizado" 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "No tienes permisos para realizar esta acción" 
      });
    }

    next();
  };
};
