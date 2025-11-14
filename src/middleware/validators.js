// Validaciones personalizadas para mayor seguridad

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  // Mínimo 6 caracteres
  if (password.length < 6) {
    return { valid: false, message: "La contraseña debe tener al menos 6 caracteres" };
  }

  // Opcional: Agregar más validaciones
  // - Al menos una letra mayúscula
  // - Al menos un número
  // - Al menos un carácter especial
  
  return { valid: true };
};

export const validateUsername = (username) => {
  // Solo letras, números y guiones bajos
  const regex = /^[a-zA-Z0-9_]{3,30}$/;
  
  if (!regex.test(username)) {
    return { 
      valid: false, 
      message: "El username solo puede contener letras, números y guiones bajos (3-30 caracteres)" 
    };
  }

  // Lista de usernames prohibidos
  const blacklist = ['admin', 'root', 'system', 'administrator', 'mod', 'moderator'];
  if (blacklist.includes(username.toLowerCase())) {
    return { 
      valid: false, 
      message: "Este username no está disponible" 
    };
  }

  return { valid: true };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remover caracteres peligrosos
  return input
    .trim()
    .replace(/[<>]/g, '') // Prevenir XSS básico
    .substring(0, 500); // Limitar longitud
};

// Middleware para validar registro
export const validateRegistration = (req, res, next) => {
  const { username, email, contraseña, confirmarContraseña } = req.body;

  // Validar email
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Email inválido" });
  }

  // Validar username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return res.status(400).json({ message: usernameValidation.message });
  }

  // Validar contraseña
  const passwordValidation = validatePassword(contraseña);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  // Validar que las contraseñas coincidan
  if (contraseña !== confirmarContraseña) {
    return res.status(400).json({ message: "Las contraseñas no coinciden" });
  }

  // Sanitizar inputs
  req.body.username = sanitizeInput(username);
  req.body.nombre = sanitizeInput(req.body.nombre);

  next();
};

// Rate limiting simple (en memoria, mejor usar redis en producción)
const loginAttempts = new Map();

export const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxAttempts = 10;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, []);
  }

  const attempts = loginAttempts.get(ip).filter(time => now - time < windowMs);
  
  if (attempts.length >= maxAttempts) {
    return res.status(429).json({ 
      message: "Demasiados intentos de login. Intenta más tarde." 
    });
  }

  attempts.push(now);
  loginAttempts.set(ip, attempts);

  next();
};