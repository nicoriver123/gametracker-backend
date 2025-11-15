
import express from "express";
import {
  getReviews,
  getReviewsByGame,
  createReview,
  updateReview,
  deleteReview
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getReviews);
router.get("/juego/:juegoId", optionalAuth, getReviewsByGame);
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;

