import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet"; // npm install helmet
import mongoSanitize from "express-mongo-sanitize"; // npm install express-mongo-sanitize
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import userGameRoutes from "./routes/userGameRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================

// Helmet - Protección de headers HTTP
app.use(helmet());

// CORS configurado correctamente
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser con límite
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitización contra NoSQL injection
app.use(mongoSanitize());

// ============================================
// RUTAS PRINCIPALES
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/juegos", gameRoutes);
app.use("/api/mis-juegos", userGameRoutes);
app.use("/api/resenas", reviewRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/contact", contactRoutes);



// Ruta de health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ 
    message: "Ruta no encontrada" 
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 5100;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

