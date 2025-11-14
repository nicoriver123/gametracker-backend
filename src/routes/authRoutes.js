import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  googleAuth,
  refreshAccessToken,
  logout,
  requestPasswordReset,
  resetPassword,
  getProfile
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================
// RUTAS PÚBLICAS
// ============================================

// Registro y login tradicional
router.post("/register", register);
router.post("/login", login);

// Verificación de email
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Google OAuth
router.post("/google", googleAuth);

// Refresh token
router.post("/refresh-token", refreshAccessToken);

// Reseteo de contraseña
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

// ============================================
// RUTAS PROTEGIDAS
// ============================================

// Obtener perfil del usuario
router.get("/profile", protect, getProfile);

// Logout
router.post("/logout", protect, logout);

export default router;
