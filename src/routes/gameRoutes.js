
import express from "express";
import {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  getTopRated
} from "../controllers/gameController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload, cleanupTempFile } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getGames); // ?esGlobal=true
router.get("/top", getTopRated);
router.get("/:id", getGameById);
// Crear juego con imagen
router.post("/", protect, upload.single('imagenPortada'), cleanupTempFile, createGame);

// Actualizar juego con imagen
router.put("/:id", protect, upload.single('imagenPortada'), cleanupTempFile, updateGame);
router.delete("/:id", protect, deleteGame);

export default router;

