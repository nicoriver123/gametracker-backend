import Review from "../Models/Review.js";
import Game from "../Models/Game.js";

// Función auxiliar: recalcula el rating promedio del juego
const updateGameRating = async (juegoId) => {
  const reviews = await Review.find({ juegoId, esPublica: true });
  if (reviews.length === 0) {
    await Game.findByIdAndUpdate(juegoId, { ratingPromedio: 0 });
    return;
  }

  const promedio = reviews.reduce((acc, r) => acc + r.puntuacion, 0) / reviews.length;
  await Game.findByIdAndUpdate(juegoId, { ratingPromedio: promedio });
};

// Obtener todas las reseñas
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("usuarioId", "nombre")
      .populate("juegoId", "titulo genero plataforma añoLanzamiento imagenPortada");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener reseñas por juego (ahora incluye privadas del usuario autenticado)
export const getReviewsByGame = async (req, res) => {
  try {
    const { juegoId } = req.params;
    const userId = req.user ? req.user._id.toString() : null;

    // 1️⃣ Trae todas las reseñas del juego (sin filtrar)
    const allReviews = await Review.find({ juegoId })
      .populate("usuarioId", "nombre avatar");

    // 2️⃣ Filtra: públicas o privadas del usuario logueado
    const visibleReviews = allReviews.filter((r) =>
      r.esPublica || (userId && r.usuarioId?._id?.toString() === userId)
    );

    // 3️⃣ Agrega bandera isMine para facilitar el frontend
    const reviewsWithFlag = visibleReviews.map((r) => ({
      ...r.toObject(),
      isMine: userId && r.usuarioId?._id?.toString() === userId,
    }));

    res.json(reviewsWithFlag);
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    res.status(500).json({ message: error.message });
  }
};



// Crear una reseña
export const createReview = async (req, res) => {
  try {
    const usuarioId = req.user ? req.user._id : req.body.usuarioId; // fallback
    const data = { ...req.body, usuarioId };
    const review = await Review.create(data);
    await updateGameRating(review.juegoId);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar una reseña
export const updateReview = async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { ...req.body, fechaActualizacion: Date.now() },
      { new: true }
    );
    await updateGameRating(updated.juegoId);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar una reseña
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (review) await updateGameRating(review.juegoId);
    res.json({ message: "Reseña eliminada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener reseña por ID
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

