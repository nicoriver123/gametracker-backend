import express from "express";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  toggleLikeComment
} from "../controllers/forumController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================
// RUTAS DE POSTS
// ============================================

// Públicas
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);

// Protegidas
router.post("/posts", protect, createPost);
router.put("/posts/:id", protect, updatePost);
router.delete("/posts/:id", protect, deletePost);
router.post("/posts/:id/like", protect, toggleLikePost);

// ============================================
// RUTAS DE COMENTARIOS
// ============================================

// Públicas
router.get("/posts/:postId/comments", getCommentsByPost);

// Protegidas
router.post("/comments", protect, createComment);
router.put("/comments/:id", protect, updateComment);
router.delete("/comments/:id", protect, deleteComment);
router.post("/comments/:id/like", protect, toggleLikeComment);

export default router;