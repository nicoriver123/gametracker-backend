
import express from "express";
import {
  addToLibrary,
  getMyLibrary,
  updateUserGame,
  removeFromLibrary
} from "../controllers/userGameController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addToLibrary); // body { juegoId }
router.get("/me", protect, getMyLibrary);
router.put("/:id", protect, updateUserGame);
router.delete("/:id", protect, removeFromLibrary);

export default router;
