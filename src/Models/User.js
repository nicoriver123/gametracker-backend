import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  nombre: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  contraseña: { 
    type: String, 
    required: function() {
      return !this.googleId; // Solo requerido si no es usuario de Google
    },
    minlength: 6
  },
  
  // Google OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Verificación de email
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationTokenExpires: {
    type: Date,
    default: null
  },
  
  // Recuperación de contraseña
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  
  // Refresh token para JWT
  refreshToken: {
    type: String,
    default: null
  },
  
  // Metadata
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  
  fechaRegistro: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });

// Virtual para verificar si la cuenta está bloqueada
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Método para incrementar intentos de login
userSchema.methods.incLoginAttempts = async function() {
  // Si tenemos un bloqueo previo que ya expiró, reiniciar intentos
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 horas
  
  // Bloquear cuenta después de 5 intentos
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.contraseña) return false;
  return bcrypt.compare(candidatePassword, this.contraseña);
};

// No retornar campos sensibles por defecto
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.contraseña;
  delete obj.verificationToken;
  delete obj.verificationTokenExpires;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.refreshToken;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  return obj;
};

export default mongoose.model("User", userSchema);
